import React, { useEffect, useState } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";

export default function Assessment({ }) {
  const navigate = useNavigate();
  const [data, setData] = useState("");
  const [datauser, setDatauser] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(""); //ค้นหา
  const [token, setToken] = useState("");
  const [medicalData, setMedicalData] = useState({});

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
        body: JSON.stringify({
          token: token,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setData(data.data);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          // logOut();
        });
    }
  }, []);

  useEffect(() => {
    getAllUser();
  }, []);

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

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };
  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };

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
          <div className="header">ติดตาม/ประเมินอาการ</div>
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
        <div className="breadcrumbs">
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
              <a>ติดตาม/ประเมินอาการ</a>
            </li>
          </ul>
        </div>

        {/*ค้นหา */}
        {/* <h3>จัดการข้อมูลผู้ป่วย</h3> */}
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
          {/* {data
  .filter(user => user.deletedAt === null)
  .map((i) => {
    const userBirthday = i.birthday ? new Date(i.birthday) : null;
    let userAge = "";
    if (userBirthday) {
      const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();
      const isBeforeBirthday =
        currentDate.getMonth() < userBirthday.getMonth() ||
        (currentDate.getMonth() === userBirthday.getMonth() &&
          currentDate.getDate() < userBirthday.getDate());
      userAge = isBeforeBirthday ? ageDiff - 1 : ageDiff;
    }
    return (
      <div key={i._id} className="adminall card mb-3 ">
        <div className="card-body">
          <h5 className="card-title">{i.name}{" "}{i.surname}</h5>
          <h5 className="card-title">{userAge}</h5>
          <a
            className="info"
            onClick={() => navigate("/allinfo", { state: { id: i._id } })}
          >
            รายละเอียด
          </a>
        </div>
      </div>
    );
  })} */}

          <table className="table">
            <thead>
              <tr>
                <th>HN </th>
                <th>AN</th>
                <th>ชื่อ-สกุล</th>
                {/* <th>อายุ</th> */}
                <th>ผู้ป่วยโรค</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {datauser

                .filter((user) => user.deletedAt === null)
                .map((i, index) => {
                  const userBirthday = i.birthday ? new Date(i.birthday) : null;
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
                    <tr key={index}>
<td>
  <span style={{ color: medicalData[i._id]?.hn ? 'inherit' : '#B2B2B2' }}>
    {medicalData[i._id]?.hn ? medicalData[i._id]?.hn : "ไม่มีข้อมูล"}
  </span>
</td>
<td>
  <span style={{ color: medicalData[i._id]?.an ? 'inherit' : '#B2B2B2' }}>
    {medicalData[i._id]?.an ? medicalData[i._id]?.an : "ไม่มีข้อมูล"}
  </span>
</td>
<td>{i.name} {i.surname}</td>
{/* <td>{userAge}</td> */}
<td>
  <span style={{ color: medicalData[i._id]?.diagnosis ? 'inherit' : '#B2B2B2' }}>
    {medicalData[i._id]?.diagnosis ? medicalData[i._id]?.diagnosis : "ไม่มีข้อมูล"}
  </span>
</td>

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
                })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
