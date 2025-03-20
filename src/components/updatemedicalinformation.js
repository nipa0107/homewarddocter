import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import "../css/styles.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { fetchAlerts } from './Alert/alert';
import { renderAlerts } from './Alert/renderAlerts';
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "./sidebar";
import "react-toastify/dist/ReactToastify.css";
import io from 'socket.io-client';
const socket = io("https://backend-deploy-render-mxok.onrender.com");
export default function Updatemedicalinformation() {
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [medicalInfo, setMedicalInfo] = useState(null);
    const location = useLocation();
    const { id, user } = location.state;
    //   const { idmd: medicalInfoId } = location.state;
    const [isActive, setIsActive] = useState(false);
    const [HN, setHN] = useState("");
    const [AN, setAN] = useState("");
    const [Diagnosis, setDiagnosis] = useState("");
    const [Chief_complaint, setChief_complaint] = useState("");
    const [Present_illness, setPresent_illness] = useState("");
    const [Phychosocial_assessment, setPhychosocial_assessment] = useState("");
    const [Management_plan, setManagement_plan] = useState("");
    const [Date_Admit, setDate_Admit] = useState("");
    const [Date_DC, setDate_DC] = useState("");
    const [fileM, setFileM] = useState(null);
    const [fileP, setFileP] = useState(null);
    const [filePhy, setFilePhy] = useState(null);
    const [fileMName, setFileMName] = useState(null);
    const [filePName, setFilePName] = useState(null);
    const [filePhyName, setFilePhyName] = useState(null);
    const [pdfURL, setPdfURL] = useState(null);
    const [selectedFileNameP, setSelectedFileNameP] = useState("");
    const [selectedFileNameM, setSelectedFileNameM] = useState("");
    const [selectedFileNamePhy, setSelectedFileNamePhy] = useState("");
    const [pdfURLP, setPdfURLP] = useState("");
    const [pdfURLM, setPdfURLM] = useState("");
    const [pdfURLPhy, setPdfURLPhy] = useState("");
    const [data, setData] = useState([]);
    const [profileData, setProfileData] = useState(null);
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
    const [latestAssessments, setLatestAssessments] = useState({});
    const [unreadCountsByType, setUnreadCountsByType] = useState({
        assessment: 0,
        abnormal: 0,
        normal: 0,
    });
    const hasFetchedUserData = useRef(false);

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
            setProfileData(data.data);
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

    const initialSelectedPersonnel = medicalInfo
        ? medicalInfo.selectedPersonnel
        : "";

    const [selectedPersonnel, setSelectedPersonnel] = useState(
        initialSelectedPersonnel
    );

    const handleFileChangeP = (e) => {
        setFileP(e.target.files[0]); // อัปเดต state ของไฟล์ Present illness
        setSelectedFileNameP(e.target.files[0].name); // อัปเดตชื่อไฟล์ที่เลือก
        const pdfURLP = URL.createObjectURL(e.target.files[0]);
        setPdfURLP(pdfURLP);
    };

    const handleFileChangeM = (e) => {
        setFileM(e.target.files[0]); // อัปเดต state ของไฟล์ Management plan
        setSelectedFileNameM(e.target.files[0].name); // อัปเดตชื่อไฟล์ที่เลือก
        const pdfURLM = URL.createObjectURL(e.target.files[0]);
        setPdfURLM(pdfURLM);
    };

    const handleFileChangePhy = (e) => {
        setFilePhy(e.target.files[0]); // อัปเดต state ของไฟล์ Phychosocial assessment
        setSelectedFileNamePhy(e.target.files[0].name); // อัปเดตชื่อไฟล์ที่เลือก
        const pdfURLPhy = URL.createObjectURL(e.target.files[0]);
        setPdfURLPhy(pdfURLPhy);
    };


    const FormatDate = (date) => {
        if (!date) {
            return ""; // Return an empty string if the date is null, undefined, or empty
        }
        const formattedDate = new Date(date);
        if (isNaN(formattedDate.getTime())) {
            return ""; // If the date is invalid, return an empty string
        }
        return formattedDate.toISOString().split("T")[0];
    };

    useEffect(() => {
        getAllMpersonnel();
    }, []);

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
                    setHN(medicalData.data.HN);
                    setAN(medicalData.data.AN);
                    setDiagnosis(medicalData.data.Diagnosis);
                    setChief_complaint(medicalData.data.Chief_complaint);
                    setPresent_illness(medicalData.data.Present_illness);
                    setPhychosocial_assessment(medicalData.data.Phychosocial_assessment);
                    setManagement_plan(medicalData.data.Management_plan);
                    setDate_Admit(FormatDate(medicalData.data.Date_Admit));
                    setSelectedPersonnel(medicalData.data.selectedPersonnel);
                    setDate_DC(FormatDate(medicalData.data.Date_DC));
                    setFileP(medicalData.data.fileP);
                    setFileM(medicalData.data.fileM);
                    setFilePhy(medicalData.data.filePhy);
                    setFilePName(medicalData.data.filePName);
                    setFileMName(medicalData.data.fileMName);
                    setFilePhyName(medicalData.data.filePhyName);
                    // const filePath = medicalData.data.fileP.replace(/\\/g, "/");
                    // const fileName = filePath.split("/").pop();
                    // setFileP(fileName);

                    // const filePathM = medicalData.data.fileM.replace(/\\/g, "/");
                    // const fileNameM = filePathM.split("/").pop();
                    // setFileM(fileNameM);

                    // const filePathPhy = medicalData.data.filePhy.replace(/\\/g, "/");
                    // const fileNamePhy = filePathPhy.split("/").pop();
                    // setFilePhy(fileNamePhy);

                } else {
                    console.error("Medical information not found for this user");
                }
            } catch (error) {
                console.error("Error fetching medical information:", error);
            }
        };
        fetchMedicalInformation();
    }, [id]);



    const logOut = () => {
        window.localStorage.clear();
        window.location.href = "./";
    };
    // bi-list
    const handleToggleSidebar = () => {
        setIsActive(!isActive);
    };

    const getAllMpersonnel = () => {
        fetch("https://backend-deploy-render-mxok.onrender.com/allMpersonnel", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`, // เพิ่ม Authorization header เพื่อส่ง token ในการร้องขอ
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data, "AllMpersonnel");
                setData(data.data);
            });
    };

    const UpdateMedical = async () => {
        console.log(HN, AN,);
        const selectedPersonnelValue =
            document.getElementById("selectedPersonnel").value;

        try {
            if (!medicalInfo) {
                console.error("ไม่พบข้อมูลการแพทย์");
                return;
            }

            const updatedSelectedPersonnel = selectedPersonnelValue !== "" ? selectedPersonnelValue : selectedPersonnel;

            const formData = new FormData();
            formData.append("HN", HN);
            formData.append("AN", AN);
            formData.append("Date_Admit", Date_Admit);
            formData.append("Date_DC", Date_DC);
            formData.append("Diagnosis", Diagnosis);
            formData.append("Chief_complaint", Chief_complaint);
            formData.append("Present_illness", Present_illness);
            formData.append("selectedPersonnel", updatedSelectedPersonnel); // ใช้ค่าที่อัปเดตแล้ว
            formData.append("Phychosocial_assessment", Phychosocial_assessment);
            formData.append("Management_plan", Management_plan);

            if (fileP) {
                formData.append("fileP", fileP);
            }

            if (fileM) {
                formData.append("fileM", fileM);
            }

            if (filePhy) {
                formData.append("filePhy", filePhy);
            }

            console.log("info:", id);
            const response = await fetch(
                `https://backend-deploy-render-mxok.onrender.com/updatemedicalinformation/${medicalInfo._id}`,
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                const updatemedicalinformation = data; // ใช้ข้อมูลที่อ่านได้ในการทำงานต่อไป
                console.log("แก้ไข้อมูลแล้ว:", updatemedicalinformation);
                toast.success("แก้ไขข้อมูลสำเร็จ");
                setTimeout(() => {
                    navigate("/infopatient", { state: { id: id, user: user } });

                    // navigate("/allinfo");
                }, 1100);
            } else {
                console.error("แก้ไขไม่ได้:", response.statusText);
            }
        } catch (error) {
            console.error("Error updating medical information:", error);
            // ดำเนินการเมื่อเกิดข้อผิดพลาดในการส่งคำขอ
        }
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
                                    {profileData && profileData.nametitle + profileData.name + " " + profileData.surname}
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
                            <a>แก้ไขข้อมูลการเจ็บป่วย</a>
                        </li>
                    </ul>
                </div>
                <br></br>
                <h3>แก้ไขข้อมูลการเจ็บป่วย</h3>
                {medicalInfo && (
                    <div className="adminall card mb-1">
                        <div className="mb-1">
                            <label>HN</label>
                            <input
                                type="text"
                                className="form-control"
                                value={HN}
                                onChange={(e) => setHN(e.target.value)}
                            />
                        </div>
                        <div className="mb-1">
                            <label>AN</label>
                            <input
                                type="text"
                                value={AN}
                                className="form-control"
                                onChange={(e) => setAN(e.target.value)}
                            />
                        </div>

                        <div className="mb-1">
                            <label>วันที่ Admit </label>
                            <input
                                type="date"
                                value={Date_Admit}
                                className="form-control"
                                onChange={(e) => setDate_Admit(e.target.value)}
                            />
                        </div>
                        <div className="mb-1">
                            <label>วันที่ D/C</label>
                            <input
                                type="date"
                                value={Date_DC}
                                className="form-control"
                                onChange={(e) => setDate_DC(e.target.value)}
                            />
                        </div>
                        <div className="mb-1">
                            <label>แพทย์ผู้ดูแล</label>
                            <select
                                id="selectedPersonnel"
                                className="form-select"
                                value={selectedPersonnel}
                                onChange={(e) => setSelectedPersonnel(e.target.value)}
                            >
                                <option value="">โปรดเลือกแพทย์</option>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data.map((personnel) => (
                                        <option key={personnel._id} value={personnel._id}>
                                            {`${personnel.nametitle} ${personnel.name} ${personnel.surname}`}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">ไม่มีข้อมูลแพทย์</option>
                                )}
                            </select>
                        </div>

                        <div className="mb-1">
                            <label>Diagnosis</label>
                            <textarea
                                className="form-control"
                                value={Diagnosis}
                                rows="3" // กำหนดจำนวนแถวเริ่มต้น
                                style={{ resize: "vertical" }} // ให้ textarea สามารถปรับขนาดได้ในทิศทางดิสพล์เมนต์
                                onChange={(e) => setDiagnosis(e.target.value)}
                            />
                        </div>
                        <div className="mb-1">
                            <label>Chief complaint</label>
                            <textarea
                                className="form-control"
                                value={Chief_complaint}
                                rows="3" // กำหนดจำนวนแถวเริ่มต้น
                                style={{ resize: "vertical" }}
                                onChange={(e) => setChief_complaint(e.target.value)}
                            />
                        </div>
                        <div className="mb-1">
                            <label>Present illness</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="application/pdf"
                                onChange={handleFileChangeP}
                            />
                            <div className="filename">
                                {pdfURLP ? (
                                    <a href={pdfURLP} target="_blank" rel="noopener noreferrer">
                                        {selectedFileNameP}
                                    </a>
                                ) : (
                                    fileP && (
                                        <a
                                            onClick={() => {
                                                window.open(
                                                    `${fileP}`,
                                                    "_blank"
                                                );
                                            }}
                                        >
                                            {filePName}
                                        </a>
                                    )
                                )}
                            </div>
                            <textarea
                                className="form-control"
                                value={Present_illness} // Set the value attribute
                                rows="3"
                                style={{ resize: "vertical" }}
                                onChange={(e) => setPresent_illness(e.target.value)}
                            />

                        </div>

                        <div className="mb-1">
                            <label>Management plan</label>
                            <input
                                type="file"
                                className="form-control"
                                accept="application/pdf"
                                onChange={handleFileChangeM}
                            />
                            <div className="filename">
                                {pdfURLM ? (
                                    <a href={pdfURLM} target="_blank" rel="noopener noreferrer">
                                        {selectedFileNameM}
                                    </a>
                                ) : (
                                    fileM && (
                                        <a
                                            onClick={() => {
                                                window.open(
                                                    `${fileM}`,
                                                    "_blank"
                                                );
                                            }}
                                        >
                                            {fileMName}
                                        </a>
                                    )
                                )}
                            </div>
                            <textarea
                                className="form-control"
                                value={Management_plan} // Set the value here
                                rows="3"
                                style={{ resize: "vertical" }}
                                onChange={(e) => setManagement_plan(e.target.value)}
                            />
                        </div>

                        <div className="mb-1">
                            <label>Phychosocial assessment</label>

                            <input
                                type="file"
                                className="form-control"
                                accept="application/pdf"
                                onChange={handleFileChangePhy}
                            />

                            <div className="filename">
                                {pdfURLPhy ? (
                                    <a href={pdfURLPhy} target="_blank" rel="noopener noreferrer">
                                        {selectedFileNamePhy}
                                    </a>
                                ) : (
                                    filePhy && (
                                        <a
                                            onClick={() => {
                                                window.open(
                                                    `${filePhy}`,
                                                    "_blank"
                                                );
                                            }}
                                        >
                                            {filePhyName}
                                        </a>
                                    )
                                )}
                            </div>
                            <textarea
                                className="form-control"
                                value={Phychosocial_assessment} // Set the value here
                                rows="3"
                                style={{ resize: "vertical" }}
                                onChange={(e) => setPhychosocial_assessment(e.target.value)}
                            />
                        </div>

                    </div>

                )}
                <div className="btn-group">
                    <div className="btn-next">
                        <button onClick={UpdateMedical} className="btn btn-outline py-2">
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>

            <div></div>
        </main>
    );
}
