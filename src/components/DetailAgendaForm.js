import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "../css/form.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./sidebar";
import PatientAgendaForm from "./UpdateAssessinhomesss/updatePatientAgenda.js";
import CaregiverAgendaForm from "./UpdateAssessinhomesss/updateCaregiverAgenda.js";
import CaregiverAssessmentForm from "./UpdateAssessinhomesss/updateCaregiverAssessment.js";
import ZaritburdeninterviewForm from "./UpdateAssessinhomesss/updateZaritburdeninterview.js";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

export default function DetailAgendaForm() {
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

  const fetchAllUsers = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/alluserchat?userId=${userId}`
      );
      const data = await response.json();

      const usersWithLastMessage = await Promise.all(
        data.data.map(async (user) => {
          const lastMessageResponse = await fetch(
            `http://localhost:5000/lastmessage/${user._id}?loginUserId=${userId}`
          );
          const lastMessageData = await lastMessageResponse.json();

          const lastMessage = lastMessageData.lastMessage;
          return { ...user, lastMessage: lastMessage ? lastMessage : null };
        })
      );

      const sortedUsers = usersWithLastMessage.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return (
          new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );
      });

      setAllUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };
  //polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllUsers(data._id);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const countUnreadUsers = () => {
    const unreadUsers = allUsers.filter((user) => {
      const lastMessage = user.lastMessage;
      return (
        lastMessage && lastMessage.senderModel === "User" && !lastMessage.isRead
      );
    });
    return unreadUsers.length;
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

  const [originalData, setOriginalData] = useState(null); // ✅ เก็บข้อมูลเดิม
  const [AgendaForms, setAgendaForms] = useState([]);

  // โหลดข้อมูลจาก API และเซ็ต originalData
  useEffect(() => {
    const fetchAgendaForms = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getAgendaForm/${id}`
        );
        const data = await response.json();

        if (response.ok) {
          setAgendaForms(data.data);
          setOriginalData(data.data); // ✅ เซ็ตค่า originalData
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching readiness form:", error);
      }
    };
    fetchAgendaForms();
  }, [id, token]);

  useEffect(() => {
    if (AgendaForms.user && AgendaForms._id) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getuser/${AgendaForms.user}`
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
  }, [AgendaForms.user]);

  useEffect(() => {
    if (AgendaForms && AgendaForms.user) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicalInformation/${AgendaForms.user}`
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
  }, [AgendaForms.user]);

  const handleBreadcrumbClick = () => {
    navigate("/assessinhomesssuser", { state: { id: AgendaForms.user } });
  };

  // ฟังก์ชันสำหรับกำหนดสีตามกลุ่มคะแนน
  const getGroupStyle = (totalScore) => {
    if (totalScore !== null) {
      if (totalScore > 20) {
        return "text-danger"; // สีแดงสำหรับภาระหนัก
      } else if (totalScore >= 11) {
        return "text-primary"; // สีน้ำเงินสำหรับภาระปานกลาง
      } else if (totalScore >= 0) {
        return "text-success"; // สีเขียวสำหรับไม่มีภาระ
      }
    }
    return "text-dark"; // ค่าเริ่มต้น (สีดำ) หากไม่มีคะแนน
  };

  // ฟังก์ชันสำหรับข้อความการประเมินผล
  const getGroupMessage = (totalScore) => {
    if (totalScore <= 10) {
      return "ไม่มีภาระทางใจ";
    } else if (totalScore >= 11 && totalScore <= 20) {
      return "มีภาระปานกลาง";
    } else if (totalScore > 20) {
      return "มีภาระหนัก";
    }
    return "ไม่มีข้อมูล"; // กรณีไม่มีคะแนน
  };

  const [tempFormValues, setTempFormValues] = useState({}); // เก็บค่าที่แก้ไข
  const [currentEditSection, setCurrentEditSection] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (AgendaForms.user) {
      setUserId(AgendaForms.user);
    }
  }, [AgendaForms.user]);

  const handleEditClick = (section) => {
    setCurrentEditSection(section);
    if (section === "Patient Agenda Form") {
      setTempFormValues({ ...AgendaForms.PatientAgenda });
    } else if (section === "Caregiver Agenda Form") {
      setTempFormValues({ ...AgendaForms.CaregiverAgenda });
    } else if (section === "Caregiver Assessment Form") {
      setTempFormValues({ Care_Assessment: [...AgendaForms.CaregiverAssessment.Care_Assessment] });
    } else if (section === "Zarit Burden Interview Form") {
      setTempFormValues({ ...AgendaForms.Zaritburdeninterview });
    }
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTempFormValues({});
  };

  const [editingOldCaregiverIndex, setEditingOldCaregiverIndex] = useState(null);
  const [editingNewCaregiverIndex, setEditingNewCaregiverIndex] = useState(null);

  const handleEditOldCaregiverAgenda = (index) => {
    setCurrentEditSection("Caregiver Agenda Form");
    setIsModalOpen(true);
    setEditingOldCaregiverIndex(index);  // ✅ ระบุว่ากำลังแก้ไขผู้ดูแลเก่า
    setEditingNewCaregiverIndex(null);  // ❌ ไม่ให้แก้ไขผู้ดูแลใหม่ในเวลาเดียวกัน
    setTempFormValues({ ...AgendaForms.CaregiverAgenda.Old_Caregiver_Agenda[index] });
  };

  const handleEditNewCaregiversAgenda = (index) => {
    setCurrentEditSection("Caregiver Agenda Form");
    setIsModalOpen(true);
    setEditingNewCaregiverIndex(index);  // ✅ ระบุว่ากำลังแก้ไขผู้ดูแลใหม่
    setEditingOldCaregiverIndex(null);  // ❌ ไม่ให้แก้ไขผู้ดูแลเก่าในเวลาเดียวกัน
    setTempFormValues({ ...AgendaForms.CaregiverAgenda.New_Caregiver_Agenda[index] });
  };

  const [editingOldCaregiverAssessmentIndex, setEditingOldCaregiverAssessmentIndex] = useState(null);
  const [editingNewCaregiverAssessmentIndex, setEditingNewCaregiverAssessmentIndex] = useState(null);

  const handleEditOldCaregiverAssessment = (index) => {
    setCurrentEditSection("Caregiver Assessment Form");
    setIsModalOpen(true);
    setEditingOldCaregiverAssessmentIndex(index);
    setEditingNewCaregiverAssessmentIndex(null);
    setTempFormValues({ ...AgendaForms.CaregiverAssessment.Old_Caregiver_Assessment[index] });
  };

  const handleEditNewCaregiverAssessment = (index) => {
    setCurrentEditSection("Caregiver Assessment Form");
    setIsModalOpen(true);
    setEditingNewCaregiverAssessmentIndex(index);
    setEditingOldCaregiverAssessmentIndex(null);
    setTempFormValues({ ...AgendaForms.CaregiverAssessment.New_Caregiver_Assessment[index] });
  };

  const handleSaveChanges = async (updatedData) => {
    try {
      let newAgendaForms = { ...AgendaForms };

      if (currentEditSection === "Patient Agenda Form") {
        newAgendaForms.PatientAgenda = updatedData;

      } else if (currentEditSection === "Caregiver Assessment Form") {
        if (editingOldCaregiverAssessmentIndex !== null) {
          // ✅ อัปเดตเฉพาะผู้ดูแลเก่า
          let updatedOldAssessments = [...newAgendaForms.CaregiverAssessment.Old_Caregiver_Assessment];
          updatedOldAssessments[editingOldCaregiverAssessmentIndex] = { ...updatedData };
          newAgendaForms.CaregiverAssessment.Old_Caregiver_Assessment = updatedOldAssessments;
        } else if (editingNewCaregiverAssessmentIndex !== null) {

          // ✅ อัปเดตเฉพาะผู้ดูแลใหม่
          let updatedNewAssessments = [...newAgendaForms.CaregiverAssessment.New_Caregiver_Assessment];
          updatedNewAssessments[editingNewCaregiverAssessmentIndex] = { ...updatedData };
          newAgendaForms.CaregiverAssessment.New_Caregiver_Assessment = updatedNewAssessments;
        }
      } else if (currentEditSection === "Zarit Burden Interview Form") {
        newAgendaForms.Zaritburdeninterview = updatedData;

      }
      else if (currentEditSection === "Caregiver Agenda Form") {
        if (editingOldCaregiverIndex !== null) {
          // ✅ อัปเดตเฉพาะผู้ดูแลเก่า
          let updatedOldCaregiverAgenda = [...newAgendaForms.CaregiverAgenda.Old_Caregiver_Agenda];
          updatedOldCaregiverAgenda[editingOldCaregiverIndex] = { ...updatedData };
          newAgendaForms.CaregiverAgenda.Old_Caregiver_Agenda = updatedOldCaregiverAgenda;
        } else if (editingNewCaregiverIndex !== null) {
          // ✅ อัปเดตเฉพาะผู้ดูแลใหม่
          let updatedNewCaregiverAgenda = [...newAgendaForms.CaregiverAgenda.New_Caregiver_Agenda];
          updatedNewCaregiverAgenda[editingNewCaregiverIndex] = { ...updatedData };
          newAgendaForms.CaregiverAgenda.New_Caregiver_Agenda = updatedNewCaregiverAgenda;
        }
      }
      const response = await fetch(`http://localhost:5000/updateAgenda/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgendaForms),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update data");

      // ✅ อัปเดตค่าที่ได้จากเซิร์ฟเวอร์กลับมา
      const updatedForm = await fetch(`http://localhost:5000/getAgendaForm/${id}`);
      const updatedDataFromServer = await updatedForm.json();

      toast.success("แก้ไขข้อมูลสำเร็จ", {
        position: "top-right",
        autoClose: 1000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        // ✅ อัปเดตค่าที่ได้จากเซิร์ฟเวอร์ลง State เพื่อให้ `updatedAt` เปลี่ยนแปลงใน UI
        setAgendaForms(updatedDataFromServer.data);
        setOriginalData(updatedDataFromServer.data);
        setIsModalOpen(false);
        setEditingOldCaregiverIndex(null);
        setEditingNewCaregiverIndex(null);
        setEditingOldCaregiverAssessmentIndex(null);
        setEditingNewCaregiverAssessmentIndex(null);
      }, 1100);
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
    if (AgendaForms.CaregiverAgenda) {
      setOpenIndex("caregiver-0"); // เปิดคนแรกโดยอัตโนมัติ
    }
  }, [AgendaForms.CaregiverAgenda]);

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

  const [activeTab, setActiveTab] = useState("patientAgenda"); // ค่าเริ่มต้น



  return (
    <main className="body">
      <ToastContainer />
      <Sidebar />

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
            <span> {formatDate(AgendaForms.createdAt)}</span><br></br>
            <label className="text-secondary mt-2">วันที่แก้ไขล่าสุด :</label>
            <span> {AgendaForms.updatedAt === AgendaForms.createdAt
              ? " -"
              : formatDate(AgendaForms.updatedAt)}</span>
          </div>
          {/* Navigation Tabs */}
          <div className="readiness card mt-4" style={{ width: "90%" }}>
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "patientAgenda" ? "active" : ""}`}
                  onClick={() => setActiveTab("patientAgenda")}
                >
                  <i class="bi bi-person-check" ></i> Patient Agenda
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "caregiverAgenda" ? "active" : ""}`}
                  onClick={() => setActiveTab("caregiverAgenda")}
                >
                  <i class="bi bi-person-check" ></i> Caregiver Agenda
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "caregiverAssessment" ? "active" : ""}`}
                  onClick={() => setActiveTab("caregiverAssessment")}
                >
                  <i class="bi bi-person-check" ></i> Caregiver Assessment
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "zaritBurden" ? "active" : ""}`}
                  onClick={() => setActiveTab("zaritBurden")}
                >
                  <i class="bi bi-file-earmark-medical"></i> Zarit Burden Interview
                </button>
              </li>
            </ul>

            {/* Content ของแต่ละแท็บ */}
            <div className="tab-content m-4">
              {activeTab === "patientAgenda" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ประเมินผู้ป่วยเบื้องต้น</p>
                  <div className="p-3 border rounded ms-2">
                    <div class="row">
                      <div class="col-sm-2">
                        <strong>Idea :</strong>
                      </div>

                      <div class="col-sm-9">
                        <p>
                          {AgendaForms.PatientAgenda?.patient_idea || "-"}
                        </p>
                      </div>

                    </div>
                    <div class="row ">
                      <div class="col-sm-2">
                        <strong>Feeling :</strong>
                      </div>

                      <div class="col-sm-9">
                        <p>
                          {AgendaForms.PatientAgenda?.patient_feeling || "-"}
                        </p>
                      </div>

                    </div>
                    <div class="row ">
                      <div class="col-sm-2">
                        <strong>Function :</strong>
                      </div>
                      <div class="col-sm-9">
                        <p>{AgendaForms.PatientAgenda?.patient_funtion || "-"}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-2">
                        <strong>Expectation :</strong>
                      </div>
                      <div className="col-sm-9">
                        <p>
                          {AgendaForms.PatientAgenda?.patient_expectation || "-"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <button
                        className="btn m-2"
                        style={{ backgroundColor: "#ffde59", color: "black" }}
                        onClick={() => handleEditClick("Patient Agenda Form")}
                      >
                        <i class="bi bi-pencil-fill"></i> แก้ไข
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "caregiverAgenda" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ประเมินผู้ดูแลเบื้องต้น</p>
                  <h5 className="ms-2" style={{ color: "#444" }}> <b>1. ผู้ดูแล</b></h5>
                  {AgendaForms.CaregiverAgenda?.Old_Caregiver_Agenda?.length > 0 ? (
                    AgendaForms.CaregiverAgenda?.Old_Caregiver_Agenda?.map((agenda, index) => (
                      <div key={index}>
                        <div
                          className="row mb-2 mt-3"
                          onClick={() => toggleAccordion(`caregiver-${index}`)}
                        >
                          <div className="col-sm-3">
                            <strong
                              style={{
                                cursor: "pointer",
                                color: "#007BFF",
                                transition: "color 0.1s ease",
                              }}
                              onMouseEnter={(e) => e.target.style.color = "#95d7ff"} // เมื่อ hover
                              onMouseLeave={(e) => e.target.style.color = "#007BFF"} // เมื่อออกจาก hover
                            >
                              ผู้ดูแลคนที่ {index + 1} : {agenda.firstName}{" "}
                              {agenda.lastName || "-"} ({agenda.relationship || "-"})
                            </strong>
                          </div>

                        </div>
                        {openIndex === `caregiver-${index}` && (
                          <div className=" p-3 border rounded ms-2 ">
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Idea :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_idea || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Feeling :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_feeling || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Function :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_function || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Expectation :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_expectation || "-"}</p>
                              </div>
                            </div>
                            {/* <hr /> */}
                            <div className="col-sm-2">
                              <button
                                className="btn m-2"
                                style={{ backgroundColor: "#ffde59", color: "black" }}
                                onClick={() => handleEditOldCaregiverAgenda(index)}
                              >
                                <i class="bi bi-pencil-fill"></i> แก้ไข
                              </button>

                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-2">ไม่มีข้อมูลผู้ดูแล</p>
                  )}
                  <h5 className="ms-2 mt-4" style={{ color: "#444" }}> <b>2. คนในครอบครัว</b></h5>
                  {AgendaForms.CaregiverAgenda?.New_Caregiver_Agenda?.length > 0 ? (
                    AgendaForms.CaregiverAgenda?.New_Caregiver_Agenda?.map((agenda, index) => (
                      <div key={index}>
                        <div
                          className="row mb-2 mt-3"
                          onClick={() => toggleAccordion(`family-${index}`)}
                        >
                          <div className="col-sm-6">
                            <strong
                              style={{
                                cursor: "pointer",
                                color: "#007BFF",
                                transition: "color 0.1s ease",
                              }}
                              onMouseEnter={(e) => e.target.style.color = "#95d7ff"} // เมื่อ hover
                              onMouseLeave={(e) => e.target.style.color = "#007BFF"} // เมื่อออกจาก hover
                            >
                              คนที่ {index + 1} : {agenda.firstName}{" "}
                              {agenda.lastName || "-"} ({agenda.relationship || "-"})
                            </strong>
                          </div>

                        </div>

                        {openIndex === `family-${index}` && (
                          <div className=" p-3 border rounded ms-2 ">
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Idea :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_idea || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Feeling :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_feeling || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Function :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_function || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Expectation :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.caregiver_expectation || "-"}</p>
                              </div>
                            </div>
                            {/* <hr /> */}
                            <div className="col-sm-2">
                              <button
                                className="btn m-2"
                                style={{ backgroundColor: "#ffde59", color: "black" }}
                                onClick={() => handleEditNewCaregiversAgenda(index)}
                              >
                                <i class="bi bi-pencil-fill"></i> แก้ไข
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

              {activeTab === "caregiverAssessment" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ประเมินภาระในการดูแลและปัญหาสุขภาพจิตของผู้ดูแล</p>
                  <h5 className="ms-2" style={{ color: "#444" }}> <b>1. ผู้ดูแล</b></h5>
                  {AgendaForms.CaregiverAssessment?.Old_Caregiver_Assessment?.length > 0 ? (
                    AgendaForms.CaregiverAssessment.Old_Caregiver_Assessment.map((agenda, index) => (
                      <div key={index}>
                        <div
                          className="row mb-2 mt-3"
                          onClick={() => toggleAccordion(`caregiver-${index}`)}
                        >
                          <div className="col-sm-3">
                            <strong
                              style={{
                                cursor: "pointer",
                                color: "#007BFF",
                                transition: "color 0.1s ease",
                              }}
                              onMouseEnter={(e) => e.target.style.color = "#95d7ff"} // เมื่อ hover
                              onMouseLeave={(e) => e.target.style.color = "#007BFF"} // เมื่อออกจาก hover
                            >
                              ผู้ดูแลคนที่ {index + 1} : {agenda.firstName}{" "}
                              {agenda.lastName || "-"} ({agenda.relationship || "-"})
                            </strong>
                          </div>
                        </div>
                        {openIndex === `caregiver-${index}` && (
                          <div className="p-3 border rounded ms-2">
                            <div className="row ">
                              <div className="col-sm-2">
                                <strong>Care  :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.care || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Affection :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.affection || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Rest :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.rest || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Empathy :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.empathy || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Goal Of Care :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.goalOfCare || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Ventilation :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.ventilation || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Empowerment :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.empowerment || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Resource :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.resource || "-"}</p>
                              </div>
                            </div>
                            <div className="col-sm-2">
                              <button
                                className="btn m-2"
                                style={{ backgroundColor: "#ffde59", color: "black" }}
                                onClick={() => handleEditOldCaregiverAssessment(index)}
                              >
                                <i class="bi bi-pencil-fill"></i> แก้ไข
                              </button>

                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-2">ไม่มีข้อมูลผู้ดูแล</p>
                  )}
                  <h5 className="ms-2 mt-4" style={{ color: "#444" }}> <b>2. คนในครอบครัว</b></h5>
                  {AgendaForms.CaregiverAssessment?.New_Caregiver_Assessment?.length > 0 ? (
                    AgendaForms.CaregiverAssessment?.New_Caregiver_Assessment?.map((agenda, index) => (
                      <div key={index}>
                        <div
                          className="row mb-2 mt-3"
                          onClick={() => toggleAccordion(`family-${index}`)}
                        >
                          <div className="col-sm-6">
                            <strong
                              style={{
                                cursor: "pointer",
                                color: "#007BFF",
                                transition: "color 0.1s ease",
                              }}
                              onMouseEnter={(e) => e.target.style.color = "#95d7ff"} // เมื่อ hover
                              onMouseLeave={(e) => e.target.style.color = "#007BFF"} // เมื่อออกจาก hover
                            >
                              คนที่ {index + 1} : {agenda.firstName}{" "}
                              {agenda.lastName || "-"} ({agenda.relationship || "-"})
                            </strong>
                          </div>
                        </div>
                        {openIndex === `family-${index}` && (
                          <div className="p-3 border rounded ms-2">
                            <div className="row ">
                              <div className="col-sm-2">
                                <strong>Care  :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.care || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Affection :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.affection || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Rest :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.rest || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Empathy :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.empathy || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Goal Of Care :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.goalOfCare || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Ventilation :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.ventilation || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Empowerment :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.empowerment || "-"}</p>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-sm-2">
                                <strong>Resource :</strong>
                              </div>
                              <div className="col-sm-9">
                                <p>{agenda.resource || "-"}</p>
                              </div>
                            </div>
                            <div className="col-sm-2">
                              <button
                                className="btn m-2"
                                style={{ backgroundColor: "#ffde59", color: "black" }}
                                onClick={() => handleEditNewCaregiverAssessment(index)}
                              >
                                <i class="bi bi-pencil-fill"></i> แก้ไข
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

              {activeTab === "zaritBurden" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> แบบประเมินภาระการดูแลผู้ป่วยในบ้าน</p>
                  {AgendaForms.Zaritburdeninterview ? (
                    <div className="p-3 border rounded ms-2">
                      <div className="row">
                        <div className="col-sm-2">
                          <strong>คะแนนรวม :</strong>
                        </div>
                        <div className="col-sm-9">
                          <div className="row">
                            <div className="col-8 col-sm-6">
                              <p
                                className={getGroupStyle(
                                  AgendaForms.Zaritburdeninterview.totalScore
                                )}
                              >
                                {AgendaForms.Zaritburdeninterview.totalScore ||
                                  "0"}{" "}
                                คะแนน
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
                            <div className="col-8 col-sm-6">
                              <p
                                className={getGroupStyle(
                                  AgendaForms.Zaritburdeninterview.totalScore
                                )}
                              >
                                {getGroupMessage(
                                  AgendaForms.Zaritburdeninterview.totalScore
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-2">
                        <button
                          className="btn m-2"
                          style={{ backgroundColor: "#ffde59", color: "black" }}
                          onClick={() => handleEditClick("Zarit Burden Interview Form")}
                        >
                          <i class="bi bi-pencil-fill"></i> แก้ไข
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>ไม่มีข้อมูล</p>
                  )}
                  <script>window.location.reload();</script>


                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && currentEditSection === "Patient Agenda Form" && (
        <PatientAgendaForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />

      )}
      {isModalOpen && currentEditSection === "Caregiver Agenda Form" && editingOldCaregiverIndex !== null && (
        <CaregiverAgendaForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}

      {isModalOpen && currentEditSection === "Caregiver Agenda Form" && editingNewCaregiverIndex !== null && (
        <CaregiverAgendaForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}

      {isModalOpen && currentEditSection === "Caregiver Assessment Form" && editingOldCaregiverAssessmentIndex !== null && (
        <CaregiverAssessmentForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}

      {isModalOpen && currentEditSection === "Caregiver Assessment Form" && editingNewCaregiverAssessmentIndex !== null && (
        <CaregiverAssessmentForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}


      {isModalOpen && currentEditSection === "Zarit Burden Interview Form" && (
        <ZaritburdeninterviewForm
          formData={tempFormValues}
          onSave={handleSaveChanges}
          onClose={handleCloseModal}
        />
      )}

    </main>
  );
}
