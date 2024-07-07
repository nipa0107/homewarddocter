import React, { useEffect, useState } from "react";
import "../css/alladmin.css";
import "../css/sidebar.css";
import logow from "../img/logow.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  LineChart,
  Line,
} from "recharts";
import "../css/contentgraph.css";
export default function Assessmentuserone({}) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [token, setToken] = useState("");

  const [isActive, setIsActive] = useState(false);
  const [patientFormsone, setPatientFormsone] = useState("");
  const location = useLocation();
  const { id } = location.state;
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [detail, setDetail] = useState("");
  const [status_name, setstatus_name] = useState("");
  const [PPS, setPPS] = useState("");
  const [statusName, setStatusName] = useState("");
  const [dateass, setDateass] = useState([]);
  const [isAssessed, setIsAssessed] = useState(false);
  const [dtxdata, setDTXData] = useState([]);
  const [Painscoredata, setPainscoreData] = useState([]);
  const [Temperaturedata, setTemperatureData] = useState([]);
  const [BloodPressuredata, setBloodPressureData] = useState([]);
  const [PulseRatedata, setPulseRateData] = useState([]);
  const [Resptrationdata, setResptrationData] = useState([]);
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [mpersonnel, setMPersonnel] = useState([]);
  const [mpersonnelID, setMPersonnelID] = useState([]);
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
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          setData(data.data);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          // logOut();
        });
    }
  }, []);

  useEffect(() => {
    const fetchpatientForms = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/getpatientformsone/${id}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setPatientFormsone(data.data);

        // const formattedData = data.data.map((item, index) => ({
        //   name: `Record ${index + 1}`,
        //   DTX: item.DTX
        // }));

        // setDTXData(formattedData);
      } catch (error) {
        console.error("Error fetching patient forms:", error);
      }
    };

    fetchpatientForms();
  }, [id, token]);

  useEffect(() => {
    if (patientFormsone.user) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/getuser/${patientFormsone.user}`
          );
          const data = await response.json();
          setName(data.name);
          setSurname(data.surname);
          setGender(data.gender);
          setBirthday(data.birthday);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchData();
    }
  }, [patientFormsone.user]);

  useEffect(() => {
    if (patientFormsone && patientFormsone.user) {
      const fetchMedicalInfo = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/medicalInformation/${patientFormsone.user}`
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
  }, [patientFormsone.user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:5000/addassessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        suggestion,
        detail,
        status_name: statusName,
        PPS,
        MPersonnel: data._id,
        PatientForm: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          toast.success("เพิ่มข้อมูลสำเร็จ");
          setTimeout(() => {
            navigate("/assessmentuser", {
              state: { id: patientFormsone.user },
            });
          }, 1000);
        }
      });
  };

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/allAssessments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        const currentAssessment = data.data.find(
          (assessment) => assessment.PatientForm === patientFormsone._id
        );
        if (currentAssessment) {
          setIsAssessed(true);
          setStatusName(currentAssessment.status_name);
          setPPS(currentAssessment.PPS);
          setDetail(currentAssessment.detail);
          setSuggestion(currentAssessment.suggestion);
          setMPersonnel(currentAssessment.MPersonnel);
          setDateass(currentAssessment.createdAt);
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    fetchAssessments();
  }, [patientFormsone._id]);

  useEffect(() => {
    const fetchDatadtx = async () => {
      try {
        if (patientFormsone.user) {
          const response = await fetch(
            `http://localhost:5000/getDTXData/${patientFormsone.user}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            setDTXData(data.data);
          }
          // else {
          //   console.error("Error fetching DTX data");
          // }
        }
      } catch (error) {
        console.error("Error fetching DTX data:", error);
      }
    };

    fetchDatadtx();
  }, [patientFormsone.user]);

  useEffect(() => {
    const fetchDataPainscore = async () => {
      try {
        if (patientFormsone.user) {
          const response = await fetch(
            `http://localhost:5000/getPainscoreData/${patientFormsone.user}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            setPainscoreData(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching Painscore data:", error);
      }
    };

    fetchDataPainscore();
  }, [patientFormsone.user, token]);

  useEffect(() => {
    const fetchDataTemperature = async () => {
      try {
        if (patientFormsone.user) {
          // ตรวจสอบว่าค่า user มีค่าหรือไม่
          const response = await fetch(
            `http://localhost:5000/getTemperatureData/${patientFormsone.user}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            setTemperatureData(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching Temperature data:", error);
      }
    };

    fetchDataTemperature();
  }, [patientFormsone.user, token]);

  useEffect(() => {
    const fetchDataBloodPressure = async () => {
      try {
        if (patientFormsone.user) {
          const response = await fetch(
            `http://localhost:5000/getBloodPressureData/${patientFormsone.user}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            setBloodPressureData(data.data);
          }
          // else {
          //   console.error("Error fetching BloodPressure data");
          // }
        }
      } catch (error) {
        console.error("Error fetching Painscore data:", error);
      }
    };

    fetchDataBloodPressure();
  }, [patientFormsone.user]);

  useEffect(() => {
    const fetchDataPulseRate = async () => {
      try {
        if (patientFormsone.user) {
          const response = await fetch(
            `http://localhost:5000/getPulseRateData/${patientFormsone.user}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            setPulseRateData(data.data);
          }
          // else {
          //   console.error("Error fetching PulseRate data");
          // }
        }
      } catch (error) {
        console.error("Error fetching Painscore data:", error);
      }
    };

    fetchDataPulseRate();
  }, [patientFormsone.user]);

  useEffect(() => {
    const fetchDataResptration = async () => {
      try {
        if (patientFormsone.user) {
          const response = await fetch(
            `http://localhost:5000/getResptrationData/${patientFormsone.user}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            setResptrationData(data.data);
          }
          // else {
          //   console.error("Error fetching Resptration data");
          // }
        }
      } catch (error) {
        console.error("Error fetching Painscore data:", error);
      }
    };

    fetchDataResptration();
  }, [patientFormsone.user]);

  const currentDate = new Date();

  // const userBirthday = new Date(birthday);

  // let userAge = "";
  // if (userBirthday) {
  //   const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();

  //   const isBeforeBirthday =
  //     currentDate.getMonth() < userBirthday.getMonth() ||
  //     (currentDate.getMonth() === userBirthday.getMonth() &&
  //       currentDate.getDate() < userBirthday.getDate());

  //   userAge = isBeforeBirthday ? ageDiff - 1 : ageDiff;
  // }

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

    return `${day < 10 ? "0" + day : day} ${thaiMonths[month - 1]} ${
      year + 543
    } เวลา ${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    } น.`;
  };

  // const formattedData = dtxdata.map((item) => ({
  //   createdAt: formatDate(item.createdAt),
  //   DTX: item.DTX,
  // }));

  const CustomTooltipDTX = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <p className="desc">{`DTX: ${data.DTX}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPainscore = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <p className="desc">{`Painscore: ${data.Painscore}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipTemperature = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <p className="desc">{`Temperature: ${data.Temperature}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipBloodPressure = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <p className="desc">{`BloodPressure: ${data.BloodPressure}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPulseRate = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <p className="desc">{`PulseRate: ${data.PulseRate}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipResptration = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${formatDate(data.createdAt)}`}</p>
          <p className="desc">{`Resptration: ${data.Resptration}`}</p>
        </div>
      );
    }
    return null;
  };

  const handleBreadcrumbClick = () => {
    navigate("/assessmentuser", { state: { id: patientFormsone.user } });
  };

  const handleButtonClick = (value) => {
    setStatusName(value);
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
          <div className="profile_details ">
            <li>
              <a href="profile">
                <i className="bi bi-person"></i>
                <span className="links_name">
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
              <a href="assessment" className="info">
                ติดตาม/ประเมินอาการ
              </a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a onClick={handleBreadcrumbClick} className="info">
                การบันทึกอาการผู้ป่วย
              </a>
            </li>
            <li className="arrow">
              <i class="bi bi-chevron-double-right"></i>
            </li>
            <li>
              <a>รายละเอียดอาการผู้ป่วย</a>
            </li>
          </ul>
        </div>
        <div className="toolbar"></div>
        <div className="content">
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
          
          <div className="contentinass">
            <p className="texthead">
              วันที่บันทึก: {formatDate(patientFormsone.createdAt)}
            </p>
            <p className="textheadSymptom">อาการและอาการแสดง</p>
            {patientFormsone.Symptom1 && (
              <div className="inline-container">
                <label>อาการที่ 1:</label>
                <p className="text">{patientFormsone.Symptom1}</p>
              </div>
            )}
            {patientFormsone.Symptom2 && (
              <div className="inline-container">
                <label>อาการที่ 2:</label>
                <p className="text">{patientFormsone.Symptom2}</p>
              </div>
            )}
            {patientFormsone.Symptom3 && (
              <div className="inline-container">
                <label>อาการที่ 3:</label>
                <p className="text">{patientFormsone.Symptom3}</p>
              </div>
            )}
            {patientFormsone.Symptom4 && (
              <div className="inline-container">
                <label>อาการที่ 4: </label>
                <p className="text">{patientFormsone.Symptom4}</p>
              </div>
            )}
            {patientFormsone.Symptom5 && (
              <div className="inline-container">
                <label>อาการที่ 5:</label>
                <p className="text">{patientFormsone.Symptom5}</p>
              </div>
            )}
            <div className="inline-container">
              <label>สิ่งที่อยากให้ทีมแพทย์ช่วยเหลือเพิ่มเติม:</label>
              <p className="text">{patientFormsone.request_detail}</p>
            </div>
            <div className="inline-container">
              <label>ความรุนแรงของอาการ:</label>
              <p className="text">{patientFormsone.LevelSymptom}</p>
            </div>
          </div>

          {/* <div className="contentinass"> */}
          <div className="contentgraphs">
            <div className="contentgraph">
              <p className="h3">ความดันโลหิต (mmHg)</p>
              <p className="textgraph">
                {/* ล่าสุด: {formatDate(patientFormsone.createdAt)} */}
              </p>
              {BloodPressuredata && (
                <div className="chart-container">
                  <BarChart
                    width={300}
                    height={230}
                    data={BloodPressuredata}
                    margin={{ left: -30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* <XAxis dataKey="createdAt"/> */}
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltipBloodPressure />} />
                    <Legend />
                    <Bar
                      dataKey="BloodPressure"
                      fill="#e5da6c"
                      name="ความดันโลหิต"
                    />
                  </BarChart>
                </div>
              )}
            </div>
            <div className="contentgraph">
              <p className="h3">ชีพจร (ครั้ง/นาที)</p>
              <p className="textgraph">
                {/* ล่าสุด: {formatDate(patientFormsone.createdAt)} */}
              </p>
              {PulseRatedata && (
                <div className="chart-container">
                  <BarChart
                    width={300}
                    height={230}
                    data={PulseRatedata}
                    margin={{ left: -30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* <XAxis dataKey="createdAt"/> */}
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltipPulseRate />} />
                    <Legend />
                    <Bar dataKey="PulseRate" fill="#444b8c" name="ชีพจร" />
                  </BarChart>
                </div>
              )}
            </div>
            <div className="contentgraph">
              <p className="h3"> การหายใจ (ครั้ง/นาที)</p>
              <p className="textgraph">
                {/* ล่าสุด: {formatDate(patientFormsone.createdAt)} */}
              </p>
              {Resptrationdata && (
                <div className="chart-container">
                  <BarChart
                    width={300}
                    height={230}
                    data={Resptrationdata}
                    margin={{ left: -30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* <XAxis dataKey="createdAt"/> */}
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltipResptration />} />
                    <Legend />
                    <Bar dataKey="Resptration" fill="#ee749b" name="การหายใจ" />
                  </BarChart>
                </div>
              )}
            </div>

            <div className="contentgraph">
              <p className="h3">อุณหภูมิ (°C)</p>
              <p className="textgraph">
                {/* ล่าสุด: {formatDate(patientFormsone.createdAt)} */}
              </p>
              {Temperaturedata && (
                <div className="chart-container">
                  <BarChart
                    width={300}
                    height={230}
                    data={Temperaturedata}
                    margin={{ left: -30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* <XAxis dataKey="createdAt"/> */}
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltipTemperature />} />
                    <Legend />
                    <Bar dataKey="Temperature" fill="#40ba9c" name="อุณหภูมิ" />
                  </BarChart>
                </div>
              )}
            </div>
            <div className="contentgraph">
              <p className="h3">ระดับความเจ็บปวด</p>
              <p className="textgraph">
                {/* ล่าสุด: {formatDate(patientFormsone.createdAt)} */}
              </p>
              {Painscoredata && (
                <div className="chart-container">
                  <BarChart
                    width={300}
                    height={230}
                    data={Painscoredata}
                    margin={{ left: -30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* <XAxis dataKey="createdAt"/> */}
                    <YAxis
                      tick={{ fontSize: 12 }}
                      domain={[0, 10]}
                      ticks={[0, 2, 4, 6, 8, 10]}
                    />
                    <Tooltip content={<CustomTooltipPainscore />} />
                    <Legend />
                    <Bar
                      dataKey="Painscore"
                      fill="#ff7f51"
                      name="ระดับความเจ็บปวด"
                    />
                  </BarChart>
                </div>
              )}
            </div>
            <div className="contentgraph">
              <p className="h3">ระดับน้ำตาลในเลือด (mg/dL)</p>
              <p className="textgraph">
                {/* ล่าสุด: {formatDate(patientFormsone.createdAt)} */}
              </p>
              {dtxdata && (
                <div className="chart-container">
                  <BarChart
                    width={300}
                    height={230}
                    data={dtxdata}
                    margin={{ left: -30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* <XAxis dataKey="createdAt"/> */}
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltipDTX />} />
                    <Legend />
                    <Bar
                      dataKey="DTX"
                      fill="#7978b1"
                      name="ระดับน้ำตาลในเลือด"
                    />
                  </BarChart>
                </div>
              )}
              {/* </div> */}
            </div>
          </div>

          {isAssessed ? (
            <div className="contentinass">
              <p className="texthead">การประเมินอาการ</p>
              <div className="mb-1">
                {/* <div className="mb-3">
                  <div className="btn-group">
                    <div
                      className={`btnass ${
                        statusName === "ปกติ" ? "btn-normal" : "btn-outline"
                      }`}
                    >
                      ปกติ
                    </div>
                    <div
                      className={`btnass ${
                        statusName === "ผิดปกติ"
                          ? "btn-abnormal"
                          : "btn-outline"
                      }`}
                    >
                      ผิดปกติ
                    </div>
                    <div
                      className={`btnass ${
                        statusName === "จบการรักษา"
                          ? "btn-completed"
                          : "btn-outline"
                      }`}
                    >
                      จบการรักษา
                    </div>
                    <input type="hidden" value={statusName} />
                  </div>
                </div> */}
                <div className="mb-3">
                  <div className="btn-group">
                    {statusName === "ปกติ" && (
                      <div
                        className="btnass btn-normal"
                        onClick={() => handleButtonClick("ปกติ")}
                      >
                        ปกติ
                      </div>
                    )}
                    {statusName === "ผิดปกติ" && (
                      <div
                        className="btnass btn-abnormal"
                        onClick={() => handleButtonClick("ผิดปกติ")}
                      >
                        ผิดปกติ
                      </div>
                    )}
                    {statusName === "จบการรักษา" && (
                      <div
                        className="btnass btn-completed"
                        onClick={() => handleButtonClick("จบการรักษา")}
                      >
                        จบการรักษา
                      </div>
                    )}
                    <input type="hidden" value={statusName} />
                  </div>
                </div>
              </div>
              <div className="inline-container">
                <label>PPS: </label>
                <p className="text">{PPS}</p>
              </div>

              <div className="inline-container">
                <label>รายละเอียด: </label>
                <p className="text">{detail}</p>
              </div>
              <div className="inline-container">
                <label>คำแนะนำ: </label>
                <p className="text">{suggestion}</p>
              </div>
              <div className="inline-container">
                <label>ผู้ประเมิน: </label>
                <p className="text">
                  {mpersonnel.nametitle} {mpersonnel.name} {mpersonnel.surname}
                </p>
              </div>
              <div className="inline-container">
                <label>วันที่ประเมิน: </label>
                <p className="text">{formatDate(dateass)}</p>
              </div>
            </div>
          ) : (
            <div className="contentinass">
              <p className="texthead">ประเมินอาการ</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-1">
                  <div className="mb-3">
                    <div className="btn-group">
                      <div
                        className={`btnass ${
                          statusName === "ปกติ" ? "btn-normal" : "btn-outline"
                        }`}
                        onClick={() => handleButtonClick("ปกติ")}
                      >
                        ปกติ
                      </div>
                      <div
                        className={`btnass ${
                          statusName === "ผิดปกติ"
                            ? "btn-abnormal"
                            : "btn-outline"
                        }`}
                        onClick={() => handleButtonClick("ผิดปกติ")}
                      >
                        ผิดปกติ
                      </div>
                      <div
                        className={`btnass ${
                          statusName === "จบการรักษา"
                            ? "btn-completed"
                            : "btn-outline"
                        }`}
                        onClick={() => handleButtonClick("จบการรักษา")}
                      >
                        จบการรักษา
                      </div>
                      <input type="hidden" value={statusName} />
                    </div>
                  </div>
                  <div className="inline-container">
                    <label>PPS</label>
                    <select
                      className="form-control select"
                      onChange={(e) => setPPS(e.target.value)}
                    >
                      <option value="">กรุณาเลือก</option>
                      <option value="0">0</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="30">30</option>
                      <option value="40">40</option>
                      <option value="50">50</option>
                      <option value="60">60</option>
                      <option value="70">70</option>
                      <option value="80">80</option>
                      <option value="90">90</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <div className="inline-container">
                  <label>รายละเอียด: </label>
                  <textarea
                    type="text"
                    className="form-control"
                    onChange={(e) => setDetail(e.target.value)}
                  />
                </div>
                <div className="inline-container">
                  <label>คำแนะนำ: </label>
                  <textarea
                    type="text"
                    className="form-control"
                    onChange={(e) => setSuggestion(e.target.value)}
                  />
                </div>

                <div className="d-grid save">
                  <button type="submit" className="btn btnsave py-2">
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
