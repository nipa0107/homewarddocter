import React, { useEffect, useState, useRef } from "react";
import "../css/form.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Typography, Stepper, Step, StepLabel, Wizard, WizardStep } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { useFormContext } from 'react-hook-form';
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import { PatientAgenda } from './stepform/PatientAgenda';
import { CaregiverAgenda } from './stepform/CaregiverAgenda';
import { CaregiverAssessment } from './stepform/CaregiverAssessment';
import { Zarit } from './stepform/Zaritburdeninterview';
import io from 'socket.io-client';
import MultiStep from "react-multistep";
const socket = io("http://localhost:5000");

export default function AgendaForm({ }) {
    const navigate = useNavigate();
    const [data, setData] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [medicalData, setMedicalData] = useState({});
    const location = useLocation();
    const { id } = location.state;
    const userid = location.state.id; // Get user ID from the navigation state
    const [caregiver, setCaregiver] = useState([]);
    const [newCaregivers, setNewCaregivers] = useState([]);
    const [mpersonnel, setMPersonnel] = useState([]);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");
    const [userAge, setUserAge] = useState(0);
    const [userAgeInMonths, setUserAgeInMonths] = useState(0);
    const [userData, setUserData] = useState(null);
    const [userId, setUserId] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const notificationsRef = useRef(null);
    const [showToTopButton, setShowToTopButton] = useState(false);
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
                setData(data.data);

                return data.data;
            })
            .catch((error) => {
                console.error("Error verifying token:", error);
            });
    };
    useEffect(() => {
        if (hasFetchedUserData.current) return; // ป้องกันการเรียกซ้ำ
        hasFetchedUserData.current = true;

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
        const fetchMedicalData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/medicalInformation/${userid}`);
                const data = await response.json();

                if (response.ok) {
                    setMedicalData(data.data);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching medical data:', error);
            }
        };

        fetchMedicalData();
    }, [userid]);

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

    const logOut = () => {
        window.localStorage.clear();
        window.location.href = "./";
    };


    const scrollToTop = () => {
        console.log("🔼 Instantly scrolling to top...");
        window.scrollTo(0, 0); // เลื่อนไปด้านบนทันที
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


    const steps = getSteps();
    function getSteps() {
        return [
            "Patient Agenda", "Caregiver Agenda", "Caregiver Assessment", "Zarit burden interview"
        ];
    }
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        scrollToTop(); // ทำให้ฟอร์มเลื่อนขึ้นไปด้านบนสุดทุกครั้งที่ activeStep เปลี่ยน
    }, [activeStep]);
    
    const methods = useForm({
        defaultValues: {
        },
    });
    // ฟังก์ชันสำหรับเปลี่ยน active step เมื่อคลิกที่ StepLabel
    const handleStepClick = (index) => {
        setActiveStep(index);
    };
    useEffect(() => {
        const fetchCaregiverData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getCaregiversByUser/${userid}`);
                const caregiverData = await response.json();
                if (caregiverData.status === 'ok') {
                    setCaregiver(caregiverData.data);
                }
            } catch (error) {
                console.error("Error fetching caregiver data:", error);
            }
        };
        fetchCaregiverData();
    }, [id]);

    useEffect(() => {
        const fetchNewCaregivers = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getcaregivesotherpeople/${id}`);
                const data = await response.json();
                console.log("Fetched new caregivers:", data); // ตรวจสอบข้อมูลใน console
                if (data.status === "ok") {
                    setNewCaregivers(data.data); // อัปเดต state newCaregivers
                } else {
                    console.error("Failed to fetch new caregivers:", data.message);
                }
            } catch (error) {
                console.error("Error fetching new caregivers:", error);
            }
        };

        if (id) fetchNewCaregivers();
    }, [id]);


    const handleNext = async (data) => {
        console.log("Form data at step", activeStep, data);

        if (activeStep === 3) { 
            const isIncomplete = Object.values(ZaritData).some(val => val === undefined || val === '');
            if (isIncomplete) {
                toast.error("⚠️ กรุณากรอกข้อมูลให้ครบทุกข้อในแบบประเมิน Zarit ก่อนบันทึก");
                return; // หยุดไม่ให้บันทึกถ้ายังไม่เลือกครบ
            }
        }
        if (activeStep === 0) {
            setPatientAgendaData(PatientAgendaData);
        } else if (activeStep === 1) {
            setCaregiverAgendaData(CaregiverAgendaData);
        } else if (activeStep === 2) {
            setCaregiverAssessmentData(CaregiverAssessmentData);
        } else if (activeStep === 3) {
            setZaritData(ZaritData);
        }

        if (activeStep === steps.length - 1) {
            try {
                const response = await fetch(`http://localhost:5000/submitagenda/${userid}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userid,
                        MPersonnel: mpersonnel,
                        Caregiver: caregiver,
                        newCaregivers: newCaregivers.map(cg => cg.id),
                        PatientAgenda: PatientAgendaData,
                        CaregiverAgenda: { Care_Agenda: CaregiverAgendaData },
                        CaregiverAssessment: { Care_Assessment: CaregiverAssessmentData },
                        Zaritburdeninterview: ZaritData,
                        status_agenda: 'ประเมินแล้ว',
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    toast.success("บันทึกข้อมูลสำเร็จ");
                    setTimeout(() => {
                        navigate("/assessinhomesssuser", { state: { id } });
                    }, 1000);
                } else {
                    console.error("Error during ReadinessForm submission:", data);
                    toast.error("เกิดข้อผิดพลาดในการประเมิน");
                }
                console.log('Data saved:', result);
            } catch (error) {
                console.error('Error saving data:', error);
            }
        } else {
            scrollToTop(); // เลื่อนไปด้านบนสุดทันที
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };


    const handleBack = () => {
        scrollToTop(); // เลื่อนไปด้านบนสุดทันที
    
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    

    const [PatientAgendaData, setPatientAgendaData] = useState({});
    const [CaregiverAgendaData, setCaregiverAgendaData] = useState({});
    const [CaregiverAssessmentData, setCaregiverAssessmentData] = useState({});
    const [ZaritData, setZaritData] = useState({
        question_1: "0",
        question_2: "0",
        question_3: "0",
        question_4: "0",
        question_5: "0",
        question_6: "0",
        question_7: "0",
        question_8: "0",
        question_9: "0",
        question_10: "0",
        question_11: "0",
        question_12: "0",
        totalScore: 0,
    });

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
            <ToastContainer />
            <div className="container-form">
                <div className="homeheaderform">
                    <div className="header">ประเมิน Agenda</div>
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
                <div className="stepper">
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => (
                            <Step key={index}>
                                <StepLabel
                                    onClick={() => handleStepClick(index)}
                                    style={{
                                        cursor: "pointer",
                                        color: activeStep === index ? "#95d7ff" : "#18aed6", // สีเขียวเมื่อเลือก, สีฟ้าสำหรับไม่เลือก
                                        fontSize: "20px", // ขนาดฟอนต์ 20px
                                        fontWeight: activeStep === index ? "bold" : "normal", // ตัวหนาเมื่อคลิก
                                    }}
                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                </div>
                <div className="formcontent">
                    <div class="row">
                        {/* style={{backgroundColor:"#87CEFA" , borderRadius:"5px"}} */}
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
                            <div className="step-menu d-flex flex-column mt-3">
                                {steps.map((label, index) => (
                                    <button
                                        className="bg-light"
                                        key={index}
                                        style={{ cursor: "pointer", color: activeStep === index ? "#59bfff" : "#000", fontWeight: activeStep === index ? "bold" : "normal" }}
                                        onClick={() => handleStepClick(index)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="form-content">
                                {/* <a href="assessinhomesssuser">บันทึกการประเมิน</a> */}
                                {activeStep === steps.length ? (
                                    <Typography variant="h3" align="center">
                                        การประเมินเสร็จสิ้น
                                    </Typography>

                                ) : (
                                    <FormProvider {...methods}>
                                        <form onSubmit={methods.handleSubmit(handleNext)}>
                                            {activeStep === 0 && (
                                                <PatientAgenda onDataChange={(data) => setPatientAgendaData(data)} />
                                            )}
                                            {activeStep === 1 && (
                                                <CaregiverAgenda onDataChange={(data) => setCaregiverAgendaData(data)} />
                                            )}
                                            {activeStep === 2 && (
                                                <CaregiverAssessment onDataChange={(data) => setCaregiverAssessmentData(data)} />
                                            )}
                                            {activeStep === 3 && (
                                                <Zarit ZaritData={ZaritData} setZaritData={setZaritData} />
                                            )}

                                            <div className="btn-group">
                                                <div className="btn-pre">
                                                    <button
                                                        className="btn btn-outline py-2"
                                                        disabled={activeStep === 0}
                                                        onClick={handleBack}
                                                        type="button"
                                                    >
                                                        ก่อนหน้า
                                                    </button>
                                                </div>
                                                <div className="btn-next">
                                                    <button
                                                        className="btn btn-outline-primary py-2"
                                                        type="submit"
                                                    >
                                                        {activeStep === steps.length - 1 ? "บันทึก" : "ถัดไป"
                                                        }

                                                    </button>
                                                </div>
                                            </div>

                                        </form>
                                    </FormProvider>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
                <a
                    onClick={scrollToTop}
                    className="btn btn-outline-primary py-2"
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
            </div>
        </div>
    );
};
