import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Assessreadiness() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState("");
  const [datauser, setDatauser] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});
  const [assessmentStatuses, setAssessmentStatuses] = useState({});

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
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
        });
    }
  }, []);

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
  
  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

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
        setDatauser(searchData.data.length > 0 ? searchData.data : []);
      } else {
        console.error("Error during search:", searchData.status);
      }
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  useEffect(() => {
    searchUser();
  }, [searchKeyword, token]);

  const currentDate = new Date();

  useEffect(() => {
    const fetchAssessmentStatuses = async () => {
      const promises = datauser.map(async (user) => {
        if (user.deletedAt === null) { // Check if user is not deleted
          try {
            const response = await fetch(`http://localhost:5000/getUserAssessreadiness/${user._id}`);
            const data = await response.json();
  
            // Check if the status_name exists and log the user ID
            if (response.ok && data.status_name) {
              console.log(`User ID: ${user._id} Status: ${data.status_name}`);
              return { userId: user._id, status: data.status_name };
            } else {
              console.log(`User ID: ${user._id} ยังไม่ได้รับการประเมิน.`);
              return { userId: user._id, status: 'ยังไม่ได้รับการประเมิน' };
            }
          } catch (error) {
            console.error(`Error fetching assessment status for user ${user._id}:`, error);
            return { userId: user._id, status: 'ยังไม่ได้รับการประเมิน' };
          }
        }
        return null; // Return null for deleted users
      });
  
      const results = await Promise.all(promises);
      const statusMap = results.reduce((acc, result) => {
        if (result) {
          acc[result.userId] = result.status; // Only add non-null results
        }
        return acc;
      }, {});
      setAssessmentStatuses(statusMap);
    };
  
    if (datauser.length > 0) {
      fetchAssessmentStatuses();
    }
  }, [datauser]);
  
  
  return (
    <main className="body">
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
              <i className="bi bi-people"></i>
              <span className="links_name">จัดการข้อมูลการดูแลผู้ป่วย</span>
            </a>
          </li>
          <li>
            <a href="assessreadiness">
              <i class="bi bi-clipboard-check"></i>
              <span class="links_name">ประเมินความพร้อมการดูแล</span>
            </a>
          </li>
          <li>
            <a href="assessinhomesss" >
              <i class="bi bi-house-check"></i>
              <span class="links_name" >แบบประเมินเยี่ยมบ้าน</span>
            </a>
          </li>
          <li>
            <a href="chat">
              <i class="bi bi-chat-dots"></i>
              <span class="links_name">แช็ต</span>
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
          <div className="header">ประเมินความพร้อมการดูแล</div>
          <div class="profile_details ">
            <li>
              <a href="profile">
                <i class="bi bi-person"></i>
                <span class="links_name">
                  {data && data.nametitle + data.name + " " + data.surname}
                </span>
              </a>
            </li>
          </div>
        </div>
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
              <a>ประเมินความพร้อมการดูแล</a>
            </li>
          </ul>
        </div>
        <div className="search-bar">
          <input
            className="search-text"
            type="text"
            placeholder="ค้นหา"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <div className="toolbar">
          <p className="countadmin1">
            จำนวนผู้ป่วยทั้งหมด :{" "}
            {datauser.filter((user) => user.deletedAt === null).length} คน
          </p>
        </div>
        <div className="content">
          <table className="table">
            <thead>
              <tr>
                <th>HN</th>
                <th>AN</th>
                <th>ชื่อ-สกุล</th>
                <th>ผู้ป่วยโรค</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {datauser
                .filter((user) => user.deletedAt === null)
                .map((user, index) => {
                  const userBirthday = user.birthday ? new Date(user.birthday) : null;
                  const ageDiff = userBirthday ? currentDate.getFullYear() - userBirthday.getFullYear() : 0;
                  const monthDiff = userBirthday ? currentDate.getMonth() - userBirthday.getMonth() : 0;
                  const isBeforeBirthday = userBirthday ? (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < userBirthday.getDate())) : false;
                  const userAge = userBirthday ? (isBeforeBirthday ? `${ageDiff - 1} ปี ${12 + monthDiff} เดือน` : `${ageDiff} ปี ${monthDiff} เดือน`) : 'ไม่มีข้อมูล';

                  return (
                    <tr key={index}>
                      <td>
                        <span style={{ color: medicalData[user._id]?.hn ? 'inherit' : '#B2B2B2' }}>
                          {medicalData[user._id]?.hn ? medicalData[user._id]?.hn : "ไม่มีข้อมูล"}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: medicalData[user._id]?.an ? 'inherit' : '#B2B2B2' }}>
                          {medicalData[user._id]?.an ? medicalData[user._id]?.an : "ไม่มีข้อมูล"}
                        </span>
                      </td>
                      <td>{user.name} {user.surname}</td>
                      <td>
                        <span style={{ color: medicalData[user._id]?.diagnosis ? 'inherit' : '#B2B2B2' }}>
                          {medicalData[user._id]?.diagnosis ? medicalData[user._id]?.diagnosis : "ไม่มีข้อมูล"}
                        </span>
                      </td>
                      <td>
                        {assessmentStatuses[user._id] === 'ประเมินแล้ว' ? (
                          <a className="info" onClick={() => navigate("/detailassessreadiness", { state: { id: user._id } })}>
                            <span className="evaluated">ประเมินแล้ว</span>
                          </a>
                        ) : (
                          <a className="info" onClick={() => navigate("/assessreadinesspage1", { state: { id: user._id } })}>
                            <span className="not-evaluated">ยังไม่ได้รับการประเมิน</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>

          </table>
        </div>
      </div>
    </main>
  );
}
