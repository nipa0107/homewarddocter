import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
// import 'react-toastify/dist/ReactToastify.css';
function Updatepassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [data, setData] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState('');

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
          console.log(data)
          console.log(location);
          setData(data.data);
        });
    }
  }, [location]);

  const Updatepassword = () => {
    fetch(`http://localhost:5000/updatepassword/${location.state._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        id: location.state._id,
        password: password,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.status === "ok") {
          navigate("/profile");
        } else {
          setError(data.error);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };


  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./";
  };

  // bi-list
  const handleToggleSidebar = () => {
    setIsActive(!isActive);
  };


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
            <a href="allpatient" >
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

          <div className="header">เปลี่ยนรหัสผ่าน</div>
          <div class="profile_details ">
            <li>
              <a href="profile">
                <i class="bi bi-person"></i>
                <span class="links_name" >{data && data.nametitle + data.name + " " + data.surname}</span>
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
            <li><a href="profile">โปรไฟล์</a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li><a>เปลี่ยนรหัสผ่าน</a>
            </li>
          </ul>
        </div>
        {/* <h3>เปลี่ยนรหัสผ่าน</h3> */}
        <div className="formcontainerpf">
          <div className="auth-inner">
            รหัสผ่านเก่า
            <input
              className="form-control"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            รหัสผ่านใหม่
            <input
              className="form-control"
              type="password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <br />
            ยืนยันรหัสผ่านใหม่
            <input
              className="form-control"
              type="password"
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            {/* แสดงข้อความ error */}
            <p id="errormessage" className="errormessage">{error}</p>
          </div>
          <div className="d-grid save">
            <button
              onClick={Updatepassword}
              className="btn btnsave py-2"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </main>
  );

}
export default Updatepassword;
