import React, { useEffect, useState, useRef, PureComponent } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "../css/noti.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import Pt from "../img/patient.png";
import Pt2 from "../img/patientcount.png";
import Bh from "../img/better-health.png";
import VSG from "../img/vsg.png";
import VSR from "../img/abnormal.png";
import Noti from "../img//noti.png";
import DoughnutChartComponent from "./Chart.js";
import { Chart } from "chart.js";
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
  const bellRef = useRef(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [medicalData, setMedicalData] = useState({});

  useEffect(() => {
    socket?.on('newAlert', (alert) => {
      setAlerts(prevAlerts => [...prevAlerts, alert]);
      setUnreadCount(prevCount => prevCount + 1);
    });

    socket.on('deletedAlert', (data) => {
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.patientFormId !== data.patientFormId)
      );
      setUnreadCount((prevCount) => prevCount - 1); // ลดจำนวน unread เมื่อ alert ถูกลบ
    });

    return () => {
      socket?.off('newAlert'); // Clean up the listener on component unmount
      socket.off('deletedAlert');
    };
  }, []);

  useEffect(() => {
    getAllUser();
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


  // Define colors for each diagnosis
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFF', '#FF6F91', '#FF6361', '#BC5090'];
  const diagnosisData = Object.entries(diagnosisCount).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length], // เพิ่มสีจาก COLORS
  }));

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
  const totalUsers = genderCount.male + genderCount.female + genderCount.unspecified;

  // ข้อมูลสำหรับ PieChart
  const genderData = [
    { name: "ชาย", value: totalUsers > 0 ? (genderCount.male / totalUsers) * 100 : 0 },
    { name: "หญิง", value: totalUsers > 0 ? (genderCount.female / totalUsers) * 100 : 0 },
    { name: "ไม่ระบุ", value: totalUsers > 0 ? (genderCount.unspecified / totalUsers) * 100 : 0 },
  ];



  //Immobility
  const [group3Users, setGroup3Users] = useState([]); // เก็บข้อมูลผู้ใช้อยู่ในกลุ่มที่ 3

  useEffect(() => {
    const fetchGroup3Users = async () => {
      try {
        const response = await fetch("http://localhost:5000/immobility/group3");
        const result = await response.json();
        if (response.ok) {
          setGroup3Users(result.data); // เก็บข้อมูลที่ดึงมา
        } else {
          console.error("Failed to fetch group 3 data:", result.error);
        }
      } catch (error) {
        console.error("Error fetching group 3 users:", error);
      }
    };

    fetchGroup3Users(); // เรียกฟังก์ชันดึงข้อมูล
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null); // เพิ่ม useRef สำหรับตาราง

  // ฟังก์ชันสำหรับเลื่อนไปยังตาราง
  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const usersPerPage = 4;

  // Calculate the current users to display
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = group3Users.slice(indexOfFirstUser, indexOfLastUser);

  // Calculate total pages
  const totalPages = Math.ceil(group3Users.length / usersPerPage);

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const [sortOrder, setSortOrder] = useState("desc");
  const [filteredUsers, setFilteredUsers] = useState(group3Users);

  useEffect(() => {
    setFilteredUsers(group3Users);
  }, [group3Users]);


  const handleDateFilter = (filterType) => {
    const now = new Date();
    let filtered;
    if (filterType === "latest") {
      // Sort the data by creation date in descending order
      filtered = [...group3Users].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else if (filterType === "7days") {
      filtered = group3Users.filter(
        (user) =>
          new Date(user.createdAt) >= new Date(now.setDate(now.getDate() - 7))
      );
    } else if (filterType === "30days") {
      filtered = group3Users.filter(
        (user) =>
          new Date(user.createdAt) >= new Date(now.setMonth(now.getMonth() - 1))
      );
    } else {
      filtered = group3Users; // Default to all users
    }
    setFilteredUsers(filtered);
  };


  const [stats, setStats] = useState({ totalUsers: 0, totalPatientForms: 0, abnormalCasesCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/assessments/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        } else {
          console.error("Failed to fetch stats:", data.error);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [token]);

  const [caseCounts, setCaseCounts] = useState({
    totalCases: 0,
    normalCasesCount: 0,
    abnormalCasesCount: 0,
    emergencyCasesCount: 0,
  });

  useEffect(() => {
    const fetchCaseCounts = async () => {
      try {
        const response = await fetch("http://localhost:5000/assessments/countcase");
        const data = await response.json();
        if (data.success) {
          setCaseCounts(data.stats);
        } else {
          console.error("Failed to fetch case counts:", data.error);
        }
      } catch (error) {
        console.error("Error fetching case counts:", error);
      }
    };

    fetchCaseCounts();
  }, []);

  const [group3Count, setGroup3Count] = useState(0);

  useEffect(() => {
    const fetchGroup3Count = async () => {
      try {
        const response = await fetch("http://localhost:5000/immobility/group3/count");
        const data = await response.json();
        if (data.success) {
          setGroup3Count(data.count); // เก็บจำนวนรวมใน State
        } else {
          console.error("Failed to fetch group 3 count:", data.error);
        }
      } catch (error) {
        console.error("Error fetching group 3 count:", error);
      }
    };

    fetchGroup3Count();
  }, []);


  const COLORS_DIAGNOSIS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28AFF', '#FF6F91', '#FF6361', '#BC5090'];
  const COLORS_GENDER = ['#0088FE', '#f9a8d4', '#9ca3af']; // Male, Female, Unspecified
  const COLORS_STATUS = ["#4caf50", "#ff9800", "#f44336"]; // สีสำหรับปกติ, ผิดปกติ, และฉุกเฉิน
  const COLORS_IMMOBILITY = ["#1cc88a", "#4e73df", "#e74a3b"]; // สีสำหรับแต่ละกลุ่ม

  const [caseStats, setCaseStats] = useState([]);

  useEffect(() => {
    const fetchCaseStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/assessments/countstats");
        const data = await response.json();
        if (data.success) {
          setCaseStats([
            { name: "เคสปกติ", value: parseFloat(data.stats.normalCasesPercentage) },
            { name: "เคสผิดปกติ", value: parseFloat(data.stats.abnormalCasesPercentage) },
            { name: "เคสฉุกเฉิน", value: parseFloat(data.stats.emergencyCasesPercentage) },
          ]);
        }
      } catch (error) {
        console.error("Error fetching case stats:", error);
      }
    };

    fetchCaseStats();
  }, []);

  const [immobilityData, setImmobilityData] = useState([]);

  useEffect(() => {
    const fetchImmobilityData = async () => {
      try {
        const response = await fetch("http://localhost:5000/immobility/groups");
        const result = await response.json();

        if (result.success) {
          const { group1, group2, group3 } = result.data;
          const total = group1 + group2 + group3;

          // ตรวจสอบว่าข้อมูลที่ได้จาก API ถูกต้องหรือไม่
          console.log("API Result:", result.data);

          if (total > 0) {
            // คำนวณเปอร์เซ็นต์
            const formattedData = [
              { name: "กลุ่มที่ 1 (ช่วยเหลือตัวเองดี)", value: ((group1 / total) * 100).toFixed(2) },
              { name: "กลุ่มที่ 2 (ช่วยเหลือตัวเองได้ปานกลาง)", value: ((group2 / total) * 100).toFixed(2) },
              { name: "กลุ่มที่ 3 (ช่วยเหลือตัวเองได้น้อย)", value: ((group3 / total) * 100).toFixed(2) },
            ];

            setImmobilityData(formattedData);
          } else {
            console.error("Total is zero, no data to display.");
          }
        } else {
          console.error("API returned error:", result.error);
        }
      } catch (error) {
        console.error("Error fetching immobility data:", error);
      }
    };

    fetchImmobilityData();
  }, []);


  const caseDetails = [
    { label: "เคสปกติ", count: caseCounts.normalCasesCount, color: "#4caf50" },
    { label: "เคสผิดปกติ", count: caseCounts.abnormalCasesCount, color: "#ff9800" },
    { label: "เคสฉุกเฉิน", count: caseCounts.emergencyCasesCount, color: "#f44336" },

  ];

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
      <div className="home_content" >
        <div className="homeheader">
          <div className="header">Dashboard</div>
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
        <div class="container-fluid bg-light">
          <div class="row">
            <div
              className="col-xl-4 col-md-6 mb-4 mt-4"
              onClick={() => navigate("/allpatient")}
              style={{ cursor: "pointer" }} // Add cursor pointer for a clickable effect
            >
              <div className="card border-left shadow h-100 py-2 hover-card">
                <div className="card-body pb-0">
                  <div className="row no-gutters align-items-start">
                    <div className="col mr-3 text-left">
                      <div className="fs-6 text-primary mb-1" style={{ fontWeight: "bold" }}>
                        <i className="bi bi-people-fill"></i> ผู้ป่วยที่กำลังรักษา
                      </div>
                      <div className="h2 mb-0 font-weight-bold text-gray-800">
                        <CountUp end={datauser.filter((user) => user.deletedAt === null).length} />
                      </div>
                    </div>
                    <div className="col-auto">
                      <img src={Pt2} className="patient" alt="patient" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-xl-4 col-md-6 mb-4 mt-4"
              onClick={() => navigate("/abnormalcase")}
              style={{ cursor: "pointer" }} // Add cursor pointer for a clickable effect
            >
              <div className="card border-left shadow h-100 py-2 hover-card abnormal-status-card">
                <div className="card-body pb-0">
                  <div className="row no-gutters align-items-start">
                    <div className="col mr-3 text-left">
                      <div className="fs-6 abnormal-status-text mb-1" style={{ fontWeight: "bold" }}>
                        <i className="bi bi-people-fill"></i> เคสที่มีอาการผิดปกติ
                      </div>
                      <div className="h2 mb-0 font-weight-bold text-gray-800">
                        <CountUp end={stats.abnormalCasesCount} />
                      </div>
                    </div>
                    <div className="col-auto">
                      <img src={VSR} className="patient" alt="patient" />
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div
              className="col-xl-4 col-md-6 mb-4 mt-4"
              onClick={scrollToTable}
              style={{ cursor: "pointer" }} // Add cursor pointer for a clickable effect
            >
              <div className="card border-left shadow h-100 py-2 hover-card group3-status-card">
                <div className="card-body pb-0">
                  <div className="row no-gutters align-items-start">
                    <div className="col mr-3 text-left">
                      <div className="fs-6 group3-status-text mb-1" style={{ fontWeight: "bold" }}>
                        <i className="bi bi-people-fill"></i> ผู้ป่วยที่ช่วยเหลือตัวเองได้น้อย
                      </div>
                      <div className="h2 mb-0 font-weight-bold text-gray-800">
                        <CountUp end={group3Count} />
                      </div>
                    </div>
                    <div className="col-auto">
                      <img src={Pt} className="patient" alt="patient" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <h6 className="m-0" style={{fontWeight:"bold" , color:"#5ab1f8"}}>ผู้ป่วยที่มีคะแนนช่วยเหลือตัวเองได้น้อย</h6> */}
          <div class="row">
            <div class="col-xl-4 col-lg-5">
              <div class="card shadow mb-4">
                <div
                  class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 class="m-0 font-weight-bold text-primary">โรคของผู้ป่วยที่กำลังรักษา</h6>

                </div>
                <div class="card-body pt-2">
                  <div className="chart-pie mb-5 ">
                    <DoughnutChartComponent data={diagnosisData} colors={COLORS_DIAGNOSIS} />
                    {/* <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          dataKey="value"
                          isAnimationActive={true}
                          data={diagnosisData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ name, percent }) => `${(percent * 100).toFixed(2)}%`}

                        >
                          {diagnosisData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`ผู้ป่วย${name}`]} />
                      </PieChart>
                    </ResponsiveContainer> */}
                  </div>
                  <ul>
                    {diagnosisData.map((entry, index) => (
                      <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '15px',
                            height: '15px',
                            backgroundColor: COLORS[index % COLORS.length],
                            borderRadius: '50%', // ทำให้เป็นวงกลม
                            marginRight: '10px',
                          }}
                        ></span>
                        <span style={{ color: COLORS[index % COLORS.length], fontSize: '15px' }}>
                          ผู้ป่วย{entry.name} : {entry.value} เคส
                        </span>
                      </li>
                    ))}
                  </ul>

                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-5">
              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold text-primary">
                    รวมเคสปกติ/ผิดปกติ/เคสฉุกเฉิน
                  </h6>
                </div>
                <div className="card-body pt-6">
                  <div className="chart-pie mb-5">
                    <DoughnutChartComponent data={caseStats} colors={COLORS_STATUS} />
                  </div>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: 0,
                      width: "100%",
                      // ใช้พื้นที่เต็มเพื่อให้การจัดชิดซ้ายดูสมเหตุสมผล
                    }}
                  >
                    {caseStats.map((entry, index) => (
                      <li
                        key={`legend-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginRight: "15px",
                          marginBottom: "9px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "15px",
                            backgroundColor: COLORS_STATUS[index % COLORS_STATUS.length],
                            borderRadius: "50%",
                            marginRight: "5px",
                          }}
                        ></span>
                        <span style={{ color: COLORS_STATUS[index % COLORS_STATUS.length] }} >
                          {entry.name} 
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-xl-4 col-lg-5">
              <div class="card shadow mb-4">
                <div
                  class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 class="m-0 font-weight-bold text-primary">ผู้ป่วย 3 กลุ่ม Immobility</h6>
                </div>
                <div className="card-body pt-4">
                  {immobilityData.length > 0 ? (
                    <>
                      <div className="chart-pie mb-5">
                        <DoughnutChartComponent
                          data={immobilityData.map((entry) => ({
                            name: entry.name,
                            value: parseFloat(entry.value),
                          }))}
                          colors={COLORS_IMMOBILITY}
                        />
                      </div>
                      <ul
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: 0,
                        }}
                      >
                        {immobilityData.map((entry, index) => (
                          <li
                            key={`legend-${index}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                width: "15px",
                                height: "15px",
                                backgroundColor: ["#1cc88a", "#4e73df", "#e74a3b"][index],
                                borderRadius: "50%",
                                marginRight: "10px",
                              }}
                            ></span>
                            <span style={{ color: COLORS_IMMOBILITY[index % COLORS_IMMOBILITY.length] }}>{entry.name}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p>ไม่มีข้อมูลสำหรับกราฟนี้</p>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-xl-4 col-lg-5">
              <div class="card shadow mb-4">
                <div
                  class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 class="m-0 font-weight-bold text-primary">สัดส่วนรวมเพศของผู้ป่วย</h6>

                </div>
                <div class="card-body pt-4">
                  <div className="chart-pie mb-4">
                    <DoughnutChartComponent data={genderData} />
                  </div>
                  <ul
                    style={{
                      display: "flex", // จัดเรียงเป็นแนวนอน
                      justifyContent: "center", // จัดให้อยู่กึ่งกลางในแนวนอน
                      alignItems: "center", // จัดให้อยู่ตรงกลางในแนวตั้ง
                      padding: 0, // เอา padding ออก
                      margin: 0, // เอา margin ออก
                      listStyle: "none", // ลบ bullet points
                    }}
                  >
                    {genderData.map((entry, index) => (
                      <li
                        key={`legend-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginRight: "15px", // เพิ่มระยะห่างระหว่างแต่ละ `li`
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "15px",
                            backgroundColor: COLORS_GENDER[index % COLORS_GENDER.length],
                            borderRadius: "50%",
                            marginRight: "5px", // ระยะห่างระหว่างสีและข้อความ
                          }}
                        ></span>
                        <span style={{ color: COLORS_GENDER[index % COLORS_GENDER.length] }}>
                          {entry.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
            <div className="col-xl-8 col-lg-7" ref={tableRef}>
              <div className="card shadow mb-4">
                <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0" style={{ fontWeight: "bold" }}>ผู้ป่วยที่มีคะแนนช่วยเหลือตัวเองได้น้อย</h6>
                  <div className="filter-options">
                    <div className="dropdown">
                      <a
                        href=""
                        id="filterMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ textDecoration: "none", border: "none", background: "transparent", padding: 0, color: "#5ab1f8" }}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="filterMenuButton">
                        <li>
                          <a className="dropdown-item" href="#" onClick={() => handleDateFilter("latest")}>
                            ล่าสุด
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#" onClick={() => handleDateFilter("7days")}>
                            7 วัน
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#" onClick={() => handleDateFilter("30days")}>
                            30 วัน
                          </a>
                        </li>
                        {/* <li>
                          <a className="dropdown-item" href="#" onClick={() => handleDateFilter("all")}>
                            แสดงทั้งหมด
                          </a>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card-body pt-2 pb-2">
                  <div className="table-responsive">
                    <table className="table custom-table table-hover">
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: "5%" }}>#</th>
                          <th scope="col">ชื่อ-สกุล</th>
                          <th scope="col" style={{ width: "25%" }}>ผู้ป่วยโรค</th>
                          <th scope="col">คะแนนรวม</th>
                          <th scope="col">วันที่ประเมิน</th>
                          <th scope="col">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.slice(indexOfFirstUser, indexOfLastUser).map((user, index) => (
                          <tr
                            key={index}
                            onClick={() => navigate("/detailAssessinhomeForm", { state: { id: user._id } })}
                            style={{ cursor: "pointer" }} /* เปลี่ยน cursor เมื่อ hover */
                          >
                            <td style={{ width: "5%" }}>{indexOfFirstUser + index + 1}</td>
                            <td>{user.user.name} {user.user.surname}</td>
                            <td>{user.Diagnosis}</td>
                            <td style={{ color: "red", fontWeight: "bold" }}>{user.Immobility.totalScore}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString("th-TH")}</td>
                            <td>
                              <a
                                href=""
                                onClick={() => navigate("/detailAssessinhomeForm", { state: { id: user._id } })}
                                style={{ textDecoration: "none", cursor: "pointer", color: "#5ab1f8" }}
                              >
                                <i className="bi bi-three-dots"></i>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* <nav aria-label="...">
                    <ul class="pagination pagination-sm">
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={toggleSortOrder}
                      >
                        {sortOrder === "asc" ? "เรียงลำดับ ↑" : "เรียงลำดับ ↓"}
                      </button>
                    </ul>
                  </nav> */}
                  <nav aria-label="Page navigation example" className="mt-3">
                    <ul className="pagination justify-content-end">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <a
                          className="page-link"
                          href="#"
                          onClick={() => handleClick(currentPage - 1)}
                        >
                          ก่อนหน้า
                        </a>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li
                          key={i + 1}
                          className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                        >
                          <a
                            className="page-link"
                            href="#"
                            onClick={() => handleClick(i + 1)}
                          >
                            {i + 1}
                          </a>
                        </li>
                      ))}
                      <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                      >
                        <a
                          className="page-link"
                          href="#"
                          onClick={() => handleClick(currentPage + 1)}
                        // style={{color:"#64b5f6"}}
                        >
                          ถัดไป
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </main >
  );
} 