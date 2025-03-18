import React, { useCallback, useState, useEffect, useRef } from "react";
import "../../css/sidebar.css";
import "../../css/stylechat.css";
import logow from "../../img/logow.png";
import Sidebar from "../sidebar";
import Linkify from "linkify-it";
import { fetchAlerts } from "../Alert/alert";
import { renderAlerts } from "../Alert/renderAlerts";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
const socketnew = io("https://backend-deploy-render-mxok.onrender.com");
const ChatComponent = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [selectedUserSurname, setSelectedUserSurname] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [socket, setSocket] = useState(null);
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
  const messageRefs = useRef({});
  const [unreadCountsByType, setUnreadCountsByType] = useState({
    assessment: 0,
    abnormal: 0,
    normal: 0,
  });
  const hasFetchedUserData = useRef(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState("พิมพ์ข้อความ...");

  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth < 500) {
        setPlaceholder("พิมพ์...");
      } else {
        setPlaceholder("พิมพ์ข้อความ...");
      }
    };

    updatePlaceholder();

    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setIsChatOpen(true);
    if (textareaRef.current) {
      textareaRef.current.innerText = "";
      textareaRef.current.style.height = "40px";
    }
    setFile(null);
    setFilePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const goBackToUserList = () => {
    setIsChatOpen(false);
    setSelectedUserId();
  };

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
    socketnew?.on("newAlert", (alert) => {
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

    socketnew?.on("deletedAlert", (data) => {
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
      socketnew?.off("newAlert");
      socketnew?.off("deletedAlert");
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

  const openModal = (image) => {
    setCurrentImage(image);
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

    // รีเซ็ตความสูงก่อนคำนวณใหม่
    textarea.style.height = "auto";

    // คำนวณความสูงใหม่ โดยมีขั้นต่ำ 45px และสูงสุด 100px
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 45), 100);

    textarea.style.height = `${newHeight}px`;

    setInput(e.target.value);
  };

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
        setData(data.data);
        setSender({
          name: data.data.name,
          surname: data.data.surname,
          _id: data.data._id,
        });
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

  useEffect(() => {
    // ดึงรายชื่อ Users
    const fetchUsers = async () => {
      if (!sender || !sender._id) {
        console.error("Sender is not defined or missing _id");
        return;
      }
      try {
        const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/users`);
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
    const newSocket = io("https://backend-deploy-render-mxok.onrender.com");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sender?._id]);

  useEffect(() => {
    if (selectedUserId) {
      const fetchSelectedUserData = async () => {
        try {
          const response = await fetch(
            `https://backend-deploy-render-mxok.onrender.com/getUserById/${selectedUserId}`
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
            `https://backend-deploy-render-mxok.onrender.com/getChatHistory/${selectedUserId}`
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
      alert("ข้อความเกินความยาวสูงสุดที่กำหนดไว้ 10000 ตัวอักษร");
      return;
    }

    if (input.trim() || file) {
      const formData = new FormData();
      formData.append("message", input);
      formData.append("roomId", selectedUserId);
      formData.append("senderId", sender._id);
      formData.append("senderModel", "MPersonnel");
      if (file) formData.append("image", file);

      setInput("");
      setFile(null);
      setFilePreview(null);
      if (textareaRef.current) {
        textareaRef.current.innerText = "";
        textareaRef.current.style.height = "40px";
      }
      try {
        const response = await fetch("https://backend-deploy-render-mxok.onrender.com/sendchat", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          setInput("");
          setFile(null);
          setFilePreview(null);
          if (textareaRef.current) {
            textareaRef.current.innerText = "";
            textareaRef.current.style.height = "40px";
          }
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

  const markAsRead = (messageId) => {
    if (socket) {
      socket.emit("markAsRead", {
        roomId: selectedUserId,
        messageId,
        userId: sender._id,
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.id;
            if (messageId) {
              markAsRead(messageId);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(messageRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [messages, socket]);


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
        top: messageEndRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, [messages]);

  
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


  // const isImageFile = (url) => {
  //   return (
  //     url.endsWith(".jpg?alt=media") ||
  //     url.endsWith(".png?alt=media") ||
  //     url.endsWith(".jpeg?alt=media") ||
  //     url.endsWith(".gif?alt=media")
  //   );
  // };
  const isImageFile = (url) => {
    return /\.(jpg|jpeg|png|gif)$/i.test(url.split("?")[0]);
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
      return fileName;
    }

    const extensionIndex = fileName.lastIndexOf(".");
    const extension = fileName.slice(extensionIndex);

    const nameWithoutExtension = fileName.slice(0, extensionIndex);
    const shortenedName = nameWithoutExtension.slice(0, maxLength - 3) + "...";

    return shortenedName + extension;
  }
  function formatFileSize(bytes) {
    if (!bytes) return "";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;

    while (bytes >= 1024 && unitIndex < units.length - 1) {
      bytes /= 1024;
      unitIndex++;
    }

    return `${bytes.toFixed(2)} ${units[unitIndex]}`;
  }



  const ImageModal = ({ isOpen, image, onClose }) => {
    if (!isOpen) return null;

    return (
      <div
        onClick={onClose}
        className="image-model-chat"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <button onClick={onClose} className="modal-chat-close">
          <i className="bi bi-x-circle-fill icon-chat"></i>
        </button>
        <div className="modal-contents" onClick={(e) => e.stopPropagation()}>
          <img src={image} alt="Modal" className="image-in-model-chat" />
        </div>
      </div>
    );
  };
  return (
    <main className="bodychat">
       <Sidebar />
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
        <div className="chat-container">

          {/* Sidebar เลือก User */}
          <div className={`chat-user-list ${isChatOpen ? "hidden" : ""}`}>
            <div className="search-bar-chat">
              <input
                className="search-text-chat"
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
                  const dateA = a.latestChat?.createdAt
                    ? new Date(a.latestChat.createdAt)
                    : 0;
                  const dateB = b.latestChat?.createdAt
                    ? new Date(b.latestChat.createdAt)
                    : 0;
                  return dateB - dateA;
                })
                .map((user) => (
                  <div
                    key={user._id}
                    className={`user-item-chat ${
                      selectedUserId === user._id ? "selected" : ""
                    }`}
                    // onClick={() => setSelectedUserId(user._id)}
                    onClick={() => handleUserClick(user._id)}
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
                                : user.latestChat.senderName || `${user.latestChat.sender?.name || "ไม่ทราบชื่อ"}`}
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
                          {/* <>
                          {user.unreadCount[sender._id] > 0 && (
                            <div className="unread-count">
                              {user.unreadCount[sender._id]}
                            </div>
                          )}
                          </> */}
                        </div>
                      )}
                    </div>
                    {user.unreadCount[sender._id] > 0 && (
                      <div className="unread-container">
                        <div className="unread-count">
                          {user.unreadCount[sender._id]}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Main Chat Section */}
          <div className={`main-chat-section ${isChatOpen ? "active" : ""}`}>
            {selectedUserId ? (
              <>
                <div className="chat-header">
                  <button
                    className="back-to-user-list"
                    onClick={goBackToUserList}
                  >
                    <i class="bi bi-chevron-left"></i>
                  </button>
                  <p className="name-chat">
                    {/* ห้องแช็ต */}
                    คุณ {selectedUserName} {selectedUserSurname}
                  </p>
                </div>
                <div className="chat-section" ref={chatSectionRef}>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      // ref={messageEndRef}
                      ref={(el) => {
                        messageRefs.current[msg._id] = el;
                      }}
                      data-id={msg._id}
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
                        <div className="dateContainer">
                          <p className="chat-date">
                            {formatDatenotTime(msg.createdAt)}
                          </p>
                        </div>
                      )}
                      <div>
                        {/* Message Sender Info */}
                        {msg.sender?._id !== sender._id && (
                          // <div
                          //   style={{
                          //     display: "flex",
                          //     flexDirection: "column",
                          //     alignItems:
                          //       msg.sender?._id === sender._id
                          //         ? "flex-end"
                          //         : "flex-start",
                          //     marginBottom: "1px",
                          //     marginLeft: "8px",
                          //   }}
                          // >
                          <div
                            className={`message-sender-info ${
                              msg.sender?._id === sender._id
                                ? "align-end"
                                : "align-start"
                            }`}
                          >
                            <span className="message-time">
                              {msg.sender?.nametitle
                                ? `${msg.sender.nametitle} ${msg.sender.name} ${
                                    msg.sender.surname || "Unknown"
                                  }`
                                : `${msg.sender?.name || sender.name} ${
                                    msg.sender?.surname ||
                                    sender.surname ||
                                    "Unknown"
                                  }`}
                            </span>
                          </div>
                        )}
                        <div
                          className={`message-info ${
                            msg.sender?._id === sender._id
                              ? "row-reverse-chat"
                              : "row-chat"
                          }`}
                        >
                          {/* Message Box */}
                          <div
                            className="message-box"
                            style={{
                              backgroundColor:
                                msg.senderModel === "MPersonnel"
                                  ? msg.sender._id === sender._id
                                    ? "#DCF8C6"
                                    : "#E1E2E1"
                                  : msg.senderModel === "User"
                                  ? "#B3D9F7"
                                  : "#d1c4e9",
                            }}
                          >
                            {msg.image ? (
                              isImageFile(msg.image) ? (
                                <div className="message-content-img">
                                  <img
                                    src={msg.image}
                                    alt={msg.imageName || "unknown image"}
                                    className="image-box-chat"
                                    onClick={() => openModal(msg.image)}
                                  />
                                  {/* 
                                  {isModalOpen &&
                                    currentImage === msg.image && (
                                      <div
                                        onClick={closeModal}
                                        className="image-model-chat"
                                      >
                                        <div
                                          className="modal-contents"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            onClick={closeModal}
                                            className="modal-chat-close"
                                          >
                                            <i
                                              className="bi bi-x-circle-fill icon-chat"
                                            ></i>
                                          </button>
                                          <img
                                            src={currentImage}
                                            alt={
                                              msg.imageName || "unknown image"
                                            }
                                            className="image-in-model-chat"
                                         
                                          />
                                        </div>
                                      </div>
                                    )} */}
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
                              <span
                                className="message-chat"
                                dangerouslySetInnerHTML={{
                                  __html: linkifyText(msg.message),
                                }}
                              />
                              // <span className="message-chat">
                              //   {msg.message}
                              // </span>
                            )}
                          </div>
                          {/* <small>Read by: {msg.readBy.length} users</small> */}

                          <span className="message-time time">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                        <div ref={messageEndRef} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="input-chat-container">
                  {/* แสดงตัวอย่างไฟล์ที่เลือก */}
                  {file && (
                    <div className="file-preview">
                      <div className="file-preview-content">
                        {filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="file-preview-image"
                          />
                        ) : (
                          <div className="file-info">
                            <i className="bi bi-file-earmark"></i>
                            <span className="file-name">{file.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => clearFile()}
                          className="clear-file-button"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="input-controls">
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

                    <div
                      ref={textareaRef}
                      contentEditable
                      role="textbox"
                      className="chat-textarea"
                      onInput={(e) => {
                        setInput(e.target.innerText);
                        if (textareaRef.current) {
                          textareaRef.current.style.height = "40px";
                          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData.getData("text/plain");
                        document.execCommand("insertText", false, text);
                      }}
                      placeholder={placeholder}
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
                  </div>
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
        <ImageModal
          isOpen={isModalOpen}
          image={currentImage}
          onClose={closeModal}
        />
      </div>
    </main>
  );
};

export default ChatComponent;
