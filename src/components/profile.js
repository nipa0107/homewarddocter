import React, { useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "../css/profile.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import io from 'socket.io-client';
const socket = io("http://localhost:5000");

export default function Home({ }) {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  // const [datauser, setDatauser] = useState([]);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [dataemail, setDataemail] = useState([]);

  const notificationsRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    socket.on('newAlert', (alert) => {
      setAlerts(prevAlerts => [...prevAlerts, alert]);
      setUnreadCount(prevCount => prevCount + 1);
    });

    return () => {
      socket.off('newAlert'); // Clean up the listener on component unmount
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

  // const toggleNotifications = () => {
  //   setShowNotifications(!showNotifications);
  // };

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
        setData(data.data);
        setDataemail(data.data);
        setIsEmailVerified(data.data.isEmailVerified);
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

  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };


  const handleEditClick = () => {
    navigate("/emailverification", { state: { dataemail } });
  };
  

  const handleChangeEmailClick = () => {
    navigate("/updateemail", { state: { dataemail } });
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
              {countUnreadUsers() !== 0 && (
                <span className="notification-countchat">
                  {countUnreadUsers()}
                </span>
              )}
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
              <a>โปรไฟล์</a>
            </li>
          </ul>
        </div>
        {/* <h3>โปรไฟล์</h3> */}
        <div className="formcontainerpf card mb-2">
          <div className="mb-2">
            <label>ชื่อผู้ใช้</label>
            <div className="form-control gray-background">{data.username}</div>{" "}
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
            <div className="form-control">
            {data.email}
            {isEmailVerified ? (
          <a
            className="verify"
            onClick={handleChangeEmailClick}
          >
            เปลี่ยนอีเมล
          </a>
        ) : (
          <a
            className="verify"
            onClick={handleEditClick}
          >
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

          {/* <a className="editname" onClick={() => navigate("/updateprofile", { state: data })}>
            แก้ไขโปรไฟล์
          </a>
          <a className="editname" onClick={() => navigate("/updatepassword", { state: data })}>
            เปลี่ยนรหัสผ่าน
          </a> */}
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
