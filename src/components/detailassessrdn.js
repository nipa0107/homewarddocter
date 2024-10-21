import React, { useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DetailAssessreadiness() {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});
  const location = useLocation();
  const { id } = location.state;
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
  const [mpersonnel, setMPersonnel] = useState(null);
  const [readinessForms, setReadinessForms] = useState([]);
  const [readinessAssessments, setReadinessAssessments] = useState([]);


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
        .then((user) => {
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

  const filteredAlerts =
    filterType === "unread"
      ? alerts.filter((alert) => !alert.viewedBy.includes(userId))
      : alerts;

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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]
      } ${year + 543} เวลา ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
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

  const getAnswerElement = (answer) => {
    const isPositive = answer === "ใช่" || answer === "ถูกต้อง";
    const color = isPositive ? "rgb(0, 172, 0)" : "red";
    const iconClass = isPositive ? "bi bi-check-circle" : "bi bi-x-circle";

    return (
      <span style={{ color }}>
        <i className={iconClass} style={{ marginRight: "8px" }}></i>
        {answer}
      </span>
    );
  };

  useEffect(() => {
    const fetchReadinessForm = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getReadinessForm/${id}`);
        const data = await response.json();

        if (response.ok) {
          setReadinessForms(data.data); 
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching readiness form:", error);
      }
    };
    fetchReadinessForm();
  }, [id, token]);

  useEffect(() => {
    if (readinessForms.user && readinessForms._id) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getuser/${readinessForms.user}`
          );
          const data = await response.json();
          setName(data.name);
          setSurname(data.surname);
          setGender(data.gender);
          setBirthday(data.birthday);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();
    }
  }, [readinessForms.user]);

  useEffect(() => {
    if (readinessForms && readinessForms.user) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicalInformation/${readinessForms.user}`
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
  }, [readinessForms.user]);

  const [readinessStatus, setReadinessStatus] = useState('');
  const [detail, setDetail] = useState('');
  const [isReadinessSubmitted, setIsReadinessSubmitted] = useState(false);
  const [dateass, setDateass] = useState([]);

  const handleStatusChange = (status) => {
    setReadinessStatus(status); // ตรงนี้ควรจะอัปเดต readinessStatus
  };
  

  const handleDetailChange = (e) => {
    setDetail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     

      // ทำการบันทึกข้อมูล readiness_status, detail, mpersonnel, readinessForm ID
      const response = await fetch(`http://localhost:5000/addReadinessAssessment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readiness_status: readinessStatus,
          detail,
          MPersonnel: userId,
          ReadinessForm: readinessForms._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error updating data");
      }

      const data = await response.json();
      toast.success("ประเมินความพร้อมสำเร็จ");
      setTimeout(() => window.location.reload(), 1000); // Reload หลังจากบันทึกสำเร็จ
    } catch (error) {
      toast.error(`Error updating data: ${error.message}`);
    }
  };
  useEffect(() => {
    const fetchReadinessAssessments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/allReadinessAssessments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        const currentReadinessAssessment = data.data.find(
          (readinessAssessment) => readinessAssessment.ReadinessForm === readinessForms._id
        );
        if (currentReadinessAssessment) {
          setIsReadinessSubmitted(true);
          setReadinessStatus(currentReadinessAssessment.readiness_status);
          setDetail(currentReadinessAssessment.detail);
          setMPersonnel(currentReadinessAssessment.MPersonnel);
          setDateass(currentReadinessAssessment.createdAt);
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };
    fetchReadinessAssessments();
  }, [readinessForms._id]);

  const handleBreadcrumbClick = () => {
    navigate("/assessreadinessuser", { state: { id: readinessForms.user } });
  };

  const [isEditing, setIsEditing] = useState(false);

  return (
    <main className="body">
      <ToastContainer />
      <div className={`sidebar ${isActive ? "active" : ""}`}>
        <div className="logo_content">
          <div className="logo">
            <div className="logo_name">
              <img src={logow} className="logow" alt="logo"></img>
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
                <i
                  className="bi bi-box-arrow-right"
                  id="log_out"
                  onClick={logOut}
                ></i>
                <span className="links_name">ออกจากระบบ</span>
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
                <i className="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a href="assessreadiness">ประเมินความพร้อมการดูแล</a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a onClick={handleBreadcrumbClick} className="info">บันทึกการประเมิน</a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
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
              <label>อายุ:</label> {userAge} ปี {userAgeInMonths} เดือน{" "}
              <label>เพศ:</label>
              {gender}
            </p>
          ) : (
            <p className="textassesment">
              {" "}
              <label>อายุ:</label>0 ปี 0 เดือน <label>เพศ:</label>
              {gender}
            </p>
          )}
          <p className="textassesment">
            <label>HN:</label>
            {medicalData && medicalData.HN ? medicalData.HN : "ไม่มีข้อมูล"}
            <label>AN:</label>
            {medicalData && medicalData.AN ? medicalData.AN : "ไม่มีข้อมูล"}
            <label>ผู้ป่วยโรค:</label>
            {medicalData && medicalData.Diagnosis
              ? medicalData.Diagnosis
              : "ไม่มีข้อมูล"}
          </p>
          <p>
              
                <p className="textassesment">
                  <p>
                    <label>วันที่บันทึก:</label>
                     {formatDate(readinessForms.createdAt)}
                  </p>
                </p>
              
          </p>
          
        </div>


        <div className="info3 card mt-4">
          <div className="header">
            <b>การประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในที่บ้าน</b>
          </div>
          <div className="m-4">
            <table className="assessment-table">
              <thead>
                <tr>
                  <th style={{ width: "90%" }}>คำถาม</th>
                  <th style={{ width: "10%" }}>คำตอบ</th>
                </tr>
              </thead>
              <tbody>
                    {readinessForms.Readiness1 && (
                      <>
                        <tr>
                          <td>
                            1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาด้วยการดูแลแบบผู้ป่วยในที่บ้านจากแพทย์อย่างครบถ้วน
                            และให้คำยินยอมก่อนรับบริการใช่หรือไม่?
                          </td>
                          <td >{getAnswerElement(readinessForms.Readiness1.question1_1)}</td>
                        </tr>
                        <tr>
                          <td>2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านมีความปลอดภัยใช่หรือไม่?</td>
                          <td >{getAnswerElement(readinessForms.Readiness1.question1_2)}</td>
                        </tr>
                        <tr>
                          <td>
                            3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านอยู่ห่างจากโรงพยาบาลไม่เกิน 20
                            กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่?
                          </td>
                          <td>{getAnswerElement(readinessForms.Readiness1.question1_3)}</td>
                        </tr>
                        <tr>
                          <td>
                            4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านสามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่?
                          </td>
                          <td>{getAnswerElement(readinessForms.Readiness1.question1_4)}</td>
                        </tr>
                      </>
                    )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="info3 card mt-4">
          <div className="header">
            <b>ประเมินความรู้ ความเข้าใจ (ตาม D-METHOD)</b>
          </div>
          <div className="m-3">
            <table className="assessment-table">
              <thead>
                <tr>
                  <th style={{ width: "90%" }}>คำถาม</th>
                  <th style={{ width: "9%" }}>คำตอบ</th>
                </tr>
              </thead>
              <tbody>

                    {readinessForms.Readiness2 && (
                      <>
                        <tr>
                          <td>1. Disease : เข้าใจโรค/ภาวะเจ็บป่วย ?</td>
                          <td>{getAnswerElement(readinessForms.Readiness2.Disease)}</td>
                        </tr>
                        <tr>
                          <td>2. Medication : รู้ข้อมูล/ข้อพึงระวัง/การจัดยา ?</td>
                          <td>{getAnswerElement(readinessForms.Readiness2.Medication)}</td>
                        </tr>
                        <tr>
                          <td>3. Environment : มีการเตรียมสิ่งแวดล้อม ?</td>
                          <td>{getAnswerElement(readinessForms.Readiness2.Environment)}</td>
                        </tr>
                        <tr>
                          <td>4. Treatment : มีการฝึกทักษะที่จำเป็น ?</td>
                          <td>{getAnswerElement(readinessForms.Readiness2.Treatment)}</td>
                        </tr>
                        <tr>
                          <td>5. Health : รู้ข้อจำกัดด้านสุขภาพ ?</td>
                          <td>{getAnswerElement(readinessForms.Readiness2.Health)}</td>
                        </tr>
                        <tr>
                          <td>6. Out patient : รู้เรื่องการมาตามนัด/การส่งต่อ ?</td>
                          <td>{getAnswerElement(readinessForms.Readiness2.Out_patient)}</td>
                        </tr>
                        <tr>
                          <td>7. Diet : รู้เรื่องการจัดการอาหารที่เหมาะสมกับโรค ?</td>
                          <td>{getAnswerElement(readinessForms.Readiness2.Diet)}</td>
                        </tr>
                      </>
                    )}
              </tbody>
            </table>
          </div>
        </div>
        {isReadinessSubmitted && !isEditing ? (
          <div className="info3 card mt-4">
            <h3>ประเมินความพร้อม</h3>
            <div className="btn-group">
              {readinessStatus === "มีความพร้อม" ? (
                <div className={`btnass btn-normal`}>มีความพร้อม</div>
              ) : (
                <div className={`btnass btn-abnormal`}>ยังไม่มีความพร้อม</div>
              )}
            </div> 
            <p className="detail-info"><b>รายละเอียดเพิ่มเติม :</b> {detail ? detail : '-'}</p>
            <p className="detail-info"><b>ผู้ประเมินความพร้อม :</b> {mpersonnel?.nametitle} {mpersonnel?.name} {mpersonnel?.surname}</p>
            <p className="detail-info"><b>วันที่ประเมินความพร้อม :</b> {formatDate(dateass)}</p>
            {/* แสดงวันที่อัปเดต */}
            {/* <button className="btn btn-warning mt-4" onClick={() => setIsEditing(true)}>
              แก้ไขการประเมิน
            </button> */}
          </div>
        ) : isEditing ? (
          <div className="info3 card mt-4">
            <p className="texthead">แก้ไขการประเมินความพร้อม</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <div className="btn-group">
                  <div
                    className={`btnass ${readinessStatus === "มีความพร้อม" ? "btn-normal" : "btn-outline"}`}
                    onClick={() => handleStatusChange("มีความพร้อม")}
                  >
                    มีความพร้อม
                  </div>
                  <div
                    className={`btnass ${readinessStatus === "ยังไม่มีความพร้อม" ? "btn-abnormal" : "btn-outline"}`}
                    onClick={() => handleStatusChange("ยังไม่มีความพร้อม")}
                  >
                    ยังไม่มีความพร้อม
                  </div>
                </div>
                <div className="inline-container mt-4">
                  <label className="title-ass">เพิ่มเติม: </label>
                  <textarea
                    type="text"
                    className="form-control ml-3"
                    id="detail"
                    value={detail}
                    onChange={handleDetailChange}
                  />
                </div>
              </div>
              <div className="btn-group">
                <div className="btn-next mb-5">
                  <button type="submit" className="btn btn-outline py-2">
                    บันทึกการแก้ไข
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="info3 card mt-4">
            <p className="texthead">ประเมินความพร้อม</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <div className="btn-group">
                  <div
                    className={`btnass ${readinessStatus === "มีความพร้อม" ? "btn-normal" : "btn-outline"}`}
                    onClick={() => handleStatusChange("มีความพร้อม")}
                  >
                    มีความพร้อม
                  </div>
                  <div
                    className={`btnass ${readinessStatus === "ยังไม่มีความพร้อม" ? "btn-abnormal" : "btn-outline"}`}
                    onClick={() => handleStatusChange("ยังไม่มีความพร้อม")}
                  >
                    ยังไม่มีความพร้อม
                  </div>
                </div>
                <div className="inline-container mt-4">
                  <label className="title-ass">เพิ่มเติม: </label>
                  <textarea
                    type="text"
                    className="form-control ml-3"
                    id="detail"
                    value={detail}
                    onChange={handleDetailChange}
                  />
                </div>
              </div>
              <div className="btn-group">
                <div className="btn-next mb-5">
                  <button type="submit" className="btn btn-outline py-2">
                    บันทึก
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

