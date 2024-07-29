import React, { useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts'; 

export default function Assessmentuser({ }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [patientForms, setPatientForms] = useState("");
  const location = useLocation();
  const { id } = location.state;
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [mpersonnel, setMPersonnel] = useState([]);
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [userData, setUserData] = useState(null);
  const [medicalData, setMedicalData] = useState([]);


  const [allUsers, setAllUsers] = useState([]);
  const [datauser, setDatauser] = useState([]);

  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const [userId, setUserId] = useState("");
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

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
    if (userData && userData._id) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicalInformation/${userData._id}`
          );
          const data = await response.json();
          console.log("Medical Information:", data);
          setMedicalData(data.data);
          console.log("22:", medicalData);

        } catch (error) {
          console.error("Error fetching medical information:", error);
        }
      };

      fetchMedicalInfo();
    }
  }, [userData]);



  const fetchpatientForms = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/getpatientforms/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setPatientForms(data.data);
      console.log("Patient Forms:", data.data);
    } catch (error) {
      console.error("Error fetching patient forms:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchpatientForms();
    }
  }, [id]);
  

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/allAssessment`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAssessments(data.data);
      console.log("AssessmentForms:", data.data);
    } catch (error) {
      console.error("Error fetching patient forms:", error);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // const hasAssessment = (patientFormId) => {
  //   return assessments.some(
  //     (assessment) => assessment.PatientForm === patientFormId
  //   );
  // };

  const fetchMpersonnel = async () => {
    try {
      const response = await fetch(`http://localhost:5000/allMpersonnel`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMPersonnel(data.data);
      console.log("Mpersonnel:", data.data);
    } catch (error) {
      console.error("Error fetching patient forms:", error);
    }
  };

  useEffect(() => {
    fetchMpersonnel();
  }, []);

  const currentDate = new Date();

  const userBirthday = new Date(birthday);

  // let userAge = "";
  // if (userBirthday) {
  //   const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();

  //   const isBeforeBirthday =
  //     currentDate.getMonth() < userBirthday.getMonth() ||
  //     (currentDate.getMonth() === userBirthday.getMonth() &&
  //       currentDate.getDate() < userBirthday.getDate());

  //   userAge = isBeforeBirthday ? ageDiff - 1 : ageDiff;
  // }

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

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };
  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${year + 543
      } เวลา ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
      } น.`;
  };

// แช็ตยังไม่อ่าน
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
<<<<<<< HEAD
      <div className="homeheader">

        <div className="header">ติดตาม/ประเมินอาการ</div>
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

        <div className="homeheader">
          <div className="header">ติดตาม/ประเมินอาการ</div>
          <div class="profile_details ">
            <li>
              <a href="profile">
                <i class="bi bi-person"></i>
                <span class="links_name">
                  {data && data.nametitle + data.name + " " + data.surname}
                </span>
              </a>
            </li>

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
              <a href="assessment" className="info">
                ติดตาม/ประเมินอาการ
              </a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>การบันทึกอาการผู้ป่วย</a>
            </li>
          </ul>
        </div>
        <div className="toolbar"></div>
        <div className="content">
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

          </div>

          <table className="table">
            <thead>
              <tr>
                <th>วันที่บันทึก</th>
                <th>ความรุนแรงของอาการ</th>
                <th>ผลการประเมิน</th>
                <th>ผู้ประเมิน</th>
              </tr>
            </thead>
            <tbody>
              {patientForms && patientForms.length > 0 ? (
                patientForms
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((form, index) => (
                    <tr
                      key={index}
                      className="info"
                      onClick={() =>
                        navigate("/assessmentuserone", {
                          state: { id: form._id },
                        })
                      }
                    >
                      <td>{formatDate(form.createdAt)}</td>
                      <td>{form.LevelSymptom}</td>
                      {/* <td>
                      {hasAssessment(form._id)
                        ? "ประเมินแล้ว"
                        : "ยังไม่ได้ประเมิน"}
                    </td> */}
                      <td>
                        {assessments.some(
                          (assessment) => assessment.PatientForm === form._id
                        ) ? (
                          assessments.map((assessment) =>
                            assessment.PatientForm === form._id ? (
                              <span
                                key={assessment._id}
                                className={
                                  assessment.status_name === "ปกติ"
                                    ? "normal-status"
                                    : assessment.status_name === "ผิดปกติ"
                                      ? "abnormal-status"
                                      : // assessment.status_name === "ผิดปกติ" ? "abnormal-status" :
                                      "end-of-treatment-status"
                                }
                              >
                                {assessment.status_name}
                              </span>
                            ) : null
                          )
                        ) : (
                          <span className="not-evaluated">
                            ยังไม่ได้รับการประเมิน
                          </span>
                        )}
                      </td>
                      <td>
                        {assessments.some(
                          (assessment) => assessment.PatientForm === form._id
                        )
                          ? assessments.map((assessment) =>
                            assessment.PatientForm === form._id ? (
                              <span key={assessment._id}>
                                {mpersonnel.map((person) =>
                                  person._id === assessment.MPersonnel ? (
                                    <span key={person._id}>
                                      {person.nametitle} {person.name}{" "}
                                      {person.surname}
                                    </span>
                                  ) : null
                                )}
                              </span>
                            ) : null
                          )
                          : <span className="not-evaluated">
                            ยังไม่ได้รับการประเมิน
                          </span>}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="4" className="assessmentnull">
                    ยังไม่มีการบันทึกอาการ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      </div>
    </main>
  );
}
