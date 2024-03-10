import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";

export default function Home({ }) {

    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState('');


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
            <div className={`sidebar ${isActive ? 'active' : ''}`}>
                <div class="logo_content">
                    <div class="logo">
                        <div class="logo_name" >
                            <img src={logow} className="logow" alt="logo" ></img>
                        </div>
                    </div>
                    <i class='bi bi-list' id="btn" onClick={handleToggleSidebar}></i>
                </div>
                <ul class="nav-list">
                    <li>
                        <a href="home">
                            <i class="bi bi-house"></i>
                            <span class="links_name" >หน้าหลัก</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" >
                            <i class="bi bi-clipboard2-pulse"></i>
                            <span class="links_name" >ติดตาม/ประเมินอาการ</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" >
                            <i class="bi bi-people"></i>
                            <span class="links_name" >ข้อมูลการดูแลผู้ป่วย</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" >
                            <i class="bi bi-clipboard-check"></i>
                            <span class="links_name" >ประเมินความพร้อมการดูแล</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" >
                            <i class="bi bi-chat-dots"></i>
                            <span class="links_name" >แช็ต</span>
                        </a>
                    </li>
                    <div class="nav-logout">
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
                <div className="header">โปรไฟล์</div>
                <div class="profile_details ">
                    <li>
                        <a href="profile">
                            <i class="bi bi-person"></i>
                            <span class="links_name"></span>
                        </a>
                    </li>
                </div>
                <hr></hr>
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
                        <li><a>โปรไฟล์</a>
                        </li>
                    </ul>
                </div>
                <h3>โปรไฟล์</h3>
                <div className="formcontainerpf card mb-3">
                    <div className="mb-3">
                        <label>ชื่อผู้ใช้</label>
                        <br />
                        <label>ชื่อ-นามสกุล</label>
                        <br />
                        <label>อีเมล</label>
                        <br />
                        <label>เบอร์โทรศัพท์</label>
                        <br />
                        <a className="editname" >
                            เปลี่ยนรหัสผ่าน
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}

