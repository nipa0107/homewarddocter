import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "./sidebar";
import "react-toastify/dist/ReactToastify.css";
import io from 'socket.io-client';
const socket = io("https://backend-deploy-render-mxok.onrender.com");
export default function AddEquipPatient() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id, user } = location.state;
    const [data, setData] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [equipmentCounts, setEquipmentCounts] = useState({});
    const [profiledata, setProfiledata] = useState([]);
    const [validationMessage, setValidationMessage] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [selectedEquipments, setSelectedEquipments] = useState([]);
    const [equipValidationMessages, setEquipValidationMessages] = useState({});
    const [userId, setUserId] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const notificationsRef = useRef(null);
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
                setProfiledata(data.data);
                return data.data;
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
        if (hasFetchedUserData.current) return; // ป้องกันการเรียกซ้ำ
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

    const [medicalEquipment, setMedicalEquipment] = useState([]);
    useEffect(() => {
        const fetchMedicalEquipmentThenEquip = async () => {
            try {
                const res = await fetch(`https://backend-deploy-render-mxok.onrender.com/equipment/${id}`);
                const data = await res.json();
                setMedicalEquipment(data);
    
                // รอโหลด medicalEquipment ก่อน แล้วค่อย fetch อุปกรณ์ทั้งหมด
                const allEquipRes = await fetch("https://backend-deploy-render-mxok.onrender.com/allequip", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const allEquipData = await allEquipRes.json();
    
                if (Array.isArray(allEquipData.data)) {
                    setEquipments(allEquipData.data);
    
                    // คำนวณจำนวนเฉพาะอุปกรณ์ที่ยังไม่มี
                    const counts = allEquipData.data.reduce((acc, item) => {
                        const alreadyAssigned = data.some(
                            (equip) => equip.equipmentname_forUser === item.equipment_name
                        );
                        if (!alreadyAssigned) {
                            acc[item.equipment_type] = (acc[item.equipment_type] || 0) + 1;
                        }
                        return acc;
                    }, {});
                    setEquipmentCounts(counts);
                }
            } catch (error) {
                console.error("Error loading equipment:", error);
            }
        };
    
        fetchMedicalEquipmentThenEquip();
    }, [id, token]);
    
    

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedEquipments.length === 0) {
            window.alert("กรุณาเลือกอุปกรณ์อย่างน้อยหนึ่งรายการ");
            return;
        }
        if (!id) {
            setValidationMessage("ไม่พบข้อมูลผู้ใช้");
            return;
        }

        if (Object.keys(equipValidationMessages).length > 0) {
            return;
        }

        fetch("https://backend-deploy-render-mxok.onrender.com/addequipuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ equipments: selectedEquipments, userId: id }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "ok") {
                    toast.success("เพิ่มข้อมูลสำเร็จ");
                    setTimeout(() => {
                        navigate("/infopatient", { state: { id } });
                    }, 1100);
                } else {
                    toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
                }
            })
            .catch((error) => {
                console.error("Error adding equipment:", error);
                toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
            });
    };


    const logOut = () => {
        window.localStorage.clear();
        window.location.href = "./";
    };

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

    const toggleAllCheckboxes = () => {
        const unassignedEquipments = equipments.filter(equipment =>
            equipment.equipment_type === selectedCategory &&
            !medicalEquipment.some(
                (me) => me.equipmentname_forUser === equipment.equipment_name
            )
        );

        const allSelected = unassignedEquipments.every(equipment =>
            selectedEquipments.some(
                (equip) => equip.equipmentname_forUser === equipment.equipment_name
            )
        );

        if (allSelected) {
            // ยกเลิกเฉพาะของประเภทนี้
            const remaining = selectedEquipments.filter(
                (equip) =>
                    equip.equipmenttype_forUser !== selectedCategory
            );
            setSelectedEquipments(remaining);
        } else {
            const validEquipments = unassignedEquipments.map(equipment => ({
                equipmentname_forUser: equipment.equipment_name,
                equipmenttype_forUser: equipment.equipment_type,
            }));

            setSelectedEquipments([...selectedEquipments, ...validEquipments]);
        }

        setValidationMessage("");
    };



    const handleCheckboxChange = (e, equipmentName, equipmentType) => {
        const isChecked = e ? e.target.checked : !selectedEquipments.some(
            equip => equip.equipmentname_forUser === equipmentName
        );

        let updatedEquipments;

        if (isChecked) {
            updatedEquipments = [
                ...selectedEquipments,
                {
                    equipmentname_forUser: equipmentName,
                    equipmenttype_forUser: equipmentType,
                },
            ];
        } else {
            updatedEquipments = selectedEquipments.filter(
                (equip) => equip.equipmentname_forUser !== equipmentName
            );
        }

        setSelectedEquipments(updatedEquipments);
        setValidationMessage(""); // ไม่ต้องแจ้งเตือนแล้ว
    };



    const [selectedCategory, setSelectedCategory] = useState("อุปกรณ์ติดตัว");


    return (
        <main className="body">
            <ToastContainer />
            <Sidebar />
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
                                        {profiledata &&
                                            profiledata.nametitle +
                                            profiledata.name +
                                            " " +
                                            profiledata.surname}
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
                        <li className="middle">
                            <a
                                href="infopatient"
                                onClick={() =>
                                    navigate("/infopatient", { state: { id: id, user: user } })
                                }
                            >
                                ข้อมูลการดูแลผู้ป่วย
                            </a>
                        </li>
                        <li className="arrow middle">
                            <i className="bi bi-chevron-double-right"></i>
                        </li>
                        <li className="ellipsis">
                            <a className="info" href="infopatient"
                                onClick={() =>
                                    navigate("/infopatient", { state: { id: id, user: user } })
                                }>
                                ...
                            </a>
                        </li>
                        <li className="arrow ellipsis">
                            <i className="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>เพิ่มอุปกรณ์สำหรับผู้ป่วย</a>
                        </li>
                    </ul>
                </div>
                <p className="title-header mt-4">เพิ่มอุปกรณ์สำหรับผู้ป่วย</p>
                <div className="equipment-category ps-5 pe-5 mt-4">

                    {/* ปุ่มเลือกประเภทอุปกรณ์ */}
                    <div className="assessment-tabs mt-0">
                        {["อุปกรณ์ติดตัว", "อุปกรณ์เสริม", "อุปกรณ์อื่นๆ"].map((type) => (
                            <button
                                key={type}
                                className={`tab-btn ${selectedCategory === type ? "active" : ""}`}
                                onClick={() => setSelectedCategory(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* แสดงชื่อประเภท + จำนวน + แจ้งเตือน */}
                    <div className="mb-2 fw-bold d-flex align-items-center" style={{ color: "#1565c0" }}>
                        <span>
                            {selectedCategory} (จำนวน {equipmentCounts[selectedCategory] || 0} รายการ)
                        </span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* ทำให้ตารางอยู่กับที่ + มี scrollbar ถ้ายาว */}
                        <div style={{  overflowY: "auto" }}>
                            <table className="equipment-table table-hover" style={{ border: "1px solid #ddd" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "10%" }}>
                                            {equipmentCounts[selectedCategory] > 0 && (
                                                <input
                                                    style={{ marginLeft: "20px", cursor: "pointer" }}
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    onChange={toggleAllCheckboxes}
                                                    checked={
                                                        equipments.filter(e =>
                                                            e.equipment_type === selectedCategory &&
                                                            !medicalEquipment.some(
                                                                (me) => me.equipmentname_forUser === e.equipment_name
                                                            )
                                                        ).every(e =>
                                                            selectedEquipments.some(
                                                                (se) => se.equipmentname_forUser === e.equipment_name
                                                            )
                                                        )
                                                    }
                                                />
                                            )}
                                        </th>
                                        <th style={{ width: "10%" }}>#</th>
                                        <th>ชื่ออุปกรณ์</th>
                                    </tr>
                                </thead>


                                <tbody>
                                    {(() => {
                                        const equipmentList = equipments.filter(
                                            (equipment) => {
                                                const isSameType = equipment.equipment_type === selectedCategory;
                                                const alreadyAssigned = medicalEquipment.some(
                                                    (me) => me.equipmentname_forUser === equipment.equipment_name
                                                );
                                                return isSameType && !alreadyAssigned;
                                            }
                                        );

                                        // ✅ เช็คว่าไม่มีอุปกรณ์ให้เลือก เพราะ "ถูกเลือกครบแล้ว"
                                        const originalEquipmentsOfCategory = equipments.filter(
                                            (e) => e.equipment_type === selectedCategory
                                        );
                                        const allAssigned =
                                            originalEquipmentsOfCategory.length > 0 &&
                                            originalEquipmentsOfCategory.every((e) =>
                                                medicalEquipment.some(
                                                    (me) => me.equipmentname_forUser === e.equipment_name
                                                )
                                            );

                                        if (equipmentList.length === 0) {
                                            return (
                                                <tr className="table-light">
                                                    <td colSpan="3" className="text-center">
                                                        {allAssigned
                                                            ? `คุณได้เพิ่ม ${selectedCategory} ครบแล้ว`
                                                            : `ไม่มีข้อมูล ${selectedCategory}`}
                                                    </td>
                                                </tr>
                                            );
                                        }

                                        return equipmentList.map((equipment, index) => (
                                            <tr
                                                key={equipment._id}
                                                onClick={() =>
                                                    handleCheckboxChange(
                                                        null,
                                                        equipment.equipment_name,
                                                        selectedCategory
                                                    )
                                                }
                                                style={{ cursor: "pointer" }}
                                            >
                                                <td style={{ width: "10%" }}>
                                                    <input
                                                        style={{ marginLeft: "20px", pointerEvents: "none" }}
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={selectedEquipments.some(
                                                            (equip) =>
                                                                equip.equipmentname_forUser === equipment.equipment_name
                                                        )}
                                                        readOnly
                                                    />
                                                </td>
                                                <td style={{ width: "10%" }}>{index + 1}</td>
                                                <td>{equipment.equipment_name}</td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>


                            </table>
                        </div>

                        {/* ปุ่มบันทึก */}
                        <div className="btn-group mt-4">
                            <div className="btn-next">
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
