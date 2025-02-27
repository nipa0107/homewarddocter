import React, { useEffect, useState, useRef } from "react";
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
  const hasFetchedUserData = useRef(false);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [userUnreadCounts, setUserUnreadCounts] = useState([]);

  useEffect(() => {
    socket?.on("newAlert", (alert) => {
      console.log("Received newAlert:", alert);

      setAlerts((prevAlerts) => {
        const isExisting = prevAlerts.some(
          (existingAlert) => existingAlert.patientFormId === alert.patientFormId
        );

        let updatedAlerts;

        if (isExisting) {
          if (alert.alertMessage === "เป็นเคสฉุกเฉิน") {
            updatedAlerts = [...prevAlerts, alert];
          } else {
            updatedAlerts = prevAlerts.map((existingAlert) =>
              existingAlert.patientFormId === alert.patientFormId
                ? alert
                : existingAlert
            );
          }
        } else {
          updatedAlerts = [...prevAlerts, alert];
        }

        return updatedAlerts.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    });

    socket?.on("deletedAlert", (data) => {
      setAlerts((prevAlerts) => {
        const filteredAlerts = prevAlerts.filter(
          (alert) => alert.patientFormId !== data.patientFormId
        );
        return filteredAlerts.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    });

    return () => {
      socket?.off("newAlert");
      socket?.off("deletedAlert");
    };
  }, []);

  useEffect(() => {
    const currentUserId = sender._id;

    const unreadAlerts = alerts.filter(
      (alert) =>
        Array.isArray(alert.viewedBy) && !alert.viewedBy.includes(currentUserId)
    );

    setUnreadCount(unreadAlerts.length); // ตั้งค่า unreadCount ตามรายการที่ยังไม่ได้อ่าน
  }, [alerts]);

  useEffect(() => {
    socket?.on("TotalUnreadCounts", (data) => {
      console.log("📦 TotalUnreadCounts received:", data);
      setUserUnreadCounts(data);
    });

    return () => {
      socket?.off("TotalUnreadCounts");
    };
  }, [socket]);

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
        setSender({
          name: data.data.name,
          surname: data.data.surname,
          _id: data.data._id,
        });
        setData(data.data);
        if (data.data == "token expired") {
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
    fetchAlerts(token)
      .then((alerts) => {
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
  }, []);

  const markAllAlertsAsViewed = () => {
    fetch("http://localhost:5000/alerts/mark-all-viewed", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedAlerts = alerts.map((alert) => ({
          ...alert,
          viewedBy: [...alert.viewedBy, userId],
        }));
        setAlerts(updatedAlerts);
        setUnreadCount(0);
      })
      .catch((error) => {
        console.error("Error marking all alerts as viewed:", error);
      });
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const filteredAlerts =
    filterType === "unread"
      ? alerts.filter((alert) => !alert.viewedBy.includes(userId))
      : alerts;

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

  const getAnswerElement = (answer) => {
    const isPositive = answer === "ใช่" || answer === "ถูกต้อง";
    const color = isPositive ? "rgb(0, 172, 0)" : "red";
    const iconClass = isPositive ? "bi bi-check-circle" : "bi bi-x-circle";

    return (
      <span style={{ color }}>
        <i className={iconClass} style={{ marginRight: "8px" }}></i>
        {answer}
      </span>
    );
  };
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

  const [currentEditSection, setCurrentEditSection] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // ดึงข้อมูลจาก AssessinhomeForms หรือ API
  useEffect(() => {
    if (AssessinhomeForms.user) {
      setUserId(AssessinhomeForms.user);
    }
  }, [AssessinhomeForms.user]);

  const handleEditClick = (section) => {
    setCurrentEditSection(section); // Set the section name here
    if (section === "Physical Examination") {
      setModalContent(
        <PhysicalExaminationForm
          formData={AssessinhomeForms.PhysicalExamination}
          onSave={(data) => handleSaveChanges({ PhysicalExamination: data })}
        />
      );
      setIsModalOpen(true);
    } else if (section === "Immobility") {
      setModalContent(
        <ImmobilityForm
          formData={AssessinhomeForms.Immobility}
          onSave={(data) => handleSaveChanges({ Immobility: data })}
        />
      );
      setIsModalOpen(true);
    } else if (section === "Nutrition") {
      setModalContent(
        <NutritionForm
          userId={userId}
          formData={AssessinhomeForms.Nutrition}
          onSave={(data) => handleSaveChanges({ Nutrition: data })}
        />
      );
      setIsModalOpen(true);
    } else if (section === "Housing") {
      setModalContent(
        <HousingForm
          formData={AssessinhomeForms.Housing}
          onSave={(data) => handleSaveChanges({ Housing: data })}
        />
      );
      setIsModalOpen(true);
    } else if (section === "OtherPeople") {
      setModalContent(
        <OtherpeopleForm
          formData={AssessinhomeForms.OtherPeople}
          onSave={(data) => handleSaveChanges({ OtherPeople: data })}
        />
      );
      setIsModalOpen(true);
    } else if (section === "Medication") {
      setModalContent(
        <MedicationForm
          formData={AssessinhomeForms.Medication}
          onSave={(data) => handleSaveChanges({ Medication: data })}
        />
      );
      setIsModalOpen(true);
    } else if (section === "SSS") {
      setModalContent(
        <SSSForm
          formData={AssessinhomeForms.SSS}
          onSave={(data) => handleSaveChanges({ SSS: data })}
        />
      );
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setCurrentEditSection("");
  };

  const handleSaveChanges = async (updatedSection) => {
    try {
      // Merge updated section with existing data
      const updatedData = {
        ...AssessinhomeForms, // Existing data
        ...updatedSection, // Updated section (PhysicalExamination or Immobility)
      };

      const response = await fetch(
        `http://localhost:5000/updateAssessinhomesss/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData), // Send the entire merged data
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update data");
      }

      console.log("Updated successfully:", result.data);
      toast.success("ข้อมูลได้รับการแก้ไขเรียบร้อย");

      // Close modal after showing success message
      setTimeout(() => {
        setModalContent(null);
        window.location.reload();
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
                if (String(user.userId) === String(sender._id)) {
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
              <p
                className="notifications-allread"
                onClick={markAllAlertsAsViewed}
              >
                ทำเครื่องหมายว่าอ่านทั้งหมด
              </p>
              <div className="notifications-filter">
                <button
                  className={filterType === "all" ? "active" : ""}
                  onClick={() => handleFilterChange("all")}
                >
                  ดูทั้งหมด
                </button>
                <button
                  className={filterType === "unread" ? "active" : ""}
                  onClick={() => handleFilterChange("unread")}
                >
                  ยังไม่อ่าน
                </button>
              </div>
            </div>
            {filteredAlerts.length > 0 ? (
              <>
                {renderAlerts(
                  filteredAlerts,
                  token,
                  userId,
                  navigate,
                  setAlerts,
                  setUnreadCount,
                  formatDate
                )}
              </>
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
        <br></br>
        <div>
          <p className="headerassesment">
            {name} {surname}
          </p>
          {birthday ? (
            <p className="textassesment">
              <label>อายุ:</label>{" "}
              <span>
                {userAge} ปี {userAgeInMonths} เดือน
              </span>{" "}
              <label>เพศ:</label> <span>{gender}</span>
            </p>
          ) : (
            <p className="textassesment">
              <label>อายุ:</label> <span>0 ปี 0 เดือน</span>{" "}
              <label>เพศ:</label> <span>{gender}</span>
            </p>
          )}
          <p className="textassesment">
            <label>HN:</label>{" "}
            <span>
              {medicalData && medicalData.HN ? medicalData.HN : "ไม่มีข้อมูล"}
            </span>
            <label>AN:</label>{" "}
            <span>
              {medicalData && medicalData.AN ? medicalData.AN : "ไม่มีข้อมูล"}
            </span>
            <label>ผู้ป่วยโรค:</label>{" "}
            <span>
              {medicalData && medicalData.Diagnosis
                ? medicalData.Diagnosis
                : "ไม่มีข้อมูล"}
            </span>
          </p>
          <p className="textassesment">
            <label>วันที่บันทึก:</label>
            <span>{formatDate(AssessinhomeForms.createdAt)}</span>
          </p>
          <p className="textassesment">
            <label>วันที่แก้ไขล่าสุด:</label>
            <span
              style={{
                color: AssessinhomeForms?.updatedAt === AssessinhomeForms?.createdAt ? "#666" : "inherit",
                fontWeight: AssessinhomeForms?.updatedAt === AssessinhomeForms?.createdAt ? "bold" : "bold"
              }}
            >
              {AssessinhomeForms && AssessinhomeForms.updatedAt
                ? AssessinhomeForms.updatedAt !== AssessinhomeForms.createdAt
                  ? formatDate(AssessinhomeForms.updatedAt)
                  : "-"
                : "ไม่มีข้อมูล"}
            </span>
          </p>

        </div>
        <div className="info3 card mt-4">
          {/* <div className="header">
                        <b>การประเมิน IN-HOME-SSS</b>
                    </div> */}
          <div class="accordion" id="accordionExample">
            {/* Patient Agenda */}
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  <b>1. Immobility</b>
                </button>
              </h2>
              <div
                id="collapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="headingOne"
                data-bs-parent="#accordionExample"
              >
                <div
                  className="accordion-body mt-2"
                  style={{ lineHeight: "20px" }}
                >
                  {AssessinhomeForms.Immobility ? (
                    <div>
                      <div className="row">
                        <div className="col-sm-2">
                          <strong>คะแนนรวม :</strong>
                        </div>
                        <div className="col-sm-9">
                          <div className="row">
                            <div className="col-8 col-sm-6">
                              <p
                                className={getGroupStyle(
                                  AssessinhomeForms.Immobility.totalScore
                                )}
                              >
                                {AssessinhomeForms.Immobility.totalScore || "0"}{" "}
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
                  ) : (
                    <p>ไม่มีข้อมูล</p>
                  )}
                </div>
                <div>
                  <button
                    className="btn m-4"
                    style={{ backgroundColor: "#ffde59", color: "black" }}
                    onClick={() => handleEditClick("Immobility")}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  <b>2. Nutrition</b>
                </button>
              </h2>
              <div
                id="collapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="headingTwo"
                data-bs-parent="#accordionExample"
              >
                <div
                  className="accordion-body mt-2"
                  style={{ lineHeight: "20px" }}
                >
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>น้ำหนัก :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>{AssessinhomeForms.Nutrition?.weight || "-"} Kg.</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>ส่วนสูง :</strong>
                    </div>

                    <div className="col-8 col-sm-6">
                      <p>{AssessinhomeForms.Nutrition?.height || "-"} cm.</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>ค่า BMR :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>{AssessinhomeForms.Nutrition?.bmr || "-"} kcal</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>ค่า TDEE :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>{AssessinhomeForms.Nutrition?.tdee || "-"} kcal</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>กิจกรรมที่ทำ :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>
                        {activityLevelMapping[
                          AssessinhomeForms.Nutrition?.activityLevel
                        ] || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>ช่องทางการรับอาหาร :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>
                        {AssessinhomeForms.Nutrition?.intakeMethod.join(", ") ||
                          "-"}
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>ลักษณะอาหาร :</strong>
                    </div>

                    <div className="col-8 col-sm-6">
                      <p>
                        {AssessinhomeForms.Nutrition?.foodTypes.join(", ") ||
                          "-"}
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>อาหารทางการแพทย์ :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>{AssessinhomeForms.Nutrition?.medicalFood || "-"}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>อาหารทางอื่นๆ :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>{AssessinhomeForms.Nutrition?.otherFood || "-"}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>อาหารที่ชอบ :</strong>
                    </div>

                    <div className="col-sm-6">
                      <p>{AssessinhomeForms.Nutrition?.favoriteFood || "-"}</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>คนปรุงอาหาร :</strong>
                    </div>
                    <div className="col-sm-6">
                      <p>
                        {AssessinhomeForms.Nutrition?.cooks.join(", ") || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <strong>ภาวะโภชนาการ :</strong>
                    </div>
                    <div className="col-sm-6">
                      <p>
                        {AssessinhomeForms.Nutrition?.nutritionStatus || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    className="btn m-4"
                    style={{ backgroundColor: "#ffde59", color: "black" }}
                    onClick={() => handleEditClick("Nutrition")}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="headingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  <b>3. Housing</b>
                </button>
              </h2>
              <div
                id="collapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="headingThree"
                data-bs-parent="#accordionExample"
              >
                <div
                  className="accordion-body mt-2"
                  style={{ lineHeight: "20px" }}
                >
                  {AssessinhomeForms.Housing ? (
                    <>
                      <div className="row">
                        <div className="col-4">
                          <strong>ลักษณะบ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.houseType || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>วัสดุที่ใช้ทำ :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.material || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>จำนวนชั้น :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.Housing.numFloors || "-"} ชั้น
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>จำนวนห้อง :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.Housing.numRooms || "-"} ห้อง
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ผู้ป่วยอาศัยอยู่ชั้นไหน :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.patientFloor || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความสะอาดในบ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.cleanliness || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความเป็นระเบียบเรียบร้อยในบ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.orderliness || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>แสงสว่างในบ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.lighting || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>การระบายอากาศ :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.ventilation || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>สิ่งแวดล้อมรอบๆ บ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.Housing.homeEnvironment.join(
                              ", "
                            ) || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>เลี้ยงสัตว์ใต้ถุนบ้าน/รอบๆ บ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.Housing
                              .homeEnvironment_petType || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>อื่นๆ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.Housing.otherHomeEnvironment ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>จำนวนเพื่อนบ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.numneighbor || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความสัมพันธ์กับเพื่อนบ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.Housing.neighborRelationship ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความช่วยเหลือกันของเพื่อนบ้าน :</strong>
                        </div>
                        <div className="col-8">
                          <p>{AssessinhomeForms.Housing.neighborHelp || "-"}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>ไม่มีข้อมูล</p>
                  )}
                </div>
                <div>
                  <button
                    className="btn m-4"
                    style={{ backgroundColor: "#ffde59", color: "black" }}
                    onClick={() => handleEditClick("Housing")}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="headingFour">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseFour"
                  aria-expanded="false"
                  aria-controls="collapseFour"
                >
                  <b>4. Other People</b>
                </button>
              </h2>
              <div
                id="collapseFour"
                className="accordion-collapse collapse"
                aria-labelledby="headingFour"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body" style={{ lineHeight: "20px" }}>
                  {AssessinhomeForms.OtherPeople ? (
                    <>
                      <h5 className="m-2">
                        <b>1. ผู้ดูแล</b>
                      </h5>
                      {AssessinhomeForms.OtherPeople.existingCaregivers.length >
                        0 ? (
                        AssessinhomeForms.OtherPeople.existingCaregivers.map(
                          (cg, index) => (
                            <div key={index} style={{ lineHeight: "20px" }}>
                              <div
                                className="row"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  toggleAccordion(`caregiver-${index}`)
                                }
                              >
                                <div className="col-4">
                                  <strong
                                    style={{
                                      color: "#64b5f6",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    คนที่ {index + 1} : {cg.firstName}{" "}
                                    {cg.lastName || "-"}
                                  </strong>
                                </div>
                                <div className="col-sm-10">
                                  <span></span>
                                  <i
                                    className={openIndex === index}
                                    style={{ marginLeft: "10px" }}
                                  ></i>
                                </div>
                              </div>
                              {openIndex === `caregiver-${index}` && (
                                <div style={{ marginLeft: "20px" }}>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>วันเกิด :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>
                                        {cg.birthDate
                                          ? formatThaiDate(cg.birthDate)
                                          : "0 ปี 0 เดือน"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>ความสัมพันธ์ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.relationship || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>อาชีพ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.occupation || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>สถานภาพ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.status || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>การศึกษา :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.education || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>รายได้ต่อเดือน :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.income || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>สิทธิ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.benefit || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>โรคประจำตัว :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.ud || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>อุปนิสัย :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.habit || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-4">
                                      <strong>
                                        รายละเอียดการดูแลผู้ป่วย :
                                      </strong>
                                    </div>
                                    <div className="col-8">
                                      <p>{cg.careDetails || "-"}</p>
                                    </div>
                                  </div>
                                  <hr />
                                </div>
                              )}
                            </div>
                          )
                        )
                      ) : (
                        <p>ไม่มีข้อมูลผู้ดูแลปัจจุบัน</p>
                      )}

                      <h5 className="m-2">
                        <b>2. คนในครอบครัว</b>
                      </h5>
                      {AssessinhomeForms.OtherPeople.newCaregivers.length >
                        0 ? (
                        AssessinhomeForms.OtherPeople.newCaregivers.map(
                          (cg, index) => (
                            <div key={index}>
                              <div
                                className="row"
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleAccordion(index)}
                              >
                                <div className="col-sm-3">
                                  <strong
                                    style={{
                                      color: "#64b5f6",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    คนที่ {index + 1} : {cg.firstName}{" "}
                                    {cg.lastName || "-"}
                                  </strong>
                                </div>
                                <div className="col-sm-10">
                                  <span></span>
                                  <i
                                    className={openIndex === index}
                                    style={{ marginLeft: "10px" }}
                                  ></i>
                                </div>
                              </div>
                              {openIndex === `family-${index}` && (
                                <div style={{ marginLeft: "20px" }}>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>วันเกิด :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>
                                        {cg.birthDate
                                          ? formatThaiDate(cg.birthDate)
                                          : "0 ปี 0 เดือน"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>ความสัมพันธ์ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.relationship || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>อาชีพ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.occupation || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>สถานภาพ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.status || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>การศึกษา :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.education || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>รายได้ต่อเดือน :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.income || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>สิทธิ :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.benefit || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>โรคประจำตัว :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.ud || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-sm-3">
                                      <strong>อุปนิสัย :</strong>
                                    </div>
                                    <div className="col-sm-9">
                                      <p>{cg.habit || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-4">
                                      <strong>
                                        รายละเอียดการดูแลผู้ป่วย :
                                      </strong>
                                    </div>
                                    <div className="col-8">
                                      <p>{cg.careDetails || "-"}</p>
                                    </div>
                                  </div>
                                  <hr />
                                </div>
                              )}
                            </div>
                          )
                        )
                      ) : (
                        <p className="p-2">ไม่พบข้อมูลคนในครอบครัว</p>
                      )}
                    </>
                  ) : (
                    <p>ไม่มีข้อมูลผู้ดูแล</p>
                  )}
                </div>
                <div>
                  <button
                    className="btn m-4"
                    style={{ backgroundColor: "#ffde59", color: "black" }}
                    onClick={() => handleEditClick("OtherPeople")}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="headingfive">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapsefive"
                  aria-expanded="false"
                  aria-controls="collapsefive"
                >
                  <b>5. Medication</b>
                </button>
              </h2>
              <div
                id="collapsefive"
                class="accordion-collapse collapse"
                aria-labelledby="headingfive"
                data-bs-parent="#accordionExample"
              >
                <div
                  className="accordion-body mt-2"
                  style={{ lineHeight: "20px" }}
                >
                  {AssessinhomeForms.Medication ? (
                    <>
                      <div className="row">
                        <div className="col-sm-3">
                          <strong>ยาที่แพทย์สั่ง :</strong>
                        </div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.Medication
                              .prescribedMedication || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3">
                          <strong>การใช้ยาจริง :</strong>
                        </div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.Medication.actualMedication ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3">
                          <strong>อาหารเสริม :</strong>
                        </div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.Medication.supplements || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3">
                          <strong>การบริหารยา :</strong>
                        </div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.Medication.administration || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3">
                          <strong>การรับประทานยา :</strong>
                        </div>
                        <div className="col-sm-9">
                          <p>{AssessinhomeForms.Medication.intake || "-"}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-sm-3">
                          <strong>ความสม่ำเสมอ :</strong>
                        </div>
                        <div className="col-sm-9">
                          <p>
                            {AssessinhomeForms.Medication.consistency || "-"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>ไม่มีข้อมูล</p>
                  )}
                </div>
                <div>
                  <button
                    className="btn m-4"
                    style={{ backgroundColor: "#ffde59", color: "black" }}
                    onClick={() => handleEditClick("Medication")}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingsix">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapsesix"
                  aria-expanded="false"
                  aria-controls="collapsesix"
                >
                  <b>6. Physical Examination</b>
                </button>
              </h2>
              <div
                id="collapsesix"
                class="accordion-collapse collapse"
                aria-labelledby="headingsix"
                data-bs-parent="#accordionExample"
              >
                <div
                  className="accordion-body mt-2"
                  style={{ lineHeight: "20px" }}
                >
                  {AssessinhomeForms.PhysicalExamination ? (
                    <>
                      <div className="row">
                        <div className="col-4 ">
                          <strong className="">Temperature :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .temperature || "-"}{" "}
                            °C
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Blood Pressure :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .bloodPressure || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Pulse :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.pulse || "-"}{" "}
                            /min
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Respiratory Rate :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .respiratoryRate || "-"}{" "}
                            /min
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>General Appearance :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .generalAppearance || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Cardiovascular System :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .cardiovascularSystem || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Respiratory System :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .respiratorySystem || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Abdominal :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.abdominal ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Nervous System :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .nervousSystem || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Extremities :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .extremities || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Mood And Affect :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.moodandaffect
                              ?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.moodandaffect
                                .map((item) =>
                                  item.isOther
                                    ? `อื่นๆ: ${item.value}`
                                    : item.value
                                )
                                .join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Appearance And Behavior :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .appearanceAndBehavior?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.appearanceAndBehavior
                                .map((item) =>
                                  item.isOther
                                    ? `อื่นๆ: ${item.value}`
                                    : item.value
                                )
                                .join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Eye Contact :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.eyeContact
                              ?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.eyeContact
                                .map((item) =>
                                  item.isOther
                                    ? `อื่นๆ: ${item.value}`
                                    : item.value
                                )
                                .join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Attention :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.attention
                              ?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.attention
                                .map((item) =>
                                  item.isOther
                                    ? `อื่นๆ: ${item.value}`
                                    : item.value
                                )
                                .join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Orientation :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination.orientation
                              ?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.orientation
                                .map((item) =>
                                  item.isOther
                                    ? `อื่นๆ: ${item.value}`
                                    : item.value
                                )
                                .join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Thought Process :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .thoughtProcess?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.thoughtProcess
                                .map((item) =>
                                  item.isOther
                                    ? `อื่นๆ: ${item.value}`
                                    : item.value
                                )
                                .join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4 ">
                          <strong>Thought Content :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.PhysicalExamination
                              .thoughtContent?.length > 0
                              ? AssessinhomeForms.PhysicalExamination.thoughtContent
                                .map((item) =>
                                  item.isOther
                                    ? `อื่นๆ: ${item.value}`
                                    : item.value
                                )
                                .join(", ")
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>ไม่มีข้อมูล</p>
                  )}
                </div>
                <div>
                  <button
                    className="btn m-4"
                    style={{ backgroundColor: "#ffde59", color: "black" }}
                    onClick={() => handleEditClick("Physical Examination")}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingseven">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseseven"
                  aria-expanded="false"
                  aria-controls="collapseseven"
                >
                  <b>7. SSS Assessments</b>
                </button>
              </h2>
              <div
                id="collapseseven"
                class="accordion-collapse collapse"
                aria-labelledby="headingseven"
                data-bs-parent="#accordionExample"
              >
                <div
                  className="accordion-body mt-2"
                  style={{ lineHeight: "20px" }}
                >
                  {AssessinhomeForms.SSS ? (
                    <>
                      <h5 className="m-2">1. ความปลอดภัย</h5>
                      <div className="row mt-4">
                        <div className="col-4">
                          <strong>แสงไฟ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.cleanliness || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>พื้นต่างระดับ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.floorSafety || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>บันได :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.stairsSafety || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ราวจับ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.handrailSafety || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>เหลี่ยมคม :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.sharpEdgesSafety ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความลื่นของพื้น :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.slipperyFloorSafety ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ลักษณะโถส้วม :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.toiletSafety || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>เตาที่ใช้หุงต้ม :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.stoveSafety || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>การเก็บของในบ้าน เช่น มีด :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.storageSafety || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>น้ำที่ใช้ดื่ม :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.waterSafety || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>อันตรายอื่นๆ (ถ้ามี) :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.otherHealthHazards ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6">
                          <strong>
                            ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร :
                          </strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Safety.emergencyContact ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <hr />
                      <h5 className="m-2">2. จิตวิญญาณ</h5>
                      <div className="row mt-4">
                        <div className="col-4">
                          <strong>ความเชื่อและศรัทธา :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth
                              .faithBelief || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row ">
                        <div className="col-4">
                          <strong>ความสำคัญ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth.importance ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ชุมชน :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth.community ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>การดูแลที่อยู่ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth
                              .addressInCare || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความรัก :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth.love || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ศาสนา :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth.religion ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>การให้อภัย :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth
                              .forgiveness || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความหวัง :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth.hope || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>ความหมายของชีวิต :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.SpiritualHealth
                              .meaningOfLife || "-"}
                          </p>
                        </div>
                      </div>
                      <hr />
                      <h5 className="m-2">3. การรับบริการ</h5>
                      <div className="row mt-4">
                        <div className="col-4">
                          <strong>สถานที่รับบริการ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Service.serviceLocation ||
                              "-"}
                          </p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <strong>บริการอื่นๆ :</strong>
                        </div>
                        <div className="col-8">
                          <p>
                            {AssessinhomeForms.SSS.Service.otherServices || "-"}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p>ไม่มีข้อมูล</p>
                  )}
                </div>
                <div>
                  <button
                    className="btn m-4"
                    style={{ backgroundColor: "#ffde59", color: "black" }}
                    onClick={() => handleEditClick("SSS")}
                  >
                    แก้ไขข้อมูล
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && modalContent && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit {currentEditSection}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">{modalContent}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
