import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddEquipPatient() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id, user } = location.state;
    const [data, setData] = useState([]);
    const [validationMessage, setValidationMessage] = useState("");
    const [adminData, setAdminData] = useState({});
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [selectedEquipType1, setSelectedEquipType1] = useState("");
    const [selectedEquipType2, setSelectedEquipType2] = useState("");
    const [selectedEquipType3, setSelectedEquipType3] = useState("");
    const [equipValidationMessages, setEquipValidationMessages] = useState({});

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
                body: JSON.stringify({ token: token }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setData(data.data);
                });
        }
        getAllEquip();
    }, [token]);

    const getAllEquip = () => {
        fetch("http://localhost:5000/allequip", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setData(data.data);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedEquipments = [];
        const validationMessages = {};

        if (selectedEquipType1) {
            selectedEquipments.push({
                equipmentname_forUser: selectedEquipType1,
                equipmenttype_forUser: "อุปกรณ์ติดตัว",
            });
        }
        if (selectedEquipType2) {
            selectedEquipments.push({
                equipmentname_forUser: selectedEquipType2,
                equipmenttype_forUser: "อุปกรณ์เสริม",
            });
        }
        if (selectedEquipType3) {
            selectedEquipments.push({
                equipmentname_forUser: selectedEquipType3,
                equipmenttype_forUser: "อุปกรณ์อื่นๆ",
            });
        }

        if (selectedEquipments.length === 0) {
            setValidationMessage("โปรดเลือกอุปกรณ์อย่างน้อยหนึ่งรายการ");
            return;
        }
        if (!id) {
            setValidationMessage("ไม่พบข้อมูลผู้ใช้");
            return;
        }

        // Check for duplicate equipment
        selectedEquipments.forEach((equip, index) => {
            if (
                selectedEquipments.filter(
                    (e) => e.equipmentname_forUser === equip.equipmentname_forUser
                ).length > 1
            ) {
                validationMessages[equip.equipmenttype_forUser] =
                    "มีอุปกรณ์นี้อยู่แล้ว";
            }
        });

        setEquipValidationMessages(validationMessages);

        if (Object.keys(validationMessages).length > 0) {
            return;
        }

        fetch("http://localhost:5000/addequipuser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ equipments: selectedEquipments, userId: id }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "ok") {
                    toast.success("เพิ่มข้อมูลสำเร็จ");
                    setTimeout(() => {
                        navigate("/infopatient", { state: { id } });
                    }, 1100);
                } else if (
                    data.status === "error" &&
                    data.message === "มีอุปกรณ์นี้อยู่แล้ว"
                ) {
                    setValidationMessage("มีอุปกรณ์นี้อยู่แล้ว");
                } else {
                    toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
                }
            })
            .catch((error) => {
                console.error("Error adding equipment:", error);
                toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
            });
    };

    const logOut = () => {
        window.localStorage.clear();
        window.location.href = "./";
    };

    const handleToggleSidebar = () => {
        setIsActive(!isActive);
    };

    const handleChange = (e, equipTypeSetter, equipType) => {
        equipTypeSetter(e.target.value);
        setEquipValidationMessages((prevMessages) => {
            const newMessages = { ...prevMessages };
            delete newMessages[equipType];
            return newMessages;
        });
        setValidationMessage(""); // Clear general validation message
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
                        <a href="assessment" >
                            <i class="bi bi-clipboard2-pulse"></i>
                            <span class="links_name" >ติดตาม/ประเมินอาการ</span>
                        </a>
                    </li>
                    <li>
                        <a href="allpatient" >
                            <i class="bi bi-people"></i>
                            <span class="links_name" >จัดการข้อมูลการดูแลผู้ป่วย</span>
                        </a>
                    </li>
                    <li>
                        <a href="assessreadiness" >
                            <i class="bi bi-clipboard-check"></i>
                            <span class="links_name" >ประเมินความพร้อมการดูแล</span>
                        </a>
                    </li>
                    <li>
                        <a href="assessinhomesss" >
                            <i class="bi bi-house-check"></i>
                            <span class="links_name" >แบบประเมินเยี่ยมบ้าน</span>
                        </a>
                    </li>
                    <li>
                        <a href="chat" >
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
                <div className="header">จัดการข้อมูลการดูแลผู้ป่วย</div>
                <div class="profile_details ">
                    <li>
                        <a href="profile">
                            <i class="bi bi-person"></i>
                            <span class="links_name">{data && data.nametitle + data.name + " " + data.surname}</span>
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
                        <li>
                            <a href="allpatient">จัดการข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a href="infopatient" onClick={() => navigate("/infopatient", { state: { id: id, user: user } })}>ข้อมูลการดูแลผู้ป่วย</a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>เพิ่มอุปกรณ์สำหรับผู้ป่วย</a>
                        </li>
                    </ul>
                </div>
                <h3>เพิ่มอุปกรณ์สำหรับผู้ป่วย</h3>
                <div className="adminall card mb-1">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-1">
                            <label>อุปกรณ์ติดตัว</label>
                            <select
                                className="form-select"
                                value={selectedEquipType1}
                                onChange={(e) =>
                                    handleChange(e, setSelectedEquipType1, "อุปกรณ์ติดตัว")
                                }
                            >
                                <option value="">เลือกอุปกรณ์ติดตัว</option>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data
                                        .filter(
                                            (equipment) =>
                                                equipment.equipment_type === "อุปกรณ์ติดตัว"
                                        )
                                        .map((equipment) => (
                                            <option
                                                key={equipment._id}
                                                value={equipment.equipment_name}
                                            >
                                                {equipment.equipment_name}
                                            </option>
                                        ))
                                ) : (
                                    <option value="">ไม่มีข้อมูลอุปกรณ์ติดตัว</option>
                                )}
                            </select>
                            {equipValidationMessages["อุปกรณ์ติดตัว"] && (
                                <div style={{ color: "red" }}>
                                    {equipValidationMessages["อุปกรณ์ติดตัว"]}
                                </div>
                            )}
                        </div>
                        <div className="mb-1">
                            <label>อุปกรณ์เสริม</label>
                            <select
                                className="form-select"
                                value={selectedEquipType2}
                                onChange={(e) =>
                                    handleChange(e, setSelectedEquipType2, "อุปกรณ์เสริม")
                                }
                            >
                                <option value="">เลือกอุปกรณ์เสริม</option>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data
                                        .filter(
                                            (equipment) => equipment.equipment_type === "อุปกรณ์เสริม"
                                        )
                                        .map((equipment) => (
                                            <option
                                                key={equipment._id}
                                                value={equipment.equipment_name}
                                            >
                                                {equipment.equipment_name}
                                            </option>
                                        ))
                                ) : (
                                    <option value="">ไม่มีข้อมูลอุปกรณ์เสริม</option>
                                )}
                            </select>
                            {equipValidationMessages["อุปกรณ์เสริม"] && (
                                <div style={{ color: "red" }}>
                                    {equipValidationMessages["อุปกรณ์เสริม"]}
                                </div>
                            )}
                        </div>
                        <div className="mb-1">
                            <label>อุปกรณ์อื่นๆ</label>
                            <select
                                className="form-select"
                                value={selectedEquipType3}
                                onChange={(e) =>
                                    handleChange(e, setSelectedEquipType3, "อุปกรณ์อื่นๆ")
                                }
                            >
                                <option value="">เลือกอุปกรณ์อื่นๆ</option>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data
                                        .filter(
                                            (equipment) => equipment.equipment_type === "อุปกรณ์อื่นๆ"
                                        )
                                        .map((equipment) => (
                                            <option
                                                key={equipment._id}
                                                value={equipment.equipment_name}
                                            >
                                                {equipment.equipment_name}
                                            </option>
                                        ))
                                ) : (
                                    <option value=""> ไม่มีข้อมูลอุปกรณ์อื่นๆ</option>
                                )}
                            </select>
                            {equipValidationMessages["อุปกรณ์อื่นๆ"] && (
                                <div style={{ color: "red" }}>
                                    {equipValidationMessages["อุปกรณ์อื่นๆ"]}
                                </div>
                            )}
                        </div>
                        {validationMessage && (
                            <div style={{ color: "red" }}>{validationMessage}</div>
                        )}
                        <div className="btn-group">
                            <div className="btn-next">
                                <button type="submit" className="btn btn-outline py-2">
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="btn-group">
                    <div className="btn-pre"></div>
                </div>
            </div>
        </main>
    );
}
