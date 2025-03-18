import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logow from "../img/logow.png";
import "../css/sidebar.css";
import io from "socket.io-client";
const socket = io("https://backend-deploy-render-mxok.onrender.com");

export default function Sidebar() {
  const [isActive, setIsActive] = useState(window.innerWidth > 967);
  const [token, setToken] = useState("");
  const hasFetchedUserData = useRef(false);
  const [data, setData] = useState("");
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [userId, setUserId] = useState("");
  const [userUnreadCounts, setUserUnreadCounts] = useState([]);
  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive((prevState) => !prevState);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsActive(false); // ซ่อน Sidebar เมื่อจอเล็ก
      } else {
        setIsActive(true); // แสดง Sidebar เมื่อจอใหญ่
      }
    };

    handleResize(); // เช็กขนาดจอครั้งแรก
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    socket?.on("TotalUnreadCounts", (data) => {
      console.log("📦 TotalUnreadCounts received:", data);
      setUserUnreadCounts(data);
    });

    return () => {
      socket?.off("TotalUnreadCounts");
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

        return data.data;
      })
      .catch((error) => {
        console.error("Error verifying token:", error);
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
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
        });
    }
  }, [token]);

  useEffect(() => {
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
            <i className="bi bi-clipboard-check"></i>
            <span className="links_name">ประเมินความพร้อมการดูแล</span>
          </a>
        </li>
        <li>
          <a href="assessinhomesss">
            <i className="bi bi-house-check"></i>
            <span className="links_name">แบบประเมินเยี่ยมบ้าน</span>
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
        <li>
          {data?.username && data?.password && (
            <a
              href={`http://localhost:5173/auth?username=${encodeURIComponent(
                data.username
              )}&password=${encodeURIComponent(data.password)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-window-dock"></i>
              <span className="links_name">PTAH กายภาพ</span>
            </a>
          )}
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
  );
}
