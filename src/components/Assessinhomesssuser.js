import React, { useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

export default function Assessinhomesssuser({ }) {
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
    const bellRef = useRef(null);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [userUnreadCounts, setUserUnreadCounts] = useState([]); 

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

    const [AssessinhomeForms, setAssessinhomeForms] = useState({});

    const fetchAssessinhomeForms = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/getAssessinhomeForms/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setAssessinhomeForms(data.data);
            console.log("Patient Forms1:", data.data);
        } catch (error) {
            console.error("Error fetching patient forms:", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAssessinhomeForms();
        }
    }, [id]);

    const [AgendaForms, setAgendaForms] = useState({});

    const fetchAgendaForms = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/getAgendaForms/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setAgendaForms(data.data);
            console.log("Patient Forms1:", data.data);
        } catch (error) {
            console.error("Error fetching patient forms:", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAgendaForms();
        }
    }, [id]);

    // const sortedAgendaForms = AgendaForms.sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt));

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

                    <div className="header">แบบประเมินเยี่ยมบ้าน</div>
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
                            <a href="assessinhomesss" className="info">
                                แบบประเมินเยี่ยมบ้าน
                            </a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>บันทึกการประเมิน</a>
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
                    <div className="toolbar ">
                        {AgendaForms && AgendaForms.length > 0 && (

                            <button
                                className="btn btn-primary add-assessment-btn"
                                onClick={() => navigate("/agendaform", { state: { id: userData._id } })}
                            >
                                <i className="bi bi-plus-circle" style={{ marginRight: '8px' }}></i>
                                เพิ่มการประเมิน
                            </button>
                        )}
                    </div>
                    <div className="nameass mt-5">
                        <h4>
                            ประเมิน Agenda
                        </h4>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: "10%" }}>#</th>
                                <th>วันที่บันทึก</th>
                                <th>วันที่แก้ไขล่าสุด</th>
                                <th>ผลการประเมิน</th>
                                <th>ผู้ประเมิน</th>
                            </tr>

                        </thead>
                        <tbody>
                            {AgendaForms.length > 0 ? (
                                AgendaForms.map((form, index) => (
                                    <tr key={form._id}
                                        onClick={() => navigate("/detailAgendaForm", { state: { id: form._id } })}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td style={{ width: "10%" }}>{index + 1}</td>
                                        <td>{formatDate(form.createdAt)}</td>
                                        <td>
                                            {form.updatedAt !== form.createdAt ? (
                                                formatDate(form.updatedAt)
                                            ) : (
                                                <span className="not-evaluated">ยังไม่มีการแก้ไขข้อมูล</span>
                                            )}
                                        </td>

                                        <td> <span className="normal-status">{form.status_agenda}</span></td>
                                        <td>{form.MPersonnel ? `${form.MPersonnel.nametitle || ''} ${form.MPersonnel.name || ''} ${form.MPersonnel.surname || ''}` : "ไม่ระบุผู้ประเมิน"}</td>
                                    </tr>
                                ))
                            ) : (
                                // แสดงข้อความเมื่อไม่มีข้อมูล
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                        <a
                                            className="info"
                                            onClick={() =>
                                                navigate("/agendaform", { state: { id: userData._id } })
                                            }
                                        >
                                            <span className="not-evaluated">ยังไม่ได้รับการประเมิน</span>
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                    <div className="toolbar mt-4">
                        {AssessinhomeForms && AssessinhomeForms.length > 0 && (

                            <button
                                className="btn btn-primary add-assessment-btn"
                                onClick={() => navigate("/assessinhomesssform", { state: { id: userData._id } })}
                            >
                                <i className="bi bi-plus-circle" style={{ marginRight: '8px' }}></i>
                                เพิ่มการประเมิน
                            </button>
                        )}
                    </div>
                    <div className="nameass mt-5">
                        <h4>
                            ประเมิน IN-HOME-SSS
                        </h4>
                    </div>

                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: "10%" }}>#</th>
                                <th>วันที่บันทึก</th>
                                <th>วันที่แก้ไขล่าสุด</th>
                                <th>ผลการประเมิน</th>
                                <th>ผู้ประเมิน</th>
                            </tr>

                        </thead>
                        <tbody>
                            {AssessinhomeForms.length > 0 ? (
                                AssessinhomeForms.map((form, index) => (
                                    <tr key={form._id}
                                        onClick={() => navigate("/detailAssessinhomeForm", { state: { id: form._id } })}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td style={{ width: "10%" }}>{index + 1}</td>
                                        <td>{formatDate(form.createdAt)}</td>
                                        <td>
                                            {form.updatedAt !== form.createdAt ? (
                                                formatDate(form.updatedAt)
                                            ) : (
                                                <span className="not-evaluated">ยังไม่มีการแก้ไขข้อมูล</span>
                                            )}
                                        </td>

                                        <td> <span className="normal-status">{form.status_inhome}</span></td>
                                        <td>{form.MPersonnel ? `${form.MPersonnel.nametitle || ''} ${form.MPersonnel.name || ''} ${form.MPersonnel.surname || ''}` : "ไม่ระบุผู้ประเมิน"}</td>
                                    </tr>
                                ))
                            ) : (
                                // แสดงข้อความเมื่อไม่มีข้อมูล
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", verticalAlign: "middle" }}>
                                        <a
                                            className="info"
                                            onClick={() =>
                                                navigate("/assessinhomesssform", { state: { id: userData._id } })
                                            }
                                        >
                                            <span className="not-evaluated">ยังไม่ได้รับการประเมิน</span>
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>

            </div>
        </main>
    );
}
