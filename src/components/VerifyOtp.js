import React, { useCallback,useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import Sidebar from "./sidebar";
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
export default function VerifyOtp() {
  // const [email, setEmail] = useState('');
  // const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const hasFetchedUserData = useRef(false);
  const [data, setData] = useState([]);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const { username, email } = location.state || {}; // รับ username และ email
  const [timer, setTimer] = useState(300); // นับถอยหลัง 5 นาที (300 วินาที)
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const dataemail = location.state?.dataemail;
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

  
  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && otp[index] === "") {
      if (event.target.previousSibling) {
        event.target.previousSibling.focus();
      }
    }
  };

  const handleChange = (element, index) => {
    if (!isNaN(element.value)) {
      const newOtp = [...otp];
      newOtp[index] = element.value;
      setOtp(newOtp);
      setErrorMessage('');
      // เลื่อนไปยังช่องถัดไปอัตโนมัติ
      if (element.nextSibling && element.value) {
        element.nextSibling.focus();
      }
    }
  };

  useEffect(() => {
    socket?.on('newAlert', (alert) => {
      console.log('Received newAlert:', alert);
  
      setAlerts((prevAlerts) => {
        const isExisting = prevAlerts.some(
          (existingAlert) => existingAlert.patientFormId === alert.patientFormId
        );
  
        let updatedAlerts;
  
        if (isExisting) {
          
          if (alert.alertMessage === 'เป็นเคสฉุกเฉิน') {
            updatedAlerts = [...prevAlerts, alert];
          } else {
            updatedAlerts = prevAlerts.map((existingAlert) =>
              existingAlert.patientFormId === alert.patientFormId ? alert : existingAlert
            );
          }
        } else {
          updatedAlerts = [...prevAlerts, alert];
        }
  
        return updatedAlerts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });
  
    socket?.on('deletedAlert', (data) => {
      setAlerts((prevAlerts) => {
        const filteredAlerts = prevAlerts.filter(
          (alert) => alert.patientFormId !== data.patientFormId
        );
        return filteredAlerts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    });
  
    return () => {
      socket?.off('newAlert');
      socket?.off('deletedAlert');
    };
  }, []);
  
  useEffect(() => {
    const currentUserId = sender._id;
  
    const unreadAlerts = alerts.filter(
      (alert) => Array.isArray(alert.viewedBy) && !alert.viewedBy.includes(currentUserId)
    );
  
    setUnreadCount(unreadAlerts.length); // ตั้งค่า unreadCount ตามรายการที่ยังไม่ได้อ่าน
  }, [alerts]);

  useEffect(() => {
    // ตั้งค่าการนับถอยหลัง
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      // เมื่อหมดเวลา
      setIsOtpExpired(true);
      setErrorMessage("OTP หมดอายุ");
      setSuccessMessage("");
    }
    return () => clearInterval(countdown); // ล้าง interval เมื่อ component unmount หรือ timer เปลี่ยน
  }, [timer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isOtpExpired) {
      setErrorMessage("OTP หมดอายุ");
      setSuccessMessage("");
      return;
    }
    const otpValue = otp.join(""); 
    console.log("Submitted OTP:", otpValue);
    fetch("http://localhost:5000/verify-otp2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, otp: otpValue, newEmail: email }), // ส่ง username, otp และ newEmail
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccessMessage("ยืนยันอีเมลสำเร็จ");
          setErrorMessage("");
          setTimeout(() => {
            navigate("/profile"); // เปลี่ยนเส้นทางไปยังโปรไฟล์หลังจากยืนยัน
          }, 1000);
        } else {
          setErrorMessage("OTP ไม่ถูกต้องหรือหมดอายุ");
          setSuccessMessage("");
        }
      })
      .catch((error) => {
        setErrorMessage("เกิดข้อผิดพลาด: " + error.message);
        console.error("Error:", error);
      });
  };

  const handleRequestNewOtp = () => {
    setIsOtpExpired(false);
    setErrorMessage("");
    setSuccessMessage("");
    fetch("http://localhost:5000/send-otp2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email }), // ส่ง username และ newEmail
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccessMessage("ส่ง OTP ใหม่เรียบร้อย");
          setTimer(300); // รีเซ็ต timer
          setIsOtpExpired(false);
        } else {
          setErrorMessage("เกิดข้อผิดพลาดในการส่ง OTP ใหม่");
        }
      })
      .catch((error) => {
        setErrorMessage("เกิดข้อผิดพลาด: " + error.message);
        console.error("Error:", error);
      });
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };


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
      notificationsRef.current && !notificationsRef.current.contains(e.target) &&
      !bellRef.current.contains(e.target)
    ) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  const handleBreadcrumbClick = () => {
    navigate("/emailverification", { state: { dataemail} });
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
              <a href="profile">โปรไฟล์</a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a className="info" onClick={handleBreadcrumbClick}>ยืนยันอีเมล</a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>กรอกรหัสยืนยัน</a>
            </li>
          </ul>
        </div>
        {/* <h3>กรอกรหัสยืนยัน</h3> */}
        <div className="formcontainerpf card mb-2">
        <p className="title-header">กรอกรหัสยืนยัน</p>
        <div className="mb-2">
        <div className="label-container">
            <p className="label-inline">คุณจะได้รับรหัสยืนยันตัวตนที่อีเมล</p>
            <p className="email-text">{email}</p>
          </div>

            <form onSubmit={handleSubmit}>
            <div className="otp-input-container">
                <label htmlFor="otp">กรอก OTP ที่ได้รับ</label>
                <div className="otp-inputs">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="otp-input"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>
              </div>

              {timer > 0 && (
            <p className="otp-instructions">
              กรุณากรอก OTP ภายในเวลา {formatTime(timer)}
            </p>
          )}
           {isOtpExpired ? (
            <div className="message-container">
              <p className="error-messageotp">{errorMessage}</p>
              <a className="resend-link" onClick={handleRequestNewOtp}>
                ขอ OTP ใหม่
              </a>
            </div>
          ) : (
            <div className="message-container">
              {errorMessage && !isOtpExpired && (
                <p className="error-messageotp">{errorMessage}</p>
              )}
              {successMessage && (
                <p className="success-message">{successMessage}</p>
              )}
            </div>
          )}
              <div className="d-grid">
                <button type="submit" className="btn" 
                 disabled={otp.includes("") || isOtpExpired}
                >
                  ยืนยัน OTP
                </button>
              </div>
            </form>
          </div>
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
