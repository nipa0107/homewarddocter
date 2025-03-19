import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import "../css/styles.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import Sidebar from "./sidebar";
import io from 'socket.io-client';
const socket = io("https://backend-deploy-render-mxok.onrender.com");

export default function Infopatient({ }) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const location = useLocation();
    const { id } = location.state;
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurName] = useState("");
    // const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");
    const [ID_card_number, setIDCardNumber] = useState("");
    const [nationality, setNationality] = useState("");
    const [Address, setAddress] = useState("");
    const [caregiverName, setCaregiverName] = useState('');
    const [caregiverSurname, setCaregiverSurname] = useState('');
    const [Relationship, setRelationship] = useState('');
    const [caregiverTel, setCaregiverTel] = useState('');
    const [medicalInfo, setMedicalInfo] = useState(null); // เพิ่ม state สำหรับเก็บข้อมูลการดูแลผู้ป่วย
    const [mdata, setMData] = useState([]);
    const [medicalEquipment, setMedicalEquipment] = useState([]);
    const [selectedEquipments, setSelectedEquipments] = useState([]);
    const [userData, setUserData] = useState(null);
    const [medicalData, setMedicalData] = useState({});
    const [userId, setUserId] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const notificationsRef = useRef(null);
    const bellRef = useRef(null);
    const [caregiverInfo, setCaregiverInfo] = useState(null);
    const hasFetchedUserData = useRef(false);
    const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
    const [userUnreadCounts, setUserUnreadCounts] = useState([]);
    const [latestAssessments, setLatestAssessments] = useState({});
    const [unreadCountsByType, setUnreadCountsByType] = useState({
        assessment: 0,
        abnormal: 0,
        normal: 0,
    });
    const [selectedCaregiver, setSelectedCaregiver] = useState(null);
    const [formData, setFormData] = useState({
        user: "",
        name: "",
        surname: "",
        tel: "",
        Relationship: "",
    });
    const handleAddCaregiver = () => {
        navigate("/addcaregiver", { state: { Iduser: id, id } }); // `userId` อาจเป็น ID ของผู้ป่วย
    };


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


    const handleEdit = (caregiver) => {
        console.log("caregiver ที่กำลังแก้ไข:", caregiver);
        navigate("/updatecaregiver", { state: { caregiver, id } });
        setSelectedCaregiver(caregiver);
        setFormData({
            user: caregiver.user || "",
            name: caregiver.name || "",
            surname: caregiver.surname || "",
            tel: caregiver.tel || "",
            Relationship: caregiver.Relationship || "",
        });
    };


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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getuser/${id}`);
                const data = await response.json();
                setUserData(data);
                setUsername(data.username);
                setName(data.name);
                setSurName(data.surname);
                setGender(data.gender);
                setBirthday(data.birthday);
                setNationality(data.nationality);
                setIDCardNumber(data.ID_card_number);
                setTel(data.tel);
                setAddress(data.Address);
            } catch (error) {
                console.error("Error fetching caremanual data:", error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchCaregiverData = async () => {
            try {
              const response = await fetch(
                `https://backend-deploy-render-mxok.onrender.com/getcaregiver/${id}`
              );
              const caregiverData = await response.json();
              if (caregiverData.status === "ok") {
                setCaregiverInfo(caregiverData.data);
                setCaregiverName(caregiverData.data.name);
                setCaregiverSurname(caregiverData.data.surname);
                setCaregiverTel(caregiverData.data.tel);
                setRelationship(caregiverData.data.Relationship);
              }
              console.log("caregiverData", caregiverInfo);
            } catch (error) {
              if (error.response && error.response.status === 404) {
                setCaregiverInfo(null);
              } else {
                console.error("Error fetching caregiver info:", error);
              }
            }
          };
        fetchCaregiverData();
    }, [id]);



    useEffect(() => {
        const fetchMedicalInformation = async () => {
            try {
                const response = await fetch(
                    `https://backend-deploy-render-mxok.onrender.com/medicalInformation/${id}`
                );
                const medicalData = await response.json();

                if (medicalData && medicalData.data) {
                    setMedicalInfo(medicalData.data);
                    console.log("medicalDataupdate:", medicalData);

                } else {
                    console.error("Medical information not found for this user");
                }
            } catch (error) {
                console.error("Error fetching medical information:", error);
            }
        };
        fetchMedicalInformation();
    }, [id]);

    useEffect(() => {
        const fetchEquipmentData = async () => {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/equipment/${id}`);
                const equipmentData = await response.json();
                setMedicalEquipment(equipmentData);
                console.log("EquipmentUser Data:", equipmentData);
            } catch (error) {
                console.error("Error fetching equipment data:", error);
            }
        };
        fetchEquipmentData();
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (medicalInfo && medicalInfo.selectedPersonnel) {
                    const response = await fetch(
                        `https://backend-deploy-render-mxok.onrender.com/getmpersonnel/${medicalInfo.selectedPersonnel}`
                    );
                    const mdata = await response.json();
                    setMData(mdata);
                    console.log("Data:", mdata);
                }
            } catch (error) {
                console.error("Error fetching caremanual data:", error);
            }
        };
        fetchData();
    }, [medicalInfo]);

    const deleteUser = async () => {
        if (window.confirm(`คุณต้องการลบ ${username} หรือไม่ ?`)) {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/deleteUser/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.data);
                    navigate("/alluser");
                } else {
                    console.error("Error during deletion:", data.data);
                }
            } catch (error) {
                console.error("Error during fetch:", error);
            }
        }
    };

    const handleCheckboxChange = (equipmentName) => {
        setSelectedEquipments((prevSelected) =>
            prevSelected.includes(equipmentName)
                ? prevSelected.filter((name) => name !== equipmentName)
                : [...prevSelected, equipmentName]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedEquipments.length === 0) {
            alert("กรุณาเลือกอุปกรณ์ที่ต้องการลบ");
            return;
        }

        if (window.confirm(`คุณต้องการลบอุปกรณ์ที่เลือกหรือไม่?`)) {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/deleteEquipuser/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ equipmentNames: selectedEquipments, userId: id }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    // รีเฟรชหน้าหลังจากลบข้อมูล
                    window.location.reload();
                } else {
                    console.error("Error during deletion:", data.message);
                }
            } catch (error) {
                console.error("Error during fetch:", error);
            }
        }
    };

    const handleDeleteMedicalInfo = async () => {
        if (window.confirm("คุณต้องการลบข้อมูลการเจ็บป่วยหรือไม่?")) {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/deletemedicalInformation/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    window.location.reload(); // รีเฟรชหน้าหลังจากลบข้อมูล
                } else {
                    console.error("Error during deletion:", data.message);
                }
            } catch (error) {
                console.error("Error during fetch:", error);
            }
        }
    };

    const handleViewPDF = () => {
        // ทำการเรียกดูไฟล์ PDF ที่เกี่ยวข้อง
    };

    const logOut = () => {
        window.localStorage.clear();
        window.location.href = "./";
    };
    // bi-list
    const handleToggleSidebar = () => {
        setIsActive(!isActive);
    };

    // กำหนดวันที่ปัจจุบัน
    const currentDate = new Date();

    // คำนวณอายุและแสดงเป็นอายุที่มีเดือนด้วย
    const userBirthday = new Date(birthday); // แปลงวันเกิดของผู้ใช้เป็นวัตถุ Date
    const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear(); // คำนวณความแตกต่างระหว่างปีปัจจุบันกับปีเกิดของผู้ใช้
    const monthDiff = currentDate.getMonth() - userBirthday.getMonth(); // คำนวณความแตกต่างระหว่างเดือนปัจจุบันกับเดือนเกิดของผู้ใช้

    // ตรวจสอบว่าวันเกิดของผู้ใช้มีเกินวันปัจจุบันหรือไม่
    // ถ้ายังไม่เกิน แสดงอายุเป็นผลลัพธ์ (ปี และ เดือน)
    // ถ้าเกินแล้ว ลดอายุลง 1 ปี
    let userAge = "";
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < userBirthday.getDate())) {
        userAge = `${ageDiff - 1} ปี ${12 + monthDiff} เดือน`;
    } else {
        userAge = `${ageDiff} ปี ${monthDiff} เดือน`;
    }

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

    const handleDelete = async (caregiverId) => {
        if (window.confirm("คุณต้องการลบข้อมูลผู้ดูแลนี้หรือไม่?")) {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/deletecaregiver`, {
                    method: "POST", // ใช้ POST หรือ DELETE ตาม API ของคุณ
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ _id: caregiverId }), // ส่ง `_id` ของผู้ดูแลไป
                });

                const data = await response.json();
                if (response.ok) {
                    alert("ลบข้อมูลสำเร็จ");
                    // อัปเดต caregiverInfo เพื่อรีเฟรชข้อมูล
                    setCaregiverInfo((prev) =>
                        prev.filter((caregiver) => caregiver._id !== caregiverId)
                    );
                } else {
                    alert(`เกิดข้อผิดพลาด: ${data.error}`);
                }
            } catch (error) {
                console.error("Error deleting caregiver:", error);
                alert("เกิดข้อผิดพลาดในการลบข้อมูล");
            }
        }
    };
    const toggleAllCheckboxes = () => {
        const allSelected = sortedEquipment.every(equipment =>
            selectedEquipments.includes(equipment.equipmentname_forUser)
        );

        if (allSelected) {
            setSelectedEquipments([]);
        } else {
            setSelectedEquipments(sortedEquipment.map(equipment => equipment.equipmentname_forUser));
        }
    };


    const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "asc" });

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedEquipment = [...medicalEquipment].sort((a, b) => {
        if (sortConfig.key) {
            let valueA = a[sortConfig.key];
            let valueB = b[sortConfig.key];

            // ถ้าเป็นวันที่ ต้องแปลงเป็น Date object
            if (sortConfig.key === "createdAt") {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            } else {
                valueA = valueA.toString().toLowerCase();
                valueB = valueB.toString().toLowerCase();
            }

            if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        }
        return 0;
    });

    const getSortIcon = (key) => {
        return (
            <i
                className={`bi ${sortConfig.key === key ?
                    (sortConfig.direction === "asc" ? "bi-caret-up-fill" : "bi-caret-down-fill")
                    : "bi-caret-down-fill" // ค่าเริ่มต้นเป็นลูกศรลง
                    }`}
            ></i>
        );
    };

    const handleRowClick = (equipmentName) => {
        setSelectedEquipments((prevSelected) =>
            prevSelected.includes(equipmentName)
                ? prevSelected.filter((name) => name !== equipmentName)
                : [...prevSelected, equipmentName]
        );
    };

    const formatIDCardNumber = (id) => {
        if (!id) return "";
        return id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5");
    };


    return (
        <main className="body">
<Sidebar />
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
            <div className="home_content">
                <div className="homeheader">
                    <div className="header">จัดการข้อมูลการดูแลผู้ป่วย</div>
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
                        <li className="middle">
                            <a href="allpatient">จัดการข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                        <li className="arrow middle">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li className="ellipsis">
              <a href="allpatient">...</a>
            </li>
            <li className="arrow ellipsis">
              <i className="bi bi-chevron-double-right"></i>
            </li>
                        <li>
                            <a>ข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                    </ul>
                </div>
                <br></br>
                <h3>ข้อมูลการดูแลผู้ป่วย</h3>
                <div className="forminfo mb-4">
                    <fieldset className="user-fieldset">
                        <legend><i className="bi bi-person-fill"></i> ข้อมูลทั่วไป</legend>
                        <div className="user-info mt-3">
                            <div className="row">
                                {[
                                    { label: "ชื่อ-สกุล", value: `${name || '-'} ${surname || '-'}` },
                                    { label: "เลขบัตรประชาชน", value: `${formatIDCardNumber(ID_card_number || '-')}` },
                                    { label: "อายุ", value: userAge },
                                    { label: "เพศ", value: gender || '-' },
                                    { label: "สัญชาติ", value: nationality || '-' },
                                    { label: "ที่อยู่", value: Address || '-' },
                                    { label: "เบอร์โทรศัพท์", value: tel || '-' }
                                ].map((item, index) => (
                                    <React.Fragment key={index}>
                                        <div className="col-sm-3" style={{ color: "#444" }}>
                                            <p><span>{item.label} :</span></p>
                                        </div>
                                        <div className="col-sm-9">
                                            <p><b>{item.value}</b></p>
                                        </div>
                                        <div className="w-100 d-none d-md-block"></div>
                                    </React.Fragment>
                                ))}
                            </div>

                        </div>

                        <div className="btn-group mb-4">
                            <div className="editimg1">
                                <button onClick={() => navigate("/updatepatient", { state: { id } })}>
                                    <i className="bi bi-pencil-square"></i> แก้ไข
                                </button>
                            </div>
                        </div>
                    </fieldset>
                </div>

                <div className="forminfo mb-4">
                    <fieldset className="user-fieldset">
                        <legend><i class="bi bi-person-fill"></i> ข้อมูลผู้ดูแล</legend>
                        <div>
                            {caregiverInfo && caregiverInfo.length > 0 ? (
                                <div>
                                    <div className="user-info-caregiver">
                                        {caregiverInfo.map((caregiver, index) => (
                                            <div className="inline-container-caregiver" key={index}>
                                                <p>
                                                    <span><b>ผู้ดูแลคนที่ {index + 1} :</b> </span>
                                                    {/* <span class=""
                                                        onClick={() => handleEdit(caregiver)}>
                                                        <i class="bi bi-pencil-square"></i> แก้ไข
                                                    </span> */}
                                                </p>
                                                <div className="caregiver-card mb-4">
                                                    <div className="row">
                                                        {[
                                                            {
                                                                label: "เลขประจําตัวประชาชน", value: `${formatIDCardNumber(
                                                                    caregiver.ID_card_number || "-" 
                                                                )}`
                                                            },
                                                            { label: "ชื่อ-สกุล", value: `${caregiver.name || "-"} ${caregiver.surname || "-"}` },
                                                            { label: "ความสัมพันธ์", value: caregiver.userRelationships?.[0]?.relationship || "ไม่ระบุ" }
                                                        ].map((item, index) => (
                                                            <React.Fragment key={index}>
                                                                <div className="col-sm-4" style={{ color: "#444" }}><p><span>{item.label} :</span></p></div>
                                                                <div className="col-sm-8 fw-bold text-dark"><p><span>{item.value}</span></p></div>
                                                                <div className="w-100 d-none d-md-block"></div>
                                                            </React.Fragment>
                                                        ))}
                                                        <div className="col-sm-4 " style={{ color: "#444" }}><p><span>เบอร์โทรศัพท์ :</span></p></div>
                                                        <div className="col-sm-8 d-flex justify-content-between align-items-center fw-bold text-dark">
                                                            <p><span>{caregiver.tel || "-"}</span></p>
                                                            <button className="button-edit ms-auto p-1" onClick={() => handleEdit(caregiver)}>
                                                                <i className="bi bi-pencil-square"></i> แก้ไข
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>





                                            </div>
                                        ))}
                                    </div>
                                    {/* <div className="btn-group mb-4">
                  <div className="adddata">
                    <button onClick={handleAddCaregiver}>เพิ่มผู้ดูแล</button>
                  </div>
                </div> */}

                                </div>
                            ) : (
                                <div>
                                    <p className="no-equipment">ไม่มีข้อมูลผู้ดูแล</p>
                                    <div className="btn-group mb-4">
                                        {/* <div className="adddata">
                    <button onClick={handleAddCaregiver}>เพิ่มผู้ดูแล</button>
                  </div> */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </fieldset>
                </div>
                <div className="forminfo mb-4">
                    <fieldset className="user-fieldset">
                        <legend><i className="bi bi-journal-medical"></i> ข้อมูลการเจ็บป่วย</legend>
                        {medicalInfo ? (
                            <>
                                <div className="user-info mt-3">
                                    <div className="row">
                                        {[
                                            { label: "HN", value: medicalInfo.HN || "-" },
                                            { label: "AN", value: medicalInfo.AN || "-" },
                                            {
                                                label: "วันที่ Admit",
                                                value: medicalInfo.Date_Admit
                                                    ? new Date(medicalInfo.Date_Admit).toLocaleDateString("th-TH", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })
                                                    : "-",
                                            },
                                            {
                                                label: "วันที่ D/C",
                                                value: medicalInfo.Date_DC
                                                    ? new Date(medicalInfo.Date_DC).toLocaleDateString("th-TH", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })
                                                    : "-",
                                            },
                                            { label: "Diagnosis", value: medicalInfo.Diagnosis || "-" },
                                            {
                                                label: "แพทย์ผู้ดูแล",
                                                value: (mdata.nametitle || mdata.name || mdata.surname)
                                                    ? `${mdata.nametitle || ""} ${mdata.name || ""} ${mdata.surname || ""}`.trim()
                                                    : "-",
                                            },
                                            { label: "Chief complaint", value: medicalInfo.Chief_complaint || "-" },
                                            { label: "Present illness", value: medicalInfo.Present_illness || "-" },
                                            {
                                                label: (
                                                    <>
                                                        <i class="bi bi-file-earmark-pdf"></i> File Present illness
                                                    </>
                                                ),
                                                value: medicalInfo.fileP ? (
                                                    <a
                                                        className="blue-500"
                                                        href=""
                                                        onClick={() => {
                                                            // const filePath = medicalInfo.fileP.replace(/\\/g, "/");
                                                            // const fileName = filePath.split("/").pop();
                                                            // console.log("fileName:", fileName);
                                                            window.open(`${medicalInfo.fileP}`, "_blank");
                                                        }}
                                                    >
                                                        {medicalInfo.filePName}
                                                    </a>
                                                ) : "-",
                                            },

                                            { label: "Management plan", value: medicalInfo.Management_plan || "-" },
                                            {
                                                label: (
                                                    <>
                                                        <i class="bi bi-file-earmark-pdf"></i> File Management plan
                                                    </>
                                                ),
                                                value: medicalInfo.fileM ? (
                                                    <a
                                                        className="blue-500"
                                                        href=""
                                                        onClick={() => {
                                                            // const filePath = medicalInfo.fileM.replace(/\\/g, "/");
                                                            // const fileName = filePath.split("/").pop();
                                                            // console.log("fileName:", fileName);
                                                            window.open(`${medicalInfo.fileM}`, "_blank");
                                                        }}
                                                    >
                                                        {medicalInfo.fileMName}
                                                    </a>
                                                ) : "-",
                                            },
                                            { label: "Phychosocial assessment", value: medicalInfo.Phychosocial_assessment || "-" },
                                            {
                                                label: (
                                                    <>
                                                        <i class="bi bi-file-earmark-pdf"></i> File Phychosocial assessment
                                                    </>
                                                ),
                                                value: medicalInfo.filePhy ? (
                                                    <a
                                                        className="blue-500"
                                                        href=""
                                                        onClick={() => {
                                                            // const filePath = medicalInfo.filePhy.replace(/\\/g, "/");
                                                            // const fileName = filePath.split("/").pop();
                                                            // console.log("fileName:", fileName);
                                                            window.open(`${medicalInfo.filePhy}`, "_blank");
                                                        }}
                                                    >
                                                        {medicalInfo.filePhyName}
                                                    </a>
                                                ) : "-",
                                            },
                                        ].map((item, index) => (
                                            <React.Fragment key={index}>
                                                <div className="col-sm-5" style={{ color: "#444" }}>
                                                    <p><span>{item.label} :</span></p>
                                                </div>
                                                <div className="col-sm-7">
                                                    <p><b>{item.value}</b></p>
                                                </div>
                                                <div className="w-100 d-none d-md-block"></div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                                <div className="btn-group mb-4">
                                    <div className="editimg1">
                                        <button onClick={() => navigate("/updatemedicalinformation", { state: { id } })}>
                                            <i className="bi bi-pencil-square"></i> แก้ไข
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <p className="no-equipment">ไม่พบข้อมูล</p>
                            </div>
                        )}
                    </fieldset>
                </div>

                <div className="forminfo mb-1">
                    <fieldset className="user-fieldset">
                        <legend>
                            <i className="bi bi-prescription2"></i> อุปกรณ์ทางการแพทย์
                        </legend>
                        {medicalEquipment && medicalEquipment.length > 0 ? (
                            <>
                                <div className="equipment-category">
                                    <table className="equipment-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        onChange={toggleAllCheckboxes}
                                                    />
                                                </th>
                                                <th scope="col">#</th>
                                                <th scope="col" onClick={() => requestSort("equipmentname_forUser")} style={{ cursor: "pointer" }}>
                                                    ชื่ออุปกรณ์ {getSortIcon("equipmentname_forUser")}
                                                </th>
                                                <th scope="col" onClick={() => requestSort("equipmenttype_forUser")} style={{ cursor: "pointer" }}>
                                                    ประเภทอุปกรณ์ {getSortIcon("equipmenttype_forUser")}
                                                </th>
                                                <th scope="col" onClick={() => requestSort("createdAt")} style={{ cursor: "pointer" }}>
                                                    วันที่เพิ่ม {getSortIcon("createdAt")}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedEquipment.map((equipment, index) => (
                                                <tr
                                                    key={equipment._id}
                                                    onClick={() => handleRowClick(equipment.equipmentname_forUser)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <td onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={selectedEquipments.includes(equipment.equipmentname_forUser)}
                                                            onChange={(e) => {
                                                                e.stopPropagation(); // ป้องกันไม่ให้ `tr` ทำงานซ้ำ
                                                                handleRowClick(equipment.equipmentname_forUser);
                                                            }}
                                                        />
                                                    </td>
                                                    <td>{index + 1}</td>
                                                    <td>{equipment.equipmentname_forUser}</td>
                                                    <td>{equipment.equipmenttype_forUser}</td>
                                                    <td>{formatDate(equipment.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>

                                {/* ปุ่มควบคุม */}
                                <div className="btn-group mt-4 mb-3">
                                    <div className="adddata">
                                        <button onClick={() => navigate("/addequippatient", { state: { id } })}>
                                            <i className="bi bi-plus-circle"></i> เพิ่มอุปกรณ์
                                        </button>
                                    </div>
                                    <div className="deleteimg1 mt-2">
                                        <button onClick={handleDeleteSelected}>
                                            <i className="bi bi-trash"></i> ลบอุปกรณ์
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="no-equipment text-center mt-3">ไม่พบข้อมูล</div>
                                <div className="btn-group mb-4">
                                    <div className="adddata">
                                        <button onClick={() => navigate("/addequippatient", { state: { id } })}>
                                            <i className="bi bi-plus-circle"></i> เพิ่มอุปกรณ์
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </fieldset>
                </div>

            </div>
        </main>
    );
}
