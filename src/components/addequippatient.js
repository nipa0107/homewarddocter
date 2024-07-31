import React, { useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddEquipPatient() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id, user } = location.state;
    const [data, setData] = useState([]);
    const [profiledata, setProfiledata] = useState([]);
    const [validationMessage, setValidationMessage] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [selectedEquipType1, setSelectedEquipType1] = useState("");
    const [selectedEquipType2, setSelectedEquipType2] = useState("");
    const [selectedEquipType3, setSelectedEquipType3] = useState("");
    const [equipValidationMessages, setEquipValidationMessages] = useState({});
    const [userId, setUserId] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const notificationsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
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
                setProfiledata(data.data);
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

    const filteredAlerts = filterType === "unread"
        ? alerts.filter(alert => !alert.viewedBy.includes(userId))
        : alerts;

    useEffect(() => {
        getAllEquip();
    }, []);

    const getAllEquip = () => {
        fetch("http://localhost:5000/allequip", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setData(data.data);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedEquipments = [];
        const validationMessages = {};

        if (selectedEquipType1) {
            selectedEquipments.push({
                equipmentname_forUser: selectedEquipType1,
                equipmenttype_forUser: "อุปกรณ์ติดตัว",
            });
        }
        if (selectedEquipType2) {
            selectedEquipments.push({
                equipmentname_forUser: selectedEquipType2,
                equipmenttype_forUser: "อุปกรณ์เสริม",
            });
        }
        if (selectedEquipType3) {
            selectedEquipments.push({
                equipmentname_forUser: selectedEquipType3,
                equipmenttype_forUser: "อุปกรณ์อื่นๆ",
            });
        }

        if (selectedEquipments.length === 0) {
            setValidationMessage("โปรดเลือกอุปกรณ์อย่างน้อยหนึ่งรายการ");
            return;
        }
        if (!id) {
            setValidationMessage("ไม่พบข้อมูลผู้ใช้");
            return;
        }

        // Check for duplicate equipment
        selectedEquipments.forEach((equip, index) => {
            if (
                selectedEquipments.filter(
                    (e) => e.equipmentname_forUser === equip.equipmentname_forUser
                ).length > 1
            ) {
                validationMessages[equip.equipmenttype_forUser] =
                    "มีอุปกรณ์นี้อยู่แล้ว";
            }
        });

        setEquipValidationMessages(validationMessages);

        if (Object.keys(validationMessages).length > 0) {
            return;
        }

        fetch("http://localhost:5000/addequipuser", {
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
                } else if (
                    data.status === "error" &&
                    data.message === "มีอุปกรณ์นี้อยู่แล้ว"
                ) {
                    setValidationMessage("มีอุปกรณ์นี้อยู่แล้ว");
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

    const handleChange = (e, equipTypeSetter, equipType) => {
        equipTypeSetter(e.target.value);
        setEquipValidationMessages((prevMessages) => {
            const newMessages = { ...prevMessages };
            delete newMessages[equipType];
            return newMessages;
        });
        setValidationMessage(""); // Clear general validation message
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

    return (
        <main className="body">
            <div className={`sidebar ${isActive ? 'active' : ''}`}>
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
                            {countUnreadUsers() !== 0 && (
                                <span className="notification-countchat">
                                    {countUnreadUsers()}
                                </span>
                            )}
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
            </div>
            <div className="home_content">
                <div className="homeheader">
                    <div className="header">จัดการข้อมูลการดูแลผู้ป่วย</div>
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
                                        {profiledata && profiledata.nametitle + profiledata.name + " " + profiledata.surname}
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
                            <a href="allpatient">จัดการข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a href="infopatient" onClick={() => navigate("/infopatient", { state: { id: id, user: user } })}>ข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>เพิ่มอุปกรณ์สำหรับผู้ป่วย</a>
                        </li>
                    </ul>
                </div>
                <h3>เพิ่มอุปกรณ์สำหรับผู้ป่วย</h3>
                <div className="adminall card mb-1">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-1">
                            <label>อุปกรณ์ติดตัว</label>
                            <select
                                className="form-select"
                                value={selectedEquipType1}
                                onChange={(e) =>
                                    handleChange(e, setSelectedEquipType1, "อุปกรณ์ติดตัว")
                                }
                            >
                                <option value="">เลือกอุปกรณ์ติดตัว</option>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data
                                        .filter(
                                            (equipment) =>
                                                equipment.equipment_type === "อุปกรณ์ติดตัว"
                                        )
                                        .map((equipment) => (
                                            <option
                                                key={equipment._id}
                                                value={equipment.equipment_name}
                                            >
                                                {equipment.equipment_name}
                                            </option>
                                        ))
                                ) : (
                                    <option value="">ไม่มีข้อมูลอุปกรณ์ติดตัว</option>
                                )}
                            </select>
                            {equipValidationMessages["อุปกรณ์ติดตัว"] && (
                                <div style={{ color: "red" }}>
                                    {equipValidationMessages["อุปกรณ์ติดตัว"]}
                                </div>
                            )}
                        </div>
                        <div className="mb-1">
                            <label>อุปกรณ์เสริม</label>
                            <select
                                className="form-select"
                                value={selectedEquipType2}
                                onChange={(e) =>
                                    handleChange(e, setSelectedEquipType2, "อุปกรณ์เสริม")
                                }
                            >
                                <option value="">เลือกอุปกรณ์เสริม</option>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data
                                        .filter(
                                            (equipment) => equipment.equipment_type === "อุปกรณ์เสริม"
                                        )
                                        .map((equipment) => (
                                            <option
                                                key={equipment._id}
                                                value={equipment.equipment_name}
                                            >
                                                {equipment.equipment_name}
                                            </option>
                                        ))
                                ) : (
                                    <option value="">ไม่มีข้อมูลอุปกรณ์เสริม</option>
                                )}
                            </select>
                            {equipValidationMessages["อุปกรณ์เสริม"] && (
                                <div style={{ color: "red" }}>
                                    {equipValidationMessages["อุปกรณ์เสริม"]}
                                </div>
                            )}
                        </div>
                        <div className="mb-1">
                            <label>อุปกรณ์อื่นๆ</label>
                            <select
                                className="form-select"
                                value={selectedEquipType3}
                                onChange={(e) =>
                                    handleChange(e, setSelectedEquipType3, "อุปกรณ์อื่นๆ")
                                }
                            >
                                <option value="">เลือกอุปกรณ์อื่นๆ</option>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data
                                        .filter(
                                            (equipment) => equipment.equipment_type === "อุปกรณ์อื่นๆ"
                                        )
                                        .map((equipment) => (
                                            <option
                                                key={equipment._id}
                                                value={equipment.equipment_name}
                                            >
                                                {equipment.equipment_name}
                                            </option>
                                        ))
                                ) : (
                                    <option value=""> ไม่มีข้อมูลอุปกรณ์อื่นๆ</option>
                                )}
                            </select>
                            {equipValidationMessages["อุปกรณ์อื่นๆ"] && (
                                <div style={{ color: "red" }}>
                                    {equipValidationMessages["อุปกรณ์อื่นๆ"]}
                                </div>
                            )}
                        </div>
                        {validationMessage && (
                            <div style={{ color: "red" }}>{validationMessage}</div>
                        )}
                        <div className="btn-group">
                            <div className="btn-next">
                                <button type="submit" className="btn btn-outline py-2">
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="btn-group">
                    <div className="btn-pre"></div>
                </div>
            </div>
        </main>
    );
}
