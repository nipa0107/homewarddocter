import React, { useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  LineChart,
  Line,
  LabelList,
  Area,
  ComposedChart,
  AreaChart,
  ReferenceArea,
  Brush,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import "bootstrap-icons/font/bootstrap-icons.css";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";

import "../css/contentgraph.css";
import io from "socket.io-client";
const socket = io("http://localhost:5000");
export default function Assessmentuserone({ }) {
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
  const [status_name, setstatus_name] = useState("");
  const [PPS, setPPS] = useState("");
  const [statusName, setStatusName] = useState("");
  const [dateass, setDateass] = useState([]);
  const [isAssessed, setIsAssessed] = useState(false);
  const [dtxdata, setDTXData] = useState([]);
  const [Painscoredata, setPainscoreData] = useState([]);
  const [Temperaturedata, setTemperatureData] = useState([]);
  const [BloodPressuredata, setBloodPressureData] = useState([]);
  const [PulseRateData, setPulseRateData] = useState([]);
  const [Respirationdata, setRespirationData] = useState([]);
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [mpersonnel, setMPersonnel] = useState([]);
  const [mpersonnelID, setMPersonnelID] = useState([]);
  const [medicalData, setMedicalData] = useState([]);
  const [symptomsCount, setSymptomsCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");
  const [allUsers, setAllUsers] = useState([]);
  const [datauser, setDatauser] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const [userId, setUserId] = useState("");
  const bellRef = useRef(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false); // ใช้ในการเปิด/ปิดการแสดง history
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

  useEffect(() => {
    socket?.on('newAlert', (alert) => {
      setAlerts(prevAlerts => [...prevAlerts, alert]);
      setUnreadCount(prevCount => prevCount + 1);
    });

    socket.on('deletedAlert', (data) => {
      setAlerts((prevAlerts) =>
        prevAlerts.filter((alert) => alert.patientFormId !== data.patientFormId)
      );
      setUnreadCount((prevCount) => prevCount - 1); // ลดจำนวน unread เมื่อ alert ถูกลบ
    });

    return () => {
      socket?.off('newAlert'); // Clean up the listener on component unmount
      socket.off('deletedAlert');
    };
  }, []);

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

  // แช็ตยังไม่อ่าน
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
  }, [patientFormsone.user]);

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
          console.log("22:", medicalData);
        } catch (error) {
          console.error("Error fetching medical information:", error);
        }
      };

      fetchMedicalInfo();
    }
  }, [patientFormsone.user]);

  const handleSubmit = (e) => {
    e.preventDefault();
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

  const fetchAssessments = async () => {
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
        setAssessmentId(currentAssessment._id);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [patientFormsone._id]);

  const handleEditAssessment = () => {
    setIsEditMode(true);
  };
  const handleViewHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/assessment/${assessmentId}`
      );
      const data = await response.json();
      setHistory(data.data.history); // ตั้งค่า history
      setHistoryVisible(true); // เปิดการแสดงผล history
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

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
        toast.success("แก้ไขสำเร็จ"); // แสดง toast หลังจาก 1 วินาที
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
        console.log("งง", patientFormsone.user);
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
  }, [patientFormsone.user]);

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
    const fetchDataBloodPressure = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/getBloodPressureData/${patientFormsone.user}/${patientFormsone._id}`,
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
            setBloodPressureData(filteredData);
          } else {
            console.error("Error fetching Blood Pressure data");
          }
        }
      } catch (error) {
        console.error("Error fetching Blood Pressure data:", error);
      }
    };

    fetchDataBloodPressure();
  }, [patientFormsone.user, patientFormsone._id, token, timeRange]);

  useEffect(() => {
    const fetchDataPulseRate = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/getPulseRateData/${patientFormsone.user}/${patientFormsone._id}`,
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
            setPulseRateData(filteredData);
          } else {
            console.error("Error fetching Temperature data");
          }
        }
      } catch (error) {
        console.error("Error fetching Painscore data:", error);
      }
    };

    fetchDataPulseRate();
  }, [patientFormsone.user, patientFormsone._id, token, timeRange]);
  useEffect(() => {
    const fetchDatadtx = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/getDTXData/${patientFormsone.user}/${patientFormsone._id}`,
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
            setDTXData(filteredData);
          } else {
            console.error("Error fetching DTX data");
          }
        }
      } catch (error) {
        console.error("Error fetching DTX data:", error);
      }
    };

    fetchDatadtx();
  }, [patientFormsone.user, patientFormsone._id, token, timeRange]);
  useEffect(() => {
    const fetchDataPainscore = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/getPainscoreData/${patientFormsone.user}/${patientFormsone._id}`,
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
            setPainscoreData(filteredData);
          } else {
            console.error("Error fetching Painscore data");
          }
        }
      } catch (error) {
        console.error("Error fetching Painscore data:", error);
      }
    };

    fetchDataPainscore();
  }, [patientFormsone.user, patientFormsone._id, token, timeRange]);

  useEffect(() => {
    const fetchDataTemperature = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/getTemperatureData/${patientFormsone.user}/${patientFormsone._id}`,
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
            setTemperatureData(filteredData);
          } else {
            console.error("Error fetching Temperature data");
          }
        }
      } catch (error) {
        console.error("Error fetching Temperature data:", error);
      }
    };

    fetchDataTemperature();
  }, [patientFormsone.user, patientFormsone._id, token, timeRange]);

  useEffect(() => {
    const fetchDataRespiration = async () => {
      try {
        if (patientFormsone.user && patientFormsone._id) {
          const response = await fetch(
            `http://localhost:5000/getRespirationData/${patientFormsone.user}/${patientFormsone._id}`,
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
            setRespirationData(filteredData);
          } else {
            console.error("Error fetching Temperature data");
          }
        }
      } catch (error) {
        console.error("Error fetching Painscore data:", error);
      }
    };

    fetchDataRespiration();
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

  const CustomTooltipBloodPressure = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <span className="desc">{`SBP: ${data.SBP}`}</span>
          <span className="desc">{` DBP: ${data.DBP}`}</span>
        </div>
      );
    }
    return null;
  };

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
    navigate("/assessmentuser", { state: { id: patientFormsone.user } });
  };

  const handleButtonClick = (value) => {
    setStatusName(value);
  };

  const CustomDot = ({ cx, cy, stroke, payload, dataKey }) => {
    const value = payload[dataKey];

    if (value === null || value === undefined || value === "") {
      return null;
    }

    return (
      <svg x={cx - 20} y={cy - 10.5} width={40} height={20} viewBox="0 0 40 20">
        <rect x="0" y="0" width="40" height="20" fill={stroke} />
        <text
          x="50%"
          y="50%"
          fill="#fff"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="12px"
        ></text>
      </svg>
    );
  };

  const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const day = dateTime.getDate().toString().padStart(2, "0");
    const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
    const year = dateTime.getFullYear();
    const hours = dateTime.getHours().toString().padStart(2, "0");
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}\n${hours}:${minutes}`;
  };

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
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching symptoms count:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchSymptomsCount();
  }, [patientFormsone.user, patientFormsone._id]);

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

        <div className="toolbar"></div>
        <div className="content">
          <p className="headerassesment">
            {name} {surname}
          </p>
          {birthday ? (
            <p className="textassesment">
              <label>อายุ:</label> {userAge} ปี {userAgeInMonths} เดือน{" "}
              <label>เพศ:</label>
              {gender}
            </p>
          ) : (
            <p className="textassesment">
              {" "}
              <label>อายุ:</label>0 ปี 0 เดือน <label>เพศ:</label>
              {gender}
            </p>
          )}
          <p className="textassesment">
            <label>HN:</label>
            {medicalData && medicalData.HN ? medicalData.HN : "ไม่มีข้อมูล"}
            <label>AN:</label>
            {medicalData && medicalData.AN ? medicalData.AN : "ไม่มีข้อมูล"}
            <label>ผู้ป่วยโรค:</label>
            {medicalData && medicalData.Diagnosis
              ? medicalData.Diagnosis
              : "ไม่มีข้อมูล"}
          </p>
          <div className="contentin-outmost">
            <div className="divdate">
              <b className="textdate" align="center">
                วันที่บันทึก: {formatDate(patientFormsone.createdAt)}
              </b>
            </div>
            <div className="content-in">
              <p className="textheadSymptom-center">สัญญาณชีพ</p>
              <div className="container">
                <div className="left-column">
                  <div className="patient-data">
                    <label className="title-Vitalsigns">อุณหภูมิ</label>
                    <p className="text">
                      {patientFormsone.Temperature || "-"} °C
                    </p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">ความดันตัวบน</label>
                    <p className="text">{patientFormsone.SBP || "-"} mmHg</p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">ความดันตัวล่าง</label>
                    <p className="text">{patientFormsone.DBP || "-"} mmHg</p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">ชีพจร</label>
                    <p className="text">
                      {patientFormsone.PulseRate || "-"} ครั้ง/นาที
                    </p>
                  </div>
                </div>

                <div className="right-column">
                  <div className="patient-data">
                    <label className="title-Vitalsigns">การหายใจ</label>
                    <p className="text">
                      {patientFormsone.Respiration || "-"} ครั้ง/นาที
                    </p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">ระดับความเจ็บปวด</label>
                    <p className="text">{patientFormsone.Painscore || "-"}</p>
                  </div>
                  <div className="patient-data">
                    <label className="title-Vitalsigns">DTX</label>
                    <p className="text">{patientFormsone.DTX || "-"} mg/dL</p>
                  </div>
                </div>
              </div>

              <p className="textheadSymptom-center">อาการและอาการแสดง</p>

              {patientFormsone.Symptoms &&
                patientFormsone.Symptoms.map((symptom, index) => (
                  <div className="symptom-item" key={index}>
                    <label className="title-ptf1">{`อาการที่ ${index + 1
                      }: `}</label>
                    <span className="text1">{symptom}</span>
                  </div>
                ))}

              <p className="textheadSymptom-center">
                ความถี่ของอาการ
                <span className="bracket">(นับรวมการบันทึกปัจจุบัน)</span>:
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
                <p className="text">
                  &nbsp;{patientFormsone.LevelSymptom || "-"}
                </p>
              </div>
              <div className="inline-container">
                <label className="textheadSymptom">
                  สิ่งที่อยากให้ทีมแพทย์ช่วยเหลือเพิ่มเติม:
                </label>
                <p className="text">
                  &nbsp;{patientFormsone.request_detail || "-"}
                </p>
              </div>
              <div className="inline-container">
                <label className="textheadSymptom">ผู้บันทึก:</label>
                <p className="text">&nbsp;{patientFormsone.Recorder || "-"}</p>
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
              <p className="textgraph"></p>
              {Temperaturedata && (
                <div className="chart-containerass1">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={Temperaturedata}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    // margin={
                    //   timeRange === "1month"
                    //     ? { top: 0, right: 0, left: -30, bottom: 0 }
                    //     : { right: 28, left: 28 }
                    // }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
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
                      />{" "}
                      <YAxis
                        domain={[30, 40]}
                        tick={{ fontSize: 10 }}
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
                          fontSize: 12,
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
                          fontSize: 12,
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
                        // dot={timeRange === "1month" ? false : <CustomDot />}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        connectNulls={true}
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="Temperature"
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
              )}
            </div>
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="SBP"></div>
                  <span className="head-graph">ความดันตัวบน (mmHg)</span>
                </div>
              </div>
              <p className="textgraph"></p>
              {BloodPressuredata && (
                <div className="chart-containerass1">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      data={BloodPressuredata}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
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
                      />
                      <YAxis
                        domain={[80, 200]} // หรือใช้ auto
                        tickCount={12} // จำนวน tick (ช่วงจะแบ่งอัตโนมัติ)
                        ticks={[80, 100, 120, 140, 160, 180, 200]}
                        tick={{ fontSize: 10 }}
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
                          fontSize: 12,
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
                          fontSize: 12,
                        }}
                      />
                      {/* <Legend verticalAlign="top" align="center" wrapperStyle={{ color: '#000' }} /> */}
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
                      // dot={
                      //   timeRange === "1month" ? (
                      //     false
                      //   ) : (
                      //     <CustomDot dataKey="SBP" />
                      //   )
                      // }
                      // legendType="none"
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="SBP"
                            position="inside"
                            style={{ fill: "white", fontSize: "10" }}
                            dot={
                              timeRange === "1month" ? (
                                false
                              ) : (
                                <CustomDot dataKey="SBP" />
                              )
                            }
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
              )}
            </div>
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="DBP"></div>
                  <span className="head-graph">ความดันตัวล่าง (mmHg)</span>
                </div>
              </div>
              <p className="textgraph"></p>
              {BloodPressuredata && (
                <div className="chart-containerass1">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      data={BloodPressuredata}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
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
                          fontSize: 12,
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
                          fontSize: 12,
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
              )}
            </div>
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="PulseRate"></div>
                  <span className="head-graph">ชีพจร (ครั้ง/นาที)</span>
                </div>
              </div>
              <p className="textgraph"></p>
              {PulseRateData && (
                <div className="chart-containerass1">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={PulseRateData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
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
                          fontSize: 12,
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
                          fontSize: 12,
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
                        // dot={
                        //   timeRange === "1month" ? (
                        //     false
                        //   ) : (
                        //     <CustomDot dataKey="PulseRate" />
                        //   )
                        // }
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        connectNulls={true}
                        isAnimationActive={true}
                        animationDuration={1500}
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="PulseRate"
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
              )}
            </div>

            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="Respiration"></div>
                  <span className="head-graph">การหายใจ (ครั้ง/นาที)</span>
                </div>
              </div>
              <p className="textgraph"></p>
              {Respirationdata && (
                <div className="chart-containerass1">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={Respirationdata}
                      // margin={
                      //   timeRange === "1month"
                      //     ? { top: 0, right: 0, left: -30, bottom: 0 }
                      //     : { right: 28, left: 28 }
                      // }
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
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
                          fontSize: 12,
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
                          fontSize: 12,
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
              )}
            </div>
            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="Painscore"></div>
                  <span className="head-graph">ระดับความเจ็บปวด</span>
                </div>
              </div>
              <p className="textgraph"></p>
              {Painscoredata && (
                <div className="chart-containerass1">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={Painscoredata}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    // margin={
                    //   timeRange === "1month"
                    //     ? { top: 0, right: 0, left: -30, bottom: 0 }
                    //     : { right: 28, left: 28 }
                    // }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
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
                      />

                      <YAxis
                        domain={[0, 10]}
                        tick={{ fontSize: 10 }}
                        ticks={[0, 2, 4, 6, 8, 10]}
                      // hide={timeRange !== "1month"}
                      />

                      <Tooltip content={<CustomTooltipPainscore />} />
                      <ReferenceLine
                        y={threshold.Painscore}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Med",
                          fill: "#00b300",
                          fontSize: 12,
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
              )}
            </div>

            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="dtx"></div>
                  <span className="head-graph">ระดับน้ำตาลในเลือด (mg/dL)</span>
                </div>
              </div>
              <p className="textgraph"></p>
              {dtxdata && (
                <div className="chart-containerass1">
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={dtxdata}
                      margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                    // margin={
                    //   timeRange === "1month"
                    //     ? { top: 0, right: 0, left: -30, bottom: 0 }
                    //     : { right: 28, left: 28 }
                    // }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
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
                      />
                      {/* {timeRange === "1month" && ( */}
                      <YAxis
                        domain={[60, 180]}
                        tick={{ fontSize: 10 }}
                        ticks={[60, 80, 100, 120, 140, 160, 180]}
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
                          fontSize: 12,
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
                          fontSize: 12,
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
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="DTX"
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
                        style={{ fontSize: "10", fill: "#000" }}
                        stroke="#878787"
                      />
                    )} */}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {isAssessed ? (
            <div className="contentinass">
              <div className="inline-container-ass">
                <p className="textheadSymptom-center-ass">การประเมินอาการ</p>
                <div
                  className="ellipsis-btn"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <span className="icon">⋮</span>
                </div>
              </div>
              <div className="ellipsis-menu" ref={menuRef}>
                {/* เมนูที่แสดงขึ้น */}
                {showMenu && (
                  <div className="menu-content">
                    {data._id === mpersonnel._id && (
                      <div className="menu-item" onClick={handleEditAssessment}>
                        <span className="icon">
                          <i class="bi bi-pencil-fill"></i>
                        </span>{" "}
                        แก้ไข
                      </div>
                    )}
                    <div className="menu-item" onClick={handleViewHistory}>
                      <span className="icon">
                        <i class="bi bi-clock-history"></i>
                      </span>{" "}
                      ดูประวัติการแก้ไข
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-1">
                <div className="mb-1 status-name">
                  <div className="btn-group-status-name">
                    {statusName === "ปกติ" && (
                      <div
                        className="btn-ass btn-normal"
                        onClick={() => handleButtonClick("ปกติ")}
                      >
                        ปกติ
                      </div>
                    )}
                    {statusName === "ผิดปกติ" && (
                      <div
                        className="btn-ass btn-abnormal"
                        onClick={() => handleButtonClick("ผิดปกติ")}
                      >
                        ผิดปกติ
                      </div>
                    )}
                    {statusName === "เคสฉุกเฉิน" && (
                      <div
                        className="btn-ass btn-Emergency"
                        onClick={() => handleButtonClick("เคสฉุกเฉิน")}
                      >
                        เคสฉุกเฉิน
                      </div>
                    )}
                    {statusName === "จบการรักษา" && (
                      <div
                        className="btn-ass btn-completed"
                        onClick={() => handleButtonClick("จบการรักษา")}
                      >
                        จบการรักษา
                      </div>
                    )}
                    <input type="hidden" value={statusName} />
                  </div>
                </div>
              </div>
              <div className="inline-container">
                <label className="title-ass">PPS: </label>
                <p className="text">{PPS || "-"}</p>
              </div>

              <div className="inline-container">
                <label className="title-ass">รายละเอียดสำหรับแพทย์: </label>
                <p className="text">{detail || "-"}</p>
              </div>
              <div className="inline-container">
                <label className="title-ass">คำแนะนำสำหรับผู้ป่วย: </label>
                <p className="text">{suggestion || "-"}</p>
              </div>
              <div className="inline-container">
                <label className="title-ass">ผู้ประเมิน: </label>
                <p className="text">
                  {mpersonnel.nametitle} {mpersonnel.name} {mpersonnel.surname}
                </p>
              </div>
              <div className="inline-container">
                <label className="title-ass">วันที่ประเมิน: </label>
                <p className="text">{formatDate(dateass)}</p>
              </div>
            </div>
          ) : (
            <div className="contentinass">
              <p className="textheadSymptom-center">ประเมินอาการ</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-1">
                  <div className="mb-1 status-name">
                    <div className="btn-group-status-name">
                      <div
                        className={`btn-ass ${statusName === "ปกติ" ? "btn-normal" : "btn-outline"
                          }`}
                        onClick={() => handleButtonClick("ปกติ")}
                      >
                        ปกติ
                      </div>
                      <div
                        className={`btn-ass ${statusName === "ผิดปกติ"
                          ? "btn-abnormal"
                          : "btn-outline"
                          }`}
                        onClick={() => handleButtonClick("ผิดปกติ")}
                      >
                        ผิดปกติ
                      </div>
                      <div
                        className={`btn-ass ${statusName === "เคสฉุกเฉิน"
                          ? "btn-Emergency"
                          : "btn-outline"
                          }`}
                        onClick={() => handleButtonClick("เคสฉุกเฉิน")}
                      >
                        เคสฉุกเฉิน
                      </div>
                      <div
                        className={`btn-ass ${statusName === "จบการรักษา"
                          ? "btn-completed"
                          : "btn-outline"
                          }`}
                        onClick={() => handleButtonClick("จบการรักษา")}
                      >
                        จบการรักษา
                      </div>
                      <input type="hidden" value={statusName} />
                    </div>
                  </div>
                  <div className="inline-container">
                    <label className="title-ass">PPS</label>
                    <select
                      className="form-control select"
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
                </div>
                <div className="inline-container">
                  <label className="title-ass">รายละเอียดสำหรับแพทย์: </label>
                  <textarea
                    type="text"
                    className="form-control"
                    onChange={(e) => setDetail(e.target.value)}
                  />
                </div>
                <div className="inline-container">
                  <label className="title-ass">คำแนะนำสำหรับผู้ป่วย: </label>
                  <textarea
                    type="text"
                    className="form-control"
                    onChange={(e) => setSuggestion(e.target.value)}
                  />
                </div>

                <div className="d-grid save">
                  <button type="submit" className="btn btnsave py-2">
                    บันทึก
                  </button>
                </div>
              </form>
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
                <div className="mb-1 status-name">
                  <div
                    className={`btn-ass ${statusName === "ปกติ" ? "btn-normal" : "btn-outline"
                      }`}
                    onClick={() => handleButtonClick("ปกติ")}
                  >
                    ปกติ
                  </div>
                  <div
                    className={`btn-ass ${statusName === "ผิดปกติ" ? "btn-abnormal" : "btn-outline"
                      }`}
                    onClick={() => handleButtonClick("ผิดปกติ")}
                  >
                    ผิดปกติ
                  </div>
                  <div
                    className={`btn-ass ${statusName === "เคสฉุกเฉิน"
                      ? "btn-Emergency"
                      : "btn-outline"
                      }`}
                    onClick={() => handleButtonClick("เคสฉุกเฉิน")}
                  >
                    เคสฉุกเฉิน
                  </div>
                  <div
                    className={`btn-ass ${statusName === "จบการรักษา"
                      ? "btn-completed"
                      : "btn-outline"
                      }`}
                    onClick={() => handleButtonClick("จบการรักษา")}
                  >
                    จบการรักษา
                  </div>
                </div>

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

                <label>รายละเอียดสำหรับแพทย์:</label>
                <textarea
                  className="form-control"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                />

                <label>คำแนะนำสำหรับผู้ป่วย:</label>
                <textarea
                  className="form-control"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                />

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
                      <div className="history-item-header">
                        <div className="mb-3">
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
                            {item.status_name === "จบการรักษา" && (
                              <div className="btn-ass btn-completed">
                                {item.status_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="history-item-body">
                        <p>
                          <strong>PPS:</strong>{" "}
                          <span className="pps">{item.PPS}</span>
                        </p>
                        <p>
                          <strong>รายละเอียดสำหรับแพทย์:</strong>{" "}
                          <span className="detail">{item.detail}</span>
                        </p>
                        <p>
                          <strong>คำแนะนำสำหรับผู้ป่วย:</strong>{" "}
                          <span className="suggestion">{item.suggestion}</span>
                        </p>
                        <p>
                          <strong>แก้ไขโดย:</strong>{" "}
                          <span className="updatedBy">
                            {item.updatedBy?.name || "N/A"}{" "}
                            {item.updatedBy?.surname || "N/A"}
                          </span>
                        </p>
                        <p>
                          <strong>วันที่แก้ไข:</strong>{" "}
                          <span className="date">
                            {formatDate(item.updatedAt)}
                          </span>
                        </p>
                      </div>
                      <hr className="history-separator" />
                    </li>
                  ))}
                </ul>
                {/* <button
                onClick={() => setHistoryVisible(false)}
                className="btn btn-close"
              ></button> */}
              </div>
            </div>
          </div>
        )}

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
      </div>
    </main>
  );
}
