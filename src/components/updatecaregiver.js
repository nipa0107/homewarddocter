import React, { useCallback, useEffect, useState, useRef } from "react";
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
import io from "socket.io-client";
const socket = io("http://localhost:5000");

export default function Updatecaregiver() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const { id, user } = location.state || {};
  const caregiver = location.state?.caregiver;
  const [gender, setGender] = useState("");
  const [Relationship, setRelationship] = useState("");
  const [adminData, setAdminData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [otherGender, setOtherGender] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherRelationship, setOtherRelationship] = useState("");
  const [formData, setFormData] = useState({
    ID_card_number: caregiver?.ID_card_number || "",
    // user: caregiver?.user|| "",
    user: caregiver?.userRelationships?.[0]?.user || "",
    name: caregiver?.name || "",
    surname: caregiver?.surname || "",
    tel: caregiver?.tel || "",
    // Relationship: caregiver?.Relationship || "",
    Relationship: caregiver?.userRelationships?.[0]?.relationship || "",
  });
  const [telError, setTelError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [otherError, setOtherError] = useState("");
  const [RelationshiError, setRelationshipError] = useState("");
  const hasFetchedUserData = useRef(false);
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
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const [userId, setUserId] = useState("");

  const fetchLatestAssessments = async () => {
    try {
      const response = await fetch("http://localhost:5000/latest-assessments");
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
  // const fetchAndSetAlerts = (token, userId) => {
  //   fetchAlerts(token)
  //     .then((alerts) => {
  //       setAlerts(alerts);
  //       const unreadAlerts = alerts.filter(
  //         (alert) => !alert.viewedBy.includes(userId)
  //       ).length;
  //       setUnreadCount(unreadAlerts);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching alerts:", error);
  //     });
  // };

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
  const currentDate = new Date();

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

  const handleBreadcrumbClick = () => {
    navigate("/allinfo", { state: { id: id, user: user } });
  };

  const handleRelationshipChange = (e) => {
    const value = e.target.value;
    if (value === "อื่นๆ") {
      setShowOtherInput(true);
      setFormData((prev) => ({ ...prev, Relationship: otherRelationship })); // กรณี "อื่นๆ" ใช้ค่า otherRelationship
    } else {
      setShowOtherInput(false);
      setFormData((prev) => ({ ...prev, Relationship: value })); // อัปเดต Relationship ตามที่เลือก
    }
  };

  const handleOtherRelationshipChange = (e) => {
    const value = e.target.value;
    setOtherRelationship(value);

    // ตรวจสอบว่าเป็นตัวอักษรเท่านั้น
    if (/[^ก-๙a-zA-Z\s]/.test(value)) {
      setOtherError("กรุณากรอกเป็นตัวอักษรเท่านั้น");
    } else {
      setOtherError(""); // ลบข้อความผิดพลาดเมื่อกรอกถูกต้อง
    }

    setFormData((prev) => ({ ...prev, Relationship: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "tel") {
      if (/[^0-9]/.test(value)) {
        setTelError("เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น");
      } else {
        setTelError("");
      }
    } else if (name === "name" || name === "surname") {
      if (/[^ก-๙a-zA-Z\s]/.test(value)) {
        if (name === "name") {
          setNameError("ชื่อต้องเป็นตัวอักษรเท่านั้น");
        } else {
          setSurnameError("นามสกุลต้องเป็นตัวอักษรเท่านั้น");
        }
      } else {
        if (name === "name") setNameError("");
        if (name === "surname") setSurnameError("");
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    const textRegex = /^[ก-๙a-zA-Z\s]+$/;

    if (!formData.name.trim()) {
      setNameError("กรุณากรอกชื่อ");
      isValid = false;
    } else if (!textRegex.test(formData.name)) {
      setNameError("ชื่อต้องเป็นตัวอักษรเท่านั้น");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!formData.surname.trim()) {
      setSurnameError("กรุณากรอกนามสกุล");
      isValid = false;
    } else if (!textRegex.test(formData.surname)) {
      setSurnameError("นามสกุลต้องเป็นตัวอักษรเท่านั้น");
      isValid = false;
    } else {
      setSurnameError("");
    }

    if (!formData.tel.trim()) {
      setTelError("กรุณากรอกเบอร์โทรศัพท์");
      isValid = false;
    } else if (formData.tel.length !== 10) {
      setTelError("เบอร์โทรศัพท์ต้องมี 10 หลัก");
      isValid = false;
    } else if (!/^\d+$/.test(formData.tel)) {
      setTelError("เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น");
      isValid = false;
    } else {
      setTelError("");
    }

    if (!showOtherInput && !formData.Relationship.trim()) {
      setRelationshipError("กรุณาเลือกความสัมพันธ์");
      isValid = false;
    } else {
      setRelationshipError("");
    }

    if (showOtherInput) {
      if (!otherRelationship.trim()) {
        setOtherError("กรุณาระบุความสัมพันธ์");
        isValid = false;
      } else if (!textRegex.test(otherRelationship)) {
        setOtherError("ความสัมพันธ์ต้องเป็นตัวอักษรเท่านั้น");
        isValid = false;
      } else {
        setOtherError("");
      }
    } else {
      setOtherError(""); // ล้าง error ถ้าไม่ได้เลือก "อื่นๆ"
    }
    return isValid;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/updatecaregiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: caregiver._id, ...formData }),
      });

      const data = await response.json();
      if (data.status === "Ok") {
        toast.success("แก้ไขข้อมูลสำเร็จ");
        setTimeout(() => {
          navigate("/infopatient", { state: { id: id, user: user } });
        }, 1100);
      } else {
        // setError(data.error);
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  useEffect(() => {
    if (
      formData.Relationship &&
      !["พ่อ", "แม่", "ลูก", "ภรรยา", "สามี"].includes(formData.Relationship)
    ) {
      setShowOtherInput(true);
      setOtherRelationship(formData.Relationship);
    }
  }, [formData.Relationship]);

  const formatIDCardNumber = (id) => {
    if (!id) return "";
    return id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5");
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

  useEffect(() => {
    if (!["พ่อ", "แม่", "ลูก", "ภรรยา", "สามี"].includes(formData.Relationship)) {
      setShowOtherInput(true);
      setOtherRelationship(formData.Relationship); // ✅ โหลดค่าที่มีอยู่แล้ว
    } else {
      setShowOtherInput(false);
      setOtherRelationship(""); // ✅ รีเซ็ตค่า ถ้าเลือกกลับมาเป็นค่าปกติ
    }
  }, [formData.Relationship]);

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
          <div className="header">จัดการข้อมูลการดูแลผู้ป่วย</div>
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
            <li>
              <a href="allpatient">จัดการข้อมูลการดูแลผู้ป่วย</a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
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
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>แก้ไขข้อมูลผู้ดูแล</a>
            </li>
          </ul>
        </div>
        <h3>แก้ไขข้อมูลผู้ดูแล</h3>
        <div className="adminall card mb-1">
          <form>
            <div className="mb-1">
              <label>เลขประจําตัวประชาชน</label>
              <input
                type="text"
                readOnly
                className="form-control gray-background"
                name="ID_card_number"
                value={formatIDCardNumber(formData.ID_card_number)}
                onChange={handleChange}
              />
            </div>
            <div className="mb-1">
              <label>ชื่อ</label>
              <input
                type="text"
                className={`form-control ${nameError ? "input-error" : ""}`}
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {nameError && <span className="error-text">{nameError}</span>}
            </div>
            <div className="mb-1">
              <label>นามสกุล</label>
              <input
                type="text"
                name="surname"
                className={`form-control ${surnameError ? "input-error" : ""}`}
                value={formData.surname}
                onChange={handleChange}
              />
              {surnameError && (
                <span className="error-text">{surnameError}</span>
              )}
            </div>
            <div className="mb-1">
              <label>ความสัมพันธ์</label>
              <div className="relationship-container">
                <div className="relationship-group">
                  {["พ่อ", "แม่", "ลูก", "ภรรยา", "สามี"].map((option) => (
                    <div key={option}>
                      <label>
                        <input
                          type="radio"
                          value={option}
                          checked={formData.Relationship === option}
                          onChange={handleRelationshipChange}
                          style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                  <div>
                    <label>
                      <input
                        type="radio"
                        value="อื่นๆ"
                        checked={showOtherInput}
                        onChange={() => {
                          setShowOtherInput(true);
                          setFormData({ ...formData, Relationship: otherRelationship || "" });
                        }}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                      />
                      อื่นๆ
                    </label>
                  </div>
                </div>
                {showOtherInput && (
                  <div className="mt-2">
                    <label>ระบุความสัมพันธ์อื่นๆ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={otherRelationship}
                      onChange={(e) => setOtherRelationship(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-1">
              <label>เบอร์โทรศัพท์</label>
              <input
                type="text"
                name="tel"
                className={`form-control ${telError ? "input-error" : ""}`}
                value={formData.tel}
                maxLength="10"
                onChange={handleChange}
              />
              {telError && <span className="error-text">{telError}</span>}
            </div>
          </form>
        </div>
        <div className="btn-group mt-4">
          <div className="btn-next">
            <button onClick={handleSave} className="btn btn-outline py-2">
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
