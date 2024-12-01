import React, { useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
export default function Updatepatient() {
    const location = useLocation();
    const { id, user } = location.state;
    const [data, setData] = useState([]);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [otherGender, setOtherGender] = useState("");
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherRelationship, setOtherRelationship] = useState("");
    const [medicalData, setMedicalData] = useState({});
    const [userId, setUserId] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const notificationsRef = useRef(null);
    const bellRef = useRef(null);
    useEffect(() => {
        socket.on('newAlert', (alert) => {
          setAlerts(prevAlerts => [...prevAlerts, alert]);
          setUnreadCount(prevCount => prevCount + 1);
        });
    
        return () => {
          socket.off('newAlert'); // Clean up the listener on component unmount
        };
      }, []);
    const FormatDate = (date) => {
        const formattedDate = new Date(date);
        // ตรวจสอบว่า date เป็น NaN หรือไม่
        if (isNaN(formattedDate.getTime())) {
            return ""; // ถ้าเป็น NaN ให้ส่งค่าว่างกลับไป
        }
        return formattedDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getuser/${id}`);
                const data = await response.json();
                setUsername(data.username);
                setName(data.name);
                setSurname(data.surname);
                setEmail(data.email);
                setPassword(data.password);
                setTel(data.tel);
                setGender(data.gender);
                setBirthday(data.birthday);
                setIDCardNumber(data.ID_card_number);
                setNationality(data.nationality);
                setAddress(data.Address);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchCaregiverData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getcaregiver/${id}`);
                const caregiverData = await response.json();
                if (caregiverData.status === 'ok') {
                    setCaregiverName(caregiverData.data.name);
                    setCaregiverSurname(caregiverData.data.surname);
                    setCaregiverTel(caregiverData.data.tel);
                    setRelationship(caregiverData.data.Relationship);
                }
            } catch (error) {
                console.error("Error fetching caregiver data:", error);
            }
        };

        fetchData();
        fetchCaregiverData();
    }, [id]);

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
    //             setShowNotifications(false);
    //         }
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);

    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, [notificationsRef]);

    // const toggleNotifications = () => {
    //     setShowNotifications(!showNotifications);
    // };
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

    const currentDate = new Date();

    const Updatepatient = async () => {
        try {
            const userData = {
                username,
                name,
                surname,
                email,
                password,
                tel,
                gender,
                birthday,
                ID_card_number,
                nationality,
                Address,
                user: id, // เชื่อมโยงกับผู้ใช้
                caregiverName,
                caregiverSurname,
                caregiverTel,
                Relationship
            };

            const response = await fetch(`http://localhost:5000/updateuserinfo/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                console.log("แก้ไขทั่วไปแล้ว:", updatedUser);
                toast.success("แก้ไขข้อมูลสำเร็จ");
                setTimeout(() => {
                    navigate("/infopatient", { state: { id: id, user: user } });
                }, 1100);
            } else {
                toast.error("ไม่สามารถแก้ไขทั่วไปได้:", response.statusText);
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการแก้ไขผู้ใช้:", error);
        }
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



    const handleRelationshipChange = (e) => {
        const value = e.target.value;
        setRelationship(value);
        if (value === "อื่นๆ") {
            setShowOtherInput(true);
        } else {
            setShowOtherInput(false);
            setOtherRelationship("");
        }
    };

    const handleOtherRelationshipChange = (e) => {
        const value = e.target.value;
        setOtherRelationship(value);
        setRelationship(value); // Update gender to the value of otherGender
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
                            <a>แก้ไขข้อมูลทั่วไป</a>
                        </li>
                    </ul>
                </div>
                <h3>แก้ไขข้อมูลทั่วไป</h3>
                <div className="adminall card mb-1">
                    <div className="mb-1">
                        <label>ชื่อ</label>
                        <input
                            value={name}
                            type="text"
                            className="form-control"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>นามสกุล</label>
                        <input
                            type="text"
                            className="form-control"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>เพศ</label>
                        <input
                            type="text"
                            value={gender}
                            readOnly
                            className="form-control gray-background"
                            onChange={(e) => setGender(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>วันเกิด</label>
                        <input
                            value={FormatDate(birthday)}
                            type="date"
                            className="form-control"
                            onChange={(e) => setBirthday(e.target.value)}
                        />
                    </div>

                    <div className="mb-1">
                        <label>เลขประจำตัวบัตรประชาชน</label>
                        <input
                            value={ID_card_number}
                            type="text"
                            className="form-control gray-background"
                            readOnly
                            onChange={(e) => setIDCardNumber(e.target.value)}
                        />
                    </div>

                    <div className="mb-1">
                        <label>สัญชาติ</label>
                        <input
                            value={nationality}
                            type="text"
                            className="form-control"
                            onChange={(e) => setNationality(e.target.value)}
                        />
                    </div>

                    <div className="mb-1">
                        <label>ที่อยู่</label>
                        <input
                            value={Address}
                            type="text"
                            className="form-control"
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>เบอร์โทรศัพท์</label>
                        <input
                            type="text"
                            value={tel}
                            className="form-control"
                            onChange={(e) => setTel(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>ชื่อ(ผู้ดูแล)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={caregiverName}
                            onChange={(e) => setCaregiverName(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>นามสกุล(ผู้ดูแล)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={caregiverSurname}
                            onChange={(e) => setCaregiverSurname(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>ความสัมพันธ์</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="พ่อ"
                                    checked={Relationship === "พ่อ"}
                                    onChange={handleRelationshipChange}
                                />
                                พ่อ
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="แม่"
                                    checked={Relationship === "แม่"}
                                    onChange={handleRelationshipChange}
                                />
                                แม่
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="ลูก"
                                    checked={Relationship === "ลูก"}
                                    onChange={handleRelationshipChange}
                                />
                                ลูก
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="ภรรยา"
                                    checked={Relationship === "ภรรยา"}
                                    onChange={handleRelationshipChange}
                                />
                                ภรรยา
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="สามี"
                                    checked={Relationship === "สามี"}
                                    onChange={handleRelationshipChange}
                                />
                                สามี
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="อื่นๆ"
                                    checked={showOtherInput}
                                    onChange={handleRelationshipChange}
                                />
                                อื่นๆ
                            </label>
                            {showOtherInput && (
                                <div className="mt-2">
                                    <label>กรุณาระบุ:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={otherRelationship}
                                        onChange={handleOtherRelationshipChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-1">
                        <label>เบอร์โทรศัพท์(ผู้ดูแล)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={caregiverTel}
                            onChange={(e) => setCaregiverTel(e.target.value)}
                        />
                    </div>

                </div>
                <div className="btn-group">
                    <div className="btn-next">
                        <button type="button" onClick={Updatepatient} className="btn btn-outline py-2">
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
            <div></div>
        </main>
    );
}   