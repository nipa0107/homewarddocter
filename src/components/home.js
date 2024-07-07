import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import Pt from "../img/pt.png";
import Pt2 from "../img/pt2.png";
import Dt from "../img/dt.png";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';


export default function Home({ }) {
  const [data, setData] = useState([]);
  const [datauser, setDatauser] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState('');

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  const handleToggleSidebar = () => {
    setIsActive(!isActive);
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
          console.log(data);
          setData(data.data);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          // logOut();
        });
    } },); 

  return (
    <main className="body">
      <div className={`sidebar ${isActive ? 'active' : ''}`}>
        <div class="logo_content">
          <div class="logo">
            <div class="logo_name" >
              <img src={logow} className="logow" alt="logo" ></img>
            </div>
          </div>
          <i class='bi bi-list' id="btn" onClick={handleToggleSidebar}></i>
        </div>
        <ul className="nav-list">
          <li>
            <a href="home">
              <i class="bi bi-house"></i>
              <span class="links_name" >หน้าหลัก</span>
            </a>
          </li>
          <li>
            <a href="assessment" >
              <i class="bi bi-clipboard2-pulse"></i>
              <span class="links_name" >ติดตาม/ประเมินอาการ</span>
            </a>
          </li>
          <li>
            <a href="./" >
              <i class="bi bi-people"></i>
              <span class="links_name" >ข้อมูลการดูแลผู้ป่วย</span>
            </a>
          </li>
          <li>
            <a href="./" >
              <i class="bi bi-clipboard-check"></i>
              <span class="links_name" >ประเมินความพร้อมการดูแล</span>
            </a>
          </li>
          <li>
            <a href="./" >
              <i class="bi bi-chat-dots"></i>
              <span class="links_name" >แช็ต</span>
            </a>
          </li>
          <div className="nav-logout">
            <li>
              <a href="./" onClick={logOut}>
                <i class='bi bi-box-arrow-right' id="log_out" onClick={logOut}></i>
                <span class="links_name" >ออกจากระบบ</span>
              </a>
            </li>
          </div>
        </ul>
      </div>
      <div className="home_content">
        <div className="header">ภาพรวมระบบ
        </div>
        <div class="profile_details ">
          <li>
            <a href="profile">
              <i class="bi bi-person"></i>
              <span class="links_name" >{data && data.nametitle+data.name+" "+data.surname}</span>
            </a>
          </li>
        </div>
        <hr></hr>
        <div className="breadcrumbs">
          <ul>
            <li>
              <a href="home">
                <i className="bi bi-house-fill"></i>
              </a>
            </li>
            <li className="arrow">
              <i className="bi bi-chevron-double-right"></i>
            </li>
            <li><a>ภาพรวมระบบ</a>
            </li>

          </ul>
        </div>
        <div className="row px-5 mt-5">
          <div className="grid">
            <div className="item">
              <div className="countcontent">
                <div className="row align-items-center">
                  <div className="color-strip bg-primary"></div>
                  <div className="col">
                    <div className="bg-icon">
                      <img src={Pt2} className="patient" alt="patient" />
                    </div>
                  </div>
                  <div className="col">
                    <p className="num mt-2"><CountUp end={datauser.filter((user) => user.deletedAt === null).length} /></p>
                    <p className="name fs-5">ผู้ป่วยทั้งหมด</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="countcontent">
                <div className="row align-items-center">
                  <div className="color-strip bg-success"></div>
                  <div className="col">
                    <div className="bg-icon">
                      <img src={Pt} className="patient" alt="patient" />
                    </div>
                  </div>
                  <div className="col">
                    <p className="num mt-2"><CountUp end={datauser.filter((user) => user.deletedAt === null).length} /></p>
                    <p className="name fs-5">ผู้ป่วยที่กำลังรักษา</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="item">
              <div className="countcontent">
                <div className="row align-items-center">
                  <div className="color-strip bg-yellow"></div>
                  <div className="col">
                    <div className="bg-icon">
                      <img src={Dt} className="patient" alt="patient" />
                    </div>
                  </div>
                  <div className="col">
                    <p className="num mt-2"><CountUp end={data.length} /></p>
                    <p className="name fs-5">แพทย์ทั้งหมด</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container d-flex justify-content-center mt-5">
          <div className="chart-content">
            <PieChart width={500} height={500}>
              <Pie
                dataKey="value"
                isAnimationActive={true}
                data={diagnosisData}
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label={({ name, percent }) => ` ${(percent * 100).toFixed(0)}%`}
              >
                {diagnosisData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`ผู้ป่วย${name}`]} />
            </PieChart>
          </div>
          <div className="legend-content mb-5">
            <div className="diagnosis-legend">
              <h5> <b>Diagnosis</b></h5>
              <ul>
                {diagnosisData.map((entry, index) => (
                  <li key={`item-${index}`} style={{ color: COLORS[index % COLORS.length] }}>
                    <span style={{ color: COLORS[index % COLORS.length], padding: '10px 10px', borderRadius: '5px', lineHeight: '30px' }}>
                      ผู้ป่วย{entry.name} : {entry.value} cases
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

