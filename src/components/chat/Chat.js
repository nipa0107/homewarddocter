import React, { useState, useEffect, useRef } from "react";
import "../../css/sidebar.css";
import "../../css/stylechat.css";
import logow from "../../img/logow.png";

import Linkify from "linkify-it";
import { fetchAlerts } from "../Alert/alert";
import { renderAlerts } from "../Alert/renderAlerts";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
const socketnew = io("http://localhost:5000");
const ChatComponent = () => {
  const [users, setUsers] = useState([]); // รายชื่อ Users
  const [selectedUserId, setSelectedUserId] = useState(null); // ID ของ User ที่เลือก
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserSurname, setSelectedUserSurname] = useState("");
  const [messages, setMessages] = useState([]); // ประวัติแชท
  const [input, setInput] = useState(""); // ข้อความที่พิมพ์
  const [file, setFile] = useState(null);
  const [socket, setSocket] = useState(null); // Socket.IO
  const [data, setData] = useState([]);
  const [token, setToken] = useState("");
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  const [userId, setUserId] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const messageEndRef = useRef(null);
  const chatSectionRef = useRef(null);
  const textareaRef = useRef(null);
  const linkify = Linkify();
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const messageRefs = useRef({});
  const [userUnreadCounts, setUserUnreadCounts] = useState([]); // To store the `users` array from the response
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
  const openModal = (image) => {
    setCurrentImage(image); // Set the current image when opening the modal
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentImage(""); // Reset current image when closing the modal
  };
  const linkifyText = (text) => {
    const links = linkify.match(text);
    if (links) {
      links.forEach((link) => {
        text = text.replace(
          link.raw,
          `<a href="${link.url}" class="linkify" target="_blank">${link.raw}</a>`
        );
      });
    }
    return text;
  };

  const handleInput = (e) => {
    const textarea = textareaRef.current;

    // ตั้งค่าเริ่มต้นให้แน่ใจว่าไม่มี padding หรือความสูงแปลกปลอม
    textarea.style.height = "50px"; // ตั้งค่าใหม่ทุกครั้งก่อนคำนวณ
    const newHeight = Math.max(textarea.scrollHeight, 50); // คำนวณความสูง
    textarea.style.height = `${newHeight}px`; // ตั้งค่าความสูงใหม่

    setInput(e.target.value); // อัปเดตข้อความ
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
        setData(data.data);
        setSender({
          name: data.data.name,
          surname: data.data.surname,
          _id: data.data._id,
        }); // ตั้งค่า sender
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
    // ดึงรายชื่อ Users
    const fetchUsers = async () => {
      if (!sender || !sender._id) {
        console.error("Sender is not defined or missing _id");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:5000/users?senderId=${sender._id}`
        );
        const result = await response.json();
        if (response.ok) {
          setUsers(result.users);
        } else {
          console.error("Failed to fetch users:", result.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (sender._id) {
      fetchUsers();
    }

    // เชื่อมต่อ Socket.IO
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sender._id]);

  useEffect(() => {
    if (selectedUserId) {
      const fetchSelectedUserData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getUserById/${selectedUserId}`
          );
          const result = await response.json();
          if (response.ok) {
            setSelectedUserName(result.user.name);
            setSelectedUserSurname(result.user.surname);
          } else {
            console.error("Failed to fetch user data:", result.message);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchSelectedUserData();

      // ดึงประวัติแชทเมื่อเลือก User
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getChatHistory/${selectedUserId}`
          );
          const result = await response.json();
          if (response.ok) {
            setMessages(result.chatHistory);
            // อัปเดตข้อความที่ยังไม่ได้อ่าน
            result.chatHistory.forEach((message) => {
              if (!message.readBy.includes(sender._id)) {
                markAsRead(message._id); // อัปเดตข้อความที่ยังไม่ได้อ่าน
              }
            });
          } else {
            console.error("Failed to fetch chat history:", result.message);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      };

      fetchChatHistory();

      // เข้าร่วมห้องแชท
      socket?.emit("joinRoom", selectedUserId);

      // รับข้อความใหม่
      socket?.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socket?.off("receiveMessage");
      };
    }
  }, [selectedUserId, socket]);

  useEffect(() => {
    socket?.on("TotalUnreadCounts", (data) => {
      console.log("📦 TotalUnreadCounts received:", data);
      setUserUnreadCounts(data);
    });

    return () => {
      socket?.off("TotalUnreadCounts");
    };
  }, [socket]);

  useEffect(() => {
    // ฟังเหตุการณ์ 'usersUpdated' เพื่อรับข้อมูลผู้ใช้และแชทล่าสุด
    socket?.on("usersUpdated", (updatedUsers) => {
      // อัปเดตแค่แชทล่าสุดของผู้ใช้
      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          // หาผู้ใช้ที่ตรงกับ ID และอัปเดตแชทล่าสุด
          const updatedUser = updatedUsers.find(
            (updated) => updated._id === user._id
          );
          if (updatedUser) {
            return {
              ...user,
              latestChat: updatedUser.latestChat, // อัปเดตแค่แชทล่าสุด
              unreadCount: updatedUser.unreadCount,
            };
          }
          return user; // ถ้าไม่ตรงกันไม่ต้องทำการเปลี่ยนแปลง
        });
      });
    });

    return () => {
      socket?.off("usersUpdated");
    };
  }, [socket]);

  const sendMessage = async () => {
    if (input.length > 10000) {
      alert("ข้อความเกินความยาวสูงสุดที่กำหนดไว้ 1000 ตัวอักษร");
      return;
    }
    if (input.trim() || file) {
      const formData = new FormData();
      formData.append("message", input);
      formData.append("roomId", selectedUserId);
      formData.append("senderId", sender._id);
      formData.append("senderModel", "MPersonnel");
      if (file) formData.append("image", file);

      try {
        const response = await fetch("http://localhost:5000/sendchat", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          setInput("");
          setFile(null);
          setFilePreview(null);
          const textarea = textareaRef.current;
          textarea.style.height = "50px";
        } else {
          console.error("Failed to send message:", result.message);
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  useEffect(() => {
    socket?.on("readByUpdated", ({ messageId, readBy, unreadCount }) => {
      if (messageId && readBy) {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message._id === messageId ? { ...message, readBy } : message
          )
        );
      }

      // อัปเดต users
      if (typeof unreadCount !== "undefined") {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === selectedUserId
              ? { ...user, unreadCount } // อัปเดต unreadCount
              : user
          )
        );
      }
    });

    return () => {
      socket?.off("readByUpdated");
    };
  }, [socket, selectedUserId]);

  // ฟังก์ชันส่ง Event "markAsRead" เมื่อผู้ใช้เลื่อนผ่านข้อความ
  const markAsRead = (messageId) => {
    if (socket) {
      socket.emit("markAsRead", {
        roomId: selectedUserId,
        messageId,
        userId: sender._id, // ส่ง ID ผู้ใช้ปัจจุบัน
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.id; // ใช้ data-id เพื่อเก็บ messageId
            if (messageId) {
              markAsRead(messageId); // อัปเดตเมื่อข้อความปรากฏใน viewport
            }
          }
        });
      },
      { threshold: 0.1 } // 10% ของข้อความที่ปรากฏใน viewport จะถูกพิจารณาว่าเห็น
    );

    // สร้าง observer สำหรับข้อความทุกข้อความ
    Object.values(messageRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      // ล้าง observer เมื่อ component ถูกลบ
      observer.disconnect();
    };
  }, [messages, socket]);

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

  const formatDatenotTime = (dateTimeString) => {
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
    } `;
  };
  const formatTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }`;
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest", // ป้องกันเลื่อนเกินขอบของ container
        inline: "nearest",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (chatSectionRef.current && messageEndRef.current) {
      chatSectionRef.current.scrollTo({
        top: messageEndRef.current.offsetTop, // เลื่อนไปตำแหน่งข้อความสุดท้าย
        behavior: "smooth",
      });
    }
  }, [messages]);

  const isImageFile = (url) => {
    return (
      url.endsWith(".jpg?alt=media") ||
      url.endsWith(".png?alt=media") ||
      url.endsWith(".jpeg?alt=media") ||
      url.endsWith(".gif?alt=media")
    );
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);

      // ตรวจสอบว่าเป็นรูปภาพหรือไม่
      if (selectedFile.type.startsWith("image/")) {
        const previewUrl = URL.createObjectURL(selectedFile);
        setFilePreview(previewUrl); // สร้าง URL ตัวอย่าง
      } else {
        setFilePreview(null); // ไม่ใช่รูปภาพ
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  function shortenFileName(fileName, maxLength = 15) {
    if (fileName.length <= maxLength) {
      return fileName; // หากความยาวน้อยกว่าหรือเท่ากับ maxLength ให้คืนค่าชื่อไฟล์เดิม
    }

    const extensionIndex = fileName.lastIndexOf(".");
    const extension = fileName.slice(extensionIndex); // รับส่วนต่อท้าย (เช่น .pdf)

    const nameWithoutExtension = fileName.slice(0, extensionIndex); // ชื่อไฟล์โดยไม่มีนามสกุล
    const shortenedName = nameWithoutExtension.slice(0, maxLength - 3) + "..."; // ตัดชื่อไฟล์และเพิ่ม ...

    return shortenedName + extension; // คืนค่าชื่อไฟล์ที่ตัดพร้อมนามสกุล
  }
  function formatFileSize(bytes) {
    if (!bytes) return ""; // ถ้า bytes เป็น null หรือ undefined ให้คืนค่าว่าง

    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;

    while (bytes >= 1024 && unitIndex < units.length - 1) {
      bytes /= 1024;
      unitIndex++;
    }

    return `${bytes.toFixed(2)} ${units[unitIndex]}`;
  }

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

  return (
    <main className="bodychat">
      <div className={`sidebar ${isActive ? "active" : ""}`}>
        <div className="logo_content">
          <div className="logo">
            <div className="logo_name">
              <img src={logow} className="logow" alt="logo"></img>
            </div>
          </div>
          <i className="bi bi-list" id="btn" onClick={handleToggleSidebar}></i>
        </div>
        <ul className="nav-list">
          <li>
            <a href="home">
              <i className="bi bi-house"></i>
              <span className="links_name">หน้าหลัก</span>
            </a>
          </li>
          <li>
            <a href="assessment">
              <i className="bi bi-clipboard2-pulse"></i>
              <span className="links_name">ติดตาม/ประเมินอาการ</span>
            </a>
          </li>
          <li>
            <a href="allpatient">
              <i className="bi bi-people"></i>
              <span className="links_name">จัดการข้อมูลการดูแลผู้ป่วย</span>
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

          <div className="nav-logout">
            <li>
              <a href="./" onClick={logOut}>
                <i
                  className="bi bi-box-arrow-right"
                  id="log_out"
                  onClick={logOut}
                ></i>
                <span className="links_name">ออกจากระบบ</span>
              </a>
            </li>
          </div>
        </ul>
      </div>

      <div className="home_contentchat">
        <div className="homeheader">
          <div className="header">แช็ต</div>
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

        <div
          className="chat-mpersonnel"
          style={{ display: "flex", flexDirection: "row", height: "100vh" }}
        >
          {/* Sidebar เลือก User */}
          <div className="chat-user-list">
            <div className="search-bar1">
              <input
                className="search-text1"
                type="text"
                placeholder="ค้นหา"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="chat-user-list-scroll">
              {users
                .filter(
                  (user) =>
                    user.deletedAt == null &&
                    `${user.name} ${user.surname}`
                      .toLowerCase()
                      .includes(searchKeyword.toLowerCase())
                )
                .sort((a, b) => {
                  // ตรวจสอบว่า latestChat มีอยู่หรือไม่เพื่อหลีกเลี่ยง Error
                  const dateA = a.latestChat?.createdAt
                    ? new Date(a.latestChat.createdAt)
                    : 0;
                  const dateB = b.latestChat?.createdAt
                    ? new Date(b.latestChat.createdAt)
                    : 0;
                  return dateB - dateA; // เรียงลำดับจากใหม่ไปเก่า
                })
                .map((user) => (
                  <div
                    key={user._id}
                    className={`user-item-chat ${
                      selectedUserId === user._id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedUserId(user._id)}
                  >
                    <div className="user-avatar">
                      {user.name?.charAt(0) || ""}
                      {user.surname?.charAt(0) || ""}
                    </div>

                    <div className="user-info-chat">
                      <span>
                        {user.name} {user.surname}
                      </span>
                      {user.latestChat && (
                        <div className="user-latest-message-container">
                          <div className="user-latest-message">
                            <strong>
                              {user.latestChat.senderId === sender._id
                                ? "คุณ"
                                : user.latestChat.senderName}
                              :
                            </strong>{" "}
                            {user.latestChat.file
                              ? /\.(jpg|jpeg|png|gif)$/.test(
                                  user.latestChat.file.split("?")[0]
                                )
                                ? "ส่งรูปภาพ"
                                : "ส่งไฟล์แนบ"
                              : user.latestChat.message}
                          </div>
                          <div className="user-latest-message-time">
                            {formatTime(user.latestChat.createdAt)}
                          </div>
                          {user.unreadCount[sender._id] > 0 && (
                            <div className="unread-count">
                              {user.unreadCount[sender._id]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Main Chat Section */}
          <div
            className="main-chat-section"
            style={{
              flex: 1,
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              height: "100vh",
            }}
          >
            {selectedUserId ? (
              <>
                <h3>
                  ห้องแช็ต คุณ{selectedUserName} {selectedUserSurname}
                </h3>
                <div
                  className="chat-section"
                  ref={chatSectionRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    border: "1px solid #ccc",
                    padding: "1rem",
                    // paddingBottom: "5rem",
                    marginBottom: "2.7rem",
                  }}
                >
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      // ref={messageEndRef}
                      ref={(el) => {
                        messageRefs.current[msg._id] = el; // เก็บ ref ใน messageRefs โดยอิงจาก messageId
                      }}
                      data-id={msg._id} // เก็บ messageId ไว้ใน data attribute
                      //   className={`message ${msg.readBy.includes(sender._id) ? "read" : "unread"}`}
                      className={`message ${
                        Array.isArray(msg.readBy) &&
                        msg.readBy.includes(sender._id)
                          ? "read"
                          : "unread"
                      }`}
                    >
                      {(idx === 0 ||
                        new Date(msg.createdAt).getDate() !==
                          new Date(messages[idx - 1].createdAt).getDate()) && (
                        <p className="chat-date">
                          {formatDatenotTime(msg.createdAt)}
                        </p>
                      )}
                      <div
                        style={
                          {
                            //   display: "flex",
                            //   flexDirection:
                            //     msg.sender?._id === sender._id ? "row-reverse" : "row", // Right side for sender, left side for others
                            //   alignItems: "flex-end",
                            //   marginBottom: "10px",
                          }
                        }
                      >
                        {/* Message Sender Info */}
                        {msg.sender?._id !== sender._id && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems:
                                msg.sender?._id === sender._id
                                  ? "flex-end"
                                  : "flex-start",
                              marginBottom: "1px",
                              marginLeft: "8px",
                            }}
                          >
                            <span className="message-time">
                              {msg.sender?.name || sender.name}{" "}
                              {msg.sender?.surname ||
                                sender.surname ||
                                "Unknown"}
                              :
                            </span>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection:
                              msg.sender?._id === sender._id
                                ? "row-reverse"
                                : "row",
                            alignItems: "flex-end",
                            marginBottom: "0.7rem",
                            maxWidth: "100%",
                          }}
                        >
                          {/* Message Box */}
                          <div
                            style={{
                              maxWidth: "70%",
                              padding: "10px",
                              borderRadius: "10px",
                              backgroundColor:
                                msg.senderModel === "MPersonnel"
                                  ? msg.sender._id === sender._id
                                    ? "#DCF8C6"
                                    : "#E0E0E0" // ถ้า sender เป็น MPersonnel
                                  : msg.senderModel === "User"
                                  ? "#B3E5FC"
                                  : "#E0E0E0",
                              border: "1px solid #ddd",
                              margin: "5px",
                              wordBreak: "break-all",
                              overflow: "hidden",
                              whiteSpace: "pre-wrap",
                              fontSize: "16px",
                            }}
                          >
                            {msg.image ? (
                              isImageFile(msg.image) ? (
                                <div className="message-content-img">
                                  <img
                                    src={msg.image}
                                    alt={msg.imageName || "unknown image"}
                                    style={{
                                      maxWidth: "250px",
                                      maxHeight: "250px",
                                      borderRadius: "5px",
                                      marginTop: "5px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => openModal(msg.image)} // Pass image to openModal
                                  />

                                  {/* Modal for full-screen image */}
                                  {isModalOpen &&
                                    currentImage === msg.image && (
                                      <div
                                        onClick={closeModal}
                                        style={{
                                          position: "fixed",
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          backgroundColor: "rgba(8, 5, 4, 0.6)",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                          zIndex: 1000,
                                        }}
                                      >
                                        <div
                                          className="modal-contents"
                                          style={
                                            {
                                              // position: "relative",
                                              // maxWidth: "90%",
                                              // maxHeight: "90%",
                                            }
                                          }
                                          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                                        >
                                          {/* Close Button */}
                                          <button
                                            onClick={closeModal}
                                            style={{
                                              position: "absolute",
                                              //   top: "0px",
                                              right: "20px",
                                              backgroundColor: "transparent",
                                              border: "none",
                                              // padding: "10px",
                                              cursor: "pointer",
                                              zIndex: 1050, // Make sure it's above the image
                                            }}
                                          >
                                            <i
                                              className="bi bi-x-circle-fill"
                                              style={{
                                                fontSize: "40px",
                                                color: "#fff",
                                              }}
                                            ></i>{" "}
                                            {/* Close Icon */}
                                          </button>
                                          <img
                                            src={currentImage}
                                            alt={
                                              msg.imageName || "unknown image"
                                            }
                                            style={{
                                              //   width: "100%",
                                              maxHeight: " 90vh",
                                              marginLeft: "auto",
                                              marginRight: "auto",
                                              objectFit: "cover",
                                            }}
                                          />
                                          {/* Close Button */}
                                          {/* <span
                                      className="close"
                                      
                                    >
                                      &times;
                                    </span> */}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              ) : (
                                <a
                                  href={msg.image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="file-link"
                                >
                                  <i
                                    className="bi bi-file-earmark-text"
                                    style={{ fontSize: "24px" }}
                                  ></i>
                                  <div className="file-info-box">
                                    <span className="file-name">
                                      {shortenFileName(msg.imageName)}
                                    </span>
                                    <span className="file-size">
                                      {formatFileSize(msg.fileSize)}
                                    </span>
                                  </div>
                                </a>
                              )
                            ) : (
                              //   <span
                              //   className="message-chat"
                              //     dangerouslySetInnerHTML={{
                              //       __html: linkifyText(msg.message),
                              //     }}
                              //   />
                              <span className="message-chat">
                                {msg.message}
                              </span>
                            )}

                            {/* {msg.image && (
                          <div>
                            <img
                              src={msg.image}
                              alt={msg.imageName}
                              style={{
                                maxWidth: "250px",
                                maxHeight: "250px",
                                borderRadius: "5px",
                                marginTop: "5px",
                              }}
                            />
                          </div>
                        )} */}
                          </div>
                          {/* <small>Read by: {msg.readBy.length} users</small> */}

                          <span
                            className="message-time"
                            style={{
                              alignSelf: "flex-end",
                            }}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <div ref={messageEndRef} />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    backgroundColor: "#fff",
                    borderTop: "1px solid #ddd",
                    position: "sticky", // ตรึงไว้ด้านล่าง
                    bottom: 0,
                    zIndex: 100,
                  }}
                >
                  <div className="file-input-wrapper">
                    <input
                      id="file-input"
                      type="file"
                      onChange={(e) => handleFileChange(e)}
                      accept="*"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="file-input" style={{ cursor: "pointer" }}>
                      <i className="bi bi-card-image"></i>
                    </label>
                  </div>

                  {/* แสดงตัวอย่างไฟล์ที่เลือก */}
                  {file && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Preview"
                          style={{
                            maxWidth: "50px",
                            maxHeight: "50px",
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        <span>{file.name}</span>
                      )}
                      <button
                        onClick={() => clearFile()}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#ff4d4d",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Input สำหรับข้อความ */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onInput={handleInput}
                    onKeyDown={(e) => {
                      // ส่งข้อความเมื่อกด Enter (ไม่กด Shift)
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); // ป้องกันการขึ้นบรรทัดใหม่
                        sendMessage(); // เรียกฟังก์ชันส่งข้อความ
                      }
                    }}
                    placeholder="พิมพ์ข้อความ"
                    style={{
                      fontSize: ".8rem",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      width: "100%",
                      resize: "none",
                      //   overflowY: "hidden",
                      minHeight: "50px",
                      maxHeight: "200px",
                      boxSizing: "border-box",
                      lineHeight: "20px",
                    }}
                  />
                  {(input.trim() || file) && (
                    <button
                      className="send-button"
                      type="submit"
                      onClick={sendMessage}
                    >
                      <i className="bi bi-send"></i>
                    </button>
                  )}
                  {/* <button  style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '5px' }}  onClick={sendMessage}>Send</button> */}
                </div>
              </>
            ) : (
              <div className="start-chat-message">
                <p>เริ่มการแช็ต</p>
              </div>
            )}
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
      </div>
    </main>
  );
};

export default ChatComponent;
