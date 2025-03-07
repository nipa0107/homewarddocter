import React, { useEffect, useState, useRef } from "react";
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
  const hasFetchedUserData = useRef(false);

  useEffect(() => {
    socket.on("newAlert", (alert) => {
      setAlerts((prevAlerts) => [...prevAlerts, alert]);
      setUnreadCount((prevCount) => prevCount + 1);
    });

    return () => {
      socket.off("newAlert"); // Clean up the listener on component unmount
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

  const activityLevelMapping = {
    sedentary: "ออกกำลังกายน้อยมาก หรือไม่ออกเลย",
    lightly_active: "ออกกำลังกาย 1-3 ครั้งต่อสัปดาห์",
    moderately_active: "ออกกำลังกาย 4-5 ครั้งต่อสัปดาห์",
    very_active: "ออกกำลังกาย 6-7 ครั้งต่อสัปดาห์",
    super_active: "ออกกำลังกายวันละ 2 ครั้งขึ้นไป",
  };

  const [tempFormValues, setTempFormValues] = useState({}); // เก็บค่าที่แก้ไข
  const [currentEditSection, setCurrentEditSection] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    if (AgendaForms.user) {
      setUserId(AgendaForms.user);
    }
  }, [AgendaForms.user]);

  const handleEditClick = (section) => {
    setCurrentEditSection(section);
    setIsModalOpen(true);

    let formData;
    if (section === "Patient Agenda Form") {
      formData = { ...AgendaForms.PatientAgenda };
    } else if (section === "Zaritburdeninterview Form") {
      formData = { ...AgendaForms.Zaritburdeninterview };
    }

    setTempFormValues(formData); // ตั้งค่าชั่วคราวก่อน

    // ใช้ useEffect เพื่ออัปเดต modalContent เมื่อ tempFormValues เปลี่ยน
  };

  useEffect(() => {
    if (currentEditSection) {
      setModalContent(
        currentEditSection === "Patient Agenda Form" ? (
          <PatientAgendaForm
            formData={tempFormValues}
            onChange={(data) => setTempFormValues(data)}
          />
        ) : (
          <ZaritburdeninterviewForm
            formData={tempFormValues}
            onChange={(data) => setTempFormValues(data)}
          />
        )
      );
    }
  }, [tempFormValues, currentEditSection]);


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTempFormValues({}); // รีเซ็ตค่ากลับไปเป็นค่าเดิม
  };

  // ✅ ฟังก์ชันบันทึกข้อมูล
  const handleSaveChanges = async () => {
    // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
    const isDataChanged = JSON.stringify(originalData) !== JSON.stringify(AgendaForms);

    if (!isDataChanged) {
      const confirmSave = window.confirm("ไม่มีการเปลี่ยนแปลงข้อมูล ต้องการบันทึกหรือไม่?");
      if (!confirmSave) return; // ถ้าผู้ใช้กด "ยกเลิก" ให้หยุดทำงานที่นี่
    }

    try {
      const updatedData = {
        ...AgendaForms,
        [currentEditSection.replace(" Form", "").replace(" ", "")]: tempFormValues,
      };

      const response = await fetch(`http://localhost:5000/updateAgenda/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update data");

      toast.success("แก้ไขข้อมูลสำเร็จ");

      setTimeout(() => {
        setAgendaForms(updatedData);
        setOriginalData(updatedData);
        setIsModalOpen(false);
        window.location.reload();
      }, 1100);
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };


  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index); // เปิด-ปิดเมื่อคลิก
  };

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

  const [editingIndex, setEditingIndex] = useState(null); // เก็บ index ของผู้ดูแลที่กำลังแก้ไข

  const handleEditCaregiver = (index) => {
    setEditingIndex(index);
    setCurrentEditSection("Caregiver Agenda"); // Add this line
    setModalContent(
      <CaregiverAgendaForm
        formData={AgendaForms.CaregiverAgenda?.Care_Agenda[index]}
        onChange={(data) => {
          const updatedCaregivers = [...AgendaForms.CaregiverAgenda.Care_Agenda];
          updatedCaregivers[index] = data;
          setAgendaForms((prev) => ({
            ...prev,
            CaregiverAgenda: { Care_Agenda: updatedCaregivers },
          }));
        }}
      />
    );
    setIsModalOpen(true);
  };

  const handleEditCaregiverAssessment = (index) => {
    setEditingIndex(index);
    setCurrentEditSection("Caregiver Assessment");
    setModalContent(
      <CaregiverAssessmentForm
        formData={AgendaForms.CaregiverAssessment?.Care_Assessment[index]}
        onChange={(data) => {
          const updatedAssessments = [...AgendaForms.CaregiverAssessment.Care_Assessment];
          updatedAssessments[index] = data;
          setAgendaForms((prev) => ({
            ...prev,
            CaregiverAssessment: { Care_Assessment: updatedAssessments },
          }));
        }}
      />
    );
    setIsModalOpen(true);
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
              {countUnreadUsers() !== 0 && (
                <span className="notification-countchat">
                  {countUnreadUsers()}
                </span>
              )}
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
            <span> {formatDate(AgendaForms.updatedAt)}</span>
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
                  {AgendaForms.CaregiverAgenda?.Care_Agenda?.map((agenda, index) => (
                    <div key={index}>
                      <div
                        className="row mb-2"
                        onClick={() => toggleAccordion(index)}
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
                            {agenda.lastName || "-"}
                            {/* {agenda.relationship || "-"} */}
                          </strong>
                        </div>

                      </div>

                      {openIndex === index && (
                        <div className="p-3 border rounded ms-2">
                          <div className="row ">
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
                              <p>{agenda.caregiver_funtion || "-"}</p>
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
                              onClick={() => handleEditCaregiver(index)}
                            >
                              <i class="bi bi-pencil-fill"></i> แก้ไข
                            </button>

                          </div>
                        </div>
                      )}
                    </div>
                  )
                  ) || "ไม่มีข้อมูล"}
                </div>
              )}


              {activeTab === "caregiverAssessment" && (
                <div className="tab-pane fade show active">
                  <p className="ms-2" style={{ color: "#10B981" }}> ประเมินภาระในการดูแลและปัญหาสุขภาพจิตของผู้ดูแล</p>
                  {AgendaForms.CaregiverAssessment?.Care_Assessment?.map((agenda, index) => (
                    <div key={index}>
                      <div
                        className="row mb-2"
                        onClick={() => toggleAccordion(index)}
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
                            {agenda.lastName || "-"}
                          </strong>
                        </div>

                      </div>

                      {openIndex === index && (
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
                              onClick={() => handleEditCaregiverAssessment(index)}
                            >
                              <i class="bi bi-pencil-fill"></i> แก้ไข
                            </button>

                          </div>
                        </div>
                      )}
                    </div>
                  )
                  ) || "ไม่มีข้อมูล"}
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
                          onClick={() => handleEditClick("Zaritburdeninterview Form")}
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
      {isModalOpen && modalContent && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header d-flex justify-content-center">
                <h5 className="modal-title text-black text-center">
                  แก้ไข {currentEditSection.replace(" Form", "")}
                </h5>
              </div>

              {/* Body */}
              <div className="modal-body">{modalContent}</div>

              {/* Footer */}
              <div className="modal-footer d-flex justify-content-between">
                {/* ปุ่มยกเลิก */}
                <button className="btn-EditMode btn-secondary" onClick={handleCloseModal}>
                  ยกเลิก
                </button>

                {/* ปุ่มบันทึก */}
                <button className="btn-EditMode btnsave" onClick={() => handleSaveChanges()}>
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
