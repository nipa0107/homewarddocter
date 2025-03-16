import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "./sidebar";

import io from "socket.io-client";
const socket = io("http://localhost:5000");
export default function UpdateProfile() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
 
  const [token, setToken] = useState("");
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [datauser, setDatauser] = useState([]);
  const [nametitle, setNameTitle] = useState("");
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [telError, setTelError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [nametitleError, setNametitleError] = useState("");
  const hasFetchedUserData = useRef(false);
  const [unreadCountsByType, setUnreadCountsByType] = useState({
    assessment: 0,
    abnormal: 0,
    normal: 0,
  });

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

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    setToken(token);
    if (token) {
      fetch("http://localhost:5000/profiledt", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          token: token,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setData(data.data);
          setName(data.data.name);
          setSurname(data.data.surname);
          setNameTitle(data.data.nametitle);
          setUsername(data.data.username);
          setTel(data.data.tel);
          setEmail(data.data.email);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          // logOut();
        });
    }
  }, []);

  const UpdateProfile = async (e) => {
    e.preventDefault();
    let hasError = false;
    if (!tel.trim() && !tel.length !== 10) {
      setTelError("เบอร์โทรศัพท์ต้องมี 10 หลัก");
      hasError = true;
    } else {
      setTelError("");
    }

    if (!name.trim()) {
      setNameError("กรุณากรอกชื่อ");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!surname.trim()) {
      setSurnameError("กรุณากรอกนามสกุล");
      hasError = true;
    } else {
      setSurnameError("");
    }

    if (!nametitle.trim()) {
      setNametitleError("กรุณาเลือกคำนำหน้าชื่อ");
      hasError = true;
    } else {
      setNametitleError("");
    }

    if (hasError) return;
    try {
      const docterData = {
        nametitle,
        name,
        tel,
        surname,
      };
      const response = await fetch(
        `http://localhost:5000/updateprofile/${location.state._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(docterData),
        }
      );

      if (response.ok) {
        const updatedAdmin = await response.json();
        console.log("แก้ไขผู้แล้ว:", updatedAdmin);
        toast.success("แก้ไขสำเร็จ");
        setTimeout(() => {
          navigate("/profile");
        }, 1100);
        // window.location.href = "./profile";
      } else {
        console.error("ไม่สามารถแก้ไขผู้ใช้ได้:", response.statusText);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไขผู้ใช้:", error);
    }
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

  const handleInputChange = (e) => {
    const input = e.target.value;
    if (/[^0-9]/.test(input)) {
      setTelError("เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น");
    } else {
      setTelError("");
    }
    setTel(input.replace(/\D/g, ""));
  };
  const handleInputNameChange = (e) => {
    const input = e.target.value;

    // ตรวจสอบว่ามีตัวเลขหรืออักขระพิเศษหรือไม่
    if (/[^ก-๙a-zA-Z\s]/.test(input)) {
      setNameError("ชื่อควรเป็นตัวอักษรเท่านั้น");
    } else {
      setNameError("");
    }

    setName(input.replace(/[^ก-๙a-zA-Z\s]/g, "")); // กรองเฉพาะตัวอักษรและช่องว่าง
  };

  const handleInputSurnameChange = (e) => {
    const input = e.target.value;

    // ตรวจสอบว่ามีตัวเลขหรืออักขระพิเศษหรือไม่
    if (/[^ก-๙a-zA-Z\s]/.test(input)) {
      setSurnameError("นามสกุลควรเป็นตัวอักษรเท่านั้น");
    } else {
      setSurnameError(""); // ล้าง error หากไม่มีปัญหา
    }

    setSurname(input.replace(/[^ก-๙a-zA-Z\s]/g, "")); // กรองเฉพาะตัวอักษรและช่องว่าง
  };

  const handleInputNameTitleChange = (e) => {
    const input = e.target.value;

    if (!input.trim()) {
      setNametitleError("กรุณาเลือกคำนำหน้าชื่อ");
    } else {
      setNametitleError("");
    }

    setNameTitle(input);
  };

  return (
    <main className="body">
      <ToastContainer />
      <Sidebar />

      <div className="home_content">
        <div className="homeheader">
          <div className="header">แก้ไขโปรไฟล์ผู้ใช้</div>
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
                    <span className="notification-count-noti">
                      {unreadCount}
                    </span>
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
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>แก้ไขโปรไฟล์ผู้ใช้</a>
            </li>
          </ul>
        </div>

        {/* <h3>แก้ไขโปรไฟล์ผู้ใช้</h3> */}
        <div className="formcontainerpf card mb-2">
          <div className="mb-2">
            <label>ชื่อผู้ใช้</label>
            <input
              type="text"
              className="form-control gray-background"
              readOnly
              value={username}
              //   onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>คำนำหน้าชื่อ</label>
            <select
              className={`form-control ${nametitleError ? "input-error" : ""}`}
              value={nametitle}
              onChange={handleInputNameTitleChange}
            >
              <option value="">กรุณาเลือก</option>
              <option value="แพทย์หญิง">แพทย์หญิง</option>
              <option value="นายแพทย์">นายแพทย์</option>
              <option value="พยาบาลวิชาชีพ">พยาบาลวิชาชีพ</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
            {nametitleError && (
              <span className="error-text">{nametitleError}</span>
            )}
          </div>
          <div className="mb-2">
            <label>ชื่อ</label>
            <input
              type="text"
              className={`form-control ${nameError ? "input-error" : ""}`}
              value={name}
              onChange={handleInputNameChange}
            />
            {nameError && <span className="error-text">{nameError}</span>}
          </div>
          <div className="mb-2">
            <label>นามสกุล</label>
            <input
              type="text"
              className={`form-control ${surnameError ? "input-error" : ""}`}
              value={surname}
              onChange={handleInputSurnameChange}
            />
            {surnameError && <span className="error-text">{surnameError}</span>}
          </div>
          <div className="mb-2">
            <label>อีเมล</label>
            <input
              type="text"
              className="form-control gray-background"
              readOnly
              value={email}
              //   onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>เบอร์โทรศัพท์</label>
            <input
              type="text"
              className={`form-control ${telError ? "input-error" : ""}`}
              maxLength="10"
              value={tel}
              onChange={handleInputChange}
            />
            {telError && <span className="error-text">{telError}</span>}
          </div>

          <div className="d-grid save">
            <button
              onClick={UpdateProfile}
              type="submit"
              className="btn btnsave py-2"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
