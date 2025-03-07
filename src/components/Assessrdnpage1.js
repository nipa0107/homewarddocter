import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
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
    const bellRef = useRef(null);
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
            const response = await fetch("http://localhost:5000/latest-assessments");
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
    }, [token]);

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

    const Readiness1 = ({ register, errors }) => (
        <div className="info3 card mt-1">
            <div className='header'>
                <b>การประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในที่บ้าน</b>
            </div>
            <div className="ms-4 mt-3">
                <p style={{ color: 'red' }}>* = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
            </div>

            {/* คำถาม 1 */}
            <div className="m-1 mt-0">
                <label className="ms-4 me-4">
                    1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาด้วยการดูแลแบบผู้ป่วยในที่บ้านจากแพทย์อย่างครบถ้วน และให้คำยินยอมก่อนรับบริการใช่หรือไม่ ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ใช่" {...register('Readiness1.question1_1', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ใช่ </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ใช่" {...register('Readiness1.question1_1', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                </div>
                {errors.Readiness1?.question1_1 && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>

            {/* คำถาม 2 */}
            <div className="m-1">
                <label className="ms-4 me-4">
                    2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านมีความปลอดภัยใช่หรือไม่ ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ใช่" {...register('Readiness1.question1_2', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ใช่ </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ใช่" {...register('Readiness1.question1_2', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                </div>
                {errors.Readiness1?.question1_2 && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>

            {/* คำถาม 3 */}
            <div className="m-1">
                <label className="ms-4 me-4">
                    3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านอยู่ห่างจากโรงพยาบาลไม่เกิน 20 กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่ ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ใช่" {...register('Readiness1.question1_3', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ใช่ </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ใช่" {...register('Readiness1.question1_3', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                </div>
                {errors.Readiness1?.question1_3 && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>

            {/* คำถาม 4 */}
            <div className="m-1">
                <label className="ms-4 me-4">
                    4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้านสามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่ ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ใช่" {...register('Readiness1.question1_4', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ใช่ </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ใช่" {...register('Readiness1.question1_4', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ใช่ </span>
                </div>
                {errors.Readiness1?.question1_4 && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>
        </div>
    );


    const Readiness2 = ({ register, errors }) => (
        <div className="info3 card mt-1">
            <div className='header'>
                <b>ประเมินความรู้ ความเข้าใจ (ตาม D-METHOD)</b>
            </div>
            <div className="ms-4 mt-3">
                <p style={{ color: 'red' }}>* = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
            </div>
            {/* คำถาม 1 */}
            <div className="m-1">
                <label className="ms-4 me-4 mb-0">
                    1. Disease : เข้าใจโรค/ภาวะเจ็บป่วย ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ถูกต้อง" {...register('Readiness2.Disease', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ถูกต้อง" {...register('Readiness2.Disease', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                </div>
                {errors.Readiness2?.Disease && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>

            {/* คำถาม 2 */}
            <div className="m-1">
                <label className="ms-4 me-4">
                    2. Medication : รู้ข้อมูล/ข้อพึงระวัง/การจัดยา ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ถูกต้อง" {...register('Readiness2.Medication', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ถูกต้อง" {...register('Readiness2.Medication', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                </div>
                {errors.Readiness2?.Medication && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>

            {/* คำถาม 3 */}
            <div className="m-1">
                <label className="ms-4 me-4">
                    3. Environment : มีการเตรียมสิ่งแวดล้อม ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                </div>
                {errors.Readiness2?.Environment && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>
            <div className="m-1">
                <label className="ms-4 me-4">
                    4. Treatment : มีการฝึกทักษะที่จำเป็น ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                </div>
                {errors.Readiness2?.Environment && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>
            <div className="m-1">
                <label className="ms-4 me-4">
                    5. Health : รู้ข้อจำกัดด้านสุขภาพ ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                </div>
                {errors.Readiness2?.Environment && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>
            <div className="m-1">
                <label className="ms-4 me-4">
                    6. Out patient : รู้เรื่องการมาตามนัด/การส่งต่อ ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                </div>
                {errors.Readiness2?.Environment && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>
            <div className="m-1">
                <label className="ms-4 me-4">
                    7. Diet : รู้เรื่องการจัดการอาหารที่เหมาะสมกับโรค ?
                    <span style={{ color: 'red' }}> *</span>
                </label>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ถูกต้อง </span>
                </div>
                <div className='ms-4 me-4'>
                    <input type="radio" value="ไม่ถูกต้อง" {...register('Readiness2.Environment', { required: true })}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    />
                    <span style={{ marginLeft: '5px' }}> ไม่ถูกต้อง </span>
                </div>
                {errors.Readiness2?.Environment && <span className="error-text">* กรุณาเลือกคำตอบ</span>}
            </div>
        </div>
    );

    const [step, setStep] = useState(1);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const onSubmit = async (formData) => {
        try {
            const response = await fetch(`http://localhost:5000/submitReadinessForm/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: id,
                    Readiness1: formData.Readiness1,
                    Readiness2: formData.Readiness2,
                    status_name: 'ประเมินแล้ว',
                    MPersonnel: mpersonnel
                }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("ประเมินข้อมูลสำเร็จ");
                setTimeout(() => {
                    navigate("/assessreadinessuser", { state: { id } });
                }, 1000);
                // Show the success message and links
            } else {
                console.error("Error during ReadinessForm submission:", data);
                toast.error("เกิดข้อผิดพลาดในการประเมิน");
            }
        } catch (error) {
            console.error("Error updating ReadinessForm:", error);
            toast.error("เกิดข้อผิดพลาดในการประเมิน");
        }
    };


    const handleNext = () => setStep(prevStep => prevStep + 1);
    const handlePrevious = () => setStep(prevStep => prevStep - 1);

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
        <div>
            {/* <div className={`sidebar ${isActive ? 'active' : ''}`}>
                <div class="logo_content">
                    <div class="logo">
                        <div class="logo_name" >
                            <img src={logow} className="logow" alt="logo" ></img>
                        </div>
                    </div>
                    <i class='bi bi-list' id="btn" onClick={handleToggleSidebar}></i>
                </div>
                <ul class="nav-list">
                    <li>
                        <a href="home">
                            <i class="bi bi-house"></i>
                            <span class="links_name" >หน้าหลัก</span>
                        </a>
                    </li>
                    <li>
                        <a href="assessment" >
                            <i class="bi bi-clipboard2-pulse"></i>
                            <span class="links_name" >ติดตาม/ประเมินอาการ</span>
                        </a>
                    </li>
                    <li>
                        <a href="allpatient" >
                            <i class="bi bi-people"></i>
                            <span class="links_name" >จัดการข้อมูลการดูแลผู้ป่วย</span>
                        </a>
                    </li>
                    <li>
                        <a href="assessreadiness" >
                            <i class="bi bi-clipboard-check"></i>
                            <span class="links_name" >ประเมินความพร้อมการดูแล</span>
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
                                <i class='bi bi-box-arrow-right' id="log_out" onClick={logOut}></i>
                                <span class="links_name" >ออกจากระบบ</span>
                            </a>
                        </li>
                    </div>
                </ul>
            </div> */}
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
                {/* <div className="breadcrumbs mt-4">
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
                            <a href="assessreadinessuser">บันทึกการประเมิน</a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>แบบฟอร์มการประเมิน</a>
                        </li>
                    </ul>
                </div> */}
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
                {/* <h3>ประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในบ้าน</h3> */}
                {/* <div className="patient-card patient-card-style">
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
                </div> */}
                <div className="formcontent ">
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
                                {showMessage ? ( // Show message if assessment is completed
                                    <div className="success-message mt-2">
                                        <h2>การประเมินเสร็จสิ้น</h2>
                                        <br></br>
                                        <a className="info" onClick={() => navigate("/detailassessreadiness", { state: { id: id } })}>ดูคำตอบ</a>
                                        <br></br>
                                        <a className="info" onClick={() => navigate("/assessreadinessuser", { state: { id } })}>กลับไปหน้าประเมินความพร้อม</a>

                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        {step === 1 && <Readiness1 register={register} errors={errors} />}
                                        {step === 2 && <Readiness2 register={register} errors={errors} />}
                                        <div className="btn-group">
                                            {step > 1 && (
                                                <div className="btn-pre">
                                                    <button type="button" onClick={handlePrevious} className="btn btn-outline py-2">ก่อนหน้า</button>
                                                </div>
                                            )}
                                            {step < 2 && (
                                                <div className="btn-next">
                                                    <button type="button" onClick={handleNext} className="btn btn-outline-primary py-2">ถัดไป</button>
                                                </div>
                                            )}
                                            {step === 2 && (
                                                <div className="btn-next">
                                                    <button type="submit" className="btn btn-outline-primary py-2">บันทึก</button>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                <ToastContainer />
            </div>
        </div>
    );
}

