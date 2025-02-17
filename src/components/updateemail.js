import React, { useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
export default function UpdateEmail() {
    const [email, setEmail] = useState('');
    const [oldEmail, setOldEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const dataemail = location.state?.dataemail;
    const [isActive, setIsActive] = useState(false);
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
    const [userUnreadCounts, setUserUnreadCounts] = useState([]); 
    const [emailError, setEmailError] = useState("");
    const [data, setData] = useState([]);
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
  
      return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${year + 543
        } เวลา ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
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
      
        fetch('http://localhost:5000/send-otp2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email: newEmail }), // ส่ง username และ email
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              navigate('/updateotp', { state: { username, email: newEmail,dataemail } }); // ส่ง username และ email ไปยังหน้า VerifyOtp
            } else {
              setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการส่ง OTP');
            }
          })
          .catch((error) => {
            setErrorMessage('เกิดข้อผิดพลาด');
            console.error('Error:', error);
          });
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

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);   
    setErrorMessage("");          
    setEmailError("");           
  };
      return (
        <main className="body">
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
                <a href="assessment" >
                  <i class="bi bi-clipboard2-pulse"></i>
                  <span class="links_name">ติดตาม/ประเมินอาการ</span>
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
            <i class="bi bi-chevron-double-right"></i>
          </li>
          <li>
            <a>เปลี่ยนอีเมล</a>
          </li>
              </ul>
            </div>
            <h3>เปลี่ยนอีเมล</h3>
            <div className="formcontainerpf card mb-2">
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
        </main>
      );
}