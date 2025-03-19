import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
const socket = io("https://backend-deploy-render-mxok.onrender.com");
export default function Assessreadiness1() {
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
    const [userId, setUserId] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const notificationsRef = useRef(null);
    const [showMessage, setShowMessage] = useState(false);
    const [showToTopButton, setShowToTopButton] = useState(false);
    const bellRef = useRef(null);
    const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
    const [userUnreadCounts, setUserUnreadCounts] = useState([]);
    const hasFetchedUserData = useRef(false);
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
                    setMPersonnel(user._id);
                    fetchAndSetAlerts(token, user._id);

                })
                .catch((error) => {
                    console.error("Error verifying token:", error);
                });
        }
    }, []);


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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getuser/${id}`);
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
                        `https://backend-deploy-render-mxok.onrender.com/medicalInformation/${userData._id}`
                    );
                    const data = await response.json();
                    console.log("Medical Information:", data);
                    setMedicalData(data.data);
                    console.log("medicalData:", medicalData);

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
                `https://backend-deploy-render-mxok.onrender.com/getpatientforms/${id}`,
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
    const [showScrollButton, setShowScrollButton] = useState(false);
    const formRef = useRef(null); // อ้างอิงไปยังฟอร์ม

    useEffect(() => {
        const handleScroll = () => {
            if (formRef.current) {
                const formTop = formRef.current.getBoundingClientRect().top;
                const scrollY = window.scrollY;

                // ถ้าเลื่อนลงมากกว่า 200px ให้แสดงปุ่ม
                setShowScrollButton(scrollY > 200);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ฟังก์ชันให้เลื่อนขึ้นด้านบนของฟอร์ม
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const LOCAL_STORAGE_KEY = `readinessForm-${id}`;
    const { control, handleSubmit, setValue, getValues, formState: { errors }, watch, clearErrors, setError } = useForm();
    const [isSubmitted, setIsSubmitted] = useState(false); // ตรวจสอบว่ากดบันทึกแล้วหรือยัง
    const fieldRefs = useRef({}); // สร้าง object เพื่อเก็บ reference ของแต่ละ field

    // ✅ ใช้ watch() เพื่อติดตามการเปลี่ยนแปลงของฟอร์ม
    const formData = watch();

    // ✅ โหลดค่าจาก LocalStorage เมื่อเปิดหน้า
    useEffect(() => {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.keys(parsedData).forEach(key => setValue(key, parsedData[key]));
        }
    }, [setValue, id]);

    // ✅ บันทึกค่าลง LocalStorage ทุกครั้งที่ Form Data เปลี่ยน
    useEffect(() => {
        if (Object.keys(formData).length > 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
        }
    }, [formData]);

    // รายการคำถามที่ต้องตรวจสอบ
    const requiredFields = [
        "question1_1", "question1_2", "question1_3", "question1_4",
        "Disease", "Medication", "Environment", "Treatment",
        "Health", "Out_patient", "Diet"
    ];

    // ฟังชันตรวจสอบฟอร์มว่าตอบครบหรือไม่
    const validateForm = (formData) => {
        let hasError = false;
        let firstErrorField = null; // เก็บข้อแรกที่ยังไม่ตอบ

        requiredFields.forEach(field => {
            if (!formData[field]) {
                setError(field, { type: "manual", message: "กรุณาเลือกคำตอบ" });

                if (!firstErrorField) {
                    firstErrorField = field; // บันทึกฟิลด์แรกที่ผิด
                }
                hasError = true;
            } else {
                clearErrors(field);
            }
        });

        // ถ้าพบข้อผิดพลาด ให้เลื่อนไปที่ฟิลด์แรกที่ยังไม่ได้เลือกคำตอบ
        if (firstErrorField && fieldRefs.current[firstErrorField]) {
            fieldRefs.current[firstErrorField].scrollIntoView({ behavior: "smooth", block: "center" });
        }

        return !hasError;
    };


    // ฟังชันเมื่อเปลี่ยนค่า input
    const handleInputChange = (name, value) => {
        setValue(name, value);

        // ล้าง error ของข้อนั้นทันทีเมื่อมีการเลือกคำตอบ
        if (value) {
            clearErrors(name);
        }
    };

    // ฟังชันเมื่อกดส่งฟอร์ม
    const onSubmit = async (formData) => {
        setIsSubmitted(true);
    
        if (!validateForm(formData)) {
            toast.error("กรุณาเลือกคำตอบให้ครบทุกข้อ");
            return;
        }
    
        const requestData = {
            userId: id,
            MPersonnel: mpersonnel,
            Readiness1: {
                question1_1: formData.question1_1,
                question1_2: formData.question1_2,
                question1_3: formData.question1_3,
                question1_4: formData.question1_4,
            },
            Readiness2: {
                Disease: formData.Disease,
                Medication: formData.Medication,
                Environment: formData.Environment,
                Treatment: formData.Treatment,
                Health: formData.Health,
                Out_patient: formData.Out_patient,
                Diet: formData.Diet,
            },
            status_name: 'ประเมินแล้ว'
        };
    
        console.log("📤 Data to submit:", requestData);
    
        try {
            const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/submitReadinessForm/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(requestData),
            });
    
            const data = await response.json();
            console.log("Response:", data);
    
            if (response.ok) {
                toast.success("บันทึกข้อมูลสำเร็จ");
    
                // ✅ ใช้ `_id` ของฟอร์มที่เพิ่งบันทึกเพื่อนำไปที่หน้ารายละเอียด
                setTimeout(() => {
                    navigate("/detailassessreadiness", { state: { id: data.data._id } });
                }, 1000);
    
                // ✅ ลบข้อมูลจาก localStorage
                localStorage.removeItem(LOCAL_STORAGE_KEY);
    
                // ✅ รีเซ็ตค่าฟอร์มทั้งหมด
                requiredFields.forEach(field => setValue(field, ""));
            } else {
                toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
    };
    


    const clearForm = () => {
        clearErrors(); // เคลียร์ errors ทั้งหมด

        // รีเซ็ตค่าฟอร์มทุกข้อให้เป็นค่าว่าง
        [
            "question1_1", "question1_2", "question1_3", "question1_4",
            "Disease", "Medication", "Environment", "Treatment",
            "Health", "Out_patient", "Diet"
        ].forEach(field => setValue(field, ""));

    };

    return (
        <div>
            <div className="container-form">
                <div className="homeheaderform">
                    <div className="header">ประเมินความพร้อมการดูแล
                    </div>
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
                <div className="formcontent" ref={formRef}>
                    <div className="row">
                        <div className="col-4 bg-light" style={{ borderRadius: "8px" }} >
                            <p className="name"> <i class="bi bi-person-fill"></i> {name} {surname}</p >
                            <div className="namepatient">
                                <label style={{ color: "#008000" }}><b>HN : {medicalData && medicalData.HN
                                    ? medicalData.HN
                                    : "-"}</b> </label> <br></br>
                                <label style={{ color: "#FFA500" }}> <b>AN : {medicalData && medicalData.AN
                                    ? medicalData.AN
                                    : "-"}  </b></label>
                                {birthday ? (
                                    <p>
                                        <label style={{ color: "#666" }}> เพศ : </label><b> {gender}</b> <br></br>
                                        <label style={{ color: "#666" }}> อายุ :</label> <b> {userAge} ปี {userAgeInMonths} เดือน</b>   <br></br>
                                        <label style={{ color: "#666" }}> ผู้ป่วยโรค :</label> <b> {medicalData && medicalData.Diagnosis
                                            ? medicalData.Diagnosis
                                            : "ไม่ได้ระบุโรค"}</b>
                                    </p>
                                ) : (
                                    <p >
                                        <label>เพศ :</label> {gender} <br></br>
                                        <label>อายุ :</label> 0 ปี 0 เดือน </p>
                                )}
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="form-content">
                                {/* {showMessage ? (
                                    <div className="success-message mt-2 text-center mt-5">
                                        <h2>บันทึกการประเมินเสร็จสิ้น</h2>
                                        <div className="d-flex flex-column align-items-center mt-3">
                                            <a className="info mb-2" onClick={() => navigate("/detailassessreadiness", { state: { id:id } })}>ดูรายละเอียดคำตอบ</a>
                                            <a className="info" onClick={() => navigate("/assessreadinessuser", { state: { id } })}>กลับไปหน้าบันทึกประเมิน</a>
                                        </div>
                                    </div>
                                ) : ( */}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="info3 card mt-1"
                                    // style={{ border: Object.keys(errors).length > 0 ? '1px solid red' : '1px solid #dee2e6' }}
                                    >
                                        <div className="header">
                                            <b>การประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในที่บ้าน</b>
                                        </div>
                                        <div className="ms-4 mt-3">
                                            <p style={{ color: "red" }}>* = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
                                        </div>

                                        {/* คำถามที่ 1 */}
                                        <div className="ms-4 me-4">
                                            <label>1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาและให้คำยินยอมก่อนรับบริการใช่หรือไม่? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller
                                                    name="question1_1"
                                                    control={control}
                                                    rules={{ required: "กรุณาเลือกคำตอบ" }}
                                                    render={({ field }) => (
                                                        <>
                                                            <div>
                                                                <input type="radio" value="ใช่" checked={field.value === "ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ใช่ </span>
                                                            </div>
                                                            <div>
                                                                <input type="radio" value="ไม่ใช่" checked={field.value === "ไม่ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                                                            </div>
                                                        </>
                                                    )}
                                                />
                                            </div>
                                            {errors.question1_1 && <p className="ms-4" style={{ color: "red" }}>{errors.question1_1.message}</p>}
                                        </div>

                                        <div className="ms-4 me-4">
                                            <label>2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน มีความปลอดภัยใช่หรือไม่? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller
                                                    name="question1_2"
                                                    control={control}
                                                    rules={{ required: "กรุณาเลือกคำตอบ" }}
                                                    render={({ field }) => (
                                                        <>
                                                            <div>
                                                                <input type="radio" value="ใช่" checked={field.value === "ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ใช่ </span>
                                                            </div>
                                                            <div>
                                                                <input type="radio" value="ไม่ใช่" checked={field.value === "ไม่ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                                                            </div>
                                                        </>
                                                    )}
                                                />
                                            </div>
                                            {errors.question1_2 && <p className="ms-4" style={{ color: "red" }}>{errors.question1_2.message}</p>}
                                        </div>

                                        <div className="ms-4 me-4">
                                            <label>3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน อยู่ห่างจากโรงพยาบาลไม่เกิน 20 กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller
                                                    name="question1_3"
                                                    control={control}
                                                    rules={{ required: "กรุณาเลือกคำตอบ" }}
                                                    render={({ field }) => (
                                                        <>
                                                            <div>
                                                                <input type="radio" value="ใช่" checked={field.value === "ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ใช่ </span>
                                                            </div>
                                                            <div>
                                                                <input type="radio" value="ไม่ใช่" checked={field.value === "ไม่ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                                                            </div>
                                                        </>
                                                    )}
                                                />
                                            </div>
                                            {errors.question1_3 && <p className="ms-4" style={{ color: "red" }}>{errors.question1_3.message}</p>}
                                        </div>

                                        <div className="ms-4 me-4 mb-4">
                                            <label>4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน สามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller
                                                    name="question1_4"
                                                    control={control}
                                                    rules={{ required: "กรุณาเลือกคำตอบ" }}
                                                    render={({ field }) => (
                                                        <>
                                                            <div>
                                                                <input type="radio" value="ใช่" checked={field.value === "ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ใช่ </span>
                                                            </div>
                                                            <div>
                                                                <input type="radio" value="ไม่ใช่" checked={field.value === "ไม่ใช่"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                                <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                                                            </div>
                                                        </>
                                                    )}
                                                />
                                            </div>
                                            {errors.question1_4 && <p className="ms-4" style={{ color: "red" }}>{errors.question1_4.message}</p>}
                                        </div>
                                        {/* {Object.keys(errors).length > 1 && (
                                            <div className="text-center text-danger" >
                                                กรุณาเลือกคำตอบให้ครบทุกข้อ
                                            </div>
                                        )} */}
                                    </div>
                                    <div className="info3 card mt-1"
                                    // style={{ border: Object.keys(errors).length > 0 ? '1px solid red' : '1px solid #dee2e6' }}
                                    >
                                        <div className="header">
                                            <b>ประเมินความรู้ ความเข้าใจ (ตาม D-METHOD)</b>
                                        </div>
                                        <div className="ms-4 mt-3">
                                            <p style={{ color: "red" }}>* = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
                                        </div>

                                        <div className="ms-4 me-4">
                                            <label>1. Disease : เข้าใจโรค/ภาวะเจ็บป่วย ? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller name="Disease" control={control} rules={{ required: "กรุณาเลือกคำตอบ" }} render={({ field }) => (
                                                    <>
                                                        <div>
                                                            <input type="radio" value="ถูกต้อง" checked={field.value === "ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                                                        </div>
                                                        <div>
                                                            <input type="radio" value="ไม่ถูกต้อง" checked={field.value === "ไม่ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                                                        </div>
                                                    </>
                                                )} />
                                            </div>
                                            {errors.Disease && <p className="ms-4" style={{ color: "red" }}>{errors.Disease.message}</p>}
                                        </div>
                                        <div className="ms-4 me-4">
                                            <label>2. Medication : รู้ข้อมูล/ข้อพึงระวัง/การจัดยา ? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller name="Medication" control={control} rules={{ required: "กรุณาเลือกคำตอบ" }} render={({ field }) => (
                                                    <>
                                                        <div>
                                                            <input type="radio" value="ถูกต้อง" checked={field.value === "ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                                                        </div>
                                                        <div>
                                                            <input type="radio" value="ไม่ถูกต้อง" checked={field.value === "ไม่ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                                                        </div>
                                                    </>
                                                )} />
                                            </div>
                                            {errors.Medication && <p className="ms-4" style={{ color: "red" }}>{errors.Medication.message}</p>}
                                        </div>
                                        <div className="ms-4 me-4">
                                            <label>3. Environment : มีการเตรียมสิ่งแวดล้อม ? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller name="Environment" control={control} rules={{ required: "กรุณาเลือกคำตอบ" }} render={({ field }) => (
                                                    <>
                                                        <div>
                                                            <input type="radio" value="ถูกต้อง" checked={field.value === "ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                                                        </div>
                                                        <div>
                                                            <input type="radio" value="ไม่ถูกต้อง" checked={field.value === "ไม่ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                                                        </div>
                                                    </>
                                                )} />
                                            </div>
                                            {errors.Environment && <p className="ms-4" style={{ color: "red" }}>{errors.Environment.message}</p>}
                                        </div>
                                        <div className="ms-4 me-4">
                                            <label>4.Treatment : มีการฝึกทักษะที่จำเป็น ? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller name="Treatment" control={control} rules={{ required: "กรุณาเลือกคำตอบ" }} render={({ field }) => (
                                                    <>
                                                        <div>
                                                            <input type="radio" value="ถูกต้อง" checked={field.value === "ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                                                        </div>
                                                        <div>
                                                            <input type="radio" value="ไม่ถูกต้อง" checked={field.value === "ไม่ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                                                        </div>
                                                    </>
                                                )} />
                                            </div>
                                            {errors.Treatment && <p className="ms-4" style={{ color: "red" }}>{errors.Treatment.message}</p>}
                                        </div>
                                        <div className="ms-4 me-4">
                                            <label>5. Health : รู้ข้อจำกัดด้านสุขภาพ  ? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller name="Health" control={control} rules={{ required: "กรุณาเลือกคำตอบ" }} render={({ field }) => (
                                                    <>
                                                        <div>
                                                            <input type="radio" value="ถูกต้อง" checked={field.value === "ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                                                        </div>
                                                        <div>
                                                            <input type="radio" value="ไม่ถูกต้อง" checked={field.value === "ไม่ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                                                        </div>
                                                    </>
                                                )} />
                                            </div>
                                            {errors.Health && <p className="ms-4" style={{ color: "red" }}>{errors.Health.message}</p>}
                                        </div>
                                        <div className="ms-4 me-4">
                                            <label>6. Out patient : รู้เรื่องการมาตามนัด/การส่งต่อ ? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller name="Out_patient" control={control} rules={{ required: "กรุณาเลือกคำตอบ" }} render={({ field }) => (
                                                    <>
                                                        <div>
                                                            <input type="radio" value="ถูกต้อง" checked={field.value === "ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                                                        </div>
                                                        <div>
                                                            <input type="radio" value="ไม่ถูกต้อง" checked={field.value === "ไม่ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                                                        </div>
                                                    </>
                                                )} />
                                            </div>
                                            {errors.Out_patient && <p className="ms-4" style={{ color: "red" }}>{errors.Out_patient.message}</p>}
                                        </div>
                                        <div className="ms-4 me-4 mb-4">
                                            <label>7. Diet : รู้เรื่องการจัดการอาหารที่เหมาะสมกับโรค ? <span style={{ color: 'red' }}> *</span></label>
                                            <div className="ms-4">
                                                <Controller name="Diet" control={control} rules={{ required: "กรุณาเลือกคำตอบ" }} render={({ field }) => (
                                                    <>
                                                        <div>
                                                            <input type="radio" value="ถูกต้อง" checked={field.value === "ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                                                        </div>
                                                        <div>
                                                            <input type="radio" value="ไม่ถูกต้อง" checked={field.value === "ไม่ถูกต้อง"} onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }} />
                                                            <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                                                        </div>
                                                    </>
                                                )} />
                                            </div>
                                            {errors.Diet && <p className="ms-4" style={{ color: "red" }}>{errors.Diet.message}</p>}
                                        </div>
                                        <div className="d-flex justify-content-end me-4 mb-2">
                                            <span className="clear-selection text-secondary"
                                                onClick={clearForm}
                                            >
                                                เคลียร์คำตอบ
                                            </span>
                                        </div>

                                        {/* {Object.keys(errors).length > 1 && (
                                            <div className="text-center text-danger" >
                                                กรุณาเลือกคำตอบให้ครบทุกข้อ
                                            </div>
                                        )} */}
                                    </div>


                                    <div className="btn-group">
                                        <div className="btn-next">
                                            <button type="submit" className="btn btn-outline-primary py-2">บันทึก</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>
                {/* ปุ่ม Scroll ไปด้านบน */}
                {showScrollButton && (
                    <a
                        className="btn btn-outline-primary py-2"
                        onClick={scrollToTop}
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            right: "20px",
                            padding: "10px 20px",
                            backgroundColor: "#87CEFA",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            zIndex: "1000",
                        }}
                    >
                        <i class="bi bi-arrow-up-circle"></i>
                    </a>
                )}
                <ToastContainer />
            </div>
        </div>
    );
}

