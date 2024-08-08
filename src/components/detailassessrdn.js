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
  const userid = location.state.id;
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
        const response = await fetch(
          `http://localhost:5000/getAssessreadiness/${userid}`
        );
        const data = await response.json();

        if (response.ok) {
          setAssessmentData(data.data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching assessment data:", error);
      }
    };

    const fetchMedicalData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/medicalInformation/${userid}`
        );
        const data = await response.json();

        if (response.ok) {
          setMedicalData(data.data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching medical data:", error);
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

    return `${day < 10 ? "0" + day : day} ${
      thaiMonths[month - 1]
    } ${year + 543} เวลา ${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
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

  const [statusName, setStatusName] = useState("");
  const [detail, setDetail] = useState("");

  const updateReadinessStatus = async (userid, readinessStatus, detail) => {
    try {
      const response = await fetch(
        `http://localhost:5000/updateReadinessStatus/${userid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ readiness_status: readinessStatus, detail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Readiness status updated successfully:", data);
        navigate("/assessreadiness");
      } else {
        console.error("Failed to update readiness status:", data.message);
      }
    } catch (error) {
      console.error("Error updating readiness status:", error);
    }
  };

  useEffect(() => {
    const fetchReadinessStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getReadinessStatus/${userid}`
        );
        const data = await response.json();

        if (response.ok) {
          setStatusName(data.readiness_status);
          setDetail(data.detail);
        } else {
          console.error("Failed to fetch readiness status:", data.message);
        }
      } catch (error) {
        console.error("Error fetching readiness status:", error);
      }
    };

    if (userid) {
      fetchReadinessStatus();
    }
  }, [userid]);

  const handleUpdateReadinessStatus = (status) => {
    if (userid) {
      updateReadinessStatus(userid, status, detail);
    } else {
      console.error("User ID is not available.");
    }
  };

  const handleButtonClick = (status) => {
    setStatusName(status);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdateReadinessStatus(statusName);
  };

  return (
    <main className="body">
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
            {assessmentData.map((assessment, index) => (
              <div key={index}>
                <p className="textassesment">
                  <p className="evaluated">
                    <label>สถานะ:</label>
                    {assessment.status_name || "ไม่มีข้อมูล"}
                  </p>
                </p>
              </div>
            ))}
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
                {assessmentData.map((assessment, index) => (
                  <React.Fragment key={index}>
                    {assessment.Readiness1 && (
                      <>
                        <tr>
                          <td>
                            1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาด้วยการดูแลแบบผู้ป่วยในที่บ้านจากแพทย์อย่างครบถ้วน
                            และให้คำยินยอมก่อนรับบริการใช่หรือไม่?
                          </td>
                          <td >{getAnswerElement(assessment.Readiness1.question1_1)}</td>
                        </tr>
                        <tr>
                          <td>2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านมีความปลอดภัยใช่หรือไม่?</td>
                          <td >{getAnswerElement(assessment.Readiness1.question1_2)}</td>
                        </tr>
                        <tr>
                          <td>
                            3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านอยู่ห่างจากโรงพยาบาลไม่เกิน 20
                            กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่?
                          </td>
                          <td>{getAnswerElement(assessment.Readiness1.question1_3)}</td>
                        </tr>
                        <tr>
                          <td>
                            4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านสามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่?
                          </td>
                          <td>{getAnswerElement(assessment.Readiness1.question1_4)}</td>
                        </tr>
                      </>
                    )}
                    
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="info3 card mt-4">
          <div className="header">
            <b>ประเมินความรู้ ความเข้าใจ (ตาม D-METHOD)</b>
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
                {assessmentData.map((assessment, index) => (
                  <React.Fragment key={index}>
                    {assessment.Readiness2 && (
                      <>
                        <tr>
                          <td>1. Disease : เข้าใจโรค/ภาวะเจ็บป่วย ?</td>
                          <td>{getAnswerElement(assessment.Readiness2.Disease)}</td>
                        </tr>
                        <tr>
                          <td>2. Medication : รู้ข้อมูล/ข้อพึงระวัง/การจัดยา ?</td>
                          <td>{getAnswerElement(assessment.Readiness2.Medication)}</td>
                        </tr>
                        <tr>
                          <td>3. Environment : มีการเตรียมสิ่งแวดล้อม ?</td>
                          <td>{getAnswerElement(assessment.Readiness2.Environment)}</td>
                        </tr>
                        <tr>
                          <td>4. Treatment : มีการฝึกทักษะที่จำเป็น ?</td>
                          <td>{getAnswerElement(assessment.Readiness2.Treatment)}</td>
                        </tr>
                        <tr>
                          <td>5. Health : รู้ข้อจำกัดด้านสุขภาพ ?</td>
                          <td>{getAnswerElement(assessment.Readiness2.Health)}</td>
                        </tr>
                        <tr>
                          <td>6. Out patient : รู้เรื่องการมาตามนัด/การส่งต่อ ?</td>
                          <td>{getAnswerElement(assessment.Readiness2.Out_patient)}</td>
                        </tr>
                        <tr>
                          <td>7. Diet : รู้เรื่องการจัดการอาหารที่เหมาะสมกับโรค ?</td>
                          <td>{getAnswerElement(assessment.Readiness2.Diet)}</td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="info3 card mt-4">
          <p className="texthead">ประเมินความพร้อม</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <div className="btn-group">
                <div
                  className={`btnass ${
                    statusName === "มีความพร้อม" ? "btn-normal" : "btn-outline"
                  }`}
                  onClick={() => handleButtonClick("มีความพร้อม")}
                >
                  มีความพร้อม
                </div>
                <div
                  className={`btnass ${
                    statusName === "ยังไม่มีความพร้อม"
                      ? "btn-abnormal"
                      : "btn-outline"
                  }`}
                  onClick={() => handleButtonClick("ยังไม่มีความพร้อม")}
                >
                  ยังไม่มีความพร้อม
                </div>
              </div>
              <div className="inline-container mt-5">
                <label className="title-ass ">เพิ่มเติม: </label>
                <textarea
                  type="text"
                  className="form-control ml-5"
                  id="detail"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
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
      </div>
    </main>
  );
}

