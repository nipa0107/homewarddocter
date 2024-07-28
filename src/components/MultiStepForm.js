import React, { useEffect, useState } from "react";
import "../css/sidebar.css";
import "../css/alladmin.css"
import "bootstrap-icons/font/bootstrap-icons.css";
import logow from "../img/logow.png";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, Chart, Bar, XAxis, YAxis } from 'recharts';
import {
    Typography,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    useForm,
    Controller,
    FormProvider,
    useFormContext,
} from "react-hook-form";
import { useStepContext } from "@mui/material";


export default function MultiStepForm() {
    const navigate = useNavigate();
    const [data, setData] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [token, setToken] = useState("");
    const [medicalData, setMedicalData] = useState({});
    const location = useLocation();
    const { id } = location.state;
    const userId = location.state.id; // Get user ID from the navigation state
    const [assessmentData, setAssessmentData] = useState([]);
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [gender, setGender] = useState("");
    const [birthday, setBirthday] = useState("");
    const [userAge, setUserAge] = useState(0);
    const [userAgeInMonths, setUserAgeInMonths] = useState(0);
    const [userData, setUserData] = useState(null);


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
        const fetchAssessmentData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/getAssessreadiness/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setAssessmentData(data.data); // Store assessment data
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching assessment data:', error);
            }
        };

        const fetchMedicalData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/medicalInformation/${userId}`);
                const data = await response.json();

                if (response.ok) {
                    setMedicalData(data.data);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching medical data:', error);
            }
        };

        fetchAssessmentData();
        fetchMedicalData();
    }, [userId]);

    const currentDate = new Date();

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

    const handleToggleSidebar = () => {
        setIsActive(!isActive);
    };

    const [activeStep, setActiveStep] = useState(0);

    const nextStep = () =>{
        if(activeStep < 6)
        setActiveStep((currentStep)=> currentStep + 1)
    }
    const previousStep = () =>{
        if(activeStep !== -1)
        setActiveStep((currentStep)=> currentStep - 1)
    }

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
                    <div className="header">แบบประเมินเยี่ยมบ้าน</div>
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
                            <a href="MultiStepForm">แบบประเมินเยี่ยมบ้าน</a>
                        </li>
                        <li className="arrow">
                            <i class="bi bi-chevron-double-right"></i>
                        </li>
                        <li>
                            <a>รายละเอียดการประเมิน</a>
                        </li>
                    </ul>
                </div>
                <br></br>
                <Stepper alternativeLabel activeStep={activeStep}>
                    <Step>
                        <StepLabel>Immobility</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Nutrition</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Housing</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Physical examination</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>SSS</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Assessment</StepLabel>
                    </Step>
                </Stepper>
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
                    <p>{assessmentData.map((assessment, index) => (
                        <div key={index}>
                            <p className="textassesment"><p className="evaluated"><label>สถานะ:</label>{assessment.status_name || "ไม่มีข้อมูล"}</p></p>
                        </div>
                    ))}</p>
                </div>
                <h3>{activeStep}</h3>
                <div className="btn-group">
                    <div className="btn-pre">
                        <button type="button" onClick={() => previousStep()} className="btn btn-outline py-2">ก่อนหน้า</button>
                    </div>
                    <div className="btn-next">
                        <button type="button" onClick={() => nextStep()}className="btn btn-outline-primary py-2">ถัดไป</button>
                    </div>
                </div>
            </div>
        </main>
    );
}
