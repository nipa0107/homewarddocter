import React, { useEffect, useState, useRef, PureComponent } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "../css/noti.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import Pt from "../img/pt.png";
import Pt2 from "../img/pt2.png";
import Bh from "../img/better-health.png";
import VSG from "../img/vsg.png";
import VSR from "../img/vsr.png";
import Noti from "../img//noti.png";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import CountUp from 'react-countup';
import { useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
export default function Home() {
  const [data, setData] = useState([]);
  const [datauser, setDatauser] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const notificationsRef = useRef(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [medicalData, setMedicalData] = useState({});
  const [completedDiagnosisData, setCompletedDiagnosisData] = useState([]);

  useEffect(() => {
    socket.on('newAlert', (alert) => {
      setAlerts(prevAlerts => [...prevAlerts, alert]);
      setUnreadCount(prevCount => prevCount + 1);
    });

    return () => {
      socket.off('newAlert'); // Clean up the listener on component unmount
    };
  }, []);

  useEffect(() => {
    getAllUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsRef]);

  const getAllUser = () => {
    fetch('http://localhost:5000/alluser', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDatauser(data.data);
      });
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

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
        console.log("เช็คhome:", alerts); 
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

  useEffect(() => {
    const fetchCompletedCount = async () => {
      try {
        const response = await fetch('http://localhost:5000/completedAssessmentsCount', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCompletedCount(data.count);
      } catch (error) {
        console.error('Error fetching completed assessments count:', error);
      }
    };

    fetchCompletedCount();
  }, []);

  useEffect(() => {
    const fetchMedicalData = async () => {
      const promises = datauser.map(async (user) => {
        if (user.deletedAt === null) {
          try {
            const response = await fetch(`http://localhost:5000/medicalInformation/${user._id}`);
            const medicalInfo = await response.json();
            return {
              userId: user._id,
              hn: medicalInfo.data?.HN,
              an: medicalInfo.data?.AN,
              diagnosis: medicalInfo.data?.Diagnosis,
              isCaseClosed: medicalInfo.data?.isCaseClosed, // สมมติว่า API ส่งสถานะการปิดเคสมา
            };
          } catch (error) {
            console.error(`Error fetching medical information for user ${user._id}:`, error);
            return {
              userId: user._id,
              hn: "Error",
              an: "Error",
              diagnosis: "Error fetching data",
              isCaseClosed: false, // ถ้าเกิดข้อผิดพลาด กำหนดเป็น false
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

  // Aggregate diagnosis data
  const diagnosisCount = datauser.reduce((acc, user) => {
    if (user.deletedAt === null && medicalData[user._id]?.diagnosis) {
      const diagnosis = medicalData[user._id].diagnosis;
      if (acc[diagnosis]) {
        acc[diagnosis]++;
      } else {
        acc[diagnosis] = 1;
      }
    }
    return acc;
  }, {});

  const diagnosisData = Object.entries(diagnosisCount).map(([name, value]) => ({ name, value }));

  // Define colors for each diagnosis
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFF', '#FF6F91', '#FF6361', '#BC5090'];
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12} // Adjust the font size as needed
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };
  // กรองข้อมูลผู้ใช้ที่ไม่ถูกลบออกไป
  const activeUsers = datauser.filter((user) => user.deletedAt === null);
  // การนับจำนวนผู้ใช้ตามเพศ
  const genderCount = activeUsers.reduce(
    (acc, user) => {
      if (user.gender === "ชาย") {
        acc.male += 1;
      } else if (user.gender === "หญิง") {
        acc.female += 1;
      } else {
        acc.unspecified += 1;
      }
      return acc;
    },
    { male: 0, female: 0, unspecified: 0 }
  );

  // ข้อมูลสำหรับ PieChart
  const genderData = [
    { name: "ชาย", value: genderCount.male },
    { name: "หญิง", value: genderCount.female },
    { name: "ไม่ระบุ", value: genderCount.unspecified },
  ];
  const totalUsers = genderCount.male + genderCount.female + genderCount.unspecified;



  const COLOR = ['#0088FE', '#FF8042', '#0088FE'];

  return (

    <main className="body">
      <div className={`sidebar ${isActive ? "active" : ""}`}>
        <div className="logo_content">
          <div className="logo">
            <div className="logo_name">
              <img src={logow} className="logow" alt="logo" />
            </div>
          </div>
          <i className="bi bi-list" id="btn" onClick={handleToggleSidebar}></i>
        </div>
        <ul className="nav-list">
          <li>
            <a href="home">
              <i className="bi bi-house"></i>
              <span className="links_name">หน้าหลัก</span>
            </a>
          </li>
          <li>
            <a href="assessment">
              <i className="bi bi-clipboard2-pulse"></i>
              <span className="links_name">ติดตาม/ประเมินอาการ</span>
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
              <i className="bi bi-clipboard-check"></i>
              <span className="links_name">ประเมินความพร้อมการดูแล</span>
            </a>
          </li>
          <li>
            <a href="assessinhomesss">
              <i className="bi bi-house-check"></i>
              <span className="links_name">แบบประเมินเยี่ยมบ้าน</span>
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
          <div className="nav-logout">
            <li>
              <a href="./" onClick={logOut}>
                <i className="bi bi-box-arrow-right" id="log_out"></i>
                <span className="links_name">ออกจากระบบ</span>
              </a>
            </li>
          </div>
        </ul>
      </div>
      <div className="home_content">
        <div className="homeheader">
          <div className="header">ภาพรวมระบบ</div>
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
        {/* <div className="breadcrumbs mt-4">
          <ul>
            <li>
              <a href="home">
                <i className="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li><a>ภาพรวมระบบ</a></li>
          </ul>
        </div> */}

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
        <div className="dashboardcontent">
          <div className="row px-5">
            <div className="grid">
              <div className="item">
                <div className="countcontent">
                  <div className="row align-items-center">
                    <div className="color-strip "></div>
                    <div className="col">
                      <div className="bg-icon">
                        <img src={Pt2} className="patient" alt="patient" />
                      </div>
                    </div>
                    <div className="col">
                      <p className="num mt-2"><CountUp end={datauser.filter((user) => user.deletedAt === null).length} /></p>
                      <p className="name fs-5">ผู้ป่วยทั้งหมด</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div className="countcontent">
                  <div className="row align-items-center">
                    <div className="color-strip"></div>
                    <div className="col">
                      <div className="bg-icon">
                        <img src={Pt} className="patient" alt="patient" />
                      </div>
                    </div>
                    <div className="col">
                      <p className="num mt-2"><CountUp end={datauser.filter((user) => user.deletedAt === null).length} /></p>
                      <p className="name fs-5">ผู้ป่วยที่กำลังรักษา</p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="item">
                <div className="countcontent">
                  <div className="row align-items-center">
                    <div className="color-strip"></div>
                    <div className="col">
                      <div className="bg-icon">
                        <img src={Bh} className="patient" alt="patient" />
                      </div>
                    </div>
                    <div className="col">
                      <p className="num mt-2"><CountUp end={completedCount} /></p>
                      <p className="name fs-5">ผู้ป่วยที่ปิดเคสแล้ว</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div className="countcontent">
                  <div className="row align-items-center">
                    <div className="color-strip "></div>
                    <div className="col">
                      {/* <div className="bg-icon">
                        <img src={Pt2} className="patient" alt="patient" />
                      </div> */}
                      <h5> <b>โรคของผู้ป่วยทั้งหมด</b></h5>
                    </div>
                    {/* <div className="col">
                      <p className="num mt-2"><CountUp end={datauser.filter((user) => user.deletedAt === null).length} /></p>
                      <p className="name fs-5">ผู้ป่วยทั้งหมด</p>
                    </div> */}
                  </div>
                  <div className="chart-container" style={{ marginLeft: '25px' }}>
                    <PieChart width={400} height={300}>
                      <Pie
                        dataKey="value"
                        isAnimationActive={true}
                        data={diagnosisData}
                        cx="40%"
                        cy="40%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={renderCustomizedLabel} // Call the custom label rendering function
                        labelLine={false} // Disable label lines that point outside the pie
                      >
                        {diagnosisData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`ผู้ป่วย${name}`]} />
                    </PieChart>
                  </div>
                  <div className="legend-content">
                    <div className="diagnosis-legend">
                      <ul>
                        {diagnosisData.map((entry, index) => (
                          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '20px',
                                height: '20px',
                                backgroundColor: COLORS[index % COLORS.length],
                                marginRight: '10px',
                              }}
                            ></span>
                            <span style={{ color: 'black' }}>
                              ผู้ป่วย{entry.name} : {entry.value} cases
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">
                <div className="countcontent">
                  <div className="row align-items-center">
                    <div className="color-strip "></div>
                    <div className="col">
                      {/* <div className="bg-icon">
                        <img src={Pt2} className="patient" alt="patient" />
                      </div> */}
                      <h5> <b>โรคของผู้ป่วยที่กำลังรักษา</b></h5>
                    </div>
                    {/* <div className="col">
                      <p className="num mt-2"><CountUp end={datauser.filter((user) => user.deletedAt === null).length} /></p>
                      <p className="name fs-5">ผู้ป่วยทั้งหมด</p>
                    </div> */}
                  </div>
                  <div className="chart-container" style={{ marginLeft: '25px' }}>
                    <PieChart width={400} height={300}>
                      <Pie
                        dataKey="value"
                        isAnimationActive={true}
                        data={diagnosisData}
                        cx="40%"
                        cy="40%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={renderCustomizedLabel} // Call the custom label rendering function
                        labelLine={false} // Disable label lines that point outside the pie
                      >
                        {diagnosisData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`ผู้ป่วย${name}`]} />
                    </PieChart>
                  </div>
                  <div className="legend-content">
                    <div className="diagnosis-legend">
                      <ul>
                        {diagnosisData.map((entry, index) => (
                          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '20px',
                                height: '20px',
                                backgroundColor: COLORS[index % COLORS.length],
                                marginRight: '10px',
                              }}
                            ></span>
                            <span style={{ color: 'black' }}>
                              ผู้ป่วย{entry.name} : {entry.value} cases
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="item">

                <div className="mt-2"style={{textAlign:'center'}}>
                  <h5 ><b>สัดส่วนเพศของผู้ป่วย</b></h5>
                </div>
                <div className="chart-container" style={{ marginTop: '-15px' }}>
                  <PieChart width={400} height={300}>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={renderCustomizedLabel}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLOR.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                  </div>
                <div className="gender-summary">
                  <ul>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: COLORS[0],
                          marginRight: '10px',
                        }}
                      ></span>
                      <span style={{ color: 'black' }}>ผู้ป่วยเพศชายทั้งหมด: {genderCount.male} คน</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: COLORS[1],
                          marginRight: '10px',
                        }}
                      ></span>
                      <span style={{ color: 'black' }}>ผู้ป่วยเพศหญิงทั้งหมด: {genderCount.female} คน</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '20px',
                          height: '20px',
                          backgroundColor: COLORS[2],
                          marginRight: '10px',
                        }}
                      ></span>
                      <span style={{ color: 'black' }}>ผู้ป่วยไม่ระบุเพศ: {genderCount.unspecified} คน</span>
                    </li>
                  </ul>
                </div>
              </div>
              {/* <div className="item">
                <div className="countcontent">
                  <div className="row align-items-center">
                    <div className="color-strip"></div>
                    <div className="col">
                      <div className="bg-icon">
                        <img src={Noti} className="patient" alt="patient" />
                      </div>
                    </div>
                    <div className="col">
                      <p className="num mt-2"><CountUp end={0} duration={2} /></p>
                      <p className="name fs-5">เคสที่มีแจ้งเตือน</p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 