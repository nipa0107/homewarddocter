import React, { useEffect, useState, useRef } from "react";
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
export default function AddCaregiver() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = location.state || {};  
  const Iduser = location.state?.Iduser;
  const [adminData, setAdminData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherRelationship, setOtherRelationship] = useState("");
  const [formData, setFormData] = useState({
    user: Iduser || "",
    name: "",
    surname: "",
    tel: "",
    Relationship: "",
  });

    const notificationsRef = useRef(null);
    const bellRef = useRef(null);
    const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
    const [userUnreadCounts, setUserUnreadCounts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const [userId, setUserId] = useState("");
    const [data, setData] = useState([]);
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
      if (hasFetchedUserData.current) return; // ป้องกันการเรียกซ้ำ
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
   
     const currentDate = new Date();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/addcaregiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === "Ok") {
        toast.success("เพิ่มข้อมูลสำเร็จ");
        console.log("Navigating to /allinfo with ID:", userId);
        setTimeout(() => {
          navigate("/infopatient", { state: { id: id } });
        }, 1100);
    } else {
        // setError(data.error);
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error adding caregiver:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
    }
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };
  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };
  const handleBreadcrumbClick = () => {
    navigate("/allinfo", { state: {id:id} });
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
    setFormData((prev) => ({ ...prev, Relationship: value })); // อัปเดต Relationship ด้วยค่าอื่นๆ
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
                  navigate("/infopatient", { state: { id: id} })
                }
              >
                ข้อมูลการดูแลผู้ป่วย
              </a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>เพิ่มข้อมูลผู้ดูแล</a>
            </li>
          </ul>
        </div>
      <h3>เพิ่มข้อมูลผู้ดูแล</h3>
      <div className="adminall card mb-1">

      <form>
      <div className="mb-1">
          <label>ชื่อ<span className="required"> *</span></label>
          <input
            type="text"
             className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-1">
          <label>นามสกุล<span className="required"> *</span></label>
          <input
            type="text"
            className="form-control"

            name="surname"
            value={formData.surname}
            onChange={handleChange}
          />
        </div>
        <div className="mb-1">
        <label>ความสัมพันธ์</label>
        <div class="relationship-container">
        <div class="relationship-group">
            <div>
              <label>
                <input
                  type="radio"
                  value="พ่อ"
                  checked={formData.Relationship === "พ่อ"} 
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
                  checked={formData.Relationship=== "แม่"}
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
                  checked={formData.Relationship === "ลูก"}
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
                  checked={formData.Relationship === "ภรรยา"}
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
                  checked={formData.Relationship === "สามี"}
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
              </div>
              </div>
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
          <label>เบอร์โทรศัพท์</label>
          <input
            type="text"
            className="form-control"
            name="tel"
            value={formData.tel}
            onChange={handleChange}
          />
        </div>
        <div className="btn-group">
          <div className="btn-next">
        <button type="submit"  className="btn btn-outline py-2"  onClick={handleSave}>
          บันทึก
        </button>
        </div>
        </div>
      </form>
      
      </div>
   
      </div>
      
    </main>

  );
}
