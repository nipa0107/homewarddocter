import React, { useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

export default function Abnormalcaser({ }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [patientForms, setPatientForms] = useState("");
    const [datauser, setDatauser] = useState([]);
    const location = useLocation();
    const { id } = location.state || {};
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
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const notificationsRef = useRef(null);
    const [userId, setUserId] = useState("");
    const bellRef = useRef(null);
    const [relatedPatientForms, setRelatedPatientForms] = useState([]);
    const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
    const [userUnreadCounts, setUserUnreadCounts] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState(""); //ค้นหา
    const hasFetchedUserData = useRef(false);

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
    // const toggleNotifications = () => {
    //   setShowNotifications(!showNotifications);
    // };

    // useEffect(() => {
    //   const handleClickOutside = (event) => {
    //     if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
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

    const [timeRange, setTimeRange] = useState("latest"); // ค่าเริ่มต้นเป็น "ล่าสุด"

    const handleTimeRangeChange = (range) => {
        setTimeRange(range); // อัปเดตค่าของช่วงเวลา
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentDate = new Date();
                let url = "http://localhost:5000/assessments/abnormal";

                if (timeRange === "7days") {
                    const sevenDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 7));
                    url += `?from=${sevenDaysAgo.toISOString()}`;
                } else if (timeRange === "30days") {
                    const thirtyDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 30));
                    url += `?from=${thirtyDaysAgo.toISOString()}`;
                }

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (data.success) {
                    setAbnormalCases(data.data); // อัปเดตข้อมูล
                } else {
                    setAbnormalCases([]); // ล้างข้อมูลเมื่อไม่มีผลลัพธ์
                }
            } catch (error) {
                console.error("Error fetching filtered data:", error);
                setAbnormalCases([]);
            }
        };

        fetchData();
    }, [timeRange, token]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getuser`);
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
    },);

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

    useEffect(() => {
        if (id) {
            const fetchPatientFormDetails = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/getpatientform/${id}`);
                    const data = await response.json();

                    if (data.success) {
                        setPatientForms([data.data]); // Set the specific PatientForm details
                    } else {
                        console.error("Failed to fetch PatientForm details:", data.error);
                    }
                } catch (error) {
                    console.error("Error fetching PatientForm details:", error);
                }
            };

            fetchPatientFormDetails();
        }
    }, [id]);


    const fetchAndMatchAlerts = async () => {
        try {
            // ดึงข้อมูล alerts
            const alertsData = await fetchAlerts(token);
            setAlerts(alertsData);

            // กรองข้อมูล patientForms ที่ตรงกับ patientFormId ของ Alert
            const matchedPatientForms = patientForms.filter((form) =>
                alertsData.some((alert) => alert.patientFormId === form._id)
            );

            setRelatedPatientForms(matchedPatientForms);
            console.log("Matched Patient Forms:", matchedPatientForms);
        } catch (error) {
            console.error("Error fetching or matching alerts:", error);
        }
    };

    // useEffect(() => {
    //     if (id) {
    //         fetchpatientForms();
    //     }
    // }, [id]);

    useEffect(() => {
        if (patientForms.length > 0) {
            fetchAndMatchAlerts();
        }
    }, [patientForms]);

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

    const [abnormalCases, setAbnormalCases] = useState([]);

    useEffect(() => {
        const fetchAbnormalCases = async () => {
            try {
                const response = await fetch("http://localhost:5000/assessments/abnormal");
                const data = await response.json();

                if (data.success) {
                    setAbnormalCases(data.data);
                } else {
                    console.error("Failed to fetch abnormal cases:", data.error);
                }
            } catch (error) {
                console.error("Error fetching abnormal cases:", error);
            }
        };

        fetchAbnormalCases();
    }, []);

    const sortedAbnormalCases = abnormalCases.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));



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
                    <div className="header">ผู้ป่วยที่มีอาการผิดปกติ</div>
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
                            <a>รายชื่อผู้ป่วยที่มีอาการผิดปกติ</a>
                        </li>
                    </ul>
                </div>
                {/* <div className="search-bar">
                    <input
                        className="search-text"
                        type="text"
                        placeholder="ค้นหา"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </div> */}

                <div class="container-fluid">
                    {/* <h2 className="headerassesment mt-4 mb-0">รายชื่อผู้ป่วยที่มีอาการผิดปกติ</h2> */}
                    <div className="align-item-end mb-3 ">
                        <button className="dropdown btn dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            เลือกการแสดงข้อมูล
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            {/* <li>
                            <a className="dropdown-item" href="#" onClick={() => handleTimeRangeChange("latest")}>
                                ล่าสุด
                            </a>
                        </li> */}
                            <li>
                                <a className="dropdown-item" href="#" onClick={() => handleTimeRangeChange("7days")}>
                                    7 วัน
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="#" onClick={() => handleTimeRangeChange("30days")}>
                                    30 วัน
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>วันที่ประเมิน</th>
                                    <th>ชื่อ-สกุล</th>
                                    <th>ผลการประเมิน</th>
                                    <th>ผู้ประเมิน</th>

                                </tr>
                            </thead>
                            <tbody>
                                {abnormalCases.length > 0 ? (
                                    abnormalCases.map((caseData, index) => (
                                        <tr
                                            key={caseData._id}
                                            className="info"
                                            onClick={() =>
                                                navigate("/assessmentuserone", {
                                                  state: {
                                                    id: caseData.PatientForm._id, // ส่ง ID
                                                    fromAbnormalCases: true, // ระบุว่ามาจากหน้านี้
                                                  },
                                                })
                                              }
                                        >
                                            <td>{formatDate(caseData.updatedAt)}</td>
                                            <td>{caseData.PatientForm?.user?.name || "ไม่ระบุชื่อ"} {caseData.PatientForm?.user?.surname || ""}</td>
                                            <td style={{ color: caseData.status_name === "ผิดปกติ" ? "#fb8c00" : "#FF6A6A" }}>
                                                {caseData.status_name}
                                            </td>
                                            <td>
                                                {caseData.MPersonnel
                                                    ? `${caseData.MPersonnel.nametitle} ${caseData.MPersonnel.name} ${caseData.MPersonnel.surname}`
                                                    : "ไม่ระบุชื่อ"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No abnormal cases found.</td>
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
            </div>
        </main>
    );
}
