import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "../css/editpassword.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";

// import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
function Updatepassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [data, setData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState('');
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [datauser, setDatauser] = useState([]);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [userUnreadCounts, setUserUnreadCounts] = useState([]); 

  const [passwordError, setPasswordError] = useState("");
  const [newpasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = (setter) => setter((prev) => !prev);

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
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       notificationsRef.current &&
  //       !notificationsRef.current.contains(event.target)
  //     ) {
  //       setShowNotifications(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [notificationsRef]);

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
          (alert) => !alert.viewedBy.includes(userId) // ตรวจสอบว่า userId ไม่อยู่ใน viewedBy
        ).length;
        setUnreadCount(unreadAlerts);
      })
      .catch((error) => {
        console.error("Error fetching alerts:", error);
      });
  };

  useEffect(() => {
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

  const Updatepassword = (e) => {
    e.preventDefault();
    let hasError = false;
    if (!password.trim()) {
      setPasswordError("กรุณากรอกรหัสผ่านเก่า");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (!newPassword.trim()) {
      setNewPasswordError("กรุณากรอกรหัสผ่านใหม่");
      hasError = true;
    } else if (newPassword.length < 8) {
      setNewPasswordError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      hasError = true;
    } else if (newPassword === password) {
      setNewPasswordError("รหัสผ่านใหม่ต้องไม่ตรงกับรหัสผ่านเก่า");
      hasError = true;
    } else {
      setNewPasswordError("");
    }
    if (!confirmNewPassword.trim()) {
      setConfirmPasswordError("กรุณากรอกยืนยันรหัสผ่านใหม่");
      hasError = true;
    } else if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError("รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    if (hasError) return;

    fetch(`http://localhost:5000/updatepassword/${location.state._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        id: location.state._id,
        password: password,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.status === "ok") {
          toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
          setTimeout(() => {
            navigate("/profile");
          }, 1100);
        } else {
          if (data.error === "รหัสผ่านเก่าไม่ถูกต้อง") {
            setPasswordError("รหัสผ่านเก่าไม่ถูกต้อง"); // แสดงข้อความในช่องรหัสผ่านเก่า
          } else {
            setError(data.error);
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handlePasswordChange = (input) => {
    setPassword(input);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const validateNewPassword = (input) => {
    if (!input.trim()) {
      setNewPasswordError("กรุณากรอกรหัสผ่านใหม่");
    } else if (input.length < 8) {
      setNewPasswordError("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
    } else {
      setNewPasswordError("");
    }
    setNewPassword(input);

    // ตรวจสอบเฉพาะกรณีที่ confirmNewPassword มีค่า
    if (confirmNewPassword.trim() && input !== confirmNewPassword) {
      setConfirmPasswordError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validateConfirmPassword = (input) => {
    if (!input.trim()) {
      setConfirmPasswordError("กรุณากรอกยืนยันรหัสผ่าน");
    } else {
      setConfirmNewPassword(input);

      // ตรวจสอบเฉพาะกรณีที่ newPassword มีค่า
      if (newPassword.trim() && input !== newPassword) {
        setConfirmPasswordError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      } else {
        setConfirmPasswordError("");
      }
    }
  };
  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
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
      <div className={`sidebar ${isActive ? "active" : ""}`}>
        <div class="logo_content">
          <div class="logo">
            <div class="logo_name">
              <img src={logow} className="logow" alt="logo"></img>
            </div>
          </div>
          <i class="bi bi-list" id="btn" onClick={handleToggleSidebar}></i>
        </div>
        <ul class="nav-list">
          <li>
            <a href="home">
              <i class="bi bi-house"></i>
              <span class="links_name">หน้าหลัก</span>
            </a>
          </li>
          <li>
            <a href="assessment">
              <i class="bi bi-clipboard2-pulse"></i>
              <span class="links_name">ติดตาม/ประเมินอาการ</span>
            </a>
          </li>
          <li>
            <a href="allpatient" >
              <i class="bi bi-people"></i>
              <span class="links_name">จัดการข้อมูลการดูแลผู้ป่วย</span>
            </a>
          </li>
          <li>
            <a href="assessreadiness">
              <i class="bi bi-clipboard-check"></i>
              <span class="links_name">ประเมินความพร้อมการดูแล</span>
            </a>
          </li>
          <li>
            <a href="assessinhomesss" >
              <i class="bi bi-house-check"></i>
              <span class="links_name" >แบบประเมินเยี่ยมบ้าน</span>
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
          <div class="nav-logout">
            <li>
              <a href="./" onClick={logOut}>
                <i
                  class="bi bi-box-arrow-right"
                  id="log_out"
                  onClick={logOut}
                ></i>
                <span class="links_name">ออกจากระบบ</span>
              </a>
            </li>
          </div>
        </ul>
      </div>
      <div className="home_content">
        <div className="homeheader">

          <div className="header">เปลี่ยนรหัสผ่าน</div>
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
                <i class="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li><a href="profile">โปรไฟล์</a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li><a>เปลี่ยนรหัสผ่าน</a>
            </li>
          </ul>
        </div>
        {/* <h3>เปลี่ยนรหัสผ่าน</h3> */}
        <div className="formcontainerpf">
          <div className="auth-inner">
          <div>
              รหัสผ่านเก่า
              <div className="password-input">
                <input
                  value={password}
                  className={`form-control ${
                    passwordError ? "input-error" : ""
                  }`}
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                />
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  onClick={() => toggleShowPassword(setShowPassword)}
                ></i>
              </div>
            </div>
            {passwordError && (
              <span className="error-text">{passwordError}</span>
            )}

            <br />
            <div>
              รหัสผ่านใหม่
              <div className="password-input">
                <input
                  className={`form-control ${
                    newpasswordError ? "input-error" : ""
                  }`}
                  type={showNewPassword ? "text" : "password"}
                  onChange={(e) => validateNewPassword(e.target.value)}
                />
                <i
                  className={`bi ${
                    showNewPassword ? "bi-eye-slash" : "bi-eye"
                  }`}
                  onClick={() => toggleShowPassword(setShowNewPassword)}
                ></i>
              </div>
            </div>

            {newpasswordError && (
              <span className="error-text">{newpasswordError}</span>
            )}
            <br />
            <div>
              ยืนยันรหัสผ่านใหม่
              <div className="password-input">
                <input
                  className={`form-control ${
                    confirmPasswordError ? "input-error" : ""
                  }`}
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={(e) => validateConfirmPassword(e.target.value)}
                />
                <i
                  className={`bi ${
                    showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                  }`}
                  onClick={() => toggleShowPassword(setShowConfirmPassword)}
                ></i>
              </div>
            </div>
            {confirmPasswordError && (
              <span className="error-text">{confirmPasswordError}</span>
            )}

            {/* แสดงข้อความ error */}
            <p id="errormessage" className="errormessage">{error}</p>
          </div>
          <div className="d-grid save">
            <button
              onClick={Updatepassword}
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
export default Updatepassword;
