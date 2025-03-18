import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "./sidebar";
import "react-toastify/dist/ReactToastify.css";
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
export default function DetailAssessreadiness() {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});
  const location = useLocation();
  const { id } = location.state;
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const [mpersonnel, setMPersonnel] = useState(null);
  const [readinessForms, setReadinessForms] = useState([]);
  const [readinessAssessments, setReadinessAssessments] = useState([]);
  const bellRef = useRef(null);
  const hasFetchedUserData = useRef(false);
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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]
      } ${year + 543} เวลา ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
      } น.`;
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

  useEffect(() => {
    const fetchReadinessForm = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getReadinessForm/${id}`);
        const data = await response.json();

        if (response.ok) {
          setReadinessForms(data.data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching readiness form:", error);
      }
    };
    fetchReadinessForm();
  }, [id, token]);

  useEffect(() => {
    if (readinessForms.user && readinessForms._id) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getuser/${readinessForms.user}`
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
  }, [readinessForms.user]);

  useEffect(() => {
    if (readinessForms && readinessForms.user) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicalInformation/${readinessForms.user}`
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
  }, [readinessForms.user]);

  const [readinessStatus, setReadinessStatus] = useState('');
  const [detail, setDetail] = useState('');
  const [isReadinessSubmitted, setIsReadinessSubmitted] = useState(false);
  const [dateass, setDateass] = useState([]);

  const handleStatusChange = (status) => {
    setReadinessStatus(status); // ตรงนี้ควรจะอัปเดต readinessStatus
  };


  const handleDetailChange = (e) => {
    setDetail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     // ✅ ตรวจสอบว่าผู้ใช้เลือกสถานะหรือยัง
     if (!readinessStatus) {
      window.alert("กรุณาเลือกสถานะการประเมิน");
      return; // ออกจากฟังก์ชัน ถ้ายังไม่ได้เลือก
  }

    try {

      // ทำการบันทึกข้อมูล readiness_status, detail, mpersonnel, readinessForm ID
      const response = await fetch(`http://localhost:5000/addReadinessAssessment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readiness_status: readinessStatus,
          detail,
          MPersonnel: userId,
          ReadinessForm: readinessForms._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating data");
      }

      const data = await response.json();
      toast.success("ประเมินสถานะความพร้อมสำเร็จ");
      setTimeout(() => window.location.reload(), 1000); // Reload หลังจากบันทึกสำเร็จ
    } catch (error) {
      toast.error(`Error updating data: ${error.message}`);
    }
  };
  useEffect(() => {
    const fetchReadinessAssessments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/allReadinessAssessments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        const currentReadinessAssessment = data.data.find(
          (readinessAssessment) => readinessAssessment.ReadinessForm === readinessForms._id
        );
        if (currentReadinessAssessment) {
          setIsReadinessSubmitted(true);
          setReadinessStatus(currentReadinessAssessment.readiness_status);
          setDetail(currentReadinessAssessment.detail);
          setMPersonnel(currentReadinessAssessment.MPersonnel);
          setDateass(currentReadinessAssessment.createdAt);
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };
    fetchReadinessAssessments();
  }, [readinessForms._id]);

  const handleBreadcrumbClick = () => {
    navigate("/assessreadinessuser", { state: { id: readinessForms.user } });
  };

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
      <Sidebar />
      <div className="home_content">
        <div className="homeheader">
          <div className="header">ประเมินความพร้อมการดูแล</div>
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
                <i className="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a href="assessreadiness">ประเมินความพร้อมการดูแล</a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a onClick={handleBreadcrumbClick} className="info">บันทึกการประเมิน</a>
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
          <div className="patient-card-ass patient-card-style">
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
          <div className="mt-5" style={{ marginLeft: "125px" }}>
            <label className="text-secondary">วันที่บันทึก :</label>
            <span> {formatDate(readinessForms.createdAt)}</span>
          </div>
          <div className="readiness card mt-4">
            <div className="header">
              <b>การประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในที่บ้าน</b>
            </div>
            <div className="m-4">
              <table className="assessment-table">
                <thead>
                  <tr>
                    <th style={{ width: "90%" }}>คำถาม</th>
                    <th style={{ width: "10%" }}>คำตอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {readinessForms.Readiness1 && (
                    <>
                      <tr >
                        <td>
                          1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาด้วยการดูแลแบบผู้ป่วยในที่บ้านจากแพทย์อย่างครบถ้วน
                          และให้คำยินยอมก่อนรับบริการใช่หรือไม่?
                        </td>
                        <td >{getAnswerElement(readinessForms.Readiness1.question1_1)}</td>
                      </tr>
                      <tr>
                        <td>2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านมีความปลอดภัยใช่หรือไม่?</td>
                        <td >{getAnswerElement(readinessForms.Readiness1.question1_2)}</td>
                      </tr>
                      <tr>
                        <td>
                          3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านอยู่ห่างจากโรงพยาบาลไม่เกิน 20
                          กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่?
                        </td>
                        <td>{getAnswerElement(readinessForms.Readiness1.question1_3)}</td>
                      </tr>
                      <tr>
                        <td>
                          4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านสามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่?
                        </td>
                        <td>{getAnswerElement(readinessForms.Readiness1.question1_4)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="readiness card mt-4">
            <div className="header">
              <b>ประเมินความรู้ ความเข้าใจ (ตาม D-METHOD)</b>
            </div>
            <div className="m-3">
              <table className="assessment-table">
                <thead>
                  <tr>
                    <th style={{ width: "80%" }}>คำถาม</th>
                    <th style={{ width: "10%" }}>คำตอบ</th>
                  </tr>
                </thead>
                <tbody>

                  {readinessForms.Readiness2 && (
                    <>
                      <tr>
                        <td>1. Disease : เข้าใจโรค/ภาวะเจ็บป่วย ?</td>
                        <td>{getAnswerElement(readinessForms.Readiness2.Disease)}</td>
                      </tr>
                      <tr>
                        <td>2. Medication : รู้ข้อมูล/ข้อพึงระวัง/การจัดยา ?</td>
                        <td>{getAnswerElement(readinessForms.Readiness2.Medication)}</td>
                      </tr>
                      <tr>
                        <td>3. Environment : มีการเตรียมสิ่งแวดล้อม ?</td>
                        <td>{getAnswerElement(readinessForms.Readiness2.Environment)}</td>
                      </tr>
                      <tr>
                        <td>4. Treatment : มีการฝึกทักษะที่จำเป็น ?</td>
                        <td>{getAnswerElement(readinessForms.Readiness2.Treatment)}</td>
                      </tr>
                      <tr>
                        <td>5. Health : รู้ข้อจำกัดด้านสุขภาพ ?</td>
                        <td>{getAnswerElement(readinessForms.Readiness2.Health)}</td>
                      </tr>
                      <tr>
                        <td>6. Out patient : รู้เรื่องการมาตามนัด/การส่งต่อ ?</td>
                        <td>{getAnswerElement(readinessForms.Readiness2.Out_patient)}</td>
                      </tr>
                      <tr>
                        <td>7. Diet : รู้เรื่องการจัดการอาหารที่เหมาะสมกับโรค ?</td>
                        <td>{getAnswerElement(readinessForms.Readiness2.Diet)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {isReadinessSubmitted ? (
            <div className="contentin-outmost-ass mt-4">
              <div className="divass">
                <div className="inline-container-ass">
                  <b className="textass" align="center">
                    การประเมินความพร้อม
                  </b>
                </div>
              </div>
              <div className="content-in-ass">
                <div className="assessment-section">
                  <label className="title-ass-inside">สถานะความพร้อม :</label>
                  {readinessStatus === "มีความพร้อม" ? (
                    <div className={`status-indicator btn-normal`}>มีความพร้อม</div>
                  ) : (
                    <div className={`status-indicator btn-abnormal`}>ยังไม่มีความพร้อม</div>
                  )}
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">
                    รายละเอียดเพิ่มเติม :{" "}
                  </label>
                  <p className="text-ass-inside">{detail ? detail : '-'}</p>
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">
                  ผู้ประเมิน :{" "}
                  </label>
                  <p className="text-ass-inside">{mpersonnel?.nametitle} {mpersonnel?.name} {mpersonnel?.surname}</p>
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">
                  วันที่ประเมิน :{" "}
                  </label>
                  <p className="text-ass-inside">{formatDate(dateass)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="contentin-outmost-ass mt-4">
              <div className="divass" >
                <b className="textass" align="center" >
                  ประเมินความพร้อม
                </b>
              </div>
              <div className="content-in-ass mb-4">
                <form onSubmit={handleSubmit}>
                  <div className="inline-ass">
                    <label className="title-ass">สถานะ :</label>
                    <div className="btn-group-status-name">
                      <div
                        className={`btn-ass ${readinessStatus === "มีความพร้อม" ? "btn-normal" : "btn-outline"}`}
                        onClick={() => handleStatusChange("มีความพร้อม")}
                        style={{ fontSize: "16px", padding: "15px 15px", width: "10px" }} // ลดขนาดปุ่ม
                      >
                        มีความพร้อม
                      </div>
                      <div
                        className={`btn-ass ${readinessStatus === "ยังไม่มีความพร้อม" ? "btn-abnormal" : "btn-outline"}`}
                        onClick={() => handleStatusChange("ยังไม่มีความพร้อม")}
                      >
                        ยังไม่มีความพร้อม
                      </div>
                    </div>
                  </div>
                  <div className="inline-ass">
                    <label className="title-ass">รายละเอียดเพิ่มเติม : </label>
                    <textarea
                      type="text"
                      className="form-control form-control-ass"
                      id="detail"
                      value={detail}
                      onChange={handleDetailChange}
                    />
                  </div>


                  <div className="d-grid save-ass mt-4">
                    <button type="submit" className="btn btnsave-ass py-2">
                      บันทึก
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

