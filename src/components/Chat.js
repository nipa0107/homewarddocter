import React, { useState, useEffect, useRef } from "react";
import "../css/sidebar.css";
import "../css/stylechat.css";
import logow from "../img/logow.png";
import Linkify from "linkify-it";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
const socket = io("http://localhost:5000");
export default function ChatComponent() {
  const [message, setMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientModel, setRecipientModel] = useState("");
  const [recipientChats, setRecipientChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentRecipient, setCurrentRecipient] = useState(null);
  const [data, setData] = useState([]);
  const [token, setToken] = useState("");
  const [sender, setSender] = useState("");
  const [senderModel, setSenderModel] = useState("MPersonnel");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const inputRef = useRef(null);
  const [modalImage, setModalImage] = useState(null);

  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const [userId, setUserId] = useState("");
  const linkify = Linkify();
  const [nonImageFile, setNonImageFile] = useState(null);
  useEffect(() => {
    socket.on("newAlert", (alert) => {
      setAlerts((prevAlerts) => [...prevAlerts, alert]);
      setUnreadCount((prevCount) => prevCount + 1);
    });

    return () => {
      socket.off("newAlert"); // Clean up the listener on component unmount
    };
  }, []);

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

  const isImageFile = (url) => {
    return (
      url.endsWith(".jpg?alt=media") ||
      url.endsWith(".png?alt=media") ||
      url.endsWith(".jpeg?alt=media") ||
      url.endsWith(".gif?alt=media")
    );
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

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setUploadedImage(file);

    // เช็คประเภทไฟล์
    if (file) {
      const reader = new FileReader();
      // สำหรับไฟล์ที่เป็นภาพ
      if (file.type.startsWith("image/")) {
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setNonImageFile(null); // ล้างไฟล์ที่ไม่ใช่ภาพ
        };
        reader.readAsDataURL(file);
      } else {
        // สำหรับไฟล์ที่ไม่ใช่ภาพ
        setNonImageFile(file);
        setImagePreview(null); // ล้างภาพที่อัปโหลด
      }
    }
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
        setSender(data.data._id);
        setSenderModel(data.data.role === "user" ? "User" : "MPersonnel");
        fetchAllUsers(data.data._id);
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

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsRef]);

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
    }, 5000);
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

  const handleSelectRecipient = async (user) => {
    setSelectedUserId(user._id);
    setRecipientId(user._id);
    setCurrentRecipient(user);
    setRecipientModel("User");
    setMessage("");
    setUploadedImage(null);
    setImagePreview(null);
    setNonImageFile(null);
    try {
      const recipientChatsResponse = await fetch(
        `http://localhost:5000/chat/${user._id}/User/${sender}/${senderModel}`
      );
      const recipientChatsData = await recipientChatsResponse.json();
      setRecipientChats(recipientChatsData.chats);
    } catch (error) {
      console.error("Error fetching recipient chats:", error);
    }
  };

  const handleChangeMessage = (e) => {
    setMessage(e.target.value);
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !uploadedImage) {
      return;
    }

    const maxFileSize = 25 * 1024 * 1024; // 5 MB
    if (uploadedImage && uploadedImage.size > maxFileSize) {
      return alert(
        "ไม่สามารถอัพโหลดไฟล์ ไฟล์ที่คุณเลือกมีขนาดใหญ่เกินไป ขนาดสูงสุดคือ 25 MB"
      );
    }
    try {
      if (data) {
        const formData = new FormData();
        formData.append("message", message);
        formData.append("recipientId", recipientId);
        formData.append("senderId", data._id);
        formData.append("recipientModel", recipientModel);
        formData.append("senderModel", senderModel);
        if (uploadedImage) {
          formData.append("image", uploadedImage);
        }

        const response = await fetch("http://localhost:5000/sendchat", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          setMessage("");
          setUploadedImage(null);
          setImagePreview(null);
          setNonImageFile(null);
          fetchRecipientChats(recipientId, recipientModel);
          fetchAllUsers(data._id);
          document.getElementById("file-input").value = ""; // เคลียร์ค่าไฟล์ใน input
        } else {
          console.error("Error sending message:", result.message);
        }
      } else {
        console.error("Error: Data is not available yet.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchRecipientChats = async (recipientId, recipientModel) => {
    try {
      const response = await fetch(
        `http://localhost:5000/chat/${recipientId}/${recipientModel}/${sender}/${senderModel}`
      );
      const data = await response.json();

      setRecipientChats(data.chats);
    } catch (error) {
      console.error("Error fetching recipient chats:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedUserId) {
        fetchRecipientChats(selectedUserId, recipientModel);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUserId, recipientModel]);

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
    const searchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/searchuserchat?keyword=${encodeURIComponent(
            searchKeyword
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const searchData = await response.json();
        if (response.ok) {
          if (searchData.data.length > 0) {
            setAllUsers(searchData.data);
          } else {
            setAllUsers([]);
          }
        } else {
          console.error("Error during search:", searchData.status);
        }
      } catch (error) {
        console.error("Error during search:", error);
      }
    };
    searchUser();
  }, [searchKeyword, token]);

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null); // Reference for chat messages container
  const [isAutoScroll, setIsAutoScroll] = useState(true); // State to manage auto-scroll
  const [prevRecipientChats, setPrevRecipientChats] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (recipientChats.length > prevRecipientChats.length && isAutoScroll) {
      // Only scroll when there's a new message and auto-scroll is enabled
      scrollToBottom();
    }
    setPrevRecipientChats(recipientChats);
  }, [recipientChats, isAutoScroll, prevRecipientChats]);

  const handleScroll = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      // If the user is close to the bottom, enable auto-scroll
      if (scrollHeight - scrollTop <= clientHeight + 50) {
        setIsAutoScroll(true);
      } else {
        setIsAutoScroll(false);
      }
    }
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
              {countUnreadUsers() !== 0 && (
                <span className="notification-countchat">
                  {countUnreadUsers()}
                </span>
              )}
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
                <a className="bell-icon" onClick={toggleNotifications}>
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

        <div className="contentchat">
          <div className="contentinchat">
            <div style={{ flex: "1" }}>
              <div className="search-bar1">
                <input
                  className="search-text1"
                  type="text"
                  placeholder="ค้นหา"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="user-list">
                {allUsers
                  .filter(
                    (user) =>
                      user.deletedAt === null &&
                      `${user.name} ${user.surname}`
                        .toLowerCase()
                        .includes(searchKeyword.toLowerCase())
                  )
                  .map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleSelectRecipient(user)}
                      className={`user-item ${
                        selectedUserId === user._id ? "selected" : ""
                      }`}
                    >
                      <div className="user-info">
                        <p
                          className={`user-name ${
                            user.lastMessage &&
                            user.lastMessage.senderModel === "User" &&
                            !user.lastMessage.isRead
                              ? "bold-text"
                              : ""
                          }`}
                        >
                          {user.name} {user.surname}
                        </p>
                        <div className="last-message">
                          {user.lastMessage && (
                            <>
                              <span className="message-contentuser">
                                <span
                                  className={
                                    user.lastMessage.senderModel === "User" &&
                                    !user.lastMessage.isRead
                                      ? "bold-text"
                                      : ""
                                  }
                                >
                                  {user.lastMessage.sender._id === data._id
                                    ? "คุณ"
                                    : user.lastMessage.sender.name}
                                  :{" "}
                                </span>
                                <span
                                  className={
                                    user.lastMessage.senderModel === "User" &&
                                    !user.lastMessage.isRead
                                      ? "bold-text"
                                      : ""
                                  }
                                >
                                    {user.lastMessage.image
            ? /\.(jpg|jpeg|png|gif)$/.test(user.lastMessage.image)
              ? "ส่งรูปภาพ"
              : "ส่งไฟล์แนบ"
            : user.lastMessage.message}
                                </span>
                              </span>
                              <span className="message-timeuser">
                                {formatTime(user.lastMessage.createdAt)}
                              </span>
                            </>
                          )}
                        </div>

                        {user.lastMessage &&
                          user.lastMessage.senderModel === "User" &&
                          !user.lastMessage.isRead && (
                            <span className="unread-dot"></span>
                          )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="chat-window">
              {currentRecipient ? (
                <>
                  <div className="chat-header">
                    <span>
                      {currentRecipient
                        ? `${currentRecipient.name} ${currentRecipient.surname}`
                        : ""}
                    </span>
                  </div>
                  <div
                    className="chat-messages"
                    onScroll={handleScroll}
                    ref={chatMessagesRef}
                    style={{ overflowY: "scroll", maxHeight: "500px" }}
                  >
                    {recipientChats.map((chat, index) => (
                      <div
                        key={index}
                        className={`chat-message ${
                          chat.sender._id === data._id ? "sent" : "received"
                        }`}
                      >
                        {(index === 0 ||
                          new Date(chat.createdAt).getDate() !==
                            new Date(
                              recipientChats[index - 1].createdAt
                            ).getDate()) && (
                          <p className="chat-date">
                            {formatDatenotTime(chat.createdAt)}
                          </p>
                        )}
                        <div className="message-container">
                          {chat.sender._id === data._id ? (
                            <>
                              <div className="content-time-wrapper">
                                <div className="status-time">
                                  {chat.isRead && (
                                    <span className="message-status">
                                      อ่านแล้ว
                                    </span>
                                  )}
                                  <span className="message-time">
                                    {formatTime(chat.createdAt)}
                                  </span>
                                </div>

                                {chat.image ? (
                                  isImageFile(chat.image) ? (
                                    <div className="message-content-img">
                                      <img
                                        className="message-img"
                                        src={chat.image}
                                        alt="Chat Image"
                                        onClick={() =>
                                          handleImageClick(chat.image)
                                        }
                                        style={{
                                          maxWidth: "100%",
                                          height: "auto",
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="message-content-file">
                                      <a
                                        href={chat.image}
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
                                            {shortenFileName(chat.imageName)}
                                          </span>
                                          <span className="file-size">
                                            {formatFileSize(chat.fileSize)}
                                          </span>
                                        </div>
                                      </a>
                                    </div>
                                  )
                                ) : (
                                  <div
                                    className="message-content"
                                    dangerouslySetInnerHTML={{
                                      __html: linkifyText(chat.message),
                                    }}
                                  />
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="content-time-wrapper">
                                {chat.image ? (
                                  isImageFile(chat.image) ? (
                                    <div className="message-content-img">
                                      <img
                                        className="message-img"
                                        src={chat.image}
                                        alt="Chat Image"
                                        onClick={() =>
                                          handleImageClick(chat.image)
                                        }
                                        style={{
                                          maxWidth: "100%",
                                          height: "auto",
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="message-content-file">
                                      <a
                                        href={chat.image}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-link"
                                      >
                                        <i
                                          className="bi bi-file-earmark-text"
                                          style={{ fontSize: "24px" }}
                                        ></i>
                                        <span className="file-name">
                                          {/* {getShortFileName(getFileNameFromUrl(chat.image))}  */}
                                          {shortenFileName(chat.imageName)}
                                        </span>
                                        {/* <span className="file-type">
                            {getFileType(getFileNameFromUrl(chat.image))}
                          </span> */}
                                        <span className="file-size">
                                          {formatFileSize(chat.fileSize)}
                                        </span>
                                      </a>
                                    </div>
                                  )
                                ) : (
                                  <div
                                    className="message-content"
                                    dangerouslySetInnerHTML={{
                                      __html: linkifyText(chat.message),
                                    }}
                                  />
                                )}
                                <span className="message-time">
                                  {formatTime(chat.createdAt)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  {modalImage && (
                    <div className="modal" onClick={closeModal}>
                      <div
                        className="modal-contents"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="close" onClick={closeModal}>
                          &times;
                        </span>
                        <img src={modalImage} alt="Modal" />
                      </div>
                    </div>
                  )}
                  {imagePreview ? (
                    <div className="image-preview-outline">
                      <div className="image-preview">
                        <img src={imagePreview} alt="Uploaded" />
                        <button
                          className="delete-button"
                          onClick={() => setImagePreview(null)}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ) : nonImageFile ? (
                    <div className="file-preview-container">
                      <div className="file-info" title={nonImageFile.name}>
                        <i
                          className="bi bi-file-earmark-text"
                          style={{ fontSize: "24px", marginRight: "10px" }}
                        ></i>
                        <div>
                          <p style={{ margin: 0 }}>
                            {shortenFileName(nonImageFile.name)}
                          </p>
                          {/* <p style={{ margin: 0 }}>{(nonImageFile.size / 1024).toFixed(2)} KB</p>
        <p style={{ margin: 0 }}>{nonImageFile.type}</p> */}
                        </div>
                      </div>
                      <button
                        className="delete-file-button"
                        onClick={() => setNonImageFile(null)}
                      >
                        &times;
                      </button>
                    </div>
                  ) : null}

                  <form className="chat-form" onSubmit={(e) => handleSubmit(e)}>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        id="file-input"
                        onChange={handleImageChange}
                        // accept="image/*"
                        accept="*/*"
                      />
                      <label htmlFor="file-input">
                        <i className="bi bi-card-image"></i>
                      </label>
                    </div>
                    <div className="message-div-container">
                      <input
                        type="text"
                        className="message-div"
                        value={message}
                        onChange={handleChangeMessage}
                        ref={inputRef}
                        style={{
                          minHeight: "30px",
                          overflowY: "hidden",
                        }}
                      />
                    </div>
                    {(message.trim() || uploadedImage) && (
                      <button
                        className="send-button"
                        type="submit"
                        disabled={!message.trim() && !uploadedImage}
                      >
                        <i className="bi bi-send"></i>
                      </button>
                    )}
                  </form>
                </>
              ) : (
                <div className="start-chat-message">
                  <p>เริ่มการแช็ต</p>
                </div>
              )}
            </div>
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
}
