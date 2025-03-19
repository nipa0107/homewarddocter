import React, { useCallback,useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import Sidebar from "./sidebar";
import io from "socket.io-client";
const socket = io("https://backend-deploy-render-mxok.onrender.com");
export default function UpdateEmail() {
  const [email, setEmail] = useState("");
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dataemail = location.state?.dataemail;
  const [token, setToken] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [emailError, setEmailError] = useState("");
  const [data, setData] = useState([]);
  const hasFetchedUserData = useRef(false);

    const [unreadCountsByType, setUnreadCountsByType] = useState({
      assessment: 0,
      abnormal: 0,
      normal: 0,
    });
  
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
    if (dataemail) {
      setOldEmail(dataemail.email);
      setUsername(dataemail.username);
    }
  }, [dataemail]);

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
          (alert) => !alert.viewedBy.includes(userId) // ตรวจสอบว่า userId ไม่อยู่ใน viewedBy
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
          setUserId(user._id); // ตั้งค่า userId
          fetchAndSetAlerts(token, user._id); // ส่ง userId ไปที่ fetchAndSetAlerts
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
        });
    }
  }, []);

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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${
      year + 543
    } เวลา ${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    } น.`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;

    setErrorMessage("");
    setEmailError("");

    if (!newEmail.trim()) {
      setEmailError("กรุณากรอกอีเมลใหม่");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (hasError) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setErrorMessage("กรุณาใส่อีเมลที่ถูกต้อง");
      return;
    }

    fetch("https://backend-deploy-render-mxok.onrender.com/send-otp2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email: newEmail }), // ส่ง username และ email
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          navigate("/updateotp", {
            state: { username, email: newEmail, dataemail },
          }); // ส่ง username และ email ไปยังหน้า VerifyOtp
        } else {
          setErrorMessage(data.error || "เกิดข้อผิดพลาดในการส่ง OTP");
        }
      })
      .catch((error) => {
        setErrorMessage("เกิดข้อผิดพลาด");
        console.error("Error:", error);
      });
  };

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
    setErrorMessage("");
    setEmailError("");
  };
  return (
    <main className="body">
       <Sidebar />
      <div className="home_content">
        <div className="homeheader">
          <div className="header">โปรไฟล์</div>
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
            <li className="middle">
              <a href="profile">โปรไฟล์</a>
            </li>
            <li className="arrow middle">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li className="ellipsis">
              <a href="profile">...</a>
            </li>
            <li className="arrow ellipsis">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>เปลี่ยนอีเมล</a>
            </li>
          </ul>
        </div>
        <div className="formcontainerpf card mb-2">
        <p className="title-header">เปลี่ยนอีเมล</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label htmlFor="email">อีเมลใหม่</label>
              <input
                type="email"
                // id="email"
                className={`form-control ${emailError ? "input-error" : ""}`}
                value={newEmail}
                onChange={handleEmailChange}
                // required
              />
              {emailError && <span className="error-text">{emailError}</span>}
            </div>
            <div className="d-grid">
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button type="submit" className="btn">
                ส่ง OTP
              </button>
            </div>
          </form>
        </div>
      </div>

      {showNotifications && (
                   <div className="notifications-dropdown" ref={notificationsRef}>
                     <div className="notifications-head">
                       <h2 className="notifications-title">การแจ้งเตือน</h2>
                     </div>
                     <div className="notifications-filter">
                       <div
                         className={`notification-box ${
                           filterType === "all" ? "active" : ""
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
                         className={`notification-box ${
                           filterType === "abnormal" ? "active" : ""
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
                         className={`notification-box ${
                           filterType === "normal" ? "active" : ""
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
                         className={`notification-box ${
                           filterType === "assessment" ? "active" : ""
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
    </main>
  );
}
