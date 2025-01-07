import React, { useEffect, useState, useRef } from "react";
import "../css/form.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Immobility } from "./stepform/Immobility";
import { Nutrition } from "./stepform/Nutrition";
import { Housing } from "./stepform/Housing"
import { Physicalexamination } from "./stepform/Physicalexamination"
import { SSS } from "./stepform/SSS"
// import { Agenda } from "./Agenda"
import { Otherpeople } from "./stepform/Otherpeople"
import { Medication } from "./stepform/Medication"
import { Zarit } from "./stepform/Zaritburdeninterview"
import { Typography, Stepper, Step, StepLabel, Wizard, WizardStep } from "@material-ui/core";
import { useForm, FormProvider } from "react-hook-form";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import io from 'socket.io-client';
const socket = io("http://localhost:5000");

export default function AssessinhomesssForm({ }) {
    const navigate = useNavigate();
    const [data, setData] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [medicalData, setMedicalData] = useState({});
    const location = useLocation();
    const { id } = location.state;
    const userid = location.state.id; // Get user ID from the navigation state
    const [assessmentData, setAssessmentData] = useState([]);
    const [username, setUsername] = useState("");
    const [mpersonnel, setMPersonnel] = useState([]);
    const [caregiver, setCaregiver] = useState([]);
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

    useEffect(() => {
        socket.on('newAlert', (alert) => {
            setAlerts(prevAlerts => [...prevAlerts, alert]);
            setUnreadCount(prevCount => prevCount + 1);
        });

        return () => {
            socket.off('newAlert'); // Clean up the listener on component unmount
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
        const fetchAssessmentData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getAssessreadiness/${userid}`);
                const data = await response.json();

                if (response.ok) {
                    setAssessmentData(data.data); // Store assessment data
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching assessment data:', error);
            }
        };

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

        fetchAssessmentData();
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

    const handleToggleSidebar = () => {
        setIsActive(!isActive);
    };



    const handleScroll = () => {
        const formContent = document.querySelector('.form-content');
        if (formContent.scrollTop > 200) {
            setShowToTopButton(true);
        } else {
            setShowToTopButton(false);
        }
    };
    const scrollToTop = () => {
        const formContent = document.querySelector('.form-content');
        formContent.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        const formContent = document.querySelector('.form-content');
        formContent.addEventListener("scroll", handleScroll);
        return () => {
            formContent.removeEventListener("scroll", handleScroll);
        };
    }, []);


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

    const steps = getSteps();
    function getSteps() {
        return [
            "Immobility", "Nutrition", "Housing", "Other people",
            "Medication", "Physical Examination", "SSS"
        ];
    }

    const [activeStep, setActiveStep] = useState(0);
    const methods = useForm({
        defaultValues: {
        },
    });

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

    const handleNext = async (data) => {
        console.log("Form data at step", activeStep, data);

        // เก็บข้อมูลของแต่ละหน้าลง state (เช่น Immobilitydata, NutritionData)
        if (activeStep === 0) {
            setImmobilityData(Immobilitydata);
        } else if (activeStep === 1) {
            setNutritionData(nutritionData);
        } else if (activeStep === 2) {
            setHousingData(HousingData);
        } else if (activeStep === 3) {
            setMedicationData(medicationData);
        } else if (activeStep === 4) {
            setOtherpeopleData(OtherpeopleData);
        } else if (activeStep === 5) {
            setPhysicalexaminationData(PhysicalexaminationData);
        } else if (activeStep === 6) {
            setsssData(data);
        }

        // เมื่อถึงหน้าสุดท้าย ให้ส่งข้อมูลไปยัง backend
        if (activeStep === steps.length - 1) {
            try {
                const response = await fetch(`http://localhost:5000/submitassessinhome/${userid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userid,
                        MPersonnel: mpersonnel,
                        Caregiver: caregiver,
                        Immobility: Immobilitydata,
                        Nutrition: nutritionData,
                        Housing: HousingData,
                        OtherPeople: {
                            existingCaregivers: OtherpeopleData.existingCaregivers,
                            newCaregivers: OtherpeopleData.newCaregivers || [],
                        },
                        Medication: medicationData,
                        PhysicalExamination: PhysicalexaminationData,
                        SSS: sssData,
                        status_inhome: 'ประเมินแล้ว',
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    toast.success("บันทึกข้อมูลสำเร็จ");
                    setTimeout(() => {
                        navigate("/assessinhomesssuser", { state: { id } });
                    }, 1000);
                    // Show the success message and links
                } else {
                    console.error("Error during ReadinessForm submission:", data);
                    toast.error("เกิดข้อผิดพลาดในการประเมิน");
                }
                console.log('Data saved:', result);
                // หลังบันทึกสามารถเพิ่มการแจ้งเตือนได้ เช่น การนำทางไปยังหน้าอื่น
            } catch (error) {
                console.error('Error saving data:', error);
            }
        } else {
            // หากไม่ใช่หน้าสุดท้าย ให้เลื่อนไปยังหน้าถัดไป
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const [Immobilitydata, setImmobilityData] = useState({
        Pick_up_food: 0,
        Clean_up: 0,
        Put_on_clothes: 0,
        Shower: 0,
        Using_the_toilet: 0,
        Get_up: 0,
        Walk_inside: 0,
        Up_down_stairs: 0,
        Continence_urine: 0,
        Continence_stool: 0,
        Walk_outside: 0,
        Cooking: 0,
        Household_chores: 0,
        Shopping: 0,
        Taking_public_transportation: 0,
        Taking_medicine: 0,
        totalScore: 0
    });
    const [nutritionData, setNutritionData] = useState({});
    const [HousingData, setHousingData] = useState({});

    const [medicationData, setMedicationData] = useState({});
    const [PhysicalexaminationData, setPhysicalexaminationData] = useState({});
    const [sssData, setsssData] = useState({});
    const [OtherpeopleData, setOtherpeopleData] = useState([]);



    return (
        <main className="bodyform">
            <ToastContainer />
            <div className="homeheaderform">
                <div className="header">ประเมิน IN-HOME-SSS</div>
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
            <div className="sidebarform">
                <div className="sideassessment">
                    <div>
                        <div className="nameassessment">
                            <p className="headerassesmentinhome">
                                {name} {surname}
                            </p>
                            {birthday ? (
                                <p className="textassesmentinhome">
                                    <label>อายุ:</label> {userAge} ปี {userAgeInMonths} เดือน <label>เพศ:</label>{gender}
                                </p>
                            ) : (
                                <p className="textassesmentinhome"> <label>อายุ:</label>0 ปี 0 เดือน <label>เพศ:</label>{gender}</p>
                            )}
                            <p className="textassesmentinhome">
                                <label>HN: </label>
                                {medicalData && medicalData.HN
                                    ? medicalData.HN
                                    : "ไม่มีข้อมูล"}
                                <label> AN: </label>
                                {medicalData && medicalData.AN
                                    ? medicalData.AN
                                    : "ไม่มีข้อมูล"}
                                <br></br>
                                <label>ผู้ป่วยโรค:</label>
                                {medicalData && medicalData.Diagnosis
                                    ? medicalData.Diagnosis
                                    : "ไม่มีข้อมูล"}
                            </p>
                        </div>

                        <Stepper className="stepper" activeStep={activeStep} orientation="vertical">
                            {steps.map((label, index) => (
                                <Step key={index}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </div>
                </div>
            </div>
            {/* Scrollable form content */}
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
                                <Immobility Immobilitydata={Immobilitydata} setImmobilityData={setImmobilityData} />
                            )}
                            {activeStep === 1 && (
                                <Nutrition onDataChange={(data) => setNutritionData(data)} />
                            )}
                            {activeStep === 2 && (
                                <Housing onDataChange={(data) => setHousingData(data)} />
                            )}
                            {activeStep === 3 && (
                                <Otherpeople onDataChange={(data) => setOtherpeopleData(data)} />
                            )}
                            {activeStep === 4 && (
                                <Medication onDataChange={(data) => setMedicationData(data)} />
                            )}
                            {activeStep === 5 && (
                                <Physicalexamination onDataChange={(data) => setPhysicalexaminationData(data)} />
                            )}
                            {activeStep === 6 && (
                                <SSS onDataChange={(data) => setsssData(data)} />
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
                ขึ้นไปด้านบน
            </a>

        </main>

    );
};
