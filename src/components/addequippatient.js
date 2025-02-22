import React, { useEffect, useState, useRef } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from 'socket.io-client';
const socket = io("http://localhost:5000");
export default function AddEquipPatient() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id, user } = location.state;
    const [data, setData] = useState([]);
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

    const handleCheckboxChange = (e, equipmentName, equipmentType) => {
        const isChecked = e.target.checked;
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

        // Check for duplicates and update validation messages
        const validationMessages = {};
        updatedEquipments.forEach((equip, index) => {
            const duplicates = updatedEquipments.filter(
                (e) => e.equipmentname_forUser === equip.equipmentname_forUser
            ).length;

            if (duplicates > 1) {
                validationMessages[equip.equipmentname_forUser] = "มีอุปกรณ์นี้อยู่แล้ว";
            }
        });

        setEquipValidationMessages(validationMessages);
        setValidationMessage(""); // Clear general validation message
    };

    const handleSelectAll = (equipmentType, isChecked) => {
        let updatedEquipments = [...selectedEquipments];

        data
            .filter((equipment) => equipment.equipment_type === equipmentType)
            .forEach((equipment) => {
                if (isChecked) {
                    if (
                        !updatedEquipments.some(
                            (equip) => equip.equipmentname_forUser === equipment.equipment_name
                        )
                    ) {
                        updatedEquipments.push({
                            equipmentname_forUser: equipment.equipment_name,
                            equipmenttype_forUser: equipmentType,
                        });
                    }
                } else {
                    updatedEquipments = updatedEquipments.filter(
                        (equip) => equip.equipmentname_forUser !== equipment.equipment_name
                    );
                }
            });

        setSelectedEquipments(updatedEquipments);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedEquipments.length === 0) {
            setValidationMessage("โปรดเลือกอุปกรณ์อย่างน้อยหนึ่งรายการ");
            return;
        }
        if (!id) {
            setValidationMessage("ไม่พบข้อมูลผู้ใช้");
            return;
        }

        if (Object.keys(equipValidationMessages).length > 0) {
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
    return (
        <main className="body">
            <ToastContainer />
            <div className={`sidebar ${isActive ? "active" : ""}`}>
                <div className="logo_content">
                    <div className="logo">
                        <div className="logo_name">
                            <img src={logow} className="logow" alt="logo"></img>
                        </div>
                    </div>
                    <i className="bi bi-list" id="btn" onClick={handleToggleSidebar}></i>
                </div>
                <ul className="nav-list">
                    <li>
                        <a href="home">
                            <i className="bi bi-house"></i>
                            <span className="links_name">หน้าหลัก</span>
                        </a>
                    </li>
                    <li>
                        <a href="assessment">
                            <i className="bi bi-clipboard2-pulse"></i>
                            <span className="links_name">ติดตาม/ประเมินอาการ</span>
                        </a>
                    </li>
                    <li>
                        <a href="allpatient">
                            <i className="bi bi-people"></i>
                            <span className="links_name">จัดการข้อมูลการดูแลผู้ป่วย</span>
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
                    <div className="nav-logout">
                        <li>
                            <a href="./" onClick={logOut}>
                                <i
                                    className="bi bi-box-arrow-right"
                                    id="log_out"
                                    onClick={logOut}
                                ></i>
                                <span className="links_name">ออกจากระบบ</span>
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
                        <li>
                            <a href="allpatient">จัดการข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                        <li className="arrow">
                            <i className="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a
                                href="infopatient"
                                onClick={() =>
                                    navigate("/infopatient", { state: { id: id, user: user } })
                                }
                            >
                                ข้อมูลการดูแลผู้ป่วย
                            </a>
                        </li>
                        <li className="arrow">
                            <i className="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>เพิ่มอุปกรณ์สำหรับผู้ป่วย</a>
                        </li>
                    </ul>
                </div>
                <h3>เพิ่มอุปกรณ์สำหรับผู้ป่วย</h3>
                <div className="adminall card mb-1">
                    <form onSubmit={handleSubmit}>
                        {["อุปกรณ์ติดตัว", "อุปกรณ์เสริม", "อุปกรณ์อื่นๆ"].map(
                            (equipmentType) => {
                                const isAllSelected = data
                                    .filter(
                                        (equipment) => equipment.equipment_type === equipmentType
                                    )
                                    .every((equipment) =>
                                        selectedEquipments.some(
                                            (equip) =>
                                                equip.equipmentname_forUser ===
                                                equipment.equipment_name
                                        )
                                    );

                                return (
                                    <div key={equipmentType} className="mb-1">
                                        <h4 className="equipment-type-title">
                                            <b>{equipmentType}</b>
                                        </h4>
                                        <table className="equipment-table">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <input
                                                            type="checkbox"
                                                            checked={isAllSelected}
                                                            onChange={(e) =>
                                                                handleSelectAll(equipmentType, e.target.checked)
                                                            }
                                                        />
                                                    </th>
                                                    <th>ลำดับ</th>
                                                    <th>ชื่ออุปกรณ์</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.isArray(data) && data.length > 0 ? (
                                                    data
                                                        .filter(
                                                            (equipment) =>
                                                                equipment.equipment_type === equipmentType
                                                        )
                                                        .map((equipment, index) => (
                                                            <tr key={equipment._id}>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        value={equipment.equipment_name}
                                                                        checked={selectedEquipments.some(
                                                                            (equip) =>
                                                                                equip.equipmentname_forUser ===
                                                                                equipment.equipment_name
                                                                        )}
                                                                        onChange={(e) =>
                                                                            handleCheckboxChange(
                                                                                e,
                                                                                equipment.equipment_name,
                                                                                equipmentType
                                                                            )
                                                                        }
                                                                    />
                                                                </td>
                                                                <td>{index + 1}</td>
                                                                <td>{equipment.equipment_name}</td>
                                                                {equipValidationMessages[equipment.equipment_name] && (
                                                                    <td style={{ color: "red" }}>
                                                                        {equipValidationMessages[equipment.equipment_name]}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3">ไม่มีข้อมูล{equipmentType}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            }
                        )}
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
