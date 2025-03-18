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
import Sidebar from "./sidebar";
import io from "socket.io-client";
const socket = io("https://backend-deploy-render-mxok.onrender.com");

export default function Updatepatient() {
  const location = useLocation();
  const { id, user } = location.state;
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tel, setTel] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [ID_card_number, setIDCardNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [Address, setAddress] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverSurname, setCaregiverSurname] = useState("");
  const [Relationship, setRelationship] = useState("");
  const [caregiverTel, setCaregiverTel] = useState("");
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState("");
  const [otherGender, setOtherGender] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherRelationship, setOtherRelationship] = useState("");
  const [medicalData, setMedicalData] = useState({});
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
  const [usernameError, setUsernameError] = useState("");
  const [telError, setTelError] = useState("");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const hasFetchedUserData = useRef(false);

  useEffect(() => {
    socket?.on("newAlert", (alert) => {
      console.log("Received newAlert:", alert);

      setAlerts((prevAlerts) => {
        const isExisting = prevAlerts.some(
          (existingAlert) => existingAlert.patientFormId === alert.patientFormId
        );

        let updatedAlerts;

        if (isExisting) {
          if (alert.alertMessage === "เป็นเคสฉุกเฉิน") {
            updatedAlerts = [...prevAlerts, alert];
          } else {
            updatedAlerts = prevAlerts.map((existingAlert) =>
              existingAlert.patientFormId === alert.patientFormId
                ? alert
                : existingAlert
            );
          }
        } else {
          updatedAlerts = [...prevAlerts, alert];
        }

        return updatedAlerts.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    });

    socket?.on("deletedAlert", (data) => {
      setAlerts((prevAlerts) => {
        const filteredAlerts = prevAlerts.filter(
          (alert) => alert.patientFormId !== data.patientFormId
        );
        return filteredAlerts.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    });

    return () => {
      socket?.off("newAlert");
      socket?.off("deletedAlert");
    };
  }, []);

  useEffect(() => {
    const currentUserId = sender._id;

    const unreadAlerts = alerts.filter(
      (alert) =>
        Array.isArray(alert.viewedBy) && !alert.viewedBy.includes(currentUserId)
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

  const FormatDate = (date) => {
    const formattedDate = new Date(date);
    // ตรวจสอบว่า date เป็น NaN หรือไม่
    if (isNaN(formattedDate.getTime())) {
      return ""; // ถ้าเป็น NaN ให้ส่งค่าว่างกลับไป
    }
    return formattedDate.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getuser/${id}`);
        const data = await response.json();
        setUsername(data.username);
        setName(data.name);
        setSurname(data.surname);
        setEmail(data.email);
        setPassword(data.password);
        setTel(data.tel);
        setGender(data.gender);
        setBirthday(data.birthday);
        setIDCardNumber(data.ID_card_number);
        setNationality(data.nationality);
        setAddress(data.Address);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchCaregiverData = async () => {
      try {
        const response = await fetch(
          `https://backend-deploy-render-mxok.onrender.com/getcaregiver/${id}`
        );
        const caregiverData = await response.json();
        if (caregiverData.status === "ok") {
          setCaregiverName(caregiverData.data.name);
          setCaregiverSurname(caregiverData.data.surname);
          setCaregiverTel(caregiverData.data.tel);
          setRelationship(caregiverData.data.Relationship);
        }
      } catch (error) {
        console.error("Error fetching caregiver data:", error);
      }
    };

    fetchData();
    fetchCaregiverData();
  }, [id]);

  // useEffect(() => {
  //     const handleClickOutside = (event) => {
  //         if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
  //             setShowNotifications(false);
  //         }
  //     };

  //     document.addEventListener("mousedown", handleClickOutside);

  //     return () => {
  //         document.removeEventListener("mousedown", handleClickOutside);
  //     };
  // }, [notificationsRef]);

  // const toggleNotifications = () => {
  //     setShowNotifications(!showNotifications);
  // };
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

  const markAllAlertsAsViewed = () => {
    fetch("https://backend-deploy-render-mxok.onrender.com/alerts/mark-all-viewed", {
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

  const Updatepatient = async () => {
    let hasError = false;
    const cleanedUsername = ID_card_number.replace(/-/g, ""); // ลบเครื่องหมาย "-" หากมี
    if (!cleanedUsername.trim()) {
      setUsernameError("กรุณากรอกเลขประจําตัวประชาชน");
      hasError = true;
    } else if (
      cleanedUsername.length !== 13 ||
      !/^\d+$/.test(cleanedUsername)
    ) {
      setUsernameError("เลขประจําตัวประชาชนต้องเป็นตัวเลข 13 หลัก");
      hasError = true;
    } else {
      setUsernameError("");
    }
    if (tel.trim() && tel.length !== 10) {
      setTelError("เบอร์โทรศัพท์ต้องมี 10 หลัก");
      hasError = true;
    } else {
      setTelError("");
    }

    if (!name.trim()) {
      setNameError("กรุณากรอกชื่อ");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!surname.trim()) {
      setSurnameError("กรุณากรอกนามสกุล");
      hasError = true;
    } else {
      setSurnameError("");
    }

    if (hasError) return;

    try {
      const userData = {
        username,
        name,
        surname,
        email,
        password,
        tel,
        gender,
        birthday,
        ID_card_number,
        nationality,
        Address,
        user: id, // เชื่อมโยงกับผู้ใช้
        caregivername: caregiverName, // เปลี่ยนเป็น lowercase ตาม Backend
        caregiversurname: caregiverSurname,
        caregivertel: caregiverTel,
        Relationship,
      };

      const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/updateuserinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("แก้ไขทั่วไปแล้ว:", updatedUser);
        toast.success("แก้ไขข้อมูลสำเร็จ");
        setTimeout(() => {
          navigate("/infopatient", { state: { id: id, user: user } });
        }, 1100);
      } else {
        toast.error("ไม่สามารถแก้ไขทั่วไปได้:", response.statusText);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการแก้ไขผู้ใช้:", error);
    }
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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${
      year + 543
    } เวลา ${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    } น.`;
  };

  const handleRelationshipChange = (e) => {
    const value = e.target.value;
    setRelationship(value);
    if (value === "อื่นๆ") {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      setOtherRelationship("");
    }
  };

  const handleOtherRelationshipChange = (e) => {
    const value = e.target.value;
    setOtherRelationship(value);
    setRelationship(value); // Update gender to the value of otherGender
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    if (/[^0-9]/.test(input)) {
      setTelError("เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น");
    } else {
      setTelError("");
    }
    setTel(input.replace(/\D/g, ""));
  };

  const handleInputUsernameChange = (e) => {
    let input = e.target.value;

    if (/[^0-9-]/.test(input)) {
      setUsernameError("เลขประจําตัวประชาชนต้องเป็นตัวเลขเท่านั้น");
      return;
    } else {
      setUsernameError(""); // Clear error if valid
    }

    // เอาเฉพาะตัวเลขและจัดรูปแบบ
    input = input.replace(/\D/g, ""); // เอาเฉพาะตัวเลข
    if (input.length > 13) input = input.slice(0, 13); // จำกัดความยาวไม่เกิน 13 หลัก

    const formatted = input.replace(
      /^(\d{1})(\d{0,4})(\d{0,5})(\d{0,2})(\d{0,1})$/,
      (match, g1, g2, g3, g4, g5) => {
        let result = g1;
        if (g2) result += `-${g2}`;
        if (g3) result += `-${g3}`;
        if (g4) result += `-${g4}`;
        if (g5) result += `-${g5}`;
        return result;
      }
    );

    setIDCardNumber(formatted); // อัปเดตฟิลด์ข้อมูล
  };

  const handleInputNameChange = (e) => {
    const input = e.target.value;

    // ตรวจสอบว่ามีตัวเลขหรืออักขระพิเศษหรือไม่
    if (/[^ก-๙a-zA-Z\s]/.test(input)) {
      setNameError("ชื่อควรเป็นตัวอักษรเท่านั้น");
    } else {
      setNameError("");
    }

    setName(input.replace(/[^ก-๙a-zA-Z\s]/g, "")); // กรองเฉพาะตัวอักษรและช่องว่าง
  };

  const handleInputSurnameChange = (e) => {
    const input = e.target.value;

    // ตรวจสอบว่ามีตัวเลขหรืออักขระพิเศษหรือไม่
    if (/[^ก-๙a-zA-Z\s]/.test(input)) {
      setSurnameError("นามสกุลควรเป็นตัวอักษรเท่านั้น");
    } else {
      setSurnameError(""); // ล้าง error หากไม่มีปัญหา
    }

    setSurname(input.replace(/[^ก-๙a-zA-Z\s]/g, "")); // กรองเฉพาะตัวอักษรและช่องว่าง
  };


  const formatIDCardNumber = (id) => {
    if (!id) return "";
    return id.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5");
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
<Sidebar />
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
              <a>แก้ไขข้อมูลทั่วไป</a>
            </li>
          </ul>
        </div>
        <h3>แก้ไขข้อมูลทั่วไป</h3>
        <div className="adminall card mb-1">
      
        <div className="mb-1">
            <label>ชื่อผู้ใช้</label>
            <input
              type="text"
              readOnly
              className="form-control gray-background"
              value={formatIDCardNumber(username)}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-1">
            <label>อีเมล</label>
            <input
              type="text"
              value={email}
              readOnly
              className="form-control gray-background"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label>เลขประจำตัวบัตรประชาชน</label>
            <input
              value={ID_card_number}
              type="text"
              className="form-control gray-background"
              readOnly
              onChange={(e) => setIDCardNumber(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label>ชื่อ</label>
            <input
              value={name}
              type="text"
              className={`form-control ${nameError ? "input-error" : ""}`}
              onChange={handleInputNameChange}
            />
            {nameError && <span className="error-text">{nameError}</span>}
          </div>
          <div className="mb-1">
            <label>นามสกุล</label>
            <input
              type="text"
              className={`form-control ${surnameError ? "input-error" : ""}`}
              value={surname}
              onChange={handleInputSurnameChange}
            />
            {surnameError && <span className="error-text">{surnameError}</span>}
          </div>
          <div className="mb-1">
            <label>เพศ</label>
            <input
              type="text"
              value={gender}
              readOnly
              className="form-control gray-background"
              onChange={(e) => setGender(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label>วันเกิด</label>
            <input
              value={FormatDate(birthday)}
              type="date"
              className="form-control"
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>



          <div className="mb-1">
            <label>สัญชาติ</label>
            <input
              value={nationality}
              type="text"
              className="form-control"
              onChange={(e) => setNationality(e.target.value)}
            />
          </div>

          <div className="mb-1">
            <label>ที่อยู่</label>
            <input
              value={Address}
              type="text"
              className="form-control"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label>เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={tel}
              className={`form-control ${telError ? "input-error" : ""}`}
              onChange={handleInputChange}
            />
             {telError && <span className="error-text">{telError}</span>}

          </div>
          {/* <div className="mb-1">
            <label>ชื่อ(ผู้ดูแล)</label>
            <input
              type="text"
              className="form-control"
              value={caregiverName}
              onChange={(e) => setCaregiverName(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label>นามสกุล(ผู้ดูแล)</label>
            <input
              type="text"
              className="form-control"
              value={caregiverSurname}
              onChange={(e) => setCaregiverSurname(e.target.value)}
            />
          </div>
          <div className="mb-1">
            <label>ความสัมพันธ์</label>
            <div>
              <label>
                <input
                  type="radio"
                  value="พ่อ"
                  checked={Relationship === "พ่อ"}
                  onChange={handleRelationshipChange}
                />
                พ่อ
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="แม่"
                  checked={Relationship === "แม่"}
                  onChange={handleRelationshipChange}
                />
                แม่
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="ลูก"
                  checked={Relationship === "ลูก"}
                  onChange={handleRelationshipChange}
                />
                ลูก
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="ภรรยา"
                  checked={Relationship === "ภรรยา"}
                  onChange={handleRelationshipChange}
                />
                ภรรยา
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="สามี"
                  checked={Relationship === "สามี"}
                  onChange={handleRelationshipChange}
                />
                สามี
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="อื่นๆ"
                  checked={showOtherInput}
                  onChange={handleRelationshipChange}
                />
                อื่นๆ
              </label>
              {showOtherInput && (
                <div className="mt-2">
                  <label>กรุณาระบุ:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={otherRelationship}
                    onChange={handleOtherRelationshipChange}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mb-1">
            <label>เบอร์โทรศัพท์(ผู้ดูแล)</label>
            <input
              type="text"
              className="form-control"
              value={caregiverTel}
              onChange={(e) => setCaregiverTel(e.target.value)}
            />
          </div>*/}
        </div> 
        <div className="btn-group">
          <div className="btn-next">
            <button
              type="button"
              onClick={Updatepatient}
              className="btn btn-outline py-2"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
      <div></div>
    </main>
  );
}
