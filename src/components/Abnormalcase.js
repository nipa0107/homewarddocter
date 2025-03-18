import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import Sidebar from "./sidebar";
import io from "socket.io-client";
const socket = io("https://backend-deploy-render-mxok.onrender.com");

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
    const [latestAssessments, setLatestAssessments] = useState({});
    const [unreadCountsByType, setUnreadCountsByType] = useState({
        assessment: 0,
        abnormal: 0,
        normal: 0,
    });

    const fetchLatestAssessments = async () => {
        try {
            const response = await fetch("https://backend-deploy-render-mxok.onrender.com/latest-assessments");
            const data = await response.json();
            console.log("Raw latestAssessments data:", data); // เช็กค่าที่ได้จาก API

            if (data.status === "ok") {
                const assessmentsMap = data.data.reduce((acc, item) => {
                    acc[item._id] = item.latestStatusName;
                    return acc;
                }, {});
                console.log("Processed latestAssessments:", assessmentsMap); // เช็กค่าหลังประมวลผล

                setLatestAssessments(assessmentsMap);
            }
        } catch (error) {
            console.error("Error fetching latest assessments:", error);
        }
    };
    const hasFetchedUserData = useRef(false);

    useEffect(() => {
        fetchLatestAssessments();
    }, []);

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

    useEffect(() => {
        socket?.on("TotalUnreadCounts", (data) => {
            console.log("📦 TotalUnreadCounts received:", data);
            setUserUnreadCounts(data);
        });

        return () => {
            socket?.off("TotalUnreadCounts");
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
            notificationsRef.current &&
            !notificationsRef.current.contains(e.target) &&
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
        return fetch("https://backend-deploy-render-mxok.onrender.com/profiledt", {
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
                if (data.data === "token expired") {
                    window.localStorage.clear();
                    window.location.href = "./";
                }
                return data.data;
            })
            .catch((error) => {
                console.error("Error verifying token:", error);
            });
    };

    const getAllUser = () => {
        fetch("https://backend-deploy-render-mxok.onrender.com/alluser", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data, "AllUser");
                setDatauser(data.data);
                console.log(datauser, "Datauser");
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
                    getAllUser();
                })
                .catch((error) => {
                    console.error("Error verifying token:", error);
                });
        }
    }, [token]);

    const markAllByTypeAsViewed = (type) => {
        fetch("https://backend-deploy-render-mxok.onrender.com/alerts/mark-all-viewed-by-type", {
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


    const [timeRange, setTimeRange] = useState("latest"); // ค่าเริ่มต้นเป็น "ล่าสุด"

    const handleTimeRangeChange = (range) => {
        setTimeRange(range); // อัปเดตค่าของช่วงเวลา
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentDate = new Date();
                let url = "https://backend-deploy-render-mxok.onrender.com/assessments/abnormal";

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
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getuser`);
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
                        `https://backend-deploy-render-mxok.onrender.com/medicalInformation/${userData._id}`
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
                    const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getpatientform/${id}`);
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
            const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/allAssessment`, {
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
            const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/allMpersonnel`, {
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
                    "https://backend-deploy-render-mxok.onrender.com/update-unread-count"
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
                const response = await fetch("https://backend-deploy-render-mxok.onrender.com/assessments/abnormal");
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

    const [sortOrder, setSortOrder] = useState({ date: "asc", status: "asc" }); // ค่าเริ่มต้น: เก่าสุด -> ใหม่สุด, สถานะผิดปกติขึ้นก่อน

    // ฟังก์ชันเรียงลำดับ
    const handleSort = (type) => {
        setSortOrder((prev) => ({
            ...prev,
            [type]: prev[type] === "asc" ? "desc" : "asc",
        }));
    };

    // เรียงลำดับข้อมูล
    const sortedAbnormalCases = [...abnormalCases].sort((a, b) => {
        if (sortOrder.date === "asc") {
            return new Date(a.updatedAt) - new Date(b.updatedAt);
        } else {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
    }).sort((a, b) => {
        if (sortOrder.status === "asc") {
            return a.status_name.localeCompare(b.status_name);
        } else {
            return b.status_name.localeCompare(a.status_name);
        }
    });

    //เพิ่ม useState เพื่อเก็บจำนวนของเคสทั้งสองประเภท:
    const [abnormalCaseCount, setAbnormalCaseCount] = useState(0);
    const [emergencyCaseCount, setEmergencyCaseCount] = useState(0);

    //ใช้ useEffect เพื่อนับจำนวนเคสผิดปกติและเคสฉุกเฉินใหม่ทุกครั้งที่ abnormalCases เปลี่ยนแปลง
    useEffect(() => {
        if (abnormalCases.length > 0) {
            // นับจำนวนเคสผิดปกติ
            const abnormalCount = abnormalCases.filter(caseData => caseData.status_name === "ผิดปกติ").length;

            // นับจำนวนเคสฉุกเฉิน
            const emergencyCount = abnormalCases.filter(caseData => caseData.status_name === "เคสฉุกเฉิน").length;

            setAbnormalCaseCount(abnormalCount);
            setEmergencyCaseCount(emergencyCount);
        } else {
            setAbnormalCaseCount(0);
            setEmergencyCaseCount(0);
        }
    }, [abnormalCases]);


    return (
        <main className="body">
            {/* <div className={`sidebar ${isActive ? "active" : ""}`}>
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
                                if (user?.userId && String(user.userId) === String(sender._id)) {
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
            </div> */}
            <Sidebar />
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
                <div class="container-fluid">
                    <div className="case-summary">
                        <p className="abnormal-status">จำนวนเคสผิดปกติ : <strong>{abnormalCaseCount} เคส</strong> </p>
                        <p className="Emergency-status">จำนวนเคสฉุกเฉิน : <strong>{emergencyCaseCount} เคส</strong> </p>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                                        วันที่บันทึก{" "}
                                        {sortOrder.date === "asc" ? (
                                            <i className="bi bi-caret-up-fill"></i>
                                        ) : (
                                            <i className="bi bi-caret-down-fill"></i>
                                        )}
                                    </th>
                                    <th>ชื่อ-สกุล</th>
                                    <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                                        ผลการประเมิน{" "}
                                        {sortOrder.status === "asc" ? (
                                            <i className="bi bi-caret-up-fill"></i>
                                        ) : (
                                            <i className="bi bi-caret-down-fill"></i>
                                        )}
                                    </th>
                                    <th>ผู้ประเมิน</th>
                                    <th scope="col">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAbnormalCases.length > 0 ? (
                                    sortedAbnormalCases.map((caseData) => (
                                        <tr
                                            key={caseData._id}
                                            className="info"
                                            onClick={() =>
                                                navigate("/assessmentuserone", {
                                                    state: { id: caseData.PatientForm._id, fromAbnormalCases: true },
                                                })
                                            }
                                        >
                                            <td>{formatDate(caseData.updatedAt)}</td>
                                            <td>{caseData.PatientForm?.user?.name || "ไม่ระบุ"} {caseData.PatientForm?.user?.surname || ""}</td>

                                            <td style={{ color: caseData.status_name === "ผิดปกติ" ? "#fb8c00" : "#FF6A6A" }}>
                                                {caseData.status_name}
                                            </td>
                                            <td>
                                                {caseData.MPersonnel
                                                    ? `${caseData.MPersonnel.nametitle} ${caseData.MPersonnel.name} ${caseData.MPersonnel.surname}`
                                                    : "ไม่ระบุ"}
                                            </td>
                                            <td style={{ color: "#5ab1f8", cursor: "pointer" }}>
                                                รายละเอียด
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">ยังไม่มีเคสผู้ป่วยที่มีอาการผิดปกติ</td>
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
                                className={`notification-box ${filterType === "all" ? "active" : ""
                                    }`}
                                onClick={() => handleFilterChange("all")}
                            >
                                <div className="notification-item">
                                    <i className="bi bi-bell"></i>
                                    ทั้งหมด
                                </div>
                                <div className="notification-right">
                                    {unreadCount > 0 && (
                                        <span className="notification-count-noti">{unreadCount}</span>
                                    )}
                                    <i className="bi bi-chevron-right"></i>
                                </div>
                            </div>
                            <div
                                className={`notification-box ${filterType === "abnormal" ? "active" : ""
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
                                className={`notification-box ${filterType === "normal" ? "active" : ""
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
                                className={`notification-box ${filterType === "assessment" ? "active" : ""
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
            </div>
        </main>
    );
}
