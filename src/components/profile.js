import React, { useCallback,useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "../css/profile.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import io from "socket.io-client";
import Sidebar from "./sidebar";

const socket = io("https://backend-deploy-render-mxok.onrender.com");

export default function Home() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [dataemail, setDataemail] = useState([]);
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
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
  }, [alerts,sender._id]);

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
        setDataemail(data.data);
        setIsEmailVerified(data.data.isEmailVerified);
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
    if (hasFetchedUserData.current) return; // ป้องกันการเรียกซ้ำ
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


  const handleEditClick = () => {
    navigate("/emailverification", { state: { dataemail } });
  };

  const handleChangeEmailClick = () => {
    navigate("/updateemail", { state: { dataemail } });
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
            <li>
              <a>โปรไฟล์</a>
            </li>
          </ul>
        </div>
        {/* <h3>โปรไฟล์</h3> */}
        <div className="formcontainerpf card mb-2">
          <div className="mb-2">
            <label>ชื่อผู้ใช้</label>
            <div className="form-control gray-background">
              {data.username}
            </div>{" "}
          </div>

          <div className="mb-2">
            <label>คำนำหน้าชื่อ</label>
            <div className="form-control">{data.nametitle}</div>{" "}
          </div>
          <div className="mb-2">
            <label>ชื่อ</label>
            <div className="form-control">
              <span>{data.name}</span>
            </div>
          </div>
          <div className="mb-2">
            <label>นามสกุล</label>
            <div className="form-control">
              <span>{data.surname}</span>
            </div>
          </div>
          <div className="mb-2">
            <label>อีเมล</label>
            <div className="form-control email-container">
              {data.email}
              {isEmailVerified ? (
                <a className="verify" onClick={handleChangeEmailClick}>
                  เปลี่ยนอีเมล
                </a>
              ) : (
                <a className="verify" onClick={handleEditClick}>
                  ยืนยันอีเมล
                </a>
              )}
            </div>
          </div>
          <div className="mb-2">
            <label>เบอร์โทรศัพท์</label>

            <div className="form-control">
              <span>{data.tel}</span>
            </div>
          </div>
          <div className="button-group">
            <button
              className="custom-btn edit-btn"
              onClick={() => navigate("/updateprofile", { state: data })}
            >
              แก้ไขโปรไฟล์
            </button>
            <button
              className="custom-btn password-btn"
              onClick={() => navigate("/updatepassword", { state: data })}
            >
              เปลี่ยนรหัสผ่าน
            </button>
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
