import React, { useCallback, useEffect, useState, useRef } from "react";
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
import { Typography, Stepper, Step, StepLabel, Wizard, WizardStep } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import io from 'socket.io-client';
const socket = io("https://backend-deploy-render-mxok.onrender.com");

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
        const fetchData = async () => {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getuser/${id}`);
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
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getAssessreadiness/${userid}`);
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
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/medicalInformation/${userid}`);
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

    // const logOut = () => {
    //     window.localStorage.clear();
    //     window.location.href = "./";
    // };

    // const handleToggleSidebar = () => {
    //     setIsActive(!isActive);
    // };



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
            "Immobility", "Nutrition", "Housing", "Other people",
            "Medication", "Physical Examination", "SSS"
        ];
    }

    const [activeStep, setActiveStep] = useState(0);

    const methods = useForm({
        defaultValues: {
        },
    });

    // ฟังก์ชันสำหรับเปลี่ยน active step เมื่อคลิกที่ StepLabel
    const handleStepClick = (index) => {
        // อนุญาตให้กลับไปยังหน้า Immobility ได้เสมอ
        if (index < activeStep) {
            setActiveStep(index);
            setShowError(false); // ซ่อนข้อความแจ้งเตือน
            window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนหน้าไปด้านบนสุด
            return;
        }

        // ตรวจสอบว่ากำลังไป Step 1 (Nutrition) และ Immobility ต้องกรอกครบก่อน
        if (activeStep === 0 && !isImmobilityDataValid(Immobilitydata)) {
            setShowError(true);
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วนก่อนดำเนินการต่อ");
            return;
        }

        // ตรวจสอบ Nutrition ก่อนข้ามไปหน้าอื่น
        if (activeStep === 1 && !validateForm()) {
            setShowError(true);
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วนก่อนดำเนินการต่อ");
            return;
        }

        setActiveStep(index);
        setShowError(false); // ซ่อนข้อความแจ้งเตือนถ้าผ่าน
        window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนหน้าไปด้านบนสุด
    };

    // ฟังก์ชันตรวจสอบข้อมูล Immobility
    const isImmobilityDataValid = (data) => {
        return Object.values(data).every(value => value !== 0 && value !== "");
    };



    useEffect(() => {
        const fetchCaregiverData = async () => {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getCaregiversByUser/${userid}`);
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


    const [hasError, setHasError] = useState(false); // ตรวจสอบข้อผิดพลาด
    const [showError, setShowError] = useState(false); // ควบคุมการแสดงข้อความแจ้งเตือน

    const [validateForm, setValidateForm] = useState(() => () => true);

    // โหลดข้อมูลจาก LocalStorage เมื่อเปิดหน้า
    const [Immobilitydata, setImmobilityData] = useState(() => {
        return JSON.parse(localStorage.getItem('immobilityData')) || {
            Pick_up_food: 0, Clean_up: 0, Put_on_clothes: 0, Shower: 0, Using_the_toilet: 0,
            Get_up: 0, Walk_inside: 0, Up_down_stairs: 0, Continence_urine: 0, Continence_stool: 0,
            Walk_outside: 0, Cooking: 0, Household_chores: 0, Shopping: 0, Taking_public_transportation: 0,
            Taking_medicine: 0, totalScore: 0
        };
    });

    const [nutritionData, setNutritionData] = useState(() => {
        return JSON.parse(localStorage.getItem('nutritionData')) || {
          weight: "", height: "", bmr: 0, tdee: 0, activityLevel: "",
          intakeMethod: [], foodTypes: [], medicalFood: "", favoriteFood: "",
          cooks: [], nutritionStatus: ""
        };
      });
    const [HousingData, setHousingData] = useState(() => JSON.parse(localStorage.getItem('housingData')) || {});
    const [medicationData, setMedicationData] = useState(() => JSON.parse(localStorage.getItem('medicationData')) || {});
    const [PhysicalexaminationData, setPhysicalexaminationData] = useState(() => JSON.parse(localStorage.getItem('physicalExaminationData')) || {});
    const [sssData, setsssData] = useState(() => JSON.parse(localStorage.getItem('sssData')) || {});
    const [OtherpeopleData, setOtherpeopleData] = useState(() => JSON.parse(localStorage.getItem('otherPeopleData')) || []);

    // บันทึกข้อมูลลง LocalStorage ทุกครั้งที่เปลี่ยนแปลง
    useEffect(() => {
        localStorage.setItem('immobilityData', JSON.stringify(Immobilitydata));
        localStorage.setItem('nutritionData', JSON.stringify(nutritionData));
        localStorage.setItem('housingData', JSON.stringify(HousingData));
        localStorage.setItem('medicationData', JSON.stringify(medicationData));
        localStorage.setItem('physicalExaminationData', JSON.stringify(PhysicalexaminationData));
        localStorage.setItem('sssData', JSON.stringify(sssData));
        localStorage.setItem('otherPeopleData', JSON.stringify(OtherpeopleData));
    }, [Immobilitydata, nutritionData, HousingData, medicationData, PhysicalexaminationData, sssData, OtherpeopleData]);

    const handleNext = async (data) => {
        console.log("Form data at step", activeStep, data);

        // ตรวจสอบเฉพาะ step 0 และ step 1
        if (activeStep === 0) {
            if (hasError) {
                setShowError(true); // แสดงข้อความแจ้งเตือน
                return; // หยุดการทำงานถ้ายังมี error
            }
            setImmobilityData(Immobilitydata);
        } else if (activeStep === 1) { // ตรวจสอบเฉพาะหน้าโภชนาการ
            if (!validateForm()) {
                setShowError(true);
                return;
            }
            setNutritionData(nutritionData);

        } else if (activeStep === 2) {
            setHousingData(HousingData);
        } else if (activeStep === 3) {
            setMedicationData(medicationData);
        } else if (activeStep === 4) {
            setOtherpeopleData(OtherpeopleData);
        } else if (activeStep === 5) { // Physical Examination Step
            const updatedPhysicalExamination = { ...PhysicalexaminationData };

            // ฟิลด์ที่อาจมี "Other"
            const fieldsWithOther = [
                "moodandaffect",
                "appearanceAndBehavior",
                "eyeContact",
                "attention",
                "orientation",
                "thoughtProcess",
                "thoughtContent"
            ];

            fieldsWithOther.forEach((field) => {
                const values = Array.isArray(updatedPhysicalExamination[field])
                    ? updatedPhysicalExamination[field]
                    : [];

                updatedPhysicalExamination[field] = values.map((item) => {
                    if (typeof item === "string" && item.startsWith("อื่นๆ:")) {
                        return {
                            value: item.replace("อื่นๆ: ", ""),
                            isOther: true,
                        };
                    }
                    return { value: item, isOther: false };
                });
            });

            setPhysicalexaminationData(updatedPhysicalExamination);
        } else if (activeStep === 6) {
            setsssData(data);
        }

        setShowError(false); // ซ่อนข้อความแจ้งเตือนเมื่อเปลี่ยนหน้า


        if (activeStep === steps.length - 1) {
            try {
                const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/submitassessinhome/${userid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userid,
                        MPersonnel: mpersonnel || {},
                        Caregiver: caregiver || {},
                        Immobility: Immobilitydata,
                        Nutrition: {
                            ...nutritionData,
                            gender: nutritionData.gender || gender,
                            userAge: nutritionData.userAge || userAge,
                            userAgeInMonths: nutritionData.userAgeInMonths || userAgeInMonths,
                        },
                        Housing: HousingData,
                        OtherPeople: {
                            existingCaregivers: Array.isArray(OtherpeopleData.existingCaregivers)
                                ? OtherpeopleData.existingCaregivers
                                : [],
                            newCaregivers: Array.isArray(OtherpeopleData.newCaregivers)
                                ? OtherpeopleData.newCaregivers
                                : [],
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

                    // ล้างค่า LocalStorage
                    localStorage.removeItem('immobilityData');
                    localStorage.removeItem('nutritionData');
                    localStorage.removeItem('housingData');
                    localStorage.removeItem('medicationData');
                    localStorage.removeItem('physicalExaminationData');
                    localStorage.removeItem('sssData');
                    localStorage.removeItem('otherPeopleData');

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
            window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนหน้าไปด้านบนสุด
        }

    };


    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: "smooth" }); // เลื่อนหน้าไปด้านบนสุด
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };


    // const [Immobilitydata, setImmobilityData] = useState({
    //     Pick_up_food: 0,
    //     Clean_up: 0,
    //     Put_on_clothes: 0,
    //     Shower: 0,
    //     Using_the_toilet: 0,
    //     Get_up: 0,
    //     Walk_inside: 0,
    //     Up_down_stairs: 0,
    //     Continence_urine: 0,
    //     Continence_stool: 0,
    //     Walk_outside: 0,
    //     Cooking: 0,
    //     Household_chores: 0,
    //     Shopping: 0,
    //     Taking_public_transportation: 0,
    //     Taking_medicine: 0,
    //     totalScore: 0
    // });
    // const [nutritionData, setNutritionData] = useState({});
    // const [HousingData, setHousingData] = useState({});

    // const [medicationData, setMedicationData] = useState({});
    // const [PhysicalexaminationData, setPhysicalexaminationData] = useState({});
    // const [sssData, setsssData] = useState({});
    // const [OtherpeopleData, setOtherpeopleData] = useState([]);


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
    return (
        <div>
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
            <div className="container-form">
                {/* <Stepper className="stepper" activeStep={activeStep} orientation="vertical">
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper> */}
                <div className="stepper">
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => (
                            <Step key={index}>
                                <StepLabel
                                    onClick={() => handleStepClick(index)}

                                >
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </div>
                <div className="formcontent">
                    <div class="row">
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
                                            : "ไม่ระบุโรค"}</b>
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
                                {activeStep === steps.length ? (
                                    <Typography variant="h3" align="center">
                                        การประเมินเสร็จสิ้น
                                    </Typography>

                                ) : (
                                    <FormProvider {...methods}>
                                        <form onSubmit={methods.handleSubmit(handleNext)}>
                                            {activeStep === 0 && (
                                                <Immobility Immobilitydata={Immobilitydata} setImmobilityData={setImmobilityData} setHasError={setHasError} showError={showError} setShowError={setShowError} />
                                            )}
                                            {activeStep === 1 && (
                                                <Nutrition onDataChange={(data) => setNutritionData(data)} setValidateForm={setValidateForm} />
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
                        </div>
                    </div>
                </div>
                <a
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} // เพิ่มฟังก์ชันเลื่อนไปด้านบน
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
