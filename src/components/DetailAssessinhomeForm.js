import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImmobilityForm from "./UpdateAssessinhomesss/updateImmobility.js";
import NutritionForm from "./UpdateAssessinhomesss/updateNutrition.js";
import HousingForm from "./UpdateAssessinhomesss/updateHousing.js";
import OtherpeopleForm from "./UpdateAssessinhomesss/updateOtherpeople.js";
import MedicationForm from "./UpdateAssessinhomesss/updateMedication.js";
import PhysicalExaminationForm from "./UpdateAssessinhomesss/updatePhysicalExamination.js";
import SSSForm from "./UpdateAssessinhomesss/updateSSS.js";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

export default function DetailAssessinhomeForm() {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});
  const location = useLocation();
  const { id } = location.state;
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [userUnreadCounts, setUserUnreadCounts] = useState([]);
  const [latestAssessments, setLatestAssessments] = useState({});
  const [unreadCountsByType, setUnreadCountsByType] = useState({
    assessment: 0,
    abnormal: 0,
    normal: 0,
  });

  const fetchLatestAssessments = async () => {
    try {
      const response = await fetch("http://localhost:5000/latest-assessments");
      const data = await response.json();
      console.log("Raw latestAssessments data:", data); // เช็กค่าที่ได้จาก API

      if (data.status === "ok") {
        const assessmentsMap = data.data.reduce((acc, item) => {
          acc[item._id] = item.latestStatusName;
          return acc;
        }, {});
        console.log("Processed latestAssessments:", assessmentsMap); // เช็กค่าหลังประมวลผล

        setLatestAssessments(assessmentsMap);
      }
    } catch (error) {
      console.error("Error fetching latest assessments:", error);
    }
  };

  useEffect(() => {
    fetchLatestAssessments();
  }, []);

  const getUnreadCount = useCallback(
    (type) => {
      const filteredByType = alerts.filter(
        (alert) =>
          (type === "assessment" &&
            alert.alertType === "assessment" &&
            alert.alertMessage !== "เคสฉุกเฉิน") ||
          (type === "abnormal" &&
            (alert.alertType === "abnormal" ||
              alert.alertMessage === "เคสฉุกเฉิน")) ||
          (type === "normal" && alert.alertType === "normal")
      );
      return filteredByType.filter((alert) => !alert.viewedBy.includes(userId))
        .length;
    },
    [alerts, userId]
  );

  useEffect(() => {
    if (!userId) return;
    const updatedCounts = {
      assessment: getUnreadCount("assessment"),
      abnormal: getUnreadCount("abnormal"),
      normal: getUnreadCount("normal"),
    };
    setUnreadCountsByType(updatedCounts);
  }, [alerts, userId]);
  const hasFetchedUserData = useRef(false);

  useEffect(() => {
    socket?.on("newAlert", (alert) => {
      console.log("Received newAlert:", alert);

      if (alert.MPersonnel?.id === userId) {
        console.log("Ignoring alert from self");
        return;
      }

      setAlerts((prevAlerts) => {
        const isExisting = prevAlerts.some(
          (existingAlert) => existingAlert.patientFormId === alert.patientFormId
        );

        let updatedAlerts;

        if (isExisting) {
          updatedAlerts = prevAlerts.map((existingAlert) =>
            existingAlert.patientFormId === alert.patientFormId
              ? alert
              : existingAlert
          );
        } else {
          updatedAlerts = [...prevAlerts, alert];
        }

        return [...updatedAlerts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    });

    socket?.on("deletedAlert", (data) => {
      setAlerts((prevAlerts) => {
        const filteredAlerts = prevAlerts.filter(
          (alert) => alert.patientFormId !== data.patientFormId
        );

        return [...filteredAlerts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    });

    return () => {
      socket?.off("newAlert");
      socket?.off("deletedAlert");
    };
  }, [userId]);

  useEffect(() => {
    const currentUserId = sender._id;

    const unreadAlerts = alerts.filter(
      (alert) =>
        Array.isArray(alert.viewedBy) && !alert.viewedBy.includes(currentUserId)
    );

    setUnreadCount(unreadAlerts.length);
  }, [alerts, sender._id]);

  useEffect(() => {
    socket?.on("TotalUnreadCounts", (data) => {
      console.log("📦 TotalUnreadCounts received:", data);
      setUserUnreadCounts(data);
    });

    return () => {
      socket?.off("TotalUnreadCounts");
    };
  }, []);

  const toggleNotifications = (e) => {
    e.stopPropagation();
    if (showNotifications) {
      setShowNotifications(false);
    } else {
      setShowNotifications(true);
    }
    // setShowNotifications(prev => !prev);
  };

  const handleClickOutside = (e) => {
    if (
      notificationsRef.current &&
      !notificationsRef.current.contains(e.target) &&
      !bellRef.current.contains(e.target)
    ) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserData = (token) => {
    return fetch("http://localhost:5000/profiledt", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data === "token expired") {
          alert("Token expired login again");
          window.localStorage.clear();
          setTimeout(() => {
            window.location.replace("./");
          }, 0);
          return null;
        }
        setSender({
          name: data.data.name,
          surname: data.data.surname,
          _id: data.data._id,
        });
        setData(data.data);
        if (data.data === "token expired") {
          window.localStorage.clear();
          window.location.href = "./";
        }
        return data.data;
      })
      .catch((error) => {
        console.error("Error verifying token:", error);
      });
  };

  const fetchAndSetAlerts = (token, userId) => {
    fetchAlerts(token, userId)
      .then((alerts, userId) => {
        setAlerts(alerts);
        const unreadAlerts = alerts.filter(
          (alert) => !alert.viewedBy.includes(userId)
        ).length;
        setUnreadCount(unreadAlerts);
      })
      .catch((error) => {
        console.error("Error fetching alerts:", error);
      });
  };

  useEffect(() => {
    if (hasFetchedUserData.current) return;
    hasFetchedUserData.current = true;

    const token = window.localStorage.getItem("token");
    setToken(token);

    if (token) {
      fetchUserData(token)
        .then((user) => {
          setUserId(user._id);
          fetchAndSetAlerts(token, user._id);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
        });
    }
  }, [token]);

  const markAllByTypeAsViewed = (type) => {
    fetch("http://localhost:5000/alerts/mark-all-viewed-by-type", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: userId, type: type }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "All selected alerts marked as viewed") {
          const updatedAlerts = alerts.map((alert) => {
            if (
              type === "all" ||
              ((alert.alertType === type ||
                (type === "abnormal" &&
                  (alert.alertType === "abnormal" ||
                    alert.alertMessage === "เคสฉุกเฉิน")) ||
                (type === "assessment" &&
                  alert.alertType === "assessment" &&
                  alert.alertMessage !== "เคสฉุกเฉิน")) &&
                !alert.viewedBy.includes(userId))
            ) {
              return { ...alert, viewedBy: [...alert.viewedBy, userId] };
            }
            return alert;
          });

          setAlerts(updatedAlerts);
          // setUnreadCount(0);
          const unreadAlerts = updatedAlerts.filter(
            (alert) => !alert.viewedBy.includes(userId)
          );
          setUnreadCount(unreadAlerts.length);
        }
      })
      .catch((error) => {
        console.error("Error marking alerts as viewed:", error);
      });
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const filteredAlerts =
    filterType === "unread"
      ? alerts.filter((alert) => !alert.viewedBy.includes(userId))
      : filterType === "assessment"
        ? alerts.filter(
          (alert) =>
            alert.alertType === "assessment" &&
            alert.alertMessage !== "เคสฉุกเฉิน"
        )
        : filterType === "abnormal"
          ? alerts.filter(
            (alert) =>
              alert.alertType === "abnormal" ||
              alert.alertMessage === "เคสฉุกเฉิน"
          )
          : filterType === "normal"
            ? alerts.filter((alert) => alert.alertType === "normal")
            : alerts;

  const getFilterLabel = (type) => {
    switch (type) {
      case "all":
        return "ทั้งหมด";
      case "unread":
        return "ยังไม่อ่าน";
      case "normal":
        return "บันทึกอาการ";
      case "abnormal":
        return "ผิดปกติ";
      case "assessment":
        return "ประเมินอาการ";
      default:
        return "ไม่ทราบ";
    }
  };

  const currentDate = new Date();

  useEffect(() => {
    if (birthday) {
      const userBirthday = new Date(birthday);
      const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();
      const monthDiff = currentDate.getMonth() - userBirthday.getMonth();
      setUserAgeInMonths(monthDiff >= 0 ? monthDiff : 12 + monthDiff);

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && currentDate.getDate() < userBirthday.getDate())
      ) {
        setUserAge(ageDiff - 1);
      } else {
        setUserAge(ageDiff);
      }
    }
  }, [currentDate]);

  const formatDate = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const day = dateTime.getDate();
    const month = dateTime.getMonth() + 1;
    const year = dateTime.getFullYear();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${year + 543
      } เวลา ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
      } น.`;
  };

  const formatThaiDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const thaiMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    return `${day} ${thaiMonths[month - 1]} ${year + 543}`; // Convert year to Thai calendar
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };


  const [originalData, setOriginalData] = useState(null);
  const [AssessinhomeForms, setAssessinhomeForms] = useState([]);

  useEffect(() => {
    const fetchAssessinhomeForms = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getAssessinhomeForm/${id}`
        );
        const data = await response.json();

        if (response.ok) {
          setAssessinhomeForms(data.data);
          setOriginalData(data.data); // ✅ เซ็ตค่า originalData
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching readiness form:", error);
      }
    };
    fetchAssessinhomeForms();
  }, [id, token]);

  useEffect(() => {
    if (AssessinhomeForms.user && AssessinhomeForms._id) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getuser/${AssessinhomeForms.user}`
          );
          const data = await response.json();
          setName(data.name);
          setSurname(data.surname);
          setGender(data.gender);
          setBirthday(data.birthday);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();
    }
  }, [AssessinhomeForms.user]);

  useEffect(() => {
    if (AssessinhomeForms && AssessinhomeForms.user) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicalInformation/${AssessinhomeForms.user}`
          );
          const data = await response.json();
          console.log("Medical Information:", data);
          setMedicalData(data.data);
          console.log("22:", medicalData);
        } catch (error) {
          console.error("Error fetching medical information:", error);
        }
      };

      fetchMedicalInfo();
    }
  }, [AssessinhomeForms.user]);

  const handleBreadcrumbClick = () => {
    navigate("/assessinhomesssuser", { state: { id: AssessinhomeForms.user } });
  };

  const getGroup = (totalScore) => {
    if (totalScore >= 16 && totalScore <= 20) {
      return "กลุ่มที่ 1 (ช่วยเหลือตัวเองดี ไม่ต้องการความช่วยเหลือจากผู้อื่น)";
    } else if (totalScore >= 21 && totalScore <= 35) {
      return "กลุ่มที่ 2 (ช่วยเหลือตัวเองได้ปานกลาง ต้องการความช่วยเหลือจากผู้อื่นบางส่วน)";
    } else if (totalScore >= 36 && totalScore <= 48) {
      return "กลุ่มที่ 3 (ช่วยเหลือตัวเองได้น้อย หรือไม่ได้เลย ต้องการความช่วยเหลือจากผู้อื่นมากหรือทั้งหมด)";
    }
    return "-";
  };
  const getGroupStyle = (totalScore) => {
    if (totalScore >= 36) {
      return "text-danger"; // สีแดงสำหรับกลุ่มที่ 3
    } else if (totalScore >= 21) {
      return "text-primary"; // สีส้มสำหรับกลุ่มที่ 2
    } else if (totalScore >= 16) {
      return "text-success"; // สีเขียวสำหรับกลุ่มที่ 1
    }
    return ""; // ค่าเริ่มต้น
  };

  const activityLevelMapping = {
    sedentary: "ออกกำลังกายน้อยมาก หรือไม่ออกเลย",
    lightly_active: "ออกกำลังกาย 1-3 ครั้งต่อสัปดาห์",
    moderately_active: "ออกกำลังกาย 4-5 ครั้งต่อสัปดาห์",
    very_active: "ออกกำลังกาย 6-7 ครั้งต่อสัปดาห์",
    super_active: "ออกกำลังกายวันละ 2 ครั้งขึ้นไป",
  };

  const [tempFormValues, setTempFormValues] = useState({});
  const [currentEditSection, setCurrentEditSection] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);


  // ดึงข้อมูลจาก AssessinhomeForms หรือ API
  useEffect(() => {
    if (AssessinhomeForms.user) {
      setUserId(AssessinhomeForms.user);
    }
  }, [AssessinhomeForms.user]);

  const handleEditClick = (section) => {
    setCurrentEditSection(section);
    if (section === "Immobility") {
      setTempFormValues({ ...AssessinhomeForms.Immobility });
    }
    else if (section === "Nutrition") {
      setTempFormValues({ ...AssessinhomeForms.Nutrition });
    }
    else if (section === "Housing") {
      setTempFormValues({ ...AssessinhomeForms.Housing });
    }
    else if (section === "OtherPeople") {
      setTempFormValues({ existingCaregivers: [...AssessinhomeForms.OtherPeople.existingCaregivers] });
    }
    else if (section === "Medication") {
      setTempFormValues({ ...AssessinhomeForms.Medication });
    }
    else if (section === "Physical Examination") {
      setTempFormValues({ ...AssessinhomeForms.PhysicalExamination });
    }
    else if (section === "SSS_Safety") {
      setTempFormValues({ ...AssessinhomeForms.SSS.Safety });
    } else if (section === "SSS_SpiritualHealth") {
      setTempFormValues({ ...AssessinhomeForms.SSS.SpiritualHealth });
    } else if (section === "SSS_Service") {
      setTempFormValues({ ...AssessinhomeForms.SSS.Service });
    } else {
      setTempFormValues({ ...AssessinhomeForms[section] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTempFormValues({});
  };

  const handleSaveChanges = async (updatedData, index, isNewCaregiver = false) => {
    try {
      let newAssessinhomeForms = { ...AssessinhomeForms };

      if (currentEditSection === "Immobility") {
        newAssessinhomeForms.Immobility = updatedData;
      }
      else if (currentEditSection === "Nutrition") {
        newAssessinhomeForms.Nutrition = updatedData;
      }
      else if (currentEditSection === "Housing") {
        newAssessinhomeForms.Housing = updatedData;
      }
      else if (currentEditSection === "Medication") {
        newAssessinhomeForms.Medication = updatedData;
      }
      else if (currentEditSection === "Physical Examination") {
        newAssessinhomeForms.PhysicalExamination = updatedData;
      }

      if (currentEditSection.startsWith("SSS_")) {
        const subSection = currentEditSection.split("_")[1]; // ดึงเฉพาะส่วนที่ต้องแก้ไข
        newAssessinhomeForms.SSS[subSection] = updatedData;
      } else {
        newAssessinhomeForms[currentEditSection] = updatedData;
      }

      if (currentEditSection === "OtherPeople") {
        if (isNewCaregiver) {
          let updatedNewCaregivers = [...newAssessinhomeForms.OtherPeople.newCaregivers];
          updatedNewCaregivers[index] = { ...updatedData };
          newAssessinhomeForms = {
            ...newAssessinhomeForms,
            OtherPeople: {
              ...newAssessinhomeForms.OtherPeople,
              newCaregivers: updatedNewCaregivers,
            }
          };
        } else {
          let updatedexistingCaregivers = [...newAssessinhomeForms.OtherPeople.existingCaregivers];
          updatedexistingCaregivers[index] = { ...updatedData };
          newAssessinhomeForms = {
            ...newAssessinhomeForms,
            OtherPeople: {
              ...newAssessinhomeForms.OtherPeople,
              existingCaregivers: updatedexistingCaregivers,
            }
          };
        }
      } else {
        newAssessinhomeForms[currentEditSection] = updatedData;
      }
      const response = await fetch(
        `http://localhost:5000/updateAssessinhomesss/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAssessinhomeForms), // ✅ ส่งข้อมูลทั้งหมด
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update data");

      // ✅ อัปเดตค่าที่ได้จากเซิร์ฟเวอร์กลับมา
      const updatedForm = await fetch(`http://localhost:5000/getAssessinhomeForm/${id}`);
      const updatedDataFromServer = await updatedForm.json();

      toast.success("แก้ไขข้อมูลสำเร็จ", {
        position: "top-right", // ให้แสดงด้านบนขวา
        autoClose: 1000, // ปิดอัตโนมัติภายใน 1 วินาที
        closeOnClick: true, // ปิดเมื่อคลิก
        pauseOnHover: false, // ไม่หยุดเมื่อโฮเวอร์
        draggable: true, // ลากออกได้

      });


      // อัพเดต State

      setTimeout(() => {
        setAssessinhomeForms(updatedDataFromServer.data);
        setOriginalData(updatedDataFromServer.data);
        setIsModalOpen(false);
        // window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };


  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index); // เปิด-ปิดเมื่อคลิก
  };
  useEffect(() => {
    if (AssessinhomeForms.OtherPeople) {
      setOpenIndex("caregiver-0"); // เปิดคนแรกโดยอัตโนมัติ
    }
  }, [AssessinhomeForms.OtherPeople]);
  useEffect(() => {
    // ดึงข้อมูล unread count เมื่อเปิดหน้า
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/update-unread-count"
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setUserUnreadCounts(data.users);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchUnreadCount();
  }, []);
  useEffect(() => {
    if (isModalOpen) {
      // เพิ่ม class modal-open และสร้าง backdrop
      document.body.classList.add("modal-open");
      const backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);
    } else {
      // ลบ backdrop และ class modal-open เมื่อปิด modal
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
    }
  }, [isModalOpen]);

  const [activeTab, setActiveTab] = useState("Immobility"); // ค่าเริ่มต้น
  const [editingIndex, setEditingIndex] = useState(null); // เก็บ index ของผู้ดูแลที่กำลังแก้ไข

  const handleEditexistingCaregivers = (index) => {
    setCurrentEditSection("OtherPeople");
    setIsModalOpen(true);
    setEditingIndex(index); // ✅ เก็บ index ที่เลือกไว้
    setTempFormValues({ ...AssessinhomeForms.OtherPeople.existingCaregivers[index] });
  };

  const [editingNewCaregiverIndex, setEditingNewCaregiverIndex] = useState(null);

  const handleEditNewCaregivers = (index) => {
    setCurrentEditSection("OtherPeople");
    setIsModalOpen(true);
    setEditingNewCaregiverIndex(index); // ✅ เก็บ index ที่เลือกไว้
    setTempFormValues({ ...AssessinhomeForms.OtherPeople.newCaregivers[index] });
  };


  return (
    <main className="body">
      <ToastContainer />
      <div className={`sidebar ${isActive ? "active" : ""}`}>
        <div className="logo_content">
          <div className="logo">
            <div className="logo_name">
              <img src={logow} className="logow" alt="logo"></img>
            </div>
          </div>
          <i className="bi bi-list" id="btn" onClick={handleToggleSidebar}></i>
        </div>
        <ul className="nav-list">
          <li>
            <a href="home">
              <i className="bi bi-house"></i>
              <span className="links_name">หน้าหลัก</span>
            </a>
          </li>
          <li>
            <a href="assessment">
              <i className="bi bi-clipboard2-pulse"></i>
              <span className="links_name">ติดตาม/ประเมินอาการ</span>
            </a>
          </li>
          <li>
            <a href="allpatient">
              <i className="bi bi-people"></i>
              <span className="links_name">จัดการข้อมูลการดูแลผู้ป่วย</span>
            </a>
          </li>
          <li>
            <a href="assessreadiness">
              <i className="bi bi-clipboard-check"></i>
              <span className="links_name">ประเมินความพร้อมการดูแล</span>
            </a>
          </li>
          <li>
            <a href="assessinhomesss">
              <i className="bi bi-house-check"></i>
              <span className="links_name">แบบประเมินเยี่ยมบ้าน</span>
            </a>
          </li>
          <li>
            <a href="chat" style={{ position: "relative" }}>
              <i className="bi bi-chat-dots"></i>
              <span className="links_name">แช็ต</span>
              {userUnreadCounts.map((user) => {
                if (user?.userId && String(user.userId) === String(sender._id)) {
                  return (
                    <div key={user.userId}>
                      {user.totalUnreadCount > 0 && (
                        <div className="notification-countchat">
                          {user.totalUnreadCount}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </a>
          </li>
          <div className="nav-logout">
            <li>
              <a href="./" onClick={logOut}>
                <i
                  className="bi bi-box-arrow-right"
                  id="log_out"
                  onClick={logOut}
                ></i>
                <span className="links_name">ออกจากระบบ</span>
              </a>
            </li>
          </div>
        </ul>
      </div>

      <div className="home_content">
        <div className="homeheader">
          <div className="header">แบบประเมินเยี่ยมบ้าน</div>
          <div className="profile_details">
            <ul className="nav-list">
              <li>
                <a
                  ref={bellRef}
                  className="bell-icon"
                  onClick={toggleNotifications}
                >
                  {showNotifications ? (
                    <i className="bi bi-bell-fill"></i>
                  ) : (
                    <i className="bi bi-bell"></i>
                  )}
                  {unreadCount > 0 && (
                    <span className="notification-count">{unreadCount}</span>
                  )}
                </a>
              </li>
              <li>
                <a href="profile">
                  <i className="bi bi-person"></i>
                  <span className="links_name">
                    {data && data.nametitle + data.name + " " + data.surname}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        {showNotifications && (
          <div className="notifications-dropdown" ref={notificationsRef}>
            <div className="notifications-head">
              <h2 className="notifications-title">การแจ้งเตือน</h2>
            </div>
            <div className="notifications-filter">
              <div
                className={`notification-box ${filterType === "all" ? "active" : ""
                  }`}
                onClick={() => handleFilterChange("all")}
              >
                <div className="notification-item">
                  <i className="bi bi-bell"></i>
                  ทั้งหมด
                </div>
                <div className="notification-right">
                  {unreadCount > 0 && (
                    <span className="notification-count-noti">{unreadCount}</span>
                  )}
                  <i className="bi bi-chevron-right"></i>
                </div>
              </div>
              <div
                className={`notification-box ${filterType === "abnormal" ? "active" : ""
                  }`}
                onClick={() => handleFilterChange("abnormal")}
              >
                <div className="notification-item">
                  <i className="bi bi-exclamation-triangle"></i>
                  ผิดปกติ
                </div>
                <div className="notification-right">
                  {unreadCountsByType.abnormal > 0 && (
                    <span className="notification-count-noti">
                      {unreadCountsByType.abnormal}
                    </span>
                  )}
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>
              <div
                className={`notification-box ${filterType === "normal" ? "active" : ""
                  }`}
                onClick={() => handleFilterChange("normal")}
              >
                <div className="notification-item">
                  {" "}
                  <i className="bi bi-journal-text"></i>
                  บันทึกอาการ
                </div>
                <div className="notification-right">
                  {unreadCountsByType.normal > 0 && (
                    <span className="notification-count-noti">
                      {unreadCountsByType.normal}
                    </span>
                  )}
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>

              <div
                className={`notification-box ${filterType === "assessment" ? "active" : ""
                  }`}
                onClick={() => handleFilterChange("assessment")}
              >
                <div className="notification-item">
                  <i className="bi bi-clipboard-check"></i>
                  ประเมินอาการ
                </div>
                <div className="notification-right">
                  {unreadCountsByType.assessment > 0 && (
                    <span className="notification-count-noti">
                      {unreadCountsByType.assessment}
                    </span>
                  )}
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>
            </div>
            <div className="selected-filter">
              <p>
                การแจ้งเตือน: <strong>{getFilterLabel(filterType)}</strong>
              </p>
              <p
                className="mark-all-read-btn"
                onClick={() => markAllByTypeAsViewed(filterType)}
              >
                ทำเครื่องหมายว่าอ่านทั้งหมด
              </p>
            </div>
            {filteredAlerts.length > 0 ? (
              <div>
                {renderAlerts(
                  filteredAlerts,
                  token,
                  userId,
                  navigate,
                  setAlerts,
                  setUnreadCount,
                  formatDate
                )}
              </div>
            ) : (
              <p className="no-notification">ไม่มีการแจ้งเตือน</p>
            )}
          </div>
        )}
        <div className="breadcrumbs mt-4">
          <ul>
            <li>
              <a href="home">
                <i className="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a href="assessreadiness">แบบประเมินเยี่ยมบ้าน</a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a onClick={handleBreadcrumbClick} className="info">
                บันทึกการประเมิน
              </a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>รายละเอียดการประเมิน</a>
            </li>
          </ul>
        </div>
        <div className="content">
          <div className="patient-card patient-card-style">
            <p className="patient-name">
              <label>ข้อมูลผู้ป่วย</label>
            </p>

            <div className="info-container">
              <div className="info-row">
                <div className="info-item">

                  <label>ชื่อ-สกุล:</label>{" "}
                  <span>
                    {name} {surname}
                  </span>
                </div>
                <div className="info-item">
                  <label>อายุ:</label>{" "}
                  <span>
                    {birthday
                      ? `${userAge} ปี ${userAgeInMonths} เดือน`
                      : "0 ปี 0 เดือน"}
                  </span>
                </div>
                <div className="info-item">
                  <label>เพศ:</label> <span>{gender}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <label>HN:</label>{" "}
                  <span>{medicalData?.HN || "ไม่มีข้อมูล"}</span>
                </div>
                <div className="info-item">
                  <label>AN:</label>{" "}
                  <span>{medicalData?.AN || "ไม่มีข้อมูล"}</span>
                </div>
                <div className="info-item full-width">
                  <label>ผู้ป่วยโรค:</label>{" "}
                  <span>{medicalData?.Diagnosis || "ไม่มีข้อมูล"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <label className="text-secondary">วันที่บันทึก :</label>
            <span> {formatDate(AssessinhomeForms.createdAt)}</span><br></br>
            <label className="text-secondary mt-2">วันที่แก้ไขล่าสุด : </label>
            <span> {AssessinhomeForms.updatedAt === AssessinhomeForms.createdAt
                ? " -"
                : formatDate(AssessinhomeForms.updatedAt)}
            </span>
          </div>


          <div className="readiness card mt-4" style={{ width: "90%" }}>
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "Immobility" ? "active" : ""}`}
                  onClick={() => setActiveTab("Immobility")}
                >
                  <i class="bi bi-person-walking" ></i> Immobility
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "Nutrition" ? "active" : ""}`}
                  onClick={() => setActiveTab("Nutrition")}
                >
                  <i class="bi bi-universal-access-circle" ></i> Nutrition
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "Housing" ? "active" : ""}`}
                  onClick={() => setActiveTab("Housing")}
                >
                  <i class="bi bi-house-check-fill" ></i> Housing
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "OtherPeople" ? "active" : ""}`}
                  onClick={() => setActiveTab("OtherPeople")}
                >
                  <i class="bi bi-people-fill"></i> Other people
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "Medication" ? "active" : ""}`}
                  onClick={() => setActiveTab("Medication")}
                >
                  <i class="bi bi-capsule"></i> Medication
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "Physical Examination" ? "active" : ""}`}
                  onClick={() => setActiveTab("Physical Examination")}
                >
                  <i class="bi bi-person-lines-fill"></i> Physical Examination
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "SSS" ? "active" : ""}`}
                  onClick={() => setActiveTab("SSS")}
                >
                  <i class="bi bi-file-earmark-medical"></i> SSS
                </button>
              </li>
            </ul>

            <div className="tab-content m-4">
              {activeTab === "Immobility" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ประเมินความสามารถในการเคลื่อนไหว</p>
                  {AssessinhomeForms.Immobility ? (
                    <div className="p-3 border rounded ms-2">
                      <div className="row">
                        <div className="row">
                          <div className="col-sm-2">
                            <strong>คะแนนรวม :</strong>
                          </div>
                          <div className="col-sm-9">
                            <div className="row">
                              <div className="col-8 col-sm-6">
                                <p
                                  className={getGroupStyle(AssessinhomeForms.Immobility.totalScore)}>
                                  <b>{AssessinhomeForms.Immobility.totalScore || "0"}{" "} คะแนน</b>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-2">
                            <strong>ประเมินผล :</strong>
                          </div>
                          <div className="col-sm-9">
                            <div className="row">
                              <div className="col-8 col-sm-12">
                                <p
                                  className={getGroupStyle(
                                    AssessinhomeForms.Immobility.totalScore
                                  )}
                                >
                                  {getGroup(
                                    AssessinhomeForms.Immobility.totalScore
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <button
                          className="btn m-2"
                          style={{ backgroundColor: "#ffde59", color: "black" }}
                          onClick={() => handleEditClick("Immobility")}
                        >
                          <i class="bi bi-pencil-fill"></i> แก้ไข
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>ไม่มีข้อมูล</p>
                  )}
                </div>
              )}
              {activeTab === "Nutrition" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ประเมินภาวะโภชนาการ</p>
                  <div className="p-3 border rounded ms-2">

                    {/* น้ำหนัก */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>น้ำหนัก :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.weight || "0"} กิโลกรัม</p>
                      </div>
                    </div>

                    {/* ส่วนสูง */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>ส่วนสูง :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.height || "0"} เซ็นติเมตร</p>
                      </div>
                    </div>

                    {/* ค่า BMR */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>ค่า BMR :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p style={{ color: "#28a745" }}>
                          <b>{(AssessinhomeForms.Nutrition?.bmr || 0).toLocaleString()}</b> กิโลแคลอรีต่อวัน
                        </p>
                      </div>
                    </div>

                    {/* ค่า TDEE */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>ค่า TDEE :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p style={{ color: "#fd7e14" }}>
                          <b>{(AssessinhomeForms.Nutrition?.tdee || "0").toLocaleString()}</b> กิโลแคลอรีต่อวัน
                        </p>
                      </div>
                    </div>


                    {/* กิจกรรมที่ทำ */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>กิจกรรมที่ทำ :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{activityLevelMapping[AssessinhomeForms.Nutrition?.activityLevel] || "-"}</p>
                      </div>
                    </div>

                    {/* ช่องทางการรับอาหาร */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>ช่องทางการรับอาหาร :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.intakeMethod.join(", ") || "-"}</p>
                      </div>
                    </div>

                    {/* ลักษณะอาหาร */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>ลักษณะอาหาร :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.foodTypes.join(", ") || "-"}</p>
                      </div>
                    </div>

                    {/* อาหารทางการแพทย์ */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>อาหารทางการแพทย์ :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.medicalFood || "-"}</p>
                      </div>
                    </div>

                    {/* อาหารทางอื่นๆ */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>อาหารอื่นๆ :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.otherFood || "-"}</p>
                      </div>
                    </div>

                    {/* อาหารที่ชอบ */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>อาหารที่ชอบ :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.favoriteFood || "-"}</p>
                      </div>
                    </div>

                    {/* คนปรุงอาหาร */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>คนปรุงอาหาร :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.cooks.join(", ") || "-"}</p>
                      </div>
                    </div>

                    {/* ภาวะโภชนาการ */}
                    <div className="row">
                      <div className="col-sm-3">
                        <strong>ภาวะโภชนาการ :</strong>
                      </div>
                      <div className="col-sm-7">
                        <p>{AssessinhomeForms.Nutrition?.nutritionStatus || "-"}</p>
                      </div>
                    </div>

                    {/* ปุ่มแก้ไข */}
                    <div>
                      <button
                        className="btn m-2"
                        style={{ backgroundColor: "#ffde59", color: "black" }}
                        onClick={() => handleEditClick("Nutrition")}
                      >
                        <i class="bi bi-pencil-fill"></i> แก้ไข
                      </button>
                    </div>

                  </div>
                </div>
              )}
              {activeTab === "Housing" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ข้อมูลที่อยู่อาศัย </p>
                  <div className="p-3 border rounded ms-2">

                    <>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>ลักษณะบ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.houseType || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>วัสดุที่ใช้ทำ :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.material || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>จำนวนชั้น :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.numFloors || "-"} ชั้น</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>จำนวนห้อง :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.numRooms || "-"} ห้อง</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>ผู้ป่วยอาศัยอยู่ชั้นไหน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.patientFloor || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>ความสะอาดในบ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.cleanliness || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>ความเป็นระเบียบเรียบร้อยในบ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.orderliness || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>แสงสว่างในบ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.lighting || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>การระบายอากาศ :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.ventilation || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>สิ่งแวดล้อมรอบๆ บ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>
                            {AssessinhomeForms.Housing?.homeEnvironment?.join(", ") || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>เลี้ยงสัตว์ใต้ถุนบ้าน/รอบๆ บ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.homeEnvironment_petType || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>อื่นๆ :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.otherHomeEnvironment || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>จำนวนเพื่อนบ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.numneighbor || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>ความสัมพันธ์กับเพื่อนบ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>
                            {["ดี", "ไม่ดี"].includes(AssessinhomeForms.Housing?.neighborRelationship)
                              ? AssessinhomeForms.Housing?.neighborRelationship
                              : (AssessinhomeForms.Housing?.neighborRelationship || "-")}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4">
                          <strong>ความช่วยเหลือกันของเพื่อนบ้าน :</strong>
                        </div>
                        <div className="col-sm-8">
                          <p>{AssessinhomeForms.Housing?.neighborHelp || "-"}</p>
                        </div>
                      </div>
                    </>

                    <div>
                      <button
                        className="btn m-2"
                        style={{ backgroundColor: "#ffde59", color: "black" }}
                        onClick={() => handleEditClick("Housing")}
                      >
                        <i className="bi bi-pencil-fill"></i> แก้ไข
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "OtherPeople" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ข้อมูลผู้ดูแลหรือบุคคลในครอบครัว</p>
                  <h5 className="ms-2" style={{ color: "#444" }}> <b>1. ผู้ดูแล</b></h5>
                  {AssessinhomeForms.OtherPeople?.existingCaregivers?.length > 0 ? (
                    AssessinhomeForms.OtherPeople?.existingCaregivers?.map((cg, index) => (
                      <div key={index}>
                        <div
                          className="row mb-2"
                          onClick={() => toggleAccordion(`caregiver-${index}`)}
                        >
                          <div className="col-sm-4 mt-3">
                            <strong
                              style={{
                                cursor: "pointer",
                                color: "#007BFF",
                                transition: "color 0.1s ease",
                              }}
                              onMouseEnter={(e) => (e.target.style.color = "#95d7ff")}
                              onMouseLeave={(e) => (e.target.style.color = "#007BFF")}
                            >
                              ผู้ดูแลคนที่ {index + 1} : {cg.firstName} {cg.lastName || "-"} ({cg.relationship || "-"})
                            </strong>
                          </div>
                        </div>

                        {openIndex === `caregiver-${index}` && (
                          <div className="p-3 border rounded ms-2">
                            <div className="row">
                              <div className="col-sm-3"><strong>วันเกิด :</strong></div>
                              <div className="col-sm-9">
                                <p>{cg.birthDate ? formatThaiDate(cg.birthDate) : "0 ปี 0 เดือน"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>ความสัมพันธ์ :</strong></div>
                              <div className="col-sm-9"><p>{cg.relationship || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>อาชีพ :</strong></div>
                              <div className="col-sm-9"><p>{cg.occupation || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>สถานภาพ :</strong></div>
                              <div className="col-sm-9"><p>{cg.status || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>การศึกษา :</strong></div>
                              <div className="col-sm-9"><p>{cg.education || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>รายได้ต่อเดือน :</strong></div>
                              <div className="col-sm-9"><p>{cg.income || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>สิทธิ :</strong></div>
                              <div className="col-sm-9"><p>{cg.benefit || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>โรคประจำตัว :</strong></div>
                              <div className="col-sm-9"><p>{cg.ud || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>อุปนิสัย :</strong></div>
                              <div className="col-sm-9"><p>{cg.habit || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>รายละเอียดการดูแลผู้ป่วย :</strong></div>
                              <div className="col-sm-7"><p>{cg.careDetails || "-"}</p></div>
                            </div>
                            <div className="col-sm-2">
                              <button
                                className="btn m-2"
                                style={{ backgroundColor: "#ffde59", color: "black" }}
                                onClick={() => handleEditexistingCaregivers(index)}
                              >
                                <i className="bi bi-pencil-fill"></i> แก้ไข
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-2">ไม่มีข้อมูลผู้ดูแลปัจจุบัน</p>
                  )}

                  {/* 🔹 ส่วนที่ 2: รายชื่อคนในครอบครัว */}
                  <h5 className="ms-2 mt-4" style={{ color: "#444" }}> <b>2. คนในครอบครัว</b></h5>
                  {AssessinhomeForms.OtherPeople?.newCaregivers?.length > 0 ? (
                    AssessinhomeForms.OtherPeople.newCaregivers.map((cg, index) => (
                      <div key={index}>
                        <div
                          className="row mb-2 mt-3"
                          onClick={() => toggleAccordion(`family-${index}`)}
                        >
                          <div className="col-sm-4">
                            <strong
                              style={{
                                cursor: "pointer",
                                color: "#007BFF",
                                transition: "color 0.1s ease",
                              }}
                              onMouseEnter={(e) => (e.target.style.color = "#95d7ff")}
                              onMouseLeave={(e) => (e.target.style.color = "#007BFF")}
                            >
                              คนที่ {index + 1} : {cg.firstName} {cg.lastName || "-"} ({cg.relationship || "-"})
                            </strong>
                          </div>
                        </div>

                        {openIndex === `family-${index}` && (
                          <div className="p-3 border rounded ms-2">
                            <div className="row">
                              <div className="col-sm-3"><strong>วันเกิด :</strong></div>
                              <div className="col-sm-9">
                                <p>{cg.birthDate ? formatThaiDate(cg.birthDate) : "0 ปี 0 เดือน"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>ความสัมพันธ์ :</strong></div>
                              <div className="col-sm-9"><p>{cg.relationship || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>อาชีพ :</strong></div>
                              <div className="col-sm-9"><p>{cg.occupation || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>สถานภาพ :</strong></div>
                              <div className="col-sm-9"><p>{cg.status || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>รายได้ต่อเดือน :</strong></div>
                              <div className="col-sm-9"><p>{cg.income || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>สิทธิ :</strong></div>
                              <div className="col-sm-9"><p>{cg.benefit || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>โรคประจำตัว :</strong></div>
                              <div className="col-sm-9"><p>{cg.ud || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>อุปนิสัย :</strong></div>
                              <div className="col-sm-9"><p>{cg.habit || "-"}</p></div>
                            </div>
                            <div className="row">
                              <div className="col-sm-3"><strong>รายละเอียดการดูแลผู้ป่วย :</strong></div>
                              <div className="col-sm-7"><p>{cg.careDetails || "-"}</p></div>
                            </div>
                            <div className="col-sm-2">
                              <button
                                className="btn m-2"
                                style={{ backgroundColor: "#ffde59", color: "black" }}
                                onClick={() => handleEditNewCaregivers(index)}
                              >
                                <i className="bi bi-pencil-fill"></i> แก้ไข
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-2">ไม่มีข้อมูลคนในครอบครัว</p>
                  )}
                </div>
              )}
              {activeTab === "Medication" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ข้อมูลเกี่ยวกับการใช้ยา</p>

                  {AssessinhomeForms.Medication ? (
                    <div className="p-3 border rounded ms-2">
                      <div className="row">
                        <div className="col-sm-2"><strong>ยาที่แพทย์สั่ง :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.Medication.prescribedMedication || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-2"><strong>การใช้ยาจริง :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.Medication.actualMedication || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-2"><strong>อาหารเสริม :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.Medication.supplements || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-2"><strong>การบริหารยา :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.Medication.administration || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-2"><strong>การรับประทานยา :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.Medication.intake || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-2"><strong>ความสม่ำเสมอ :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.Medication.consistency || "-"}</p>
                        </div>
                      </div>

                      {/* ปุ่มแก้ไข */}
                      <div className="col-sm-2">
                        <button
                          className="btn m-2"
                          style={{ backgroundColor: "#ffde59", color: "black" }}
                          onClick={() => handleEditClick("Medication")}
                        >
                          <i className="bi bi-pencil-fill"></i> แก้ไข
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="p-2">ไม่มีข้อมูลการใช้ยา</p>
                  )}
                </div>
              )}
              {activeTab === "Physical Examination" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}>  การซักประวัติและการตรวจร่างกายทั่วไป</p>

                  {AssessinhomeForms.PhysicalExamination ? (
                    <div className="p-3 border rounded ms-2">
                      <div className="row">
                        <div className="col-sm-3"><strong>Temperature :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.temperature || "0"}  °C</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>Blood pressure :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.bloodPressure || "0"} mmHg</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>Pulse :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.pulse || "0"} min</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>Respiration :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.respiratoryRate || "0"} min</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>GA (ลักษณะโดยรวม) :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.generalAppearance || "-"}</p>
                        </div>
                      </div>

                      {/* ระบบต่างๆ ของร่างกาย */}
                      <div className="row">
                        <div className="col-sm-3"><strong>CVS (ระบบหัวใจ) :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.cardiovascularSystem || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>RS (ระบบหายใจ) :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.respiratorySystem || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>Abd (ช่องท้อง) :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.abdominal || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>NS (ระบบประสาท) :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.nervousSystem || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>Ext (รยางค์แขน/ขา) :</strong></div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.PhysicalExamination.extremities || "-"}</p>
                        </div>
                      </div>

                      {/* สภาวะทางอารมณ์และจิตใจ */}
                      <div className="row">
                        <div className="col-sm-3"><strong>Mood and affect :</strong></div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.moodandaffect?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.moodandaffect.map((item) =>
                                item.isOther ? `อื่นๆ : ${item.value}` : item.value
                              ).join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3"><strong>Appearance and Behavior :</strong></div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.appearanceAndBehavior?.length > 0 ? (
                              AssessinhomeForms.PhysicalExamination.appearanceAndBehavior
                                .sort((a, b) => (a.isOther ? 1 : -1)) // ให้ "อื่นๆ" ไปอยู่ท้ายสุด
                                .map((item) => (item.isOther ? `อื่นๆ : ${item.value}` : item.value))
                                .join(", ")
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-3"><strong>Eye contact :</strong></div>
                        <div className="col-sm-9">
                          {AssessinhomeForms.PhysicalExamination.eyeContact?.length > 0 ? (
                            <p>
                              {AssessinhomeForms.PhysicalExamination.eyeContact
                                .sort((a, b) => (a.isOther ? 1 : -1)) // ให้ "อื่นๆ" ไปอยู่ท้ายสุด
                                .map((item) => (item.isOther ? `อื่นๆ : ${item.value}` : item.value))
                                .join(", ")}
                            </p>
                          ) : (
                            <p>-</p>
                          )}
                        </div>
                      </div>


                      {/* กระบวนการคิดและการรับรู้ */}
                      <div className="row">
                        <div className="col-sm-3"><strong>Attention :</strong></div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.attention?.length > 0 ? (
                              AssessinhomeForms.PhysicalExamination.attention
                                .sort((a, b) => (a.isOther ? 1 : -1)) // ให้ "อื่นๆ" ไปอยู่ท้ายสุด
                                .map((item) => (item.isOther ? `อื่นๆ : ${item.value}` : item.value))
                                .join(", ")
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-3"><strong>Orientation :</strong></div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.orientation?.length > 0 ? (
                              AssessinhomeForms.PhysicalExamination.orientation
                                .sort((a, b) => (a.isOther ? 1 : -1))
                                .map((item) => (item.isOther ? `อื่นๆ : ${item.value}` : item.value))
                                .join(", ")
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-3"><strong>Thought process :</strong></div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.thoughtProcess?.length > 0 ? (
                              AssessinhomeForms.PhysicalExamination.thoughtProcess
                                .sort((a, b) => (a.isOther ? 1 : -1))
                                .map((item) => (item.isOther ? `อื่นๆ : ${item.value}` : item.value))
                                .join(", ")
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-sm-3"><strong>Thought content :</strong></div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.thoughtContent?.length > 0 ? (
                              AssessinhomeForms.PhysicalExamination.thoughtContent
                                .sort((a, b) => (a.isOther ? 1 : -1))
                                .map((item) => (item.isOther ? `อื่นๆ : ${item.value}` : item.value))
                                .join(", ")
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      </div>


                      {/* ปุ่มแก้ไข */}
                      <div className="col-sm-2">
                        <button
                          className="btn m-2"
                          style={{ backgroundColor: "#ffde59", color: "black" }}
                          onClick={() => handleEditClick("Physical Examination")}
                        >
                          <i className="bi bi-pencil-fill"></i> แก้ไข
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="p-2">ไม่มีข้อมูลการตรวจร่างกาย</p>
                  )}
                </div>
              )}
              {activeTab === "SSS" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ประเมินระบบการดูแลผู้ป่วย</p>

                  {/* 🔹 ส่วนที่ 1: ความปลอดภัย */}
                  <h5 className="ms-2 mt-3" style={{ color: "#444" }}> <b>1. Safety (ความปลอดภัย)</b></h5>
                  <div className="p-3 border rounded ms-2 mt-3">
                    {AssessinhomeForms.SSS?.Safety ? (
                      <>
                        {[
                          { label: "แสงไฟ", value: AssessinhomeForms.SSS.Safety.cleanliness },
                          { label: "พื้นต่างระดับ", value: AssessinhomeForms.SSS.Safety.floorSafety },
                          { label: "บันได", value: AssessinhomeForms.SSS.Safety.stairsSafety },
                          { label: "ราวจับ", value: AssessinhomeForms.SSS.Safety.handrailSafety },
                          { label: "เหลี่ยมคม", value: AssessinhomeForms.SSS.Safety.sharpEdgesSafety },
                          { label: "ความลื่นของพื้น", value: AssessinhomeForms.SSS.Safety.slipperyFloorSafety },
                          { label: "ลักษณะโถส้วม", value: AssessinhomeForms.SSS.Safety.toiletSafety },
                          { label: "เตาที่ใช้หุงต้ม", value: AssessinhomeForms.SSS.Safety.stoveSafety },
                          { label: "การเก็บของในบ้าน", value: AssessinhomeForms.SSS.Safety.storageSafety },
                          { label: "น้ำที่ใช้ดื่ม", value: AssessinhomeForms.SSS.Safety.waterSafety },
                          { label: "อันตรายอื่นๆ (ถ้ามี)", value: AssessinhomeForms.SSS.Safety.otherHealthHazards },
                          { label: "ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร", value: AssessinhomeForms.SSS.Safety.emergencyContact }
                        ].map((item, index) => (
                          <div className="row" key={index}>
                            <div className="col-sm-4"><strong>{item.label} :</strong></div>
                            <div className="col-sm-8"><p>{item.value || "-"}</p></div>
                          </div>
                        ))}
                        <div className="col-sm-2">
                          <button
                            className="btn m-2"
                            style={{ backgroundColor: "#ffde59", color: "black" }}
                            onClick={() => handleEditClick("SSS_Safety")}
                          >
                            <i className="bi bi-pencil-fill"></i> แก้ไข
                          </button>
                        </div>
                      </>
                    ) : <p className="p-2">ไม่มีข้อมูล</p>}
                  </div>
                  {/* 🔹 ส่วนที่ 2: จิตวิญญาณ */}
                  <h5 className="ms-2 mt-4" style={{ color: "#444" }}> <b>2. Spiritual Health (สุขภาพจิตวิญญาณ)</b></h5>
                  <div className="p-3 border rounded ms-2 mt-3">
                    {AssessinhomeForms.SSS?.SpiritualHealth ? (
                      <>
                        {[
                          { label: "Faith and belief", value: AssessinhomeForms.SSS.SpiritualHealth.faithBelief },
                          { label: "Importance", value: AssessinhomeForms.SSS.SpiritualHealth.importance },
                          { label: "Community", value: AssessinhomeForms.SSS.SpiritualHealth.community },
                          { label: "Address in care", value: AssessinhomeForms.SSS.SpiritualHealth.addressInCare },
                          { label: "Love", value: AssessinhomeForms.SSS.SpiritualHealth.love },
                          { label: "Religion", value: AssessinhomeForms.SSS.SpiritualHealth.religion },
                          { label: "Forgiveness", value: AssessinhomeForms.SSS.SpiritualHealth.forgiveness },
                          { label: "Hope", value: AssessinhomeForms.SSS.SpiritualHealth.hope },
                          { label: "Meaning of life", value: AssessinhomeForms.SSS.SpiritualHealth.meaningOfLife }
                        ].map((item, index) => (
                          <div className="row" key={index}>
                            <div className="col-sm-4"><strong>{item.label} :</strong></div>
                            <div className="col-sm-8"><p>{item.value || "-"}</p></div>
                          </div>
                        ))}
                        <div className="col-sm-2">
                          <button
                            className="btn m-2"
                            style={{ backgroundColor: "#ffde59", color: "black" }}
                            onClick={() => handleEditClick("SSS_SpiritualHealth")}
                          >
                            <i className="bi bi-pencil-fill"></i> แก้ไข
                          </button>
                        </div>
                      </>
                    ) : <p className="p-2">ไม่มีข้อมูล</p>}
                  </div>
                  {/* 🔹 ส่วนที่ 3: การรับบริการ */}
                  <h5 className="ms-2 mt-4" style={{ color: "#444" }}> <b>3. Service (การรับบริการ)</b></h5>
                  <div className="p-3 border rounded ms-2 mt-3">
                    {AssessinhomeForms.SSS?.Service ? (
                      <>
                        {[
                          { label: "เมื่อเจ็บป่วย ท่านรับบริการที่ใด", value: AssessinhomeForms.SSS.Service.serviceLocation },
                          { label: "อื่นๆ", value: AssessinhomeForms.SSS.Service.otherServices }
                        ].map((item, index) => (
                          <div className="row" key={index}>
                            <div className="col-sm-4"><strong>{item.label} :</strong></div>
                            <div className="col-sm-8"><p>{item.value || "-"}</p></div>
                          </div>

                        ))}
                        <div className="col-sm-2">
                          <button
                            className="btn m-2"
                            style={{ backgroundColor: "#ffde59", color: "black" }}
                            onClick={() => handleEditClick("SSS_Service")}
                          >
                            <i className="bi bi-pencil-fill"></i> แก้ไข
                          </button>
                        </div>
                      </>
                    ) : <p className="p-2">ไม่มีข้อมูล</p>}
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      {isModalOpen && currentEditSection === "Immobility" && (
        <ImmobilityForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}
      {isModalOpen && currentEditSection === "Nutrition" && (
        <NutritionForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
          name={name} 
          surname={surname} 
        />
      )}
      {isModalOpen && currentEditSection === "Housing" && (
        <HousingForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}
      {isModalOpen && currentEditSection === "OtherPeople" && (
        <OtherpeopleForm
          formData={tempFormValues}
          onSave={(updatedData) => handleSaveChanges(updatedData, editingIndex)}
          onClose={handleCloseModal}
        />
      )}
      {isModalOpen && currentEditSection === "OtherPeople" && editingNewCaregiverIndex !== null && (
        <OtherpeopleForm
          formData={tempFormValues}
          onSave={(updatedData) => handleSaveChanges(updatedData, editingNewCaregiverIndex, true)}
          onClose={handleCloseModal}
        />
      )}
      {isModalOpen && currentEditSection === "Medication" && (
        <MedicationForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}
      {isModalOpen && currentEditSection === "Physical Examination" && (
        <PhysicalExaminationForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}
      {isModalOpen && currentEditSection.startsWith("SSS_") && (
        <SSSForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
          currentSection={currentEditSection} // ✅ ส่งชื่อ section ที่กำลังแก้ไขไป
        />
      )}



    </main>
  );
}
