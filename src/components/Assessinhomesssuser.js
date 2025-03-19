import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import Sidebar from "./sidebar";
import io from "socket.io-client";
const socket = io("https://backend-deploy-render-mxok.onrender.com");

export default function Assessinhomesssuser({ }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [patientForms, setPatientForms] = useState("");
  const location = useLocation();
  const { id } = location.state;
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [mpersonnel, setMPersonnel] = useState([]);
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [userData, setUserData] = useState(null);
  const [medicalData, setMedicalData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [datauser, setDatauser] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const [userId, setUserId] = useState("");
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
      const response = await fetch("https://backend-deploy-render-mxok.onrender.com/latest-assessments");
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
    return fetch("https://backend-deploy-render-mxok.onrender.com/profiledt", {
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
    fetch("https://backend-deploy-render-mxok.onrender.com/alerts/mark-all-viewed-by-type", {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getuser/${id}`);
        const data = await response.json();
        setUserData(data);
        setUsername(data.username);
        setName(data.name);
        setSurname(data.surname);
        setGender(data.gender);
        setBirthday(data.birthday);
      } catch (error) {
        console.error("Error fetching caremanual data:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (userData && userData._id) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `https://backend-deploy-render-mxok.onrender.com/medicalInformation/${userData._id}`
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
  }, [userData]);

  const fetchMpersonnel = async () => {
    try {
      const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/allMpersonnel`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMPersonnel(data.data);
      console.log("Mpersonnel:", data.data);
    } catch (error) {
      console.error("Error fetching patient forms:", error);
    }
  };

  useEffect(() => {
    fetchMpersonnel();
  }, []);

  const currentDate = new Date();

  const userBirthday = new Date(birthday);

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

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };
  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };
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

  const [AssessinhomeForms, setAssessinhomeForms] = useState({});
  const [AgendaForms, setAgendaForms] = useState({});

  useEffect(() => {
    if (id) {
      fetchAgendaForms();
      fetchAssessinhomeForms();
    }
  }, [id]);

  const fetchAgendaForms = async () => {
    try {
      const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getAgendaForms/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      // ✅ เรียงจาก ใหม่สุด -> เก่าสุด ก่อนเซ็ตค่า
      const sortedData = [...data.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAgendaForms(sortedData);
    } catch (error) {
      console.error("Error fetching patient forms:", error);
    }
  };

  const fetchAssessinhomeForms = async () => {
    try {
      const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getAssessinhomeForms/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      // ✅ เรียงจาก ใหม่สุด -> เก่าสุด ก่อนเซ็ตค่า
      const sortedData = [...data.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAssessinhomeForms(sortedData);
    } catch (error) {
      console.error("Error fetching patient forms:", error);
    }
  };


  useEffect(() => {
    // ดึงข้อมูล unread count เมื่อเปิดหน้า
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          "https://backend-deploy-render-mxok.onrender.com/update-unread-count"
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

  const [sortOrder, setSortOrder] = useState("desc"); // เริ่มต้น ใหม่สุด -> เก่าสุด

  const sortByDate = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc"; // สลับทิศทาง
    setSortOrder(newOrder);

    const sortFunction = (a, b) =>
      newOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt) // เก่าสุด -> ใหม่สุด
        : new Date(b.createdAt) - new Date(a.createdAt); // ใหม่สุด -> เก่าสุด

    // ✅ ใช้ [...state] เพื่อให้ React ตรวจจับการเปลี่ยนแปลง
    setAgendaForms(prev => [...prev].sort(sortFunction));
    setAssessinhomeForms(prev => [...prev].sort(sortFunction));
  };

  const [sortOrderAgenda, setSortOrderAgenda] = useState("desc");
  const [sortOrderInHome, setSortOrderInHome] = useState("desc");
  const sortByDateAgenda = () => {
    const newOrder = sortOrderAgenda === "asc" ? "desc" : "asc";
    setSortOrderAgenda(newOrder);

    const sortedForms = [...AgendaForms].sort((a, b) =>
      newOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

    setAgendaForms(sortedForms);
  };
  const sortByDateInHome = () => {
    const newOrder = sortOrderInHome === "asc" ? "desc" : "asc";
    setSortOrderInHome(newOrder);

    const sortedForms = [...AssessinhomeForms].sort((a, b) =>
      newOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

    setAssessinhomeForms(sortedForms);
  };

  // สถานะของประเภทประเมินที่ถูกเลือก
  const [selectedAssessment, setSelectedAssessment] = useState("Agenda");


  return (
    <main className="body">
      <Sidebar />

      <div className="home_content">
        <div className="homeheader">

          <div className="header">แบบประเมินเยี่ยมบ้าน</div>
          <div className="profile_details">
            <ul className="nav-list">
              <li>
                <a ref={bellRef} className="bell-icon" onClick={toggleNotifications}>
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
                <i class="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a href="assessinhomesss" className="info">
                แบบประเมินเยี่ยมบ้าน
              </a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>บันทึกการประเมิน</a>
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

          {/* Tab เมนูเลือกการประเมิน */}
          <div className="assessment-tabs">
            <button
              className={`tab-btn ${selectedAssessment === "Agenda" ? "active" : ""}`}
              onClick={() => setSelectedAssessment("Agenda")}
            >
              ประเมิน Agenda
            </button>
            <button
              className={`tab-btn ${selectedAssessment === "IN-HOME-SSS" ? "active" : ""}`}
              onClick={() => setSelectedAssessment("IN-HOME-SSS")}
            >
              ประเมิน IN-HOME-SSS
            </button>
          </div>

          {/* แสดงข้อมูลตามประเภทที่เลือก */}
          {selectedAssessment === "Agenda" && (
            <div>
              <div className="content-toolbar d-flex justify-content-between align-items-center mt-4">
                <div className="search-bar position-relative mb-2">
                  <button
                    className="btn btn-primary add-assessment-btn"
                    onClick={() => navigate("/agendaform", { state: { id: userData._id } })}
                  >
                    <i className="bi bi-plus-circle" style={{ marginRight: '8px' }}></i>
                    เพิ่มการประเมิน
                  </button>
                </div>
                <div className="toolbar">
                  <p className="countadmin1 mb-2">
                    การประเมินทั้งหมด : {AgendaForms.length} ครั้ง
                  </p>
                </div>
              </div>

              <div className="table-container">
                <table className="table-all tableass table-hover mt-3">
                  <thead>
                    <tr>
                      <th  onClick={sortByDateAgenda} style={{ cursor: "pointer"  }}>
                        วันที่บันทึก{" "}
                        {sortOrderAgenda === "asc" ? (
                          <i className="bi bi-caret-up-fill"></i>
                        ) : (
                          <i className="bi bi-caret-down-fill"></i>
                        )}
                      </th>
                      <th>ผลการประเมิน</th>
                      <th>ผู้ประเมิน</th>
                      <th>รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AgendaForms.length > 0 ? (
                      AgendaForms.map((form, index) => (
                        <tr key={form._id}
                          onClick={() => navigate("/detailAgendaForm", { state: { id: form._id } })}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ width: "25%" }}>{formatDate(form.createdAt)}</td>
                          <td><span className="normal-status"><i className="bi bi-check-circle"></i> {form.status_agenda}</span></td>
                          <td>{form.MPersonnel ? `${form.MPersonnel.nametitle || ''} ${form.MPersonnel.name || ''} ${form.MPersonnel.surname || ''}` : "ไม่ระบุผู้ประเมิน"}</td>
                          <td className="text-primary">รายละเอียด</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", verticalAlign: "middle" }}>
                          <a className="info" onClick={() => navigate("/agendaform", { state: { id: userData._id } })}>
                            <span className="not-evaluated">ยังไม่ได้รับการประเมิน</span>
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedAssessment === "IN-HOME-SSS" && (
            <div>
              <div className="content-toolbar d-flex justify-content-between align-items-center mt-4">
                <div className="search-bar position-relative mb-2">
                
                    <button
                      className="btn btn-primary add-assessment-btn"
                      onClick={() => navigate("/assessinhomesssform", { state: { id: userData._id } })}
                    >
                      <i className="bi bi-plus-circle" style={{ marginRight: '8px' }}></i>
                      เพิ่มการประเมิน
                    </button>
                  
                </div>
                <div className="toolbar">
                  <p className="countadmin1 mb-2">
                    การประเมินทั้งหมด : {AssessinhomeForms.length} ครั้ง
                  </p>
                </div>
              </div>
              <div className="table-container">
                <table className="table-all tableass table-hover mt-3">
                  <thead>
                    <tr>
                      {/* <th>#</th> */}
                      <th onClick={sortByDateInHome} style={{ cursor: "pointer" }}>
                        วันที่บันทึก{" "}
                        {sortOrderInHome === "asc" ? (
                          <i className="bi bi-caret-up-fill"></i> // เก่าสุด -> ใหม่สุด
                        ) : (
                          <i className="bi bi-caret-down-fill"></i> // ใหม่สุด -> เก่าสุด
                        )}
                      </th>
                      <th>ผลการประเมิน</th>
                      <th>ผู้ประเมิน</th>
                      <th>รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AssessinhomeForms.length > 0 ? (
                      AssessinhomeForms.map((form, index) => (
                        <tr key={form._id}
                          onClick={() => navigate("/detailAssessinhomeForm", { state: { id: form._id } })}
                          style={{ cursor: "pointer" }}
                        >
                          {/* <td>{index + 1}</td> */}
                          <td style={{ width: "25%" }}>{formatDate(form.createdAt)}</td>
                          <td><span className="normal-status"><i class="bi bi-check-circle"></i> {form.status_inhome}</span></td>
                          <td>{form.MPersonnel ? `${form.MPersonnel.nametitle || ''} ${form.MPersonnel.name || ''} ${form.MPersonnel.surname || ''}` : "ไม่ระบุผู้ประเมิน"}</td>
                          <td className="text-primary">รายละเอียด</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", verticalAlign: "middle" }}>
                          <a className="info" onClick={() => navigate("/assessinhomesssform", { state: { id: userData._id } })}>
                            <span className="not-evaluated">ยังไม่ได้รับการประเมิน</span>
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
          )}



        </div>

      </div>
    </main>
  );
}
