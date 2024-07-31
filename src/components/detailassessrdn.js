import React, { useEffect, useState, useRef  } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, Chart, Bar, XAxis, YAxis } from 'recharts';

export default function DetailAssessreadiness() {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});
  const location = useLocation();
  const { id } = location.state;
  const userid = location.state.id; // Get user ID from the navigation state
  const [assessmentData, setAssessmentData] = useState([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [userData, setUserData] = useState(null);
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
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getuser/${id}`);
        const data = await response.json();
        setUserData(data);
        setUsername(data.username);
        setName(data.name);
        setSurname(data.surname);
        setGender(data.gender);
        setBirthday(data.birthday);
      } catch (error) {
        console.error("Error fetching caremanual data:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getAssessreadiness/${userid}`);
        const data = await response.json();

        if (response.ok) {
          setAssessmentData(data.data); // Store assessment data
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching assessment data:', error);
      }
    };

    const fetchMedicalData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/medicalInformation/${userid}`);
        const data = await response.json();

        if (response.ok) {
          setMedicalData(data.data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching medical data:', error);
      }
    };

    fetchAssessmentData();
    fetchMedicalData();
  }, [userid]);

  const currentDate = new Date();

  useEffect(() => {
    if (birthday) {
      const userBirthday = new Date(birthday);
      const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();
      const monthDiff = currentDate.getMonth() - userBirthday.getMonth();
      setUserAgeInMonths(monthDiff >= 0 ? monthDiff : 12 + monthDiff);

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && currentDate.getDate() < userBirthday.getDate())
      ) {
        setUserAge(ageDiff - 1);
      } else {
        setUserAge(ageDiff);
      }
    }
  }, [currentDate]);

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

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

  const getColor = (answer) => {
    return answer === "ใช่" || answer === "ถูกต้อง" ? "rgb(0, 172, 0)" : "red";
  };

  const getAnswerElement = (answer) => {
    const isPositive = answer === "ใช่" || answer === "ถูกต้อง";
    const color = isPositive ? "rgb(0, 172, 0)" : "red";
    const iconClass = isPositive ? "bi bi-check-circle" : "bi bi-x-circle";

    return (
      <span style={{ color }}>
        <i className={iconClass} style={{ marginRight: '8px' }}></i>
        {answer}
      </span>
    );
  };

  // Calculate percentages
  const calculateReadinessPercentages = () => {
    let yesCount = 0;
    let noCount = 0;
    let totalCount = 0;

    assessmentData.forEach((assessment) => {
      if (assessment.Readiness1) {
        Object.values(assessment.Readiness1).forEach((answer) => {
          if (answer === "ใช่") {
            yesCount++;
          } else {
            noCount++;
          }
        });
        totalCount += Object.values(assessment.Readiness1).length;
      }
    });

    const yesPercentage = (yesCount / totalCount) * 100;
    const noPercentage = (noCount / totalCount) * 100;

    return [
      { name: "ใช่", value: yesPercentage },
      { name: "ไม่ใช่", value: noPercentage },
    ];
  };

  const readinessData = calculateReadinessPercentages();

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
          <div className="header">ประเมินความพร้อมการดูแล</div>
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
              <a href="assessreadiness">ประเมินความพร้อมการดูแล</a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>รายละเอียดการประเมิน</a>
            </li>
          </ul>
        </div>
        <br></br>
        <div className="">
          <p className="headerassesment">
            {name} {surname}
          </p>
          {birthday ? (
            <p className="textassesment">
              <label>อายุ:</label> {userAge} ปี {userAgeInMonths} เดือน <label>เพศ:</label>{gender}
            </p>
          ) : (
            <p className="textassesment"> <label>อายุ:</label>0 ปี 0 เดือน <label>เพศ:</label>{gender}</p>
          )}
          <p className="textassesment">

            <label>HN:</label>
            {medicalData && medicalData.HN
              ? medicalData.HN
              : "ไม่มีข้อมูล"}
            <label>AN:</label>
            {medicalData && medicalData.AN
              ? medicalData.AN
              : "ไม่มีข้อมูล"}
            <label>ผู้ป่วยโรค:</label>
            {medicalData && medicalData.Diagnosis
              ? medicalData.Diagnosis
              : "ไม่มีข้อมูล"}
          </p>
          <p>{assessmentData.map((assessment, index) => (
            <div key={index}>
              <p className="textassesment"><p className="evaluated"><label>สถานะ:</label>{assessment.status_name || "ไม่มีข้อมูล"}</p></p>
            </div>
          ))}</p>
        </div>
        <div className="info3 card mt-4">
          <div className="header">
            <b>การประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในที่บ้าน</b>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                dataKey="value"
                isAnimationActive={true}
                data={readinessData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="info3 card mt-4">
          {/* <div className="header">
            <b>การประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในที่บ้าน</b>
          </div> */}
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness1 ? (
                <>
                  <div className="mb-1" >
                    <label>
                      1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาด้วยการดูแลแบบผู้ป่วยใน
                      ที่บ้านจากแพทย์อย่างครบ ถ้วน และให้คำยินยอมก่อนรับบริการใช่หรือไม่ ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness1.question1_1)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4">
              {assessment.Readiness1 ? (
                <>
                  <div className="mb-1">
                    <label>
                      2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน
                      มีความปลอดภัยใช่หรือไม่ ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>
                      {getAnswerElement(assessment.Readiness1.question1_2)}
                    </label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4">
              {assessment.Readiness1 ? (
                <>
                  <div className="mb-1">
                    <label>
                      3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน
                      อยู่ห่างจากโรงพยาบาลไม่เกิน 20
                      กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่ ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness1.question1_3)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีคำตอบ"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4">
              {assessment.Readiness1 ? (
                <>
                  <div className="mb-1">
                    <label>
                      4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน
                      สามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่ ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness1.question1_4)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-4">
          <div className="header">
            <b>ประเมินความรู้ ความเข้าใจ (ตาม D-METHOD)</b>
          </div>
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness2 ? (
                <>
                  <div className="mb-1">
                    <label>1. Disease : เข้าใจโรค/ภาวะเจ็บป่วย ?</label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness2.Disease)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness2 ? (
                <>
                  <div className="mb-1">
                    <label>
                      2. Medication : รู้ข้อมูล/ข้อพึงระวัง/การจัดยา ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness2.Medication)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness2 ? (
                <>
                  <div className="mb-1">
                    <label>
                      3. Environment : มีการเตรียมสิ่งแวดล้อม ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness2.Environment)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness2 ? (
                <>
                  <div className="mb-1">
                    <label>
                      4.Treatment : มีการฝึกทักษะที่จำเป็น ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness2.Treatment)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness2 ? (
                <>
                  <div className="mb-1">
                    <label>5. Health : รู้ข้อจำกัดด้านสุขภาพ ?</label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness2.Health)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness2 ? (
                <>
                  <div className="mb-1">
                    <label>
                      6. Out patient : รู้เรื่องการมาตามนัด/การส่งต่อ ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness2.Out_patient)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          {assessmentData.map((assessment, index) => (
            <div key={index} className="m-4 ">
              {assessment.Readiness2 ? (
                <>
                  <div className="mb-1">
                    <label>
                      7. Diet : รู้เรื่องการจัดการอาหารที่เหมาะสมกับโรค ?
                    </label>
                  </div>
                  <div className="ml-3">
                    <label>{getAnswerElement(assessment.Readiness2.Diet)}</label>
                  </div>
                </>
              ) : (
                "ไม่มีข้อมูล"
              )}
            </div>
          ))}
        </div>
        <div className="info3 card mt-3">
          <p className="texthead">การประเมิน</p>
          <form>
            <div className="mb-1">
              <div className="mb-3">
                <div className="btn-group">
                  <div>มีความพร้อม</div>
                  <div>ยังไม่มีความพร้อม</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
