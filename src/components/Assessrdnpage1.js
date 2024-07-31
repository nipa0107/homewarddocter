import React, { useEffect, useState, useRef  } from "react";
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
    const Readiness1 = ({ register, errors, watch }) => (
        <div>
            <div className="mb-1">
                <label>1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาด้วยการดูแลแบบผู้ป่วยใน ที่บ้านจากแพทย์อย่างครบถ้วน และให้คำยินยอมก่อนรับบริการใช่หรือไม่?</label>
                <div >
                    <label>
                        <input type="radio" name="question1_1" value="ใช่" {...register('Readiness1.question1_1', { required: true })} />
                        ใช่
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="question1_1" value="ไม่ใช่" {...register('Readiness1.question1_1', { required: true })} />
                        ไม่ใช่
                    </label>
                </div>
                {errors.question1_1 && <span>This field is required</span>}
            </div>
            <div className="mb-1">
                <label>2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน มีความปลอดภัยใช่หรือไม่?</label>
                <div>
                    <label>
                        <input type="radio" name="question1_2" value="ใช่" {...register('Readiness1.question1_2', { required: true })} />
                        ใช่
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="question1_2" value="ไม่ใช่" {...register('Readiness1.question1_2', { required: true })} />
                        ไม่ใช่
                    </label>
                </div>
                {errors.question1_2 && <span>This field is required</span>}
            </div>
            <div className="mb-1">
                <label>3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน อยู่ห่างจากโรงพยาบาลไม่เกิน 20 กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่?</label>
                <div>
                    <label>
                        <input type="radio" name="question1_3" value="ใช่" {...register('Readiness1.question1_3', { required: true })} />
                        ใช่
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="question1_3" value="ไม่ใช่" {...register('Readiness1.question1_3', { required: true })} />
                        ไม่ใช่
                    </label>
                </div>
                {errors.question1_3 && <span>This field is required</span>}
            </div>
            <div className="mb-1">
                <label>4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน สามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่?</label>
                <div>
                    <label>
                        <input type="radio" name="question1_4" value="ใช่" {...register('Readiness1.question1_4', { required: true })} />
                        ใช่
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="question1_4" value="ไม่ใช่" {...register('Readiness1.question1_4', { required: true })} />
                        ไม่ใช่
                    </label>
                </div>
                {errors.question1_4 && <span>This field is required</span>}
            </div>
        </div>
    );

    const Readiness2 = ({ register, errors, watch }) => (
        <div>
            <div className="mb-1">
                <label>1. Disease : เข้าใจโรค/ภาวะเจ็บป่วย</label>
                <div>
                    <label>
                        <input type="radio" name="Disease" value="ถูกต้อง" {...register('Readiness2.Disease', { required: true })} />
                        ถูกต้อง
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="Disease" value="ไม่ถูกต้อง" {...register('Readiness2.Disease', { required: true })} />
                        ไม่ถูกต้อง
                    </label>
                </div>
                {/* {errors.Disease && <span>This field is required</span>} */}
            </div>
            <div className="mb-1">
                <label>2. Medication : รู้ข้อมูล/ข้อพึงระวัง/การจัดยา</label>
                <div>
                    <label>
                        <input type="radio" name="Medication" value="ถูกต้อง" {...register('Readiness2.Medication', { required: true })} />
                        ถูกต้อง
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="Medication" value="ไม่ถูกต้อง" {...register('Readiness2.Medication', { required: true })} />
                        ไม่ถูกต้อง
                    </label>
                </div>
                {/* {errors.Medication && <span>This field is required</span>} */}
            </div>
            <div className="mb-1">
                <label>3. Environment : มีการเตรียมสิ่งแวดล้อม</label>
                <div>
                    <label>
                        <input type="radio" name="Environment" value="ถูกต้อง" {...register('Readiness2.Environment', { required: true })} />
                        ถูกต้อง
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="Environment" value="ไม่ถูกต้อง" {...register('Readiness2.Environment', { required: true })} />
                        ไม่ถูกต้อง
                    </label>
                </div>
                {/* {errors.Environment && <span>This field is required</span>} */}
            </div>
            <div className="mb-1">
                <label>4.Treatment : มีการฝึกทักษะที่จำเป็น</label>
                <div>
                    <label>
                        <input type="radio" name="Treatment" value="ถูกต้อง" {...register('Readiness2.Treatment', { required: true })} />
                        ถูกต้อง
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="Treatment" value="ไม่ถูกต้อง" {...register('Readiness2.Treatment', { required: true })} />
                        ไม่ถูกต้อง
                    </label>
                </div>
                {/* {errors.Treatment && <span>This field is required</span>} */}
            </div>
            <div className="mb-1">
                <label>5. Health : รู้ข้อจำกัดด้านสุขภาพ</label>
                <div>
                    <label>
                        <input type="radio" name="Health" value="ถูกต้อง" {...register('Readiness2.Health', { required: true })} />
                        ถูกต้อง
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="Health" value="ไม่ถูกต้อง" {...register('Readiness2.Health', { required: true })} />
                        ไม่ถูกต้อง
                    </label>
                </div>
                {/* {errors.Health && <span>This field is required</span>} */}
            </div>
            <div className="mb-1">
                <label>6. Out patient : รู้เรื่องการมาตามนัด/การส่งต่อ</label>
                <div>
                    <label>
                        <input type="radio" name="Out_patient" value="ถูกต้อง" {...register('Readiness2.Out_patient', { required: true })} />
                        ถูกต้อง
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="Out_patient" value="ไม่ถูกต้อง" {...register('Readiness2.Out_patient', { required: true })} />
                        ไม่ถูกต้อง
                    </label>
                </div>
                {/* {errors.Out_patient && <span>This field is required</span>} */}
            </div>
            <div className="mb-1">
                <label>7. Diet : รู้เรื่องการจัดการอาหารที่เหมาะสมกับโรค</label>
                <div>
                    <label>
                        <input type="radio" name="Diet" value="ถูกต้อง" {...register('Readiness2.Diet', { required: true })} />
                        ถูกต้อง
                    </label>
                </div>
                <div>
                    <label>
                        <input type="radio" name="Diet" value="ไม่ถูกต้อง" {...register('Readiness2.Diet', { required: true })} />
                        ไม่ถูกต้อง
                    </label>
                </div>
                {/* {errors.Diet && <span>This field is required</span>} */}
            </div>
        </div>
    );
    const [step, setStep] = useState(1);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const onSubmit = async (formData) => {
        try {
            const response = await fetch(`http://localhost:5000/submitAssessreadiness/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: id,
                    Readiness1: formData.Readiness1,
                    Readiness2: formData.Readiness2,
                    status_name: 'ประเมินแล้ว',
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("ประเมินความพร้อมสำเร็จ:", data);
                toast.success("ประเมินข้อมูลสำเร็จ");
                setTimeout(() => {
                    navigate("/assessreadiness");
                }, 1000);
            } else {
                console.error("Error during Assessreadiness submission:", data);
                toast.error("เกิดข้อผิดพลาดในการประเมิน");
            }
        } catch (error) {
            console.error("Error updating Assessreadiness:", error);
            toast.error("เกิดข้อผิดพลาดในการประเมิน");
        }
    };


    const handleNext = () => setStep(prevStep => prevStep + 1);
    const handlePrevious = () => setStep(prevStep => prevStep - 1);
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
                    <div className="header">ประเมินความพร้อมการดูแล
                    </div>
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
                            <a href="assessreadiness">ประเมินความพร้อมการดูแล</a>
                        </li>
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
                <h3>ประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในบ้าน</h3>
                <div className="">
                    <p className="headerassesment">
                        {name} {surname}
                    </p>
                    {birthday ? (
                        <p className="textassesment">
                            <label>อายุ:</label> {userAge} ปี {userAgeInMonths} เดือน <label>เพศ:</label>{gender}
                        </p>
                    ) : (
                        <p className="textassesment"> <label>อายุ:</label>0 ปี 0 เดือน <label>เพศ:</label>{gender}</p>
                    )}
                    <p className="textassesment">

                        <label>HN:</label>
                        {medicalData && medicalData.HN
                            ? medicalData.HN
                            : "ไม่มีข้อมูล"}
                        <label>AN:</label>
                        {medicalData && medicalData.AN
                            ? medicalData.AN
                            : "ไม่มีข้อมูล"}
                        <label>ผู้ป่วยโรค:</label>
                        {medicalData && medicalData.Diagnosis
                            ? medicalData.Diagnosis
                            : "ไม่มีข้อมูล"}
                    </p>
                </div>
                <div className="adminall card mb-1">
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
                </div>
                <ToastContainer />
            </div>
        </main>
    );
}

