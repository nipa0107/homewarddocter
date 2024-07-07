import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from 'react-router-dom';

export default function Assessreadiness() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [patientForms, setPatientForms] = useState("");
    const location = useLocation();
    const { id } = location.state;
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");
    const [assessments, setAssessments] = useState([]);
    const [mpersonnel, setMPersonnel] = useState([]);
    const [userAge, setUserAge] = useState(0);
    const [userAgeInMonths, setUserAgeInMonths] = useState(0);
    const [userData, setUserData] = useState(null);
    const [medicalData, setMedicalData] = useState([]);

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
                });
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getuser/${id}`);
                const data = await response.json();
                setUserData(data);
                setUsername(data.username);
                setName(data.name);
                setSurname(data.surname);
                setGender(data.gender);
                setBirthday(data.birthday);
            } catch (error) {
                console.error("Error fetching caremanual data:", error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (userData && userData._id) {
            const fetchMedicalInfo = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/medicalInformation/${userData._id}`
                    );
                    const data = await response.json();
                    console.log("Medical Information:", data);
                    setMedicalData(data.data);
                    console.log("22:", medicalData);

                } catch (error) {
                    console.error("Error fetching medical information:", error);
                }
            };

            fetchMedicalInfo();
        }
    }, [userData]);



    const fetchpatientForms = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/getpatientforms/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setPatientForms(data.data);
            console.log("Patient Forms:", data.data);
        } catch (error) {
            console.error("Error fetching patient forms:", error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchpatientForms();
        }
    }, [id]);

    const fetchAssessments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/allAssessment`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setAssessments(data.data);
            console.log("AssessmentForms:", data.data);
        } catch (error) {
            console.error("Error fetching patient forms:", error);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);
    const fetchMpersonnel = async () => {
        try {
            const response = await fetch(`http://localhost:5000/allMpersonnel`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setMPersonnel(data.data);
            console.log("Mpersonnel:", data.data);
        } catch (error) {
            console.error("Error fetching patient forms:", error);
        }
    };

    useEffect(() => {
        fetchMpersonnel();
    }, []);

    const currentDate = new Date();

    const userBirthday = new Date(birthday);

    useEffect(() => {
        if (birthday) {
            const userBirthday = new Date(birthday);
            const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();
            const monthDiff = currentDate.getMonth() - userBirthday.getMonth();
            setUserAgeInMonths(monthDiff >= 0 ? monthDiff : 12 + monthDiff);

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && currentDate.getDate() < userBirthday.getDate())
            ) {
                setUserAge(ageDiff - 1);
            } else {
                setUserAge(ageDiff);
            }
        }
    }, [currentDate]);

    const logOut = () => {
        window.localStorage.clear();
        window.location.href = "./";
    };
    // bi-list
    const handleToggleSidebar = () => {
        setIsActive(!isActive);
    };
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

        return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${year + 543
            } เวลา ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
            } น.`;
    };

    const [formData, setFormData] = useState({
        question1: '',
        question2: '',
        question3: '',
        question4: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleNext = () => {
        navigate("/assessreadinesspage2", { state: { id, formData } });
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
                <div className="header">ประเมินความพร้อมการดูแล
                </div>
                <div class="profile_details ">
                    <li>
                        <a href="profile">
                            <i class="bi bi-person"></i>
                            <span class="links_name" >{data && data.nametitle + data.name + " " + data.surname}</span>
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
                            <a href="assessreadiness">ประเมินความพร้อมการดูแล</a>
                        </li>
                    </ul>
                </div>
                <h3>การประเมินที่พักอาศัยระหว่างการดูแลแบบผู้ป่วยในบ้าน</h3>
                <div className="">
                    <p className="headerassesment">
                        {name} {surname}
                    </p>
                    {birthday ? (
                        <p className="textassesment">
                            <label>อายุ:</label> {userAge} ปี {userAgeInMonths} เดือน <label>เพศ:</label>{gender}
                        </p>
                    ) : (
                        <p className="textassesment"> <label>อายุ:</label>0 ปี 0 เดือน <label>เพศ:</label>{gender}</p>
                    )}
                    <p className="textassesment">

                        <label>HN:</label>
                        {medicalData && medicalData.HN
                            ? medicalData.HN
                            : "ไม่มีข้อมูล"}
                        <label>AN:</label>
                        {medicalData && medicalData.AN
                            ? medicalData.AN
                            : "ไม่มีข้อมูล"}
                        <label>ผู้ป่วยโรค:</label>
                        {medicalData && medicalData.Diagnosis
                            ? medicalData.Diagnosis
                            : "ไม่มีข้อมูล"}
                    </p>

                </div>
                <div className="adminall card mb-1">
                    <form>
                        <div className="mb-1">
                            <label>1. ผู้ป่วยและผู้ดูแลได้รับข้อมูลแนวทางการรักษาด้วยการดูแลแบบผู้ป่วยใน ที่บ้านจากแพทย์อย่างครบถ้วน และให้คำยินยอมก่อนรับบริการใช่หรือไม่?</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question1"
                                        value="ใช่"
                                        checked={formData.question1 === 'ใช่'}
                                        onChange={handleChange}
                                    />
                                    ใช่
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question1"
                                        value="ไม่ใช่"
                                        checked={formData.question1 === 'ไม่ใช่'}
                                        onChange={handleChange}
                                    />
                                    ไม่ใช่
                                </label>
                            </div>
                        </div>
                        <div className="mb-1">
                            <label>2. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน มีความปลอดภัยใช่หรือไม่?</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question2"
                                        value="ใช่"
                                        checked={formData.question2 === 'ใช่'}
                                        onChange={handleChange}
                                    />
                                    ใช่
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question2"
                                        value="ไม่ใช่"
                                        checked={formData.question2 === 'ไม่ใช่'}
                                        onChange={handleChange}
                                    />
                                    ไม่ใช่
                                </label>
                            </div>
                        </div>
                        <div className="mb-1">
                            <label>3. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน อยู่ห่างจากโรงพยาบาลไม่เกิน 20 กิโลเมตรและเดินทางมาโรงพยาบาลได้สะดวกใช่หรือไม่?</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question3"
                                        value="ใช่"
                                        checked={formData.question3 === 'ใช่'}
                                        onChange={handleChange}
                                    />
                                    ใช่
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question3"
                                        value="ไม่ใช่"
                                        checked={formData.question3 === 'ไม่ใช่'}
                                        onChange={handleChange}
                                    />
                                    ไม่ใช่
                                </label>
                            </div>
                        </div>
                        <div className="mb-1">
                            <label>4. ที่พักอาศัยระหว่างการดูแลผู้ป่วยในบ้าน สามารถเข้าถึงช่องทางสื่อสารทางโทรศัพท์หรืออินเทอร์เน็ตใช่หรือไม่?</label>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question4"
                                        value="ใช่"
                                        checked={formData.question4 === 'ใช่'}
                                        onChange={handleChange}
                                    />
                                    ใช่
                                </label>
                            </div>
                            <div>
                                <label>
                                    <input
                                        type="radio"
                                        name="question4"
                                        value="ไม่ใช่"
                                        checked={formData.question4 === 'ไม่ใช่'}
                                        onChange={handleChange}
                                    />
                                    ไม่ใช่
                                </label>
                            </div>
                        </div>
                        <div className="btn-group">
                            <div className="btn-next">
                                <button type="button" onClick={handleNext} className="btn btn-outline py-2">
                                    ถัดไป
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}

