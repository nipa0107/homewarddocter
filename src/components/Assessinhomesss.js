import React, { useEffect, useState, useRef} from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate} from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';

export default function Assessinhomesss({ }) {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [datauser, setDatauser] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(""); //ค้นหา
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsRef]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

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
    const token = window.localStorage.getItem("token");
    setToken(token);

    if (token) {
      fetchUserData(token)
        .then(user => {
          setUserId(user._id);
          fetchAndSetAlerts(token, user._id);

          const interval = setInterval(() => {
            fetchAndSetAlerts(token, user._id);
            fetchAllUsers(user._id);
          }, 1000);

          return () => clearInterval(interval);
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

  const filteredAlerts = filterType === "unread"
    ? alerts.filter(alert => !alert.viewedBy.includes(userId))
    : alerts;

  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = () => {
    fetch("http://localhost:5000/alluser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "AllUser");
        setDatauser(data.data);
      });
  };

  useEffect(() => {
    const fetchMedicalData = async () => {
      const promises = datauser.map(async (user) => {
        if (user.deletedAt === null) {
          try {
            const response = await fetch(
              `http://localhost:5000/medicalInformation/${user._id}`
            );
            const medicalInfo = await response.json();
            return {
              userId: user._id,
              hn: medicalInfo.data?.HN,
              an: medicalInfo.data?.AN,
              diagnosis: medicalInfo.data?.Diagnosis,
            };
          } catch (error) {
            console.error(
              `Error fetching medical information for user ${user._id}:`,
              error
            );
            return {
              userId: user._id,
              hn: "Error",
              an: "Error",
              diagnosis: "Error fetching data",
            };
          }
        }
        return null;
      });

      const results = await Promise.all(promises);
      const medicalDataMap = results.reduce((acc, result) => {
        if (result) {
          acc[result.userId] = result;
        }
        return acc;
      }, {});
      setMedicalData(medicalDataMap);
    };

    if (datauser.length > 0) {
      fetchMedicalData();
    }
  }, [datauser]);

  const currentDate = new Date();

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };
  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    const searchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/searchassessment?keyword=${encodeURIComponent(
            searchKeyword
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const searchData = await response.json();
        if (response.ok) {
          if (searchData.data.length > 0) {
            setDatauser(searchData.data);
          } else {
            setDatauser([]);
          }
        } else {
          console.error("Error during search:", searchData.status);
        }
      } catch (error) {
        console.error("Error during search:", error);
      }
    };
    searchUser();
  }, [searchKeyword, token]);

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
            <a href="assessment">
              <i class="bi bi-clipboard2-pulse"></i>
              <span class="links_name">ติดตาม/ประเมินอาการ</span>
            </a>
          </li>
          <li>
            <a href="allpatient">
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
      {showNotifications && (
        <div className="notifications-dropdown" ref={notificationsRef}>
          <div className="notifications-head">
            <h2 className="notifications-title">การแจ้งเตือน</h2>
            <p className="notifications-allread" onClick={markAllAlertsAsViewed}>
              ทำเครื่องหมายว่าอ่านทั้งหมด
            </p>
            <div className="notifications-filter">
              <button className={filterType === "all" ? "active" : ""} onClick={() => handleFilterChange("all")}>
                ดูทั้งหมด
              </button>
              <button className={filterType === "unread" ? "active" : ""} onClick={() => handleFilterChange("unread")}>
                ยังไม่อ่าน
              </button>
            </div>
          </div>
          {filteredAlerts.length > 0 ? (
            <>
              {renderAlerts(filteredAlerts, token, userId, navigate, setAlerts, setUnreadCount, formatDate)}
            </>
          ) : (
            <p className="no-notification">ไม่มีการแจ้งเตือน</p>
          )}
        </div>
      )}
      <div className="home_content">
        <div className="homeheader">
          <div className="header">แบบประเมินเยี่ยมบ้าน</div>
          <div className="profile_details">
            <ul className="nav-list">
              <li>
                <a className="bell-icon" onClick={toggleNotifications}>
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
              <a>แบบประเมินเยี่ยมบ้าน</a>
            </li>
          </ul>
        </div>
        <div className="search-bar">
          <input
            className="search-text"
            type="text"
            placeholder="ค้นหา"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className="toolbar">
          <p className="countadmin1">
            จำนวนผู้ป่วยทั้งหมด :{" "}
            {datauser.filter((user) => user.deletedAt === null).length} คน
          </p>
        </div>
        <div className="content">
          <table className="table">
            <thead>
              <tr>
                <th>HN</th>
                <th>AN</th>
                <th>ชื่อ-สกุล</th>
                <th>ผู้ป่วยโรค</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {datauser

                .filter((user) => user.deletedAt === null)
                .map((i, index) => {
                  const userBirthday = i.birthday ? new Date(i.birthday) : null;
                  let userAge = "";
                  if (userBirthday) {
                    const ageDiff =
                      currentDate.getFullYear() - userBirthday.getFullYear();
                    const monthDiff =
                      currentDate.getMonth() - userBirthday.getMonth();
                    const isBeforeBirthday =
                      monthDiff < 0 ||
                      (monthDiff === 0 &&
                        currentDate.getDate() < userBirthday.getDate());
                    userAge = isBeforeBirthday
                      ? `${ageDiff - 1} ปี ${12 + monthDiff} เดือน`
                      : `${ageDiff} ปี ${monthDiff} เดือน`;
                  }
                  return (
                    <tr key={index}>
                      <td>
                        <span style={{ color: medicalData[i._id]?.hn ? 'inherit' : '#B2B2B2' }}>
                          {medicalData[i._id]?.hn ? medicalData[i._id]?.hn : "ไม่มีข้อมูล"}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: medicalData[i._id]?.an ? 'inherit' : '#B2B2B2' }}>
                          {medicalData[i._id]?.an ? medicalData[i._id]?.an : "ไม่มีข้อมูล"}
                        </span>
                      </td>
                      <td>{i.name} {i.surname}</td>
                      {/* <td>{userAge}</td> */}
                      <td>
                        <span style={{ color: medicalData[i._id]?.diagnosis ? 'inherit' : '#B2B2B2' }}>
                          {medicalData[i._id]?.diagnosis ? medicalData[i._id]?.diagnosis : "ไม่มีข้อมูล"}
                        </span>
                      </td>
                      <td>
                        <a
                          className="info"
                          onClick={() =>
                            navigate("/assessinhomesssuser", {
                              state: { id: i._id },
                            })
                          }
                        >
                          <span className="not-evaluated">ยังไม่ได้รับการประเมิน</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
