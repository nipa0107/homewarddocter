import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";

export default function UpdateProfile() {
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const location = useLocation();
    const [username, setUsername] = useState("");
    const [tel, setTel] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");

    const [nametitle, setNameTitle] = useState("");
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
              setName(data.data.name);
              setSurname(data.data.surname);
              setNameTitle(data.data.nametitle)
              setUsername(data.data.username)
              setTel(data.data.tel)
              setEmail(data.data.email)
              if (data.data == "token expired") {
                window.localStorage.clear();
                window.location.href = "./";
              }
            })
            .catch((error) => {
              console.error("Error verifying token:", error);
              // logOut();
            });
        }
      },[]);

      const UpdateProfile = async () => {
        try {
          const docterData = 
          { nametitle,
            name,
            tel,
            surname,
          };
          const response = await fetch(`http://localhost:5000/updateprofile/${location.state._id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(docterData),
          });
      
          if (response.ok) {
            const updatedAdmin = await response.json();
            console.log("แก้ไขผู้แล้ว:", updatedAdmin);
            setTimeout(() => {
              navigate("/profile");
            },1100); 
            // window.location.href = "./profile";
          } else {
            console.error("ไม่สามารถแก้ไขผู้ใช้ได้:", response.statusText);
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการแก้ไขผู้ใช้:", error);
        }
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
              <a href="assessment" >
                  <i class="bi bi-clipboard2-pulse"></i>
                  <span class="links_name">ติดตาม/ประเมินอาการ</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i class="bi bi-people"></i>
                  <span class="links_name">ข้อมูลการดูแลผู้ป่วย</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <i class="bi bi-clipboard-check"></i>
                  <span class="links_name">ประเมินความพร้อมการดูแล</span>
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

            <div className="header">แก้ไขโปรไฟล์ผู้ใช้</div>
            <div class="profile_details ">
              <li>
                <a href="profile">
                  <i class="bi bi-person"></i>
                  <span class="links_name" >{data && data.nametitle+data.name+" "+data.surname}</span>
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
            <li><a href="profile">โปรไฟล์</a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li><a>แก้ไขโปรไฟล์ผู้ใช้</a>
            </li>
          </ul>
        </div>
            {/* <h3>แก้ไขโปรไฟล์ผู้ใช้</h3> */}
            <div className="formcontainerpf card mb-2">
              <div className="mb-2">
              <label>ชื่อผู้ใช้</label>
          <input
              type="text"
              className="form-control gray-background"
              readOnly
              value={username}
            //   onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label>คำนำหน้าชื่อ</label>
            <select
              className="form-control"
              value={nametitle}
              onChange={(e) => setNameTitle(e.target.value)}
            >
              <option value="">กรุณาเลือก</option>
              <option value="แพทย์หญิง">แพทย์หญิง</option>
                <option value="นายแพทย์">นายแพทย์</option>
            </select>
          </div>
          <div className="mb-2">
          <label>ชื่อ</label>
          <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-2">
          <label>นามสกุล</label>
          <input
              type="text"
              className="form-control"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </div>
          
          <div className="mb-2">
          <label>อีเมล</label>
          <input
              type="text"
              className="form-control gray-background"
              readOnly
              value={email}
            //   onChange={(e) => setEmail(e.target.value)}
            />
          </div>      
          <div className="mb-2">
          <label>เบอร์โทรศัพท์</label>
          <input
              type="text"
              className="form-control"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
          </div>   

                <div className="d-grid save">
            <button
              onClick={UpdateProfile}
              type="submit"
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
