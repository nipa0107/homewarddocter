import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Updatepatient() {
    const location = useLocation();
    const { id, user } = location.state;
    const [data, setData] = useState([]);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tel, setTel] = useState("");
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");
    const [ID_card_number, setIDCardNumber] = useState("");
    const [nationality, setNationality] = useState("");
    const [Address, setAddress] = useState("");
    const [caregiverName, setCaregiverName] = useState('');
    const [caregiverSurname, setCaregiverSurname] = useState('');
    const [Relationship, setRelationship] = useState('');
    const [caregiverTel, setCaregiverTel] = useState('');
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [otherGender, setOtherGender] = useState("");
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherRelationship, setOtherRelationship] = useState("");

    const formatDate = (date) => {
        const formattedDate = new Date(date);
        // ตรวจสอบว่า date เป็น NaN หรือไม่
        if (isNaN(formattedDate.getTime())) {
            return ""; // ถ้าเป็น NaN ให้ส่งค่าว่างกลับไป
        }
        return formattedDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getuser/${id}`);
                const data = await response.json();
                setUsername(data.username);
                setName(data.name);
                setSurname(data.surname);
                setEmail(data.email);
                setPassword(data.password);
                setTel(data.tel);
                setGender(data.gender);
                setBirthday(data.birthday);
                setIDCardNumber(data.ID_card_number);
                setNationality(data.nationality);
                setAddress(data.Address);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchCaregiverData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getcaregiver/${id}`);
                const caregiverData = await response.json();
                if (caregiverData.status === 'ok') {
                    setCaregiverName(caregiverData.data.name);
                    setCaregiverSurname(caregiverData.data.surname);
                    setCaregiverTel(caregiverData.data.tel);
                    setRelationship(caregiverData.data.Relationship);
                }
            } catch (error) {
                console.error("Error fetching caregiver data:", error);
            }
        };

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
                    console.log(data);
                    setData(data.data);
                });
        }
        fetchData();
        fetchCaregiverData();
    }, [id]);

    const Updatepatient = async () => {
        try {
            const userData = {
                username,
                name,
                surname,
                email,
                password,
                tel,
                gender,
                birthday,
                ID_card_number,
                nationality,
                Address,
                user: id, // เชื่อมโยงกับผู้ใช้
                caregiverName,
                caregiverSurname,
                caregiverTel,
                Relationship
            };

            const response = await fetch(`http://localhost:5000/updateuserinfo/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                console.log("แก้ไขทั่วไปแล้ว:", updatedUser);
                toast.success("แก้ไขข้อมูลสำเร็จ");
                setTimeout(() => {
                    navigate("/infopatient", { state: { id: id, user: user } });
                }, 1100);
            } else {
                toast.error("ไม่สามารถแก้ไขทั่วไปได้:", response.statusText);
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการแก้ไขผู้ใช้:", error);
        }
    };

    const logOut = () => {
        window.localStorage.clear();
        window.location.href = "./";
    };

    const handleToggleSidebar = () => {
        setIsActive(!isActive);
    };

    const handleBreadcrumbClick = () => {
        navigate("/allinfo", { state: { id: id, user: user } });
    };

    const handleGenderChange = (e) => {
        const value = e.target.value;
        setGender(value);
        if (value === "อื่นๆ") {
            setShowOtherInput(true);
        } else {
            setShowOtherInput(false);
            setOtherGender("");
        }
    };

    const handleOtherGenderChange = (e) => {
        const value = e.target.value;
        setOtherGender(value);
        setGender(value); // Update gender to the value of otherGender
    };

    const handleRelationshipChange = (e) => {
        const value = e.target.value;
        setRelationship(value);
        if (value === "อื่นๆ") {
            setShowOtherInput(true);
        } else {
            setShowOtherInput(false);
            setOtherRelationship("");
        }
    };

    const handleOtherRelationshipChange = (e) => {
        const value = e.target.value;
        setOtherRelationship(value);
        setRelationship(value); // Update gender to the value of otherGender
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
            <div className="homeheader">
                <div className="header">จัดการข้อมูลการดูแลผู้ป่วย</div>
                <div class="profile_details ">
                    <li>
                        <a href="profile">
                            <i class="bi bi-person"></i>
                            <span class="links_name">{data && data.nametitle + data.name + " " + data.surname}</span>
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
                            <a href="alluser">จัดการข้อมูลการดูแลผู้ป่วย</a>
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
                            <a>แก้ไขข้อมูลทั่วไป</a>
                        </li>
                    </ul>
                </div>
                <h3>แก้ไขข้อมูลทั่วไป</h3>
                <div className="adminall card mb-1">
                    {/* <div className="mb-1">
                        <label>ชื่อผู้ใช้</label>
                        <input
                            type="text"
                            readOnly
                            className="form-control gray-background"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>อีเมล</label>
                        <input
                            type="text"
                            value={email}
                            readOnly
                            className="form-control gray-background"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div> */}
                    <div className="mb-1">
                        <label>ชื่อ</label>
                        <input
                            value={name}
                            type="text"
                            className="form-control"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>นามสกุล</label>
                        <input
                            type="text"
                            className="form-control"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>เพศ</label>
                        <input
                            type="text"
                            value={gender}
                            readOnly
                            className="form-control gray-background"
                            onChange={(e) => setGender(e.target.value)}
                        />
                    </div>
                    {/* <div className="mb-1">
                        <label>เพศ</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="ชาย"
                                    checked={gender === "ชาย"}
                                    onChange={handleGenderChange}
                                />
                                ชาย
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="หญิง"
                                    checked={gender === "หญิง"}
                                    onChange={handleGenderChange}
                                />
                                หญิง
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="ไม่ต้องการระบุ"
                                    checked={gender === "ไม่ต้องการระบุ"}
                                    onChange={handleGenderChange}
                                />
                                ไม่ต้องการระบุ
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="อื่นๆ"
                                    checked={showOtherInput}
                                    onChange={handleGenderChange}
                                />
                                อื่นๆ
                            </label>
                            {showOtherInput && (
                                <div className="mt-2">
                                    <label>กรุณาระบุ:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={otherGender}
                                        onChange={handleOtherGenderChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div> */}

                    <div className="mb-1">
                        <label>วันเกิด</label>
                        <input
                            value={formatDate(birthday)}
                            type="date"
                            className="form-control"
                            onChange={(e) => setBirthday(e.target.value)}
                        />
                    </div>

                    <div className="mb-1">
                        <label>เลขประจำตัวบัตรประชาชน</label>
                        <input
                            value={ID_card_number}
                            type="text"
                            className="form-control gray-background"
                            readOnly
                            onChange={(e) => setIDCardNumber(e.target.value)}
                        />
                    </div>

                    <div className="mb-1">
                        <label>สัญชาติ</label>
                        <input
                            value={nationality}
                            type="text"
                            className="form-control"
                            onChange={(e) => setNationality(e.target.value)}
                        />
                    </div>

                    <div className="mb-1">
                        <label>ที่อยู่</label>
                        <input
                            value={Address}
                            type="text"
                            className="form-control"
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>เบอร์โทรศัพท์</label>
                        <input
                            type="text"
                            value={tel}
                            className="form-control"
                            onChange={(e) => setTel(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>ชื่อ(ผู้ดูแล)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={caregiverName}
                            onChange={(e) => setCaregiverName(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>นามสกุล(ผู้ดูแล)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={caregiverSurname}
                            onChange={(e) => setCaregiverSurname(e.target.value)}
                        />
                    </div>
                    <div className="mb-1">
                        <label>ความสัมพันธ์</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="พ่อ"
                                    checked={Relationship === "พ่อ"}
                                    onChange={handleRelationshipChange}
                                />
                                พ่อ
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="แม่"
                                    checked={Relationship === "แม่"}
                                    onChange={handleRelationshipChange}
                                />
                                แม่
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="ลูก"
                                    checked={Relationship === "ลูก"}
                                    onChange={handleRelationshipChange}
                                />
                                ลูก
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="ภรรยา"
                                    checked={Relationship === "ภรรยา"}
                                    onChange={handleRelationshipChange}
                                />
                                ภรรยา
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="สามี"
                                    checked={Relationship === "สามี"}
                                    onChange={handleRelationshipChange}
                                />
                                สามี
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="อื่นๆ"
                                    checked={showOtherInput}
                                    onChange={handleRelationshipChange}
                                />
                                อื่นๆ
                            </label>
                            {showOtherInput && (
                                <div className="mt-2">
                                    <label>กรุณาระบุ:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={otherRelationship}
                                        onChange={handleOtherRelationshipChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-1">
                        <label>เบอร์โทรศัพท์(ผู้ดูแล)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={caregiverTel}
                            onChange={(e) => setCaregiverTel(e.target.value)}
                        />
                    </div>
                    <div className="btn-group">
                        <div className="btn-next">
                            <button type="button" onClick={Updatepatient} className="btn btn-outline py-2">
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div></div>
        </main>
    );
}   