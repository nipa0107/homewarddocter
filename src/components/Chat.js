import React, { useState, useEffect, useRef } from "react";
import "../css/sidebar.css";
import "../css/stylechat.css";
import logow from "../img/logow.png";
import Linkify from "linkify-it";

const ChatComponent = () => {
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
  const messagesEndRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const inputRef = useRef(null);
  const [modalImage, setModalImage] = useState(null);

  const linkify = Linkify();

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
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    const token = window.localStorage.getItem("token");
    setToken(token);
    if (token) {
      fetch("http://localhost:5000/profiledt", {
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
          fetchAllUsers(data.data._id); // ส่ง userId ของผู้ใช้ที่ล็อกอินไปกับการเรียก API
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
        });
    }
  }, []);

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

  const handleSelectRecipient = async (user) => {
    setSelectedUserId(user._id);
    setRecipientId(user._id);
    setCurrentRecipient(user);
    setRecipientModel("User");

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
    // ปรับความสูงของ input element ตามข้อความที่พิมพ์
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  };

  // const adjustTextareaHeight = (textarea) => {
  //   textarea.style.height = "auto";
  //   textarea.style.height = textarea.scrollHeight + "px";
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (data) {
  //       const response = await fetch("http://localhost:5000/chat", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           message,
  //           recipientId,
  //           senderId: data._id,
  //           recipientModel,
  //           senderModel,
  //         }),
  //       });
  //       const result = await response.json();
  //       if (result.success) {
  //         setMessage("");
  //         fetchRecipientChats(recipientId, recipientModel);
  //         fetchAllUsers(data._id);
  //       } else {
  //         console.error("Error sending message:", result.message);
  //       }
  //     } else {
  //       console.error("Error: Data is not available yet.");
  //     }
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
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

        const response = await fetch("http://localhost:5000/chat", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          setMessage("");
          setUploadedImage(null);
          setImagePreview(null); 
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
      console.log(
        `Fetching chats for recipientId: ${recipientId}, recipientModel: ${recipientModel}, sender: ${sender}, senderModel: ${senderModel}`
      );

      const response = await fetch(
        `http://localhost:5000/chat/${recipientId}/${recipientModel}/${sender}/${senderModel}`
      );
      const data = await response.json();

      const filteredChats = data.chats;

      setRecipientChats(filteredChats);
    } catch (error) {
      console.error("Error fetching recipient chats:", error);
    }
  };

  //polling
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (selectedUserId) {
  //       fetchRecipientChats(selectedUserId, recipientModel);
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [selectedUserId, recipientModel]);

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
    }`;
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [recipientChats]);

  const countUnreadUsers = () => {
    const unreadUsers = allUsers.filter((user) => {
      const lastMessage = user.lastMessage;
      return (
        lastMessage && lastMessage.senderModel === "User" && !lastMessage.isRead
      );
    });
    return unreadUsers.length;
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
            <a href="chat">
              <i className="bi bi-chat-dots"></i>
              <span className="links_name">แช็ต</span>
              {countUnreadUsers() !== 0 && (
                <span className="countchat">{countUnreadUsers()}</span>
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
            <li>
              <a href="profile">
                <i className="bi bi-person"></i>
                <span className="links_name">
                  {data && data.nametitle + data.name + " " + data.surname}
                </span>
              </a>
            </li>
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
                                    ? "ส่งรูปภาพ"
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
              <div className="chat-header">
                <span>
                  {currentRecipient
                    ? `${currentRecipient.name} ${currentRecipient.surname}`
                    : ""}
                </span>
              </div>
              {currentRecipient && (
                <>
                  <div className="chat-messages">
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
                            {formatDate(chat.createdAt)}
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
                                  <div className="message-content-img">
                                    <img
                                      className="message-img"
                                      src={chat.image}
                                      alt="Chat Image"
                                      onClick={() =>
                                        handleImageClick(chat.image)
                                      }
                                    />
                                  </div>
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
                                  <div className="message-content-img">
                                    <img
                                      className="message-img"
                                      src={chat.image}
                                      alt="Chat Image"
                                      onClick={() =>
                                        handleImageClick(chat.image)
                                      }
                                    />
                                  </div>
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
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Uploaded" />
                      <button
                        className="delete-button"
                        onClick={() => setImagePreview(null)}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  <form className="chat-form" onSubmit={(e) => handleSubmit(e)}>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        id="file-input"
                        onChange={handleImageChange}
                        accept="image/*"
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
                    {(message || uploadedImage) && (
                      <button
                        className="send-button"
                        type="submit"
                        disabled={!message && !uploadedImage}
                      >
                        <i className="bi bi-send"></i>
                      </button>
                    )}
                    {/* 
  <button type="submit">
    <i className="bi bi-send"></i>
  </button> */}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatComponent;
