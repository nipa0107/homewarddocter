import React, { useCallback, useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  Area,
  ComposedChart,
  // Brush,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import "bootstrap-icons/font/bootstrap-icons.css";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import "../css/contentgraph.css";
import io from "socket.io-client";
const socket = io("http://localhost:5000");

export default function Assessmentuserone() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [token, setToken] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [patientFormsone, setPatientFormsone] = useState("");
  const location = useLocation();
  const { id } = location.state || {};
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [detail, setDetail] = useState("");
  const [PPS, setPPS] = useState("");
  const [statusName, setStatusName] = useState("");
  const [dateass, setDateass] = useState([]);
  const [dateModified, setDateModified] = useState([]);
  const [isAssessed, setIsAssessed] = useState(false);
  const [patientdata, setPatientData] = useState([]);
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [mpersonnel, setMPersonnel] = useState([]);
  const [medicalData, setMedicalData] = useState([]);
  const [symptomsCount, setSymptomsCount] = useState([]);
  const [timeRange, setTimeRange] = useState("7days");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const [userId, setUserId] = useState("");
  const bellRef = useRef(null);
  const [historyass, setHistoryAss] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [history, setHistory] = useState([]);
  const [assessmentId, setAssessmentId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [min, setMin] = useState({
    SBP: "",
    DBP: "",
    PulseRate: "",
    Temperature: "",
    DTX: "",
    Respiration: "",
  });
  const [max, setMax] = useState({
    SBP: "",
    DBP: "",
    PulseRate: "",
    Temperature: "",
    DTX: "",
    Respiration: "",
  });
  const [painscore, setPainscore] = useState("");
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [userUnreadCounts, setUserUnreadCounts] = useState([]);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const textareaDetailRef = useRef(null);
  const textareaSuggestionRef = useRef(null);
  const hasFetchedUserData = useRef(false);
  const [unreadCountsByType, setUnreadCountsByType] = useState({
    assessment: 0,
    abnormal: 0,
    normal: 0,
  });

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [originalData, setOriginalData] = useState({
    suggestion: "",
    detail: "",
    status_name: "",
    PPS: "",
  });

  useEffect(() => {
    if (isEditMode) {
      setOriginalData({
        suggestion,
        detail,
        status_name: statusName,
        PPS,
      });
    }
  }, [isEditMode]);

  const isDataChanged = () => {
    return (
      originalData.suggestion !== suggestion ||
      originalData.detail !== detail ||
      originalData.status_name !== statusName ||
      originalData.PPS !== PPS
    );
  };

  const handleCancelEdit = () => {
    setSuggestion(originalData.suggestion);
    setDetail(originalData.detail);
    setStatusName(originalData.status_name);
    setPPS(originalData.PPS);
    setIsEditMode(false);
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
  }, []);

  const markAllByTypeAsViewed = (type) => {
    fetch("http://localhost:5000/alerts/mark-all-viewed-by-type", {
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
  useEffect(() => {
    const fetchpatientForms = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getpatientformsone/${id}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setPatientFormsone(data.data);
      } catch (error) {
        console.error("Error fetching patient forms:", error);
      }
    };

    fetchpatientForms();
  }, [id, token]);

  useEffect(() => {
    if (patientFormsone.user && patientFormsone._id) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getuser/${patientFormsone.user}`
          );
          const data = await response.json();
          setName(data.name);
          setSurname(data.surname);
          setGender(data.gender);
          setBirthday(data.birthday);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();
    }
  }, [patientFormsone.user, patientFormsone._id]);

  useEffect(() => {
    if (patientFormsone && patientFormsone.user) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicalInformation/${patientFormsone.user}`
          );
          const data = await response.json();
          console.log("Medical Information:", data);
          setMedicalData(data.data);
        } catch (error) {
          console.error("Error fetching medical information:", error);
        }
      };

      fetchMedicalInfo();
    }
  }, [patientFormsone.user, patientFormsone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!statusName && !PPS) {
      toast.error("กรุณาเลือกค่า PPS และสถานะการประเมินอาการ");
      return;
    }

    if (!statusName) {
      toast.error("กรุณาเลือกสถานะการประเมินอาการ");
      return;
    }
    if (!PPS) {
      toast.error("กรุณาเลือกค่า PPS");
      return;
    }

    fetch("http://localhost:5000/addassessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        suggestion,
        detail,
        status_name: statusName,
        PPS,
        MPersonnel: data._id,
        PatientForm: { _id: id },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          toast.success("ประเมินอาการสำเร็จ");
          setTimeout(() => {
            navigate("/assessmentuser", {
              state: { id: patientFormsone.user },
            });
          }, 1000);
        }
      });
  };

  const fetchAssessments = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/allAssessments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      const currentAssessment = data.data.find(
        (assessment) => assessment.PatientForm === patientFormsone._id
      );
      if (currentAssessment) {
        setIsAssessed(true);
        setStatusName(currentAssessment.status_name);
        setPPS(currentAssessment.PPS);
        setDetail(currentAssessment.detail);
        setSuggestion(currentAssessment.suggestion);
        setMPersonnel(currentAssessment.MPersonnel);
        setDateass(currentAssessment.createdAt);
        setDateModified(currentAssessment.updatedAt);
        setAssessmentId(currentAssessment._id);
        setHistoryAss(currentAssessment.history || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  }, [token, patientFormsone._id]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const handleEditAssessment = () => {
    setIsEditMode(true);
  };
  const handleViewHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/assessment/${assessmentId}`
      );
      const data = await response.json();
      setHistory(data.data.history);
      setHistoryVisible(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
  const [chartWidth, setChartWidth] = useState("100%");
  const [chartHeight, setChartHeight] = useState(300);
  
  useEffect(() => {
    const updateChartSize = () => {
      if (window.innerWidth < 576) {
        setChartWidth("100%"); 
        setChartHeight(200);
      } else if (window.innerWidth < 768) {
        setChartWidth("100%");
        setChartHeight(220);
      } else if (window.innerWidth < 992) {
        setChartWidth("100%");
        setChartHeight(270);
      } else {
        setChartWidth("100%");
        setChartHeight(300);
      }
    };
  
    updateChartSize(); // เรียกใช้ครั้งแรก
    window.addEventListener("resize", updateChartSize); // 📌 อัปเดตเมื่อ resize
  
    return () => window.removeEventListener("resize", updateChartSize); // ลบ event เมื่อ component ออกจาก DOM
  }, []);

  
  const handleUpdateAssessment = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/updateassessment/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion,
          detail,
          status_name: statusName,
          PPS,
          MPersonnel: data._id,
        }),
      });
      setTimeout(() => {
        toast.success("แก้ไขสำเร็จ");
      }, 1000);
      setIsEditMode(false);
      fetchAssessments(); // รีเฟรชข้อมูลใหม่
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  const threshold = {
    SBP: { min: 90, max: 140 },
    DBP: { min: 60, max: 90 },
    PulseRate: { min: 60, max: 100 },
    Temperature: { min: 36.5, max: 37.5 },
    DTX: { min: 70, max: 110 },
    Respiration: { min: 16, max: 20 },
    Painscore: 5,
  };

  useEffect(() => {
    const fetchThreshold = async () => {
      if (patientFormsone && patientFormsone.user) {
        try {
          const token = window.localStorage.getItem("token");
          if (token) {
            const response = await fetch(
              "http://localhost:5000/get-threshold",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: patientFormsone.user,
                }),
              }
            );

            const data = await response.json();
            if (data.status === "success") {
              setMin({
                SBP: data.min.SBP,
                DBP: data.min.DBP,
                PulseRate: data.min.PulseRate,
                Temperature: data.min.Temperature,
                DTX: data.min.DTX,
                Respiration: data.min.Respiration,
              });

              setMax({
                SBP: data.max.SBP,
                DBP: data.max.DBP,
                PulseRate: data.max.PulseRate,
                Temperature: data.max.Temperature,
                DTX: data.max.DTX,
                Respiration: data.max.Respiration,
              });
              setPainscore(data.Painscore);
            } else {
              // ถ้าไม่พบข้อมูล threshold ใช้ค่าเริ่มต้น
              setMin({
                SBP: threshold.SBP.min,
                DBP: threshold.DBP.min,
                PulseRate: threshold.PulseRate.min,
                Temperature: threshold.Temperature.min,
                DTX: threshold.DTX.min,
                Respiration: threshold.Respiration.min,
              });

              setMax({
                SBP: threshold.SBP.max,
                DBP: threshold.DBP.max,
                PulseRate: threshold.PulseRate.max,
                Temperature: threshold.Temperature.max,
                DTX: threshold.DTX.max,
                Respiration: threshold.Respiration.max,
              });
              setPainscore(threshold.Painscore);
            }
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูล threshold:", error);
          toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล threshold");
        }
      }
    };

    fetchThreshold();
  }, [
    patientFormsone.user,
    patientFormsone,
    threshold.DBP.max,
    threshold.DBP.min,
    threshold.DTX.max,
    threshold.DTX.min,
    threshold.Painscore,
    threshold.PulseRate.max,
    threshold.PulseRate.min,
    threshold.Respiration.max,
    threshold.Respiration.min,
    threshold.SBP.max,
    threshold.SBP.min,
    threshold.Temperature.max,
    threshold.Temperature.min,
  ]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const filterDataByTimeRange = (data) => {
    const endDate = new Date(patientFormsone.createdAt);
    let startDate;

    if (timeRange === "7days") {
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeRange === "1month") {
      startDate = new Date(endDate);
      startDate.setMonth(endDate.getMonth() - 1);
    }

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/getPatientData/${patientFormsone.user}/${patientFormsone._id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            const filteredData = filterDataByTimeRange(data.data);
            setPatientData(filteredData);
          } else {
            console.error("Error fetching Blood Pressure data");
          }
        }
      } catch (error) {
        console.error("Error fetching Blood Pressure data:", error);
      }
    };

    fetchPatientData();
  }, [patientFormsone.user, patientFormsone._id, token, timeRange]);

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
  }, [currentDate, birthday]);

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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${
      year + 543
    } เวลา ${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    } น.`;
  };

  const CustomTooltipDTX = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{`ระดับน้ำตาลในเลือด: ${data.DTX} mg/dL`}</span>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPainscore = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{`ระดับความเจ็บปวด: ${data.Painscore}`}</span>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipTemperature = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{`อุณหภูมิ: ${data.Temperature} °C`}</span>
        </div>
      );
    }
    return null;
  };

  // const CustomTooltipBloodPressure = ({ active, payload }) => {
  //   if (active && payload && payload.length) {
  //     const data = payload[0].payload;
  //     return (
  //       <div className="custom-tooltip">
  //         <p className="label">{`${formatDate(data.createdAt)}`}</p>
  //         <span className="desc">{`SBP: ${data.SBP}`}</span>
  //         <span className="desc">{` DBP: ${data.DBP}`}</span>
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  const CustomTooltipSBP = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{`ความดันตัวบน: ${data.SBP} mmHg`}</span>
        </div>
      );
    }
    return null;
  };
  const CustomTooltipDBP = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{` ความดันตัวล่าง: ${data.DBP} mmHg`}</span>
        </div>
      );
    }
    return null;
  };
  const CustomTooltipPulseRate = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{`ชีพจร: ${data.PulseRate} ครั้ง/นาที`}</span>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipRespiration = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{`การหายใจ: ${data.Respiration} ครั้ง/นาที`}</span>
        </div>
      );
    }
    return null;
  };

  const handleBreadcrumbClick = () => {
    const waitForUser = setInterval(() => {
      if (patientFormsone?.user) {
        clearInterval(waitForUser);
        navigate("/assessmentuser", { state: { id: patientFormsone.user } });
      }
    }, 500);
  };
  

  const handleButtonClick = (value) => {
    setStatusName(value);
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const day = dateTime.getDate().toString().padStart(2, "0");
    const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
    const year = (dateTime.getFullYear() + 543).toString().slice(-2);
    const hours = dateTime.getHours().toString().padStart(2, "0");
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year}\n${hours}:${minutes}`;
  };

  const dynamicFontSize = window.innerWidth < 768 ? 10 : 12;


  useEffect(() => {
    const fetchSymptomsCount = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/countSymptoms/${patientFormsone.user}/${patientFormsone._id}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setSymptomsCount(data.symptomsCount);
        }
      } catch (error) {
        console.error("Error fetching symptoms count:", error);
      }
    };

    fetchSymptomsCount();
  }, [patientFormsone.user, patientFormsone._id]);

  useEffect(() => {
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

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setShowScrollTopButton(true);
    } else {
      setShowScrollTopButton(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const adjustTextareaHeight = (textarea) => {
    if (!textarea) return;

    textarea.style.height = "auto";

    if (textarea.scrollHeight > 100) {
      textarea.style.height = "200px";
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = textarea.scrollHeight + "px";
      textarea.style.overflowY = "hidden";
    }
  };
  useEffect(() => {
    if (isEditMode) {
      setTimeout(() => {
        adjustTextareaHeight(textareaDetailRef.current);
        adjustTextareaHeight(textareaSuggestionRef.current);
      }, 0);
    }
  }, [isEditMode]);

  const handleInputChange = (e, setter) => {
    const textarea = e.target;

    textarea.style.height = "auto";

    textarea.style.height = textarea.scrollHeight + "px";

    if (textarea.scrollHeight > 200) {
      textarea.style.overflowY = "auto";
      textarea.style.height = "200px";
    } else {
      textarea.style.overflowY = "hidden";
    }

    setter(textarea.value);
  };

  return (
    <main className="body">
      <ToastContainer />
      <div className={`sidebar ${isActive ? "active" : ""}`}>
        <div class="logo_content">
          <div class="logo">
            <div class="logo_name">
              <img src={logow} className="logow" alt="logo"></img>
            </div>
          </div>
          <i class="bi bi-list" id="btn" onClick={handleToggleSidebar}></i>
        </div>
        <ul class="nav-list">
          <li>
            <a href="home">
              <i class="bi bi-house"></i>
              <span class="links_name">หน้าหลัก</span>
            </a>
          </li>
          <li>
            <a href="assessment">
              <i class="bi bi-clipboard2-pulse"></i>
              <span class="links_name">ติดตาม/ประเมินอาการ</span>
            </a>
          </li>
          <li>
            <a href="allpatient">
              <i class="bi bi-people"></i>
              <span class="links_name">จัดการข้อมูลการดูแลผู้ป่วย</span>
            </a>
          </li>
          <li>
            <a href="assessreadiness">
              <i class="bi bi-clipboard-check"></i>
              <span class="links_name">ประเมินความพร้อมการดูแล</span>
            </a>
          </li>
          <li>
            <a href="assessinhomesss">
              <i class="bi bi-house-check"></i>
              <span class="links_name">แบบประเมินเยี่ยมบ้าน</span>
            </a>
          </li>
          <li>
            <a href="chat" style={{ position: "relative" }}>
              <i className="bi bi-chat-dots"></i>
              <span className="links_name">แช็ต</span>
              {userUnreadCounts.map((user) => {
                if (user?.userId && String(user.userId) === String(sender._id)) {
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
                <i
                  class="bi bi-box-arrow-right"
                  id="log_out"
                  onClick={logOut}
                ></i>
                <span class="links_name">ออกจากระบบ</span>
              </a>
            </li>
          </div>
        </ul>
      </div>

      <div className="home_content">
        <div className="homeheader">
          <div className="header">ติดตาม/ประเมินอาการ</div>
          <div className="profile_details">
            <ul className="nav-list">
              <li>
                <a
                  ref={bellRef}
                  className="bell-icon"
                  onClick={toggleNotifications}
                >
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
                <i className="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            {location.state?.fromAbnormalCases ? (
              <>
                <li>
                  <a href="/abnormalcase" className="info">
                    บันทึกผู้ป่วยที่มีอาการผิดปกติ
                  </a>
                </li>
                <li className="arrow">
                  <i className="bi bi-chevron-double-right"></i>
                </li>
                <li>
                  <a>รายละเอียดอาการผู้ป่วย</a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="assessment" className="info">
                    ติดตาม/ประเมินอาการ
                  </a>
                </li>
                <li className="arrow">
                  <i class="bi bi-chevron-double-right"></i>
                </li>
                <li>
                  <a onClick={handleBreadcrumbClick} className="info">
                    การบันทึกอาการผู้ป่วย
                  </a>
                </li>
                <li className="arrow">
                  <i class="bi bi-chevron-double-right"></i>
                </li>
                <li>
                  <a>รายละเอียดอาการผู้ป่วย</a>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="content">
        <div className="patient-card-ass patient-card-style">
            <p className="patient-name">
              <label>ข้อมูลผู้ป่วย</label>
            </p>

            <div className="info-container">
              <div className="info-row">
                <div className="info-item">
                  <label>ชื่อ-สกุล:</label>{" "}
                  <span>
                    {name} {surname}
                  </span>
                </div>
                <div className="info-item">
                  <label>อายุ:</label>{" "}
                  <span>
                    {birthday
                      ? `${userAge} ปี ${userAgeInMonths} เดือน`
                      : "0 ปี 0 เดือน"}
                  </span>
                </div>
                <div className="info-item">
                  <label>เพศ:</label> <span>{gender}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-item">
                  <label>HN:</label>{" "}
                  <span>{medicalData?.HN || "ไม่มีข้อมูล"}</span>
                </div>
                <div className="info-item">
                  <label>AN:</label>{" "}
                  <span>{medicalData?.AN || "ไม่มีข้อมูล"}</span>
                </div>
                <div className="info-item full-width">
                  <label>ผู้ป่วยโรค:</label>{" "}
                  <span>{medicalData?.Diagnosis || "ไม่มีข้อมูล"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="contentin-outmost">
            <div className="divdate">
              <b className="textdate" align="center">
                วันที่บันทึก: {formatDate(patientFormsone.createdAt)}
              </b>
            </div>
            <div className="content-in">
              <p className="textheadSymptom-center">สัญญาณชีพ</p>
              <div className="container-ass">
                <div className="left-column">
                  <div className="patient-data">
                    <label className="title-Vitalsigns">อุณหภูมิ:</label>
                    <p className="text">{patientFormsone.Temperature || "-"}</p>
                    <p className="text-unit">°C</p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">ความดันตัวบน:</label>
                    <p className="text">{patientFormsone.SBP || "-"} </p>
                    <p className="text-unit">mmHg</p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">ความดันตัวล่าง:</label>
                    <p className="text">{patientFormsone.DBP || "-"}</p>
                    <p className="text-unit">mmHg</p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">ชีพจร:</label>
                    <p className="text">{patientFormsone.PulseRate || "-"}</p>
                    <p className="text-unit">ครั้ง/นาที</p>
                  </div>
                </div>

                <div className="right-column">
                  <div className="patient-data">
                    <label className="title-Vitalsigns">การหายใจ:</label>
                    <p className="text">{patientFormsone.Respiration || "-"}</p>
                    <p className="text-unit">ครั้ง/นาที</p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">
                      ระดับความเจ็บปวด:
                    </label>
                    <p className="text">{patientFormsone.Painscore || "-"}</p>
                    <p className="text-unit"></p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">DTX:</label>
                    <p className="text">{patientFormsone.DTX || "-"}</p>
                    <p className="text-unit">mg/dL</p>
                  </div>
                </div>
              </div>

              <p className="textheadSymptom-center">อาการและอาการแสดง</p>

              <div className="symptom-item-container">
                {patientFormsone.Symptoms &&
                  patientFormsone.Symptoms.map((symptom, index) => (
                    <div className="symptom-item" key={index}>
                      <label className="title-symtom">{`อาการที่ ${
                        index + 1
                      }: `}</label>
                      <span className="text-symtom">{symptom}</span>
                    </div>
                  ))}
              </div>

              <p className="textheadSymptom-center">
                ความถี่ของอาการ
                <span className="bracket">(นับรวมการบันทึกปัจจุบัน)</span>
              </p>
              <div className="inline-containersymtoms-count">
                {symptomsCount.map((symptom) => (
                  <p className="symtoms-count" key={symptom._id}>
                    {symptom._id}: {symptom.count}{" "}
                  </p>
                ))}
              </div>
              <div className="inline-container">
                <label className="textheadSymptom">ความรุนแรงของอาการ:</label>
                <p className="text-symtom-inline">
                  <span
                    className={
                      patientFormsone.LevelSymptom?.trim() === "ดีขึ้น"
                        ? "up-normal-status-LevelSymptom"
                        : patientFormsone.LevelSymptom === "พอ ๆ เดิม"
                        ? "normal-status-LevelSymptom"
                        : patientFormsone.LevelSymptom?.trim() === "แย่ลง"
                        ? "abnormal-status-LevelSymptom"
                        : "end-of-treatment-status"
                    }
                  >
                    &nbsp;{patientFormsone.LevelSymptom || "-"}
                  </span>
                </p>
              </div>
              <div className="inline-container help">
                <label className="textheadSymptom">
                  สิ่งที่อยากให้ทีมแพทย์ช่วยเหลือเพิ่มเติม:
                </label>
                <p className="text-symtom-inline">
                  &nbsp;{patientFormsone.request_detail || "-"}
                </p>
              </div>
              <div className="inline-container">
                <label className="textheadSymptom">ผู้บันทึก:</label>
                <p className="text-symtom-inline">
                  &nbsp;{patientFormsone.Recorder || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* <div className="contentinass"> */}
          <div className="contentgraphs">
            <div className="selecttime">
              <label htmlFor="timeRange">เลือกช่วงเวลาแสดงกราฟ:</label>
              <span> </span>
              <select
                id="timeRange"
                value={timeRange}
                onChange={handleTimeRangeChange}
              >
                <option value="7days">7 วัน</option>
                <option value="1month">1 เดือน</option>
              </select>
            </div>
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="Temperature"></div>
                  <span className="head-graph">อุณหภูมิ (°C)</span>
                </div>
              </div>
              {patientdata && (
                 <div className="chart-wrapper"> 
                <div className="chart-containerass1">
                <ResponsiveContainer width={chartWidth} height={chartHeight}>

                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={patientdata}
                       margin={
                           timeRange === "1month"
                             ? { top: 10, right: 30, left: 0, bottom: 0 }  // ลด bottom เป็น 0
                             : { top: 10, right: 30, left: 0, bottom: 10 } // ค่าปกติ
                         }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      {/* <XAxis
                        dataKey="createdAt"
                        tickFormatter={formatDateTime}
                        interval="preserveStartEnd"
                        minTickGap={5}
                        tickLine={timeRange === "1month" ? false : true}
                        tick={
                          timeRange === "1month"
                            ? false
                            : { fontSize: 10, lineHeight: 1.5 }
                        }
                      />{" "} */}
                        <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />
                      <YAxis
                        domain={[30, 40]}
                        tick={{ fontSize: window.innerWidth < 768 ? 8 : 10 }} 
                        ticks={[30, 32, 34, 36, 38, 40]}
                        // hide={timeRange !== "1month"}
                      />
                      <Tooltip content={<CustomTooltipTemperature />} />
                      <ReferenceLine
                        y={min.Temperature}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Min",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <ReferenceLine
                        y={max.Temperature}
                        stroke="#ff0000"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Max",
                          fill: "#ff0000",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Temperature"
                        stroke="rgb(229, 113, 63)"
                        fill="rgb(229, 113, 63,0.3)"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="Temperature"
                        stroke="#e5713f"
                        strokeWidth={3}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        connectNulls={true}
                      >
                      </Line>                    
                    </ComposedChart>
                  </ResponsiveContainer>    
                </div>          
                </div>          
              )}
             {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)}{" "}{" "}-{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>

            
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="SBP"></div>
                  <span className="head-graph">ความดันตัวบน (mmHg)</span>
                </div>
              </div>
              {patientdata && (
                <div className="chart-wrapper"> 
                <div className="chart-containerass1">
                <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <ComposedChart
                      data={patientdata}
                      margin={
                        timeRange === "1month"
                          ? { top: 10, right: 30, left: 0, bottom: 0 } 
                          : { top: 10, right: 30, left: 0, bottom: 10 } 
                      }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />
                      <YAxis
                        domain={[80, 200]} 
                        tickCount={12}
                        ticks={[80, 100, 120, 140, 160, 180, 200]}
                        tick={{ fontSize: window.innerWidth < 768 ? 8 : 10 }} 
                      />
                      <Tooltip content={<CustomTooltipSBP />} />
                      <ReferenceLine
                        y={min.SBP}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Min",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <ReferenceLine
                        y={max.SBP}
                        stroke="#ff0000"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Max",
                          fill: "#ff0000",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="SBP"
                        stroke="rgb(93, 93, 233)"
                        fill="rgb(93, 93, 233,0.3)"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="SBP"
                        name="ความดันตัวบน"
                        stroke="rgb(93, 93, 233)"
                        strokeWidth={3}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        connectNulls={true}
                      >
                      </Line>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </div>
              )}
              {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)} {" "}-{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>

            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="DBP"></div>
                  <span className="head-graph">ความดันตัวล่าง (mmHg)</span>
                </div>
              </div>
              {patientdata && (
                <div className="chart-wrapper">
                <div className="chart-containerass1">
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <ComposedChart
                      data={patientdata}
                      margin={
                           timeRange === "1month"
                             ? { top: 10, right: 30, left: 0, bottom: 0 }  
                             : { top: 10, right: 30, left: 0, bottom: 10 } 
                         }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />
                      <YAxis
                        domain={[50, 120]}
                        ticks={[50, 60, 70, 80, 90, 100, 110, 120]}
                        tick={{ fontSize: 12 }}
                        // padding={{ top: 10, bottom: 10 }}
                      />
                      <Tooltip content={<CustomTooltipDBP />} />
                      <ReferenceLine
                        y={min.DBP}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Min",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <ReferenceLine
                        y={max.DBP}
                        stroke="#ff0000"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Max",
                          fill: "#ff0000",
                          fontSize: dynamicFontSize,
                        }}
                      />

                      {/* <Legend verticalAlign="top" align="center" wrapperStyle={{ color: '#000' }} /> */}

                      <Area
                        type="monotone"
                        dataKey="DBP"
                        stroke="#5ec1ff"
                        fill="rgb(94, 193, 255,0.3)"
                        connectNulls={true}
                        legendType="none"
                      />
                      <Line
                        type="monotone"
                        dataKey="DBP"
                        name="ความดันตัวล่าง"
                        stroke="#5ec1ff"
                        // fill="rgb(94, 193, 255,0.3)"
                        strokeWidth={3}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        // dot={
                        //   timeRange === "1month" ? (
                        //     false
                        //   ) : (
                        //     <CustomDot dataKey="DBP" />
                        //   )
                        // }
                        connectNulls={true}
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="DBP"
                            position="inside"
                            style={{ fill: "white", fontSize: "10" }}
                            dot={<CustomDot dataKey="DBP" />}
                          />
                        )} */}
                      </Line>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </div>
              )}
              {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)} {" "}-{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="PulseRate"></div>
                  <span className="head-graph">ชีพจร (ครั้ง/นาที)</span>
                </div>
              </div>
              {patientdata && (
                <div className="chart-wrapper">
                <div className="chart-containerass1">
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={patientdata}
                      margin={
                           timeRange === "1month"
                             ? { top: 10, right: 30, left: 0, bottom: 0 }  
                             : { top: 10, right: 30, left: 0, bottom: 10 } 
                         }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />{" "}
                      {/* {timeRange === "1month" && (
                        <YAxis
                          tick={{ fontSize: 10 }}
                          ticks={[0, 25, 50, 75, 100, 125, 150]}
                        />
                      )} */}
                      <YAxis
                        domain={[0, 150]}
                        tick={{ fontSize: 10 }}
                        ticks={[0, 25, 50, 75, 100, 125, 150]}
                      />
                      <Tooltip content={<CustomTooltipPulseRate />} />
                      <ReferenceLine
                        y={min.PulseRate}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Min",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <ReferenceLine
                        y={max.PulseRate}
                        stroke="#ff0000"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Max",
                          fill: "#ff0000",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="PulseRate"
                        stroke="rgb(224, 44, 98)"
                        fill="rgb(224, 44, 98,0.3)"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="PulseRate"
                        stroke="rgb(224, 44, 98)"
                        strokeWidth={3}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={1500}
                      >
                      </Line>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </div>
              )}
              {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)} {" "}-{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>

            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="Respiration"></div>
                  <span className="head-graph">การหายใจ (ครั้ง/นาที)</span>
                </div>
              </div>
              {patientdata && (
                <div className="chart-wrapper">
                <div className="chart-containerass1">
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={patientdata}
                      // margin={
                      //   timeRange === "1month"
                      //     ? { top: 0, right: 0, left: -30, bottom: 0 }
                      //     : { right: 28, left: 28 }
                      // }
                      margin={
                           timeRange === "1month"
                             ? { top: 10, right: 30, left: 0, bottom: 0 }  
                             : { top: 10, right: 30, left: 0, bottom: 10 } 
                         }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />{" "}
                      <YAxis
                        tick={{ fontSize: 10 }}
                        ticks={[0, 10, 20, 30, 40]}
                        // hide={timeRange !== "1month"}
                      />
                      <Tooltip content={<CustomTooltipRespiration />} />
                      <ReferenceLine
                        y={min.Respiration}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Min",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <ReferenceLine
                        y={max.Respiration}
                        stroke="#ff0000"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Max",
                          fill: "#ff0000",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Respiration"
                        stroke="rgb(44, 223, 71)"
                        fill="rgb(44, 223, 71,0.3)"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="Respiration"
                        stroke="rgb(44, 223, 71)"
                        strokeWidth={3}
                        // dot={
                        //   timeRange === "1month" ? (
                        //     false
                        //   ) : (
                        //     <CustomDot dataKey="Respiration" />
                        //   )
                        // }
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={1500}
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="Respiration"
                            position="inside"
                            style={{ fill: "white", fontSize: "10" }}
                          />
                        )} */}
                      </Line>
                      {/* {timeRange === "1month" && (
                      <Brush
                        tickFormatter={formatDateTime}
                        dataKey="createdAt"
                        height={15}
                        style={{ fontSize: "10" }}
                        stroke="#878787"
                      />
                    )} */}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </div>
              )}
              {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)} {" "}-{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="Painscore"></div>
                  <span className="head-graph">ระดับความเจ็บปวด</span>
                </div>
              </div>
              {patientdata && (
                <div className="chart-wrapper">
                <div className="chart-containerass1">
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={patientdata}
                      margin={
                           timeRange === "1month"
                             ? { top: 10, right: 30, left: 0, bottom: 0 }  
                             : { top: 10, right: 30, left: 0, bottom: 10 } 
                         }
                      // margin={
                      //   timeRange === "1month"
                      //     ? { top: 0, right: 0, left: -30, bottom: 0 }
                      //     : { right: 28, left: 28 }
                      // }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />

                      <YAxis
                        domain={[0, 10]}
                        tick={{ fontSize: 10 }}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        // hide={timeRange !== "1month"}
                      />

                      <Tooltip content={<CustomTooltipPainscore />} />
                      <ReferenceLine
                        y={painscore}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Med",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="Painscore"
                        stroke="rgb(197, 44, 224)"
                        fill="rgb(197, 44, 224,0.3)"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="Painscore"
                        stroke="rgb(197, 44, 224)"
                        // fill="rgb(197, 44, 224,0.3)"
                        name="ระดับความเจ็บปวด"
                        strokeWidth={3}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        // dot={timeRange === "1month" ? false : <CustomDot />}
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={1500}
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="Painscore"
                            position="inside"
                            style={{ fill: "white", fontSize: "10" }}
                          />
                        )} */}
                      </Line>
                      {/* {timeRange === "1month" && (
                      <Brush
                        tickFormatter={formatDateTime}
                        dataKey="createdAt"
                        height={15}
                        style={{ fontSize: "10" }}
                        stroke="#878787"
                      />
                    )} */}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </div>
              )}
              {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)} {" "}-{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>

            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="dtx"></div>
                  <span className="head-graph">ระดับน้ำตาลในเลือด (mg/dL)</span>
                </div>
              </div>
              {patientdata && (
                <div className="chart-wrapper">
                <div className="chart-containerass1">
                  <ResponsiveContainer width={chartWidth} height={chartHeight}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={patientdata}
                      margin={
                           timeRange === "1month"
                             ? { top: 10, right: 30, left: 0, bottom: 0 }  
                             : { top: 10, right: 30, left: 0, bottom: 10 } 
                         }
                      // margin={
                      //   timeRange === "1month"
                      //     ? { top: 0, right: 0, left: -30, bottom: 0 }
                      //     : { right: 28, left: 28 }
                      // }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />
                      {/* {timeRange === "1month" && ( */}
                      <YAxis
                        domain={[60, 180]}
                        tick={{ fontSize: 10 }}
                        ticks={[60, 85, 110, 135, 160, 185, 210]}
                      />
                      {/* )} */}
                      <Tooltip content={<CustomTooltipDTX />} />
                      <ReferenceLine
                        y={min.DTX}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Min",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <ReferenceLine
                        y={max.DTX}
                        stroke="#ff0000"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Max",
                          fill: "#ff0000",
                          fontSize: dynamicFontSize,
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="DTX"
                        stroke="rgb(237, 219, 51)"
                        fill="rgb(237, 219, 51,0.3)"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="DTX"
                        stroke="rgb(237, 219, 51)"
                        strokeWidth={3}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        // dot={timeRange === "1month" ? false : <CustomDot />}
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={1500}
                      ></Line>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                </div>
              )}
              {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)} {" "}-{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>
          </div>

          {isAssessed ? (
            <div className="contentin-outmost-ass">
              <div className="divass">
                <div className="inline-container-ass">
                  <b className="textass" align="center">
                    การประเมินอาการ
                  </b>
                  {(data._id === mpersonnel._id || historyass.length > 0) && (
                    <div
                      className="ellipsis-btn"
                      onClick={() => setShowMenu(!showMenu)}
                    >
                      <i class="bi bi-three-dots-vertical"></i>
                    </div>
                  )}
                </div>

                <div
                  className={`ellipsis-menu ${showMenu ? "show" : ""}`}
                  ref={menuRef}
                >
                  {/* เมนูที่แสดงขึ้น */}
                  {showMenu && (
                    <div className="menu-content">
                      {data._id === mpersonnel._id && (
                        <div
                          className="menu-item"
                          onClick={handleEditAssessment}
                        >
                          <span className="icon">
                            <i className="bi bi-pencil-fill"></i>
                          </span>{" "}
                          แก้ไข
                        </div>
                      )}
                      {historyass.length > 0 && (
                        <div className="menu-item" onClick={handleViewHistory}>
                          <span className="icon">
                            <i className="bi bi-clock-history"></i>
                          </span>{" "}
                          ดูประวัติการแก้ไข
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="content-in-ass">
                <div className="assessment-section pps-section">
                  <label className="title-ass-inside">PPS: </label>
                  <p className="text-ass-inside">{PPS || "-"}</p>
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">ผลการประเมินอาการ:</label>
                  <div
                    className={`status-indicator ${
                      statusName === "ปกติ"
                        ? "btn-normal"
                        : statusName === "ผิดปกติ"
                        ? "btn-abnormal"
                        : statusName === "เคสฉุกเฉิน"
                        ? "btn-Emergency"
                        : "btn-completed"
                    }`}
                    onClick={() => handleButtonClick(statusName)}
                  >
                    {statusName}
                  </div>
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">
                    รายละเอียดสำหรับแพทย์:{" "}
                  </label>
                  <p className="text-ass-inside">{detail || "-"}</p>
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">
                    คำแนะนำสำหรับผู้ป่วย:{" "}
                  </label>
                  <p className="text-ass-inside">{suggestion || "-"}</p>
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">ผู้ประเมิน: </label>
                  <p className="text-ass-inside">
                    {mpersonnel.nametitle} {mpersonnel.name}{" "}
                    {mpersonnel.surname}
                  </p>
                </div>
                <div className="assessment-section">
                  <label className="title-ass-inside">วันที่ประเมิน: </label>
                  <p className="text-ass-inside">{formatDate(dateass)}</p>
                </div>
                {historyass.length > 0 && (
                  <div className="assessment-section">
                    <label className="title-ass-inside">
                      วันที่แก้ไขล่าสุด:{" "}
                    </label>
                    <p className="text-ass-inside">
                      {formatDate(dateModified)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="contentin-outmost-ass">
              <div className="divass">
                <b className="textass" align="center">
                  ประเมินอาการ
                </b>
              </div>
              <div className="content-in-ass">
                <form onSubmit={handleSubmit}>
                  <div className="inline-ass">
                    <label className="title-ass">PPS:</label>
                    <select
                      className="form-select select"
                      onChange={(e) => setPPS(e.target.value)}
                    >
                      <option value="">กรุณาเลือก</option>
                      <option value="0">0</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="40">40</option>
                      <option value="50">50</option>
                      <option value="60">60</option>
                      <option value="70">70</option>
                      <option value="80">80</option>
                      <option value="90">90</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                  <div className="inline-ass">
                    <label className="title-ass">ประเมินอาการ:</label>
                    <div className="btn-group-status-name">
                      <div
                        className={`btn-ass ${
                          statusName === "ปกติ" ? "btn-normal" : "btn-outline"
                        }`}
                        onClick={() => handleButtonClick("ปกติ")}
                      >
                        ปกติ
                      </div>
                      <div
                        className={`btn-ass ${
                          statusName === "ผิดปกติ"
                            ? "btn-abnormal"
                            : "btn-outline"
                        }`}
                        onClick={() => handleButtonClick("ผิดปกติ")}
                      >
                        ผิดปกติ
                      </div>
                      <div
                        className={`btn-ass ${
                          statusName === "เคสฉุกเฉิน"
                            ? "btn-Emergency"
                            : "btn-outline"
                        }`}
                        onClick={() => handleButtonClick("เคสฉุกเฉิน")}
                      >
                        เคสฉุกเฉิน
                      </div>
                      <div
                        className={`btn-ass ${
                          statusName === "สิ้นสุดการรักษา"
                            ? "btn-completed"
                            : "btn-outline"
                        }`}
                        onClick={() => handleButtonClick("สิ้นสุดการรักษา")}
                      >
                        สิ้นสุดการรักษา
                      </div>
                      <input type="hidden" value={statusName} />
                    </div>
                  </div>

                  <div className="inline-ass">
                    <label className="title-ass">รายละเอียดสำหรับแพทย์: </label>
                    <textarea
                      className="form-control form-control-ass"
                      onChange={(e) => handleInputChange(e, setDetail)}
                      rows="2" // กำหนดจำนวนแถวเริ่มต้น
                      style={{ resize: "vertical" }}
                    ></textarea>
                  </div>

                  <div className="inline-ass">
                    <label className="title-ass">คำแนะนำสำหรับผู้ป่วย: </label>
                    <textarea
                      className="form-control form-control-ass"
                      onChange={(e) => handleInputChange(e, setSuggestion)}
                      // rows="1"
                      // style={{
                      //   overflowY: "hidden",
                      //   resize: "none",
                      //   maxHeight: "200px",
                      // }}
                      rows="2" // กำหนดจำนวนแถวเริ่มต้น
                      style={{ resize: "vertical" }}
                    ></textarea>
                  </div>

                  <div className="d-grid save-ass">
                    <button type="submit" className="btn btnsave-ass py-2">
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        {isEditMode && (
          <div
            className="edit-modal-overlay"
            onClick={() => setIsEditMode(false)}
          >
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="edit-modal-header">
                <h4>แก้ไขการประเมิน</h4>
              </div>
              <form onSubmit={handleUpdateAssessment}>
                <div className="model-edit-ass">
                  <label>PPS:</label>
                  <select
                    className="form-control"
                    value={PPS}
                    onChange={(e) => setPPS(e.target.value)}
                  >
                    <option value="">กรุณาเลือก PPS</option>
                    {[...Array(11)].map((_, i) => (
                      <option key={i} value={i * 10}>
                        {i * 10}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="model-edit-ass">
                  <label>ประเมินอาการ:</label>
                  <div className="btn-group-status-name">
                    <div
                      className={`btn-ass ${
                        statusName === "ปกติ" ? "btn-normal" : "btn-outline"
                      }`}
                      onClick={() => handleButtonClick("ปกติ")}
                    >
                      ปกติ
                    </div>
                    <div
                      className={`btn-ass ${
                        statusName === "ผิดปกติ"
                          ? "btn-abnormal"
                          : "btn-outline"
                      }`}
                      onClick={() => handleButtonClick("ผิดปกติ")}
                    >
                      ผิดปกติ
                    </div>
                    <div
                      className={`btn-ass ${
                        statusName === "เคสฉุกเฉิน"
                          ? "btn-Emergency"
                          : "btn-outline"
                      }`}
                      onClick={() => handleButtonClick("เคสฉุกเฉิน")}
                    >
                      เคสฉุกเฉิน
                    </div>
                    <div
                      className={`btn-ass ${
                        statusName === "สิ้นสุดการรักษา"
                          ? "btn-completed"
                          : "btn-outline"
                      }`}
                      onClick={() => handleButtonClick("สิ้นสุดการรักษา")}
                    >
                      สิ้นสุดการรักษา
                    </div>
                  </div>
                </div>
                <div className="model-edit-ass">
                  <label>รายละเอียดสำหรับแพทย์:</label>
                  <textarea
                    ref={textareaDetailRef}
                    value={detail}
                    className="form-control"
                    onChange={(e) => {
                      setDetail(e.target.value); // อัปเดต state
                      adjustTextareaHeight(e.target); // ปรับความสูง
                    }}
                    rows="1"
                    style={{
                      overflowY: "hidden",
                      resize: "none",
                      maxHeight: "100px",
                    }}
                  ></textarea>

                  {/* <textarea
                  className="form-control"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                /> */}
                </div>
                <div className="model-edit-ass">
                  <label>คำแนะนำสำหรับผู้ป่วย:</label>
                  {/* <textarea
                 value={suggestion}
                      className="form-control"
                      onChange={(e) => handleInputChange(e, setSuggestion)}
                      rows="1"
                      style={{
                        overflowY: "hidden",
                        resize: "none",
                        maxHeight: "100px",
                      }}
                    ></textarea> */}
                  <textarea
                    ref={textareaSuggestionRef}
                    value={suggestion}
                    className="form-control"
                    onChange={(e) => {
                      setSuggestion(e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    rows="1"
                    style={{
                      overflowY: "hidden",
                      resize: "none",
                      maxHeight: "100px",
                    }}
                  ></textarea>
                  {/* <textarea
                  className="form-control"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                /> */}
                </div>
                <div className="button-group-EditMode">
                  <button
                    disabled={!isDataChanged()}
                    type="submit"
                    className="btn-EditMode btnsave"
                  >
                    บันทึกการแก้ไข
                  </button>
                  <button
                    type="button"
                    className="btn-EditMode btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {historyVisible && (
          <div
            className="history-modal-overlay"
            onClick={() => setHistoryVisible(false)}
          >
            <div className="history-modal">
              <div className="history-modal-header">
                <h4>ประวัติการแก้ไข</h4>
                <button
                  className="close-btn"
                  onClick={() => setHistoryVisible(false)}
                >
                  X
                </button>
              </div>

              <div className="seccond-history-modal">
                <ul className="history-list">
                  {history.map((item, index) => (
                    <li key={index} className="history-item">
                      <div className="history-item-body">
                        <p>
                          PPS:{" "}
                          <strong>
                            <span className="pps">{item.PPS}</span>
                          </strong>
                        </p>
                        <div className="history-item-header">
                          {/* <div className="mb-3"> */}
                          ผลการประเมินอาการ:
                          <div className="btn-group-history">
                            {item.status_name === "ปกติ" && (
                              <div className="btn-ass btn-normal">
                                {item.status_name}
                              </div>
                            )}
                            {item.status_name === "ผิดปกติ" && (
                              <div className="btn-ass btn-abnormal">
                                {item.status_name}
                              </div>
                            )}
                            {item.status_name === "เคสฉุกเฉิน" && (
                              <div className="btn-ass btn-Emergency">
                                {item.status_name}
                              </div>
                            )}
                            {item.status_name === "สิ้นสุดการรักษา" && (
                              <div className="btn-ass btn-completed">
                                {item.status_name}
                              </div>
                            )}
                            {/* </div> */}
                          </div>
                        </div>
                        <p>
                          รายละเอียดสำหรับแพทย์:{" "}
                          <strong>
                            <span className="detail">{item.detail || "-"}</span>
                          </strong>
                        </p>
                        <p>
                          คำแนะนำสำหรับผู้ป่วย:{" "}
                          <strong>
                            <span className="suggestion">
                              {item.suggestion || "-"}
                            </span>
                          </strong>
                        </p>
                        <p>
                          แก้ไขโดย:{" "}
                          <strong>
                            <span className="updatedBy">
                              {item.updatedBy?.name || "N/A"}{" "}
                              {item.updatedBy?.surname || "N/A"}
                            </span>
                          </strong>
                        </p>
                        <p>
                          วันที่แก้ไข:{" "}
                          <strong>
                            <span className="date">
                              {formatDate(item.updatedAt)}
                            </span>
                          </strong>
                        </p>
                      </div>
                      <hr className="history-separator" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {showNotifications && (
          <div className="notifications-dropdown" ref={notificationsRef}>
            <div className="notifications-head">
              <h2 className="notifications-title">การแจ้งเตือน</h2>
            </div>
            <div className="notifications-filter">
              <div
                className={`notification-box ${
                  filterType === "all" ? "active" : ""
                }`}
                onClick={() => handleFilterChange("all")}
              >
                <div className="notification-item">
                  <i className="bi bi-bell"></i>
                  ทั้งหมด
                </div>
                <div className="notification-right">
                  {unreadCount > 0 && (
                    <span className="notification-count-noti">
                      {unreadCount}
                    </span>
                  )}
                  <i className="bi bi-chevron-right"></i>
                </div>
              </div>
              <div
                className={`notification-box ${
                  filterType === "abnormal" ? "active" : ""
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
                className={`notification-box ${
                  filterType === "normal" ? "active" : ""
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
                className={`notification-box ${
                  filterType === "assessment" ? "active" : ""
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
        {showScrollTopButton && (
          <button
            className="scroll-to-top-btn"
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: "1rem",
              right: "1rem",
              backgroundColor: "#87CEFA",
              color: "white",
              border: "none",
              borderRadius: "50%",
              padding: ".5em .8em",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            <i class="bi bi-caret-up-fill"></i>
          </button>
        )}
      </div>
    </main>
  );
}
