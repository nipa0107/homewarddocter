import React, { useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import "../css/styles.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import io from 'socket.io-client';
const socket = io("http://localhost:5000");

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

     const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
     const [userUnreadCounts, setUserUnreadCounts] = useState([]); 
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


       const handleEdit = (caregiver) => {
        console.log("caregiver ที่กำลังแก้ไข:", caregiver);
        navigate("/updatecaregiver", { state: { caregiver, id }});
        setSelectedCaregiver(caregiver);
        setFormData({
          user: caregiver.user || "",
          name: caregiver.name || "",
          surname: caregiver.surname || "",
          tel: caregiver.tel || "",
          Relationship: caregiver.Relationship || "",
        });
      };
   
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


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getuser/${id}`);
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
                const response = await fetch(`http://localhost:5000/getcaregiver/${id}`);
                const caregiverData = await response.json();
                if (caregiverData.status === 'ok') {
                    setCaregiverInfo(caregiverData.data);
                    setCaregiverName(caregiverData.data.name);
                    setCaregiverSurname(caregiverData.data.surname);
                    setCaregiverTel(caregiverData.data.tel);
                    setRelationship(caregiverData.data.Relationship);
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setCaregiverInfo(null);
                  } else {
                    console.error("Error fetching caregiver info:", error);
                  }            }
        };
        fetchCaregiverData();
    }, [id]);


    useEffect(() => {
        const fetchMedicalInformation = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/medicalInformation/${id}`
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
                const response = await fetch(`http://localhost:5000/equipment/${id}`);
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
                        `http://localhost:5000/getmpersonnel/${medicalInfo.selectedPersonnel}`
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
                const response = await fetch(`http://localhost:5000/deleteUser/${id}`, {
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
                const response = await fetch(`http://localhost:5000/deleteEquipuser/${id}`, {
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
                const response = await fetch(`http://localhost:5000/deletemedicalInformation/${id}`, {
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

  const handleDelete = async (caregiverId) => {
    if (window.confirm("คุณต้องการลบข้อมูลผู้ดูแลนี้หรือไม่?")) {
      try {
        const response = await fetch(`http://localhost:5000/deletecaregiver`, {
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
                                <i class='bi bi-box-arrow-right' id="log_out" onClick={logOut}></i>
                                <span class="links_name" >ออกจากระบบ</span>
                            </a>
                        </li>
                    </div>
                </ul>
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
                        <li>
                            <a href="allpatient">จัดการข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>ข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                    </ul>
                </div>
                <br></br>
                <h3>ข้อมูลการดูแลผู้ป่วย</h3>
                <div className="info3 card mb-1">
                    <div className="header">
                        <b>ข้อมูลทั่วไป</b>
                    </div>
                    <div className="user-info mt-3">
                        <div className="left-info">
                            <p>
                                <span>ชื่อ-สกุล</span>
                            </p>
                            <p>
                                <span>เลขบัตรประชาชน</span>
                            </p>
                            <p>
                                <span>อายุ</span>
                            </p>
                            <p>
                                <span>เพศ</span>
                            </p>
                            <p>
                                <span>สัญชาติ</span>
                            </p>
                            <p>
                                <span>ที่อยู่</span>
                            </p>
                            <p>
                                <span>เบอร์โทรศัพท์</span>
                            </p>
                            {/* <p>
                                <span>ผู้ดูแล</span>
                            </p>
                            <p>
                                <span>ความสัมพันธ์</span>
                            </p>
                            <p>
                                <span>เบอร์โทรศัพท์ผู้ดูแล</span>
                            </p> */}
                        </div>
                        <div className="right-info">
                            <p>
                                <b>{name || '-'}</b> <b>{surname || '-'}</b>
                            </p>
                            <p>
                                <b>{ID_card_number || '-'}</b>
                            </p>
                            <p>
                                <b>{userAge}</b>
                            </p>
                            <p>
                                <b>{gender || '-'}</b>
                            </p>
                            <p>
                                <b>{nationality || '-'}</b>
                            </p>
                            <p>
                                <b>{Address || '-'}</b>
                            </p>
                            <p>
                                <b>{tel || '-'}</b>
                            </p>
                            {/* <p>
                                <b>{caregiverName || '-'}</b> <b>{caregiverSurname || '-'}</b>
                            </p>
                            <p>
                                <b>{Relationship || '-'}</b>
                            </p>
                            <p>
                                <b>{caregiverTel || '-'}</b>
                            </p> */}
                        </div>
                    </div>
                    <div className="btn-group mb-4">
                        <div className="editimg1">
                            <button
                                onClick={() =>
                                    navigate("/updatepatient", {
                                        state: { id },
                                    })
                                }
                            >
                                แก้ไข
                            </button>
                        </div>
                        {/* <div className="deleteimg1">
                            <button onClick={() => deleteUser()}>ลบ</button>
                        </div> */}
                    </div>
                </div>
                <div className="info3 card mb-1">
          <div className="header">
            <b>ข้อมูลผู้ดูแล</b>
          </div>
          
          <div>
            {caregiverInfo && caregiverInfo.length > 0 ? (
              <div>
                <div className="user-info-caregiver">
                  {caregiverInfo.map((caregiver, index) => (
                    <div className="inline-container-caregiver" key={index}>
                      <p>
                        <span>ผู้ดูแลคนที่ {index + 1}:</span>
                      </p>
                      <div className="caregiver-card">
                      <div className="caregiver-info">
                        <p>
                          <span>ชื่อ-สกุล:</span> {caregiver.name || "-"}{" "}
                          {caregiver.surname || "-"}
                        </p>
                        <p>
                          <span>ความสัมพันธ์:</span>{" "}
                          {caregiver.Relationship || "-"}
                        </p>
                        <p>
                          <span>เบอร์โทรศัพท์:</span> {caregiver.tel || "-"}
                        </p>
                        </div>
                        <div class="button-container-vertical">
                      <button class="button-edit" 
                      onClick={() => handleEdit(caregiver)}>
                        แก้ไข
                      </button>
                       {/* <button  class="button-delete" 
                      onClick={() => handleDelete(caregiver._id)}>
                        ลบ 
                      </button> */}
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
        </div>

                <br></br>
                <div className="info3 card mb-1">
                    <div className="header"><b>ข้อมูลการเจ็บป่วย</b></div>
                    {medicalInfo ? (
                        <>
                            <div className="user-info mt-3">
                                <div className="left-info">
                                    <p><span>HN</span></p>
                                    <p><span>AN</span></p>
                                    <p><span>วันที่ Admit</span></p>
                                    <p><span>วันที่ D/C</span></p>
                                    <p><span>Diagnosis</span></p>
                                    <p><span>แพทย์ผู้ดูแล</span></p>
                                    <p><span>Chief_complaint</span></p>
                                    <p><span>Present illness</span></p>
                                    <p><span>File Present illness</span></p>
                                    <p><span>Management plan</span></p>
                                    <p><span>File Management plan</span></p>
                                    <p><span>Phychosocial assessment</span></p>
                                    <p><span>File Phychosocial assessment</span></p>
                                </div>
                                <div className="right-info">
                                    <p><b>{medicalInfo.HN || "-"}</b></p>
                                    <p><b>{medicalInfo.AN || "-"}</b></p>
                                    <p>
                                        <b>{medicalInfo.Date_Admit
                                            ? new Date(medicalInfo.Date_Admit).toLocaleDateString(
                                                "th-TH",
                                                { day: "numeric", month: "long", year: "numeric" }
                                            )
                                            : "-"}</b>
                                    </p>
                                    <p>
                                        <b>{medicalInfo.Date_DC
                                            ? new Date(medicalInfo.Date_DC).toLocaleDateString(
                                                "th-TH",
                                                { day: "numeric", month: "long", year: "numeric" }
                                            )
                                            : "-"}</b>
                                    </p>
                                    <p><b>{medicalInfo.Diagnosis || "-"}</b></p>
                                    <p>
                                        <b>
                                            {(mdata.nametitle || mdata.name || mdata.surname)
                                                ? `${mdata.nametitle || ""} ${mdata.name || ""} ${mdata.surname || ""}`.trim()
                                                : "-"
                                            }
                                        </b>
                                    </p>
                                    <p><b>{medicalInfo.Chief_complaint || "-"}</b></p>
                                    <p><b>{medicalInfo.Present_illness || "-"}</b></p>
                                    <p>
                                        <b>
                                            {medicalInfo.fileP ? (
                                                <a
                                                    style={{ color: "grey" }}
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
                                            ) : (
                                                "-"
                                            )}
                                        </b>
                                    </p>

                                    <p><b>{medicalInfo.Management_plan || "-"}</b></p>
                                    <p>
                                        <b>
                                            {medicalInfo.fileM ? (
                                                <a
                                                    style={{ color: "grey" }}
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
                                            ) : (
                                                "-"
                                            )}
                                        </b>
                                    </p>
                                    <p><b>{medicalInfo.Phychosocial_assessment || "-"}</b></p>
                                    <p>
                                        <b>
                                            {medicalInfo.filePhy ? (
                                                <a
                                                    style={{ color: "grey" }}
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
                                            ) : (
                                                "-"
                                            )}
                                        </b>
                                    </p>
                                </div>
                            </div>
                            <div className="btn-group mb-4">
                                <div className="editimg1">
                                    <button
                                        onClick={() =>
                                            navigate("/updatemedicalinformation", {
                                                state: { id },
                                            })
                                        }
                                    >
                                        แก้ไข
                                    </button>
                                </div>
                                {/* <div className="deleteimg1">
                                    <button onClick={handleDeleteMedicalInfo}>ลบ</button>
                                </div> */}
                            </div>
                        </>
                    ) : (
                        <div>
                            <p className="no-equipment">ไม่พบข้อมูล</p>
                            <div className="btn-group">
                                {/* <div className="adddata">
                                    <button onClick={() => navigate("/addmdinformation", { state: { id } })}>
                                        เพิ่มข้อมูล
                                    </button>
                                </div> */}
                            </div>
                        </div>
                    )}
                </div>
                <br></br>
                <div className="info3 card mb-1">
                    <div className="header">
                        <b>อุปกรณ์ทางการแพทย์</b>
                    </div>
                    {medicalEquipment && medicalEquipment.length > 0 ? (
                        <>
                            {Object.entries(
                                medicalEquipment.reduce((acc, equipment) => {
                                    if (!acc[equipment.equipmenttype_forUser]) {
                                        acc[equipment.equipmenttype_forUser] = [];
                                    }
                                    acc[equipment.equipmenttype_forUser].push(equipment);
                                    return acc;
                                }, {})
                            ).map(([type, equipments]) => {
                                // Determine if all items in this category are selected
                                const allSelected = equipments.every(equipment =>
                                    selectedEquipments.includes(equipment.equipmentname_forUser)
                                );

                                return (
                                    <div key={type} className="equipment-category">
                                        <h4 className="mt-3"><b>{type}</b></h4>
                                        <table className="equipment-table mb-5">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <input
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            onChange={() => {
                                                                if (allSelected) {
                                                                    // Unselect all items in this category
                                                                    setSelectedEquipments(prevSelected =>
                                                                        prevSelected.filter(name =>
                                                                            !equipments.some(equipment => equipment.equipmentname_forUser === name)
                                                                        )
                                                                    );
                                                                } else {
                                                                    // Select all items in this category
                                                                    setSelectedEquipments(prevSelected => [
                                                                        ...prevSelected,
                                                                        ...equipments
                                                                            .filter(equipment => !prevSelected.includes(equipment.equipmentname_forUser))
                                                                            .map(equipment => equipment.equipmentname_forUser)
                                                                    ]);
                                                                }
                                                            }}
                                                        />
                                                    </th>
                                                    <th>ลำดับ</th>
                                                    <th>ชื่ออุปกรณ์</th>
                                                    <th>วันที่เพิ่ม</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {equipments.map((equipment, index) => (
                                                    <tr key={equipment._id}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                className="mb-2"
                                                                checked={selectedEquipments.includes(equipment.equipmentname_forUser)}
                                                                onChange={() =>
                                                                    handleCheckboxChange(equipment.equipmentname_forUser)
                                                                }
                                                            />
                                                        </td>
                                                        <td>{index + 1}</td>
                                                        <td>{equipment.equipmentname_forUser}</td>
                                                        <td>
                                                            {new Date(equipment.createdAt).toLocaleDateString("th-TH", {
                                                                day: "numeric",
                                                                month: "long",
                                                                year: "numeric",
                                                            })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                            <div className="btn-group mb-4">
                                <div className="adddata">
                                    <button onClick={() => navigate("/addequippatient", { state: { id } })}>
                                        เพิ่มอุปกรณ์
                                    </button>
                                </div>
                                <div className="deleteimg1 mt-2">
                                    <button onClick={handleDeleteSelected}>ลบอุปกรณ์</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="no-equipment">ไม่พบข้อมูล</div>
                            <div className="btn-group mb-4">
                                <div className="adddata">
                                    <button onClick={() => navigate("/addequippatient", { state: { id } })}>
                                        เพิ่มอุปกรณ์
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </main>
    );
}
