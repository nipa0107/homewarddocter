import React, { useCallback,useEffect, useState, useRef } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import "../css/assessment.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { fetchAlerts } from "./Alert/alert";
import { renderAlerts } from "./Alert/renderAlerts";
import Sidebar from "./sidebar";
import io from "socket.io-client";
const socket = io("http://localhost:5000");


export default function Assessment() {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [datauser, setDatauser] = useState([]);
  const [isActive, setIsActive] = useState(window.innerWidth > 967);  
  const [searchKeyword, setSearchKeyword] = useState(""); //ค้นหา
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});
  const [userId, setUserId] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState("all");
  const notificationsRef = useRef(null);
  const bellRef = useRef(null);
  const [sender, setSender] = useState({ name: "", surname: "", _id: "" });
  // const [latestAssessments, setLatestAssessments] = useState({});
    const [unreadCountsByType, setUnreadCountsByType] = useState({
      assessment: 0,
      abnormal: 0,
      normal: 0,
    });
    const hasFetchedUserData = useRef(false);

//สถานะล่าสุด
  // const fetchLatestAssessments = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5000/latest-assessments");
  //     const data = await response.json();
  //     console.log("Raw latestAssessments data:", data); 

  //     if (data.status === "ok") {
  //       const assessmentsMap = data.data.reduce((acc, item) => {
  //         acc[item._id] = item.latestStatusName;
  //         return acc;
  //       }, {});
  //       console.log("Processed latestAssessments:", assessmentsMap); // เช็กค่าหลังประมวลผล

  //       setLatestAssessments(assessmentsMap);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching latest assessments:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchLatestAssessments();
  // }, []);

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
            getAllUser();
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
  
    const getAllUser = () => {
      fetch("http://localhost:5000/alluser", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "AllUser");
          setDatauser(data.data);
          console.log(datauser, "Datauser");
        });
    };
  
    useEffect(() => {
      const fetchMedicalData = async () => {
        const promises = datauser.map(async (user) => {
          if (user.deletedAt === null) {
            try {
              const response = await fetch(
                `http://localhost:5000/medicalInformation/${user._id}`
              );
              const medicalInfo = await response.json();
              return {
                userId: user._id,
                hn: medicalInfo.data?.HN,
                an: medicalInfo.data?.AN,
                diagnosis: medicalInfo.data?.Diagnosis,
              };
            } catch (error) {
              console.error(
                `Error fetching medical information for user ${user._id}:`,
                error
              );
              return {
                userId: user._id,
                hn: "Error",
                an: "Error",
                diagnosis: "Error fetching data",
              };
            }
          }
          return null;
        });
  
        const results = await Promise.all(promises);
        const medicalDataMap = results.reduce((acc, result) => {
          if (result) {
            acc[result.userId] = result;
          }
          return acc;
        }, {});
        setMedicalData(medicalDataMap);
      };
  
      if (datauser.length > 0) {
        fetchMedicalData();
      }
    }, [datauser]);
  const currentDate = new Date();

  useEffect(() => {
    const searchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/searchassessment?keyword=${encodeURIComponent(
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
            setDatauser(searchData.data);
          } else {
            setDatauser([]);
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


  return (
    <main className="body">
     <Sidebar />
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
            <li>
              <a>ติดตาม/ประเมินอาการ</a>
            </li>
          </ul>
        </div>

        {/*ค้นหา */}
        {/* <h3>จัดการข้อมูลผู้ป่วย</h3> */}
        <div className="content-toolbar d-flex justify-content-between align-items-center mt-5 mb-4">
          <div className="search-bar position-relative">
            <i className="bi bi-search search-icon"></i> 
            <input
              className="search-text" 
              type="text"
              placeholder="ค้นหา"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <div className="toolbar">
            <p className="countadmin1 mb-0">
              จำนวนผู้ป่วยทั้งหมด: {" "} {datauser.filter((user) => user.deletedAt === null).length} คน
            </p>
          </div>
        </div>

        <div className="content">
        <div className="table-container">
          <table className="table-all table-user">
            <thead>
              <tr>
                <th>HN </th>
                <th>AN</th>
                <th>ชื่อ-สกุล</th>
                <th>ผู้ป่วยโรค</th>
                {/* <th>สถานะ</th>                 */}
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {datauser.filter((user) => user.deletedAt === null).length > 0 ? (
                datauser
                  .filter((user) => user.deletedAt === null)
                  .map((i, index) => {
                    // console.log(
                    //   `User ID: ${i._id}, Matched Status: ${
                    //     latestAssessments[i._id]
                    //   }`
                    // );

                    const userBirthday = i.birthday
                      ? new Date(i.birthday)
                      : null;
                    let userAge = "";
                    if (userBirthday) {
                      const ageDiff =
                        currentDate.getFullYear() - userBirthday.getFullYear();
                      const monthDiff =
                        currentDate.getMonth() - userBirthday.getMonth();
                      const isBeforeBirthday =
                        monthDiff < 0 ||
                        (monthDiff === 0 &&
                          currentDate.getDate() < userBirthday.getDate());
                      userAge = isBeforeBirthday
                        ? `${ageDiff - 1} ปี ${12 + monthDiff} เดือน`
                        : `${ageDiff} ปี ${monthDiff} เดือน`;
                    }
                    return (
                      <tr
                        key={index}
                        className="info"
                        onClick={() =>
                          navigate("/assessmentuser", {
                            state: { id: i._id },
                          })
                        }
                      >
                        <td>
                          <span
                            style={{
                              color: medicalData[i._id]?.hn
                                ? "inherit"
                                : "#B2B2B2",
                            }}
                          >
                            {medicalData[i._id]?.hn
                              ? medicalData[i._id]?.hn
                              : "ไม่มีข้อมูล"}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              color: medicalData[i._id]?.an
                                ? "inherit"
                                : "#B2B2B2",
                            }}
                          >
                            {medicalData[i._id]?.an
                              ? medicalData[i._id]?.an
                              : "ไม่มีข้อมูล"}
                          </span>
                        </td>
                        <td>
                          {i.name} {i.surname}
                        </td>
                        {/* <td>{userAge}</td> */}
                        <td>
                          <span
                            style={{
                              color: medicalData[i._id]?.diagnosis
                                ? "inherit"
                                : "#B2B2B2",
                            }}
                          >
                            {medicalData[i._id]?.diagnosis
                              ? medicalData[i._id]?.diagnosis
                              : "ไม่มีข้อมูล"}
                          </span>
                        </td>
                        {/* <td>
                        <span style={{ color: latestAssessments[i._id] ? "inherit" : "#B2B2B2" }}>
                          {latestAssessments[i._id] ? latestAssessments[i._id] : "ยังไม่มีการประเมิน"}
                        </span>
                      </td> */}
                        {/* <td>
                        <span
                          style={{
                            color: latestAssessments[i._id]
                              ? latestAssessments[i._id] === "ปกติ" ? "#28a745"
                              : latestAssessments[i._id] === "ผิดปกติ" ? "#FFA500"
                              : latestAssessments[i._id] === "เคสฉุกเฉิน" ? "#DC3545"
                              : latestAssessments[i._id] === "สิ้นสุดการรักษา" ? "#343A40"
                              : latestAssessments[i._id] === "ยังไม่มีการบันทึก" ? "#B2B2B2"
                              : latestAssessments[i._id] === "รอประเมิน" ? "#B2B2B2"
                              : "inherit"
                              : "#B2B2B2", 
                              // fontWeight: "bold"
                              }}
                        >
                          {latestAssessments[i._id] ? latestAssessments[i._id] : "ยังไม่มีการประเมิน"}
                        </span>
                      </td> */}
                        {/* <td>
                        <span
                          className={
                            latestAssessments[i._id] === "สัญญาณชีพปกติ"
                              ? "not-evaluated"
                              : latestAssessments[i._id] === "สัญญาณชีพผิดปกติ"
                              ? "abnormal-status"
                              : latestAssessments[i._id] === "ปกติ"
                              ? "status-normal"
                              : latestAssessments[i._id] === "ผิดปกติ"
                              ? "status-abnormal"
                              : latestAssessments[i._id] === "เคสฉุกเฉิน"
                              ? "status-emergency"
                              : latestAssessments[i._id] === "สิ้นสุดการรักษา"
                              ? "status-finished"
                              : latestAssessments[i._id] === "ยังไม่มีการบันทึก"
                              ? "status-no-record"
                              : "inherit"
                          }
                        >
                          {latestAssessments[i._id] ? latestAssessments[i._id] : "ยังไม่มีการประเมิน"}
                        </span>
                      </td> */}
                        <td>
                          <a
                            className="info"
                            onClick={() =>
                              navigate("/assessmentuser", {
                                state: { id: i._id },
                              })
                            }
                          >
                            รายละเอียด
                          </a>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", color: "#B2B2B2" }}
                  >
                    ไม่พบข้อมูลที่คุณค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  <span className="notification-count-noti">{unreadCount}</span>
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
                <i className="bi bi-chevron-right"></i>
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
                <i className="bi bi-chevron-right"></i>
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
                <i className="bi bi-chevron-right"></i>
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
      </div>
    </main>
  );
}
