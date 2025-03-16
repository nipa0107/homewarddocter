import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import io from "socket.io-client";
import Sidebar from "./sidebar";

const socket = io("http://localhost:5000");
export default function Assessmentuser() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [token, setToken] = useState("");
  const [patientForms, setPatientForms] = useState("");
  const location = useLocation();
  const { id } = location.state;
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
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const [userId, setUserId] = useState("");
  const bellRef = useRef(null);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [vitalStatuses, setVitalStatuses] = useState({});
  const hasFetchedUserData = useRef(false);
  const [sortOrder, setSortOrder] = useState("desc"); // เริ่มต้นใหม่สุดมาก่อน

  const [unreadCountsByType, setUnreadCountsByType] = useState({
    assessment: 0,
    abnormal: 0,
    normal: 0,
  });

  const getUnreadCount = useCallback(
    (type) => {
      const filteredByType = alerts.filter(
        (alert) =>
          (type === "assessment" &&
            alert.alertType === "assessment" &&
            alert.alertMessage !== "เคสฉุกเฉิน") ||
          (type === "abnormal" &&
            (alert.alertType === "abnormal" ||
              alert.alertMessage === "เคสฉุกเฉิน")) ||
          (type === "normal" && alert.alertType === "normal")
      );
      return filteredByType.filter((alert) => !alert.viewedBy.includes(userId))
        .length;
    },
    [alerts, userId]
  );
  useEffect(() => {
    if (!userId) return;
    const updatedCounts = {
      assessment: getUnreadCount("assessment"),
      abnormal: getUnreadCount("abnormal"),
      normal: getUnreadCount("normal"),
    };
    setUnreadCountsByType(updatedCounts);
  }, [alerts, userId]);

  useEffect(() => {
    socket?.on("newAlert", (alert) => {
      console.log("Received newAlert:", alert);

      if (alert.MPersonnel?.id === userId) {
        console.log("Ignoring alert from self");
        return;
      }

      setAlerts((prevAlerts) => {
        const isExisting = prevAlerts.some(
          (existingAlert) => existingAlert.patientFormId === alert.patientFormId
        );

        let updatedAlerts;

        if (isExisting) {
          updatedAlerts = prevAlerts.map((existingAlert) =>
            existingAlert.patientFormId === alert.patientFormId
              ? alert
              : existingAlert
          );
        } else {
          updatedAlerts = [...prevAlerts, alert];
        }

        return [...updatedAlerts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    });

    socket?.on("deletedAlert", (data) => {
      setAlerts((prevAlerts) => {
        const filteredAlerts = prevAlerts.filter(
          (alert) => alert.patientFormId !== data.patientFormId
        );

        return [...filteredAlerts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });
    });

    return () => {
      socket?.off("newAlert");
      socket?.off("deletedAlert");
    };
  }, [userId]);

  useEffect(() => {
    const currentUserId = sender._id;
    const unreadAlerts = alerts.filter(
      (alert) =>
        Array.isArray(alert.viewedBy) && !alert.viewedBy.includes(currentUserId)
    );
    setUnreadCount(unreadAlerts.length);
  }, [alerts, sender._id]);

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
      notificationsRef.current &&
      !notificationsRef.current.contains(e.target) &&
      !bellRef.current.contains(e.target)
    ) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        if (data.data === "token expired") {
          alert("Token expired login again");
          window.localStorage.clear();
          setTimeout(() => {
            window.location.replace("./");
          }, 0);
          return null;
        }
        setSender({
          name: data.data.name,
          surname: data.data.surname,
          _id: data.data._id,
        });
        setData(data.data);

        return data.data;
      })
      .catch((error) => {
        console.error("Error verifying token:", error);
      });
  };
  const fetchAndSetAlerts = (token, userId) => {
    fetchAlerts(token, userId)
      .then((alerts, userId) => {
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
    if (hasFetchedUserData.current) return;
    hasFetchedUserData.current = true;

    const token = window.localStorage.getItem("token");
    setToken(token);

    if (token) {
      fetchUserData(token)
        .then((user) => {
          setUserId(user._id);
          fetchAndSetAlerts(token, user._id);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
        });
    }
  }, []);

  const markAllByTypeAsViewed = (type) => {
    fetch("http://localhost:5000/alerts/mark-all-viewed-by-type", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: userId, type: type }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "All selected alerts marked as viewed") {
          const updatedAlerts = alerts.map((alert) => {
            if (
              type === "all" ||
              ((alert.alertType === type ||
                (type === "abnormal" &&
                  (alert.alertType === "abnormal" ||
                    alert.alertMessage === "เคสฉุกเฉิน")) ||
                (type === "assessment" &&
                  alert.alertType === "assessment" &&
                  alert.alertMessage !== "เคสฉุกเฉิน")) &&
                !alert.viewedBy.includes(userId))
            ) {
              return { ...alert, viewedBy: [...alert.viewedBy, userId] };
            }
            return alert;
          });

          setAlerts(updatedAlerts);
          // setUnreadCount(0);
          const unreadAlerts = updatedAlerts.filter(
            (alert) => !alert.viewedBy.includes(userId)
          );
          setUnreadCount(unreadAlerts.length);
        }
      })
      .catch((error) => {
        console.error("Error marking alerts as viewed:", error);
      });
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const filteredAlerts =
    filterType === "unread"
      ? alerts.filter((alert) => !alert.viewedBy.includes(userId))
      : filterType === "assessment"
      ? alerts.filter(
          (alert) =>
            alert.alertType === "assessment" &&
            alert.alertMessage !== "เคสฉุกเฉิน"
        )
      : filterType === "abnormal"
      ? alerts.filter(
          (alert) =>
            alert.alertType === "abnormal" ||
            alert.alertMessage === "เคสฉุกเฉิน"
        )
      : filterType === "normal"
      ? alerts.filter((alert) => alert.alertType === "normal")
      : alerts;

  const getFilterLabel = (type) => {
    switch (type) {
      case "all":
        return "ทั้งหมด";
      case "unread":
        return "ยังไม่อ่าน";
      case "normal":
        return "บันทึกอาการ";
      case "abnormal":
        return "ผิดปกติ";
      case "assessment":
        return "ประเมินอาการ";
      default:
        return "ไม่ทราบ";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getuser/${id}`);
        const data = await response.json();
        setUserData(data);
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
        } catch (error) {
          console.error("Error fetching medical information:", error);
        }
      };

      fetchMedicalInfo();
    }
  }, [userData, medicalData]);

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

  const checkVitalSigns = async (formId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/checkVitals/${formId}`
      );
      const data = await response.json();
      setVitalStatuses((prev) => ({ ...prev, [formId]: data.status }));
    } catch (error) {
      console.error("Error fetching vital sign status:", error);
    }
  };

  useEffect(() => {
    if (patientForms.length > 0) {
      patientForms.forEach((form) => checkVitalSigns(form._id));
    }
  }, [patientForms]);

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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${
      year + 543
    } เวลา ${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    } น.`;
  };


  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTopButton(true);
    } else {
      setShowScrollTopButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const sortedForms = [...patientForms].sort((a, b) => {
    return sortOrder === "desc"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
  });

  return (
    <main className="body">
       <Sidebar />
      <div className="home_content">
        <div className="homeheader">
          <div className="header">ติดตาม/ประเมินอาการ</div>
          <div className="profile_details">
            <ul className="nav-list">
              <li>
                <a
                  ref={bellRef}
                  className="bell-icon"
                  onClick={toggleNotifications}
                >
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
        <div className="content">
          <div className="patient-card patient-card-style">
            <p className="patient-name">
              <label>ข้อมูลผู้ป่วย</label>
            </p>

            <div className="info-container">
              <div className="info-row">
                <div className="info-item">
                  
                  <label>ชื่อ-สกุล:</label>{" "}
                  <span>
                    {name} {surname}
                  </span>
                </div>
                <div className="info-item">
                  <label>อายุ:</label>{" "}
                  <span>
                    {birthday
                      ? `${userAge} ปี ${userAgeInMonths} เดือน`
                      : "0 ปี 0 เดือน"}
                  </span>
                </div>
                <div className="info-item">
                  <label>เพศ:</label> <span>{gender}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-item">
                  <label>HN:</label>{" "}
                  <span>{medicalData?.HN || "ไม่มีข้อมูล"}</span>
                </div>
                <div className="info-item">
                  <label>AN:</label>{" "}
                  <span>{medicalData?.AN || "ไม่มีข้อมูล"}</span>
                </div>
                <div className="info-item full-width">
                  <label>ผู้ป่วยโรค:</label>{" "}
                  <span>{medicalData?.Diagnosis || "ไม่มีข้อมูล"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="table-container">
            <table className="table-all tableass">
              <thead>
                <tr>
                  <th onClick={toggleSortOrder} style={{ cursor: "pointer" }}>
                    วันที่บันทึก
                    <i
                      className={
                        sortOrder === "desc"
                          ? "bi bi-caret-down-fill"
                          : "bi bi-caret-up-fill"
                      }
                    ></i>
                  </th>
                  <th>ความรุนแรงของอาการ</th>
                  <th>ผลการประเมิน</th>
                  <th>ผู้ประเมิน</th>
                </tr>
              </thead>
              <tbody>
                {sortedForms && sortedForms.length > 0 ? (
                  sortedForms.map((form, index) => (
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
                      <td>
                        <span
                          className={
                            form.LevelSymptom?.trim() === "ดีขึ้น"
                              ? "up-normal-status-LevelSymptom"
                              : form.LevelSymptom === "พอ ๆ เดิม"
                              ? "normal-status-LevelSymptom"
                              : form.LevelSymptom?.trim() === "แย่ลง"
                              ? "abnormal-status-LevelSymptom"
                              : "end-of-treatment-status"
                          }
                        >
                          {form.LevelSymptom}
                        </span>
                      </td>

                      {/* <td>
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
                                    : assessment.status_name === "เคสฉุกเฉิน"
                                    ? "Emergency-status"
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
                                    : assessment.status_name === "เคสฉุกเฉิน"
                                    ? "Emergency-status"
                                    : "end-of-treatment-status"
                                }
                              >
                                {assessment.status_name}
                              </span>
                            ) : null
                          )
                        ) : vitalStatuses[form._id] === "สัญญาณชีพผิดปกติ" ? (
                          <span className="abnormal-status">
                            สัญญาณชีพผิดปกติ
                          </span>
                        ) : (
                          <span className="not-evaluated">สัญญาณชีพปกติ</span>
                        )}
                      </td>
                      {/* <td>
                        {vitalStatuses[form._id] === "สัญญาณชีพผิดปกติ" ? (
                          <span className="abnormal-status">
                            สัญญาณชีพผิดปกติ
                          </span>
                        ) : (
                          <span className="not-evaluated">สัญญาณชีพปกติ</span>
                        )}
                      </td> */}
                      <td>
                        {assessments.some(
                          (assessment) => assessment.PatientForm === form._id
                        ) ? (
                          assessments.map((assessment) =>
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
                        ) : (
                          <span className="not-evaluated">
                            ยังไม่ได้รับการประเมิน
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="assessmentnull"
                      style={{ textAlign: "center", verticalAlign: "middle" }}
                    >
                      ยังไม่มีการบันทึกอาการ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showNotifications && (
          <div className="notifications-dropdown" ref={notificationsRef}>
            <div className="notifications-head">
              <h2 className="notifications-title">การแจ้งเตือน</h2>
            </div>
            <div className="notifications-filter">
              <div
                className={`notification-box ${
                  filterType === "all" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("all")}
              >
                <div className="notification-item">
                  <i className="bi bi-bell"></i>
                  ทั้งหมด
                </div>
                <div className="notification-right">
                  {unreadCount > 0 && (
                    <span className="notification-count-noti">
                      {unreadCount}
                    </span>
                  )}
                  <i className="bi bi-chevron-right"></i>
                </div>
              </div>
              <div
                className={`notification-box ${
                  filterType === "abnormal" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("abnormal")}
              >
                <div className="notification-item">
                  <i className="bi bi-exclamation-triangle"></i>
                  ผิดปกติ
                </div>
                <div className="notification-right">
                  {unreadCountsByType.abnormal > 0 && (
                    <span className="notification-count-noti">
                      {unreadCountsByType.abnormal}
                    </span>
                  )}
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>
              <div
                className={`notification-box ${
                  filterType === "normal" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("normal")}
              >
                <div className="notification-item">
                  {" "}
                  <i className="bi bi-journal-text"></i>
                  บันทึกอาการ
                </div>
                <div className="notification-right">
                  {unreadCountsByType.normal > 0 && (
                    <span className="notification-count-noti">
                      {unreadCountsByType.normal}
                    </span>
                  )}
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>

              <div
                className={`notification-box ${
                  filterType === "assessment" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("assessment")}
              >
                <div className="notification-item">
                  <i className="bi bi-clipboard-check"></i>
                  ประเมินอาการ
                </div>
                <div className="notification-right">
                  {unreadCountsByType.assessment > 0 && (
                    <span className="notification-count-noti">
                      {unreadCountsByType.assessment}
                    </span>
                  )}
                  <i class="bi bi-chevron-right"></i>
                </div>
              </div>
            </div>
            <div className="selected-filter">
              <p>
                การแจ้งเตือน: <strong>{getFilterLabel(filterType)}</strong>
              </p>
              <p
                className="mark-all-read-btn"
                onClick={() => markAllByTypeAsViewed(filterType)}
              >
                ทำเครื่องหมายว่าอ่านทั้งหมด
              </p>
            </div>
            {filteredAlerts.length > 0 ? (
              <div>
                {renderAlerts(
                  filteredAlerts,
                  token,
                  userId,
                  navigate,
                  setAlerts,
                  setUnreadCount,
                  formatDate
                )}
              </div>
            ) : (
              <p className="no-notification">ไม่มีการแจ้งเตือน</p>
            )}
          </div>
        )}
        {showScrollTopButton && (
          <button
            className="scroll-to-top-btn"
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: "1rem",
              right: "1rem",
              backgroundColor: "#87CEFA",
              color: "white",
              border: "none",
              borderRadius: "50%",
              padding: ".5em .8em",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            <i class="bi bi-caret-up-fill"></i>
          </button>
        )}
      </div>
    </main>
  );
}
