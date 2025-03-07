import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';

export const Nutrition = ({ onDataChange }) => {
  const { control, getValues, setValue } = useFormContext();
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const location = useLocation();
  const { id } = location.state;
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [activityLevel, setActivityLevel] = useState("");
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);

  const [nutritionData, setNutritionData] = useState({
    gender: '',
    userAge: 0,
    userAgeInMonths: 0,
    weight: 0,
    height: 0,
    bmr: 0,
    tdee: 0,
    activityLevel: '',
    intakeMethod: [],
    foodTypes: [],
    medicalFood: '',
    otherFood: '',
    favoriteFood: '',
    cooks: [],
    nutritionStatus: '',
  });

  // ดึงข้อมูลจาก localStorage เมื่อหน้ารีเฟรช
  useEffect(() => {
    const storedData = localStorage.getItem('nutritionData');
    if (storedData) {
      const storedNutritionData = JSON.parse(storedData);
      setNutritionData(storedNutritionData);

      // ใช้ setValue จาก react-hook-form เพื่ออัปเดตค่าในฟอร์ม
      Object.keys(storedNutritionData).forEach((key) => {
        setValue(key, storedNutritionData[key]);
      });

      // กำหนดค่า tdee และ activityLevel จาก localStorage
      setTdee(storedNutritionData.tdee || 0);
      setActivityLevel(storedNutritionData.activityLevel || "");
    }
  }, [setValue]);

  useEffect(() => {
    if (gender) {
      setNutritionData((prev) => ({
        ...prev,
        gender: gender,
      }));
    }
  }, [gender]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getuser/${id}`);
        const data = await response.json();

        // ตั้งค่า gender และ birthday
        setGender(data.gender || "");
        setBirthday(data.birthday || "");

        // คำนวณ userAge และ userAgeInMonths
        if (data.birthday) {
          const userBirthday = new Date(data.birthday);
          const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();
          const monthDiff = currentDate.getMonth() - userBirthday.getMonth();

          const calculatedMonths = monthDiff >= 0 ? monthDiff : 12 + monthDiff;
          const calculatedYears =
            monthDiff < 0 ||
              (monthDiff === 0 && currentDate.getDate() < userBirthday.getDate())
              ? ageDiff - 1
              : ageDiff;

          setUserAge(calculatedYears);
          setUserAgeInMonths(calculatedMonths);

          // อัปเดต nutritionData
          setNutritionData((prev) => ({
            ...prev,
            gender: data.gender || "",
            userAge: calculatedYears,
            userAgeInMonths: calculatedMonths,
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [id]);


  const currentDate = new Date();

  useEffect(() => {
    if (birthday) {
      const userBirthday = new Date(birthday);
      const ageDiff = currentDate.getFullYear() - userBirthday.getFullYear();
      const monthDiff = currentDate.getMonth() - userBirthday.getMonth();

      const calculatedMonths = monthDiff >= 0 ? monthDiff : 12 + monthDiff;
      const calculatedYears =
        monthDiff < 0 ||
          (monthDiff === 0 && currentDate.getDate() < userBirthday.getDate())
          ? ageDiff - 1
          : ageDiff;

      setUserAge(calculatedYears);
      setUserAgeInMonths(calculatedMonths);
      setNutritionData((prev) => ({
        ...prev,
        userAge: calculatedYears,
        userAgeInMonths: calculatedMonths,
      }));
    }
  }, [birthday]);

  useEffect(() => {
    const calculateBmr = () => {
      const weight = parseFloat(getValues('weight'));
      const height = parseFloat(getValues('height'));

      if (isNaN(weight) || isNaN(height) || !userAge || !gender) {
        return; // ถ้ามีข้อมูลไม่ครบ ให้ข้ามการคำนวณ
      }

      let calculatedBmr = 0;

      if (gender === "ชาย") {
        calculatedBmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * userAge);
      } else if (gender === "หญิง") {
        calculatedBmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * userAge);
      }

      setBmr(Math.round(calculatedBmr));
      setValue('bmr', Math.round(calculatedBmr));
      setNutritionData((prev) => ({
        ...prev,
        bmr: Math.round(calculatedBmr),
      }));
    };

    calculateBmr();
  }, [getValues('weight'), getValues('height'), userAge, gender]); // คำนวณใหม่เมื่อ weight, height, userAge หรือ gender เปลี่ยน


  useEffect(() => {
    const calculateTdee = () => {
      const activityFactors = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        super_active: 1.9
      };

      if (!bmr || !activityLevel || !activityFactors[activityLevel]) {
        return; // ถ้า BMR หรือ activityLevel ไม่ครบ ให้ข้ามการคำนวณ
      }

      const calculatedTdee = bmr * activityFactors[activityLevel];
      setTdee(Math.round(calculatedTdee));
      setValue('tdee', Math.round(calculatedTdee));
      setNutritionData((prev) => ({
        ...prev,
        tdee: Math.round(calculatedTdee),
      }));
      localStorage.setItem('nutritionData', JSON.stringify({
        ...nutritionData,
        tdee: Math.round(calculatedTdee),
      }));
    };

    calculateTdee();
  }, [bmr, activityLevel]); // คำนวณใหม่เมื่อ BMR หรือ activityLevel เปลี่ยน


  const handleInputChange = (name, value) => {
    const updatedValue = value || (typeof nutritionData[name] === 'number' ? 0 : nutritionData[name]);
    const updatedData = {
      ...nutritionData,
      [name]: updatedValue,
      gender: gender || nutritionData.gender, // ใช้ gender จาก state ถ้ายังไม่มีการแก้ไข
      userAge: userAge || nutritionData.userAge, // ใช้ userAge ที่คำนวณแล้ว
      userAgeInMonths: userAgeInMonths || nutritionData.userAgeInMonths, // ใช้ userAgeInMonths ที่คำนวณแล้ว
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    };
    // เก็บข้อมูลลงใน localStorage
    localStorage.setItem('nutritionData', JSON.stringify(updatedData));
    setNutritionData(updatedData);
    onDataChange(updatedData);
  };


  return (
    <div>
      <div className="title-form mt-1">
        <div className="header">
          <b>Nutrition</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-universal-access-circle" style={{ color: "#008000" }}></i> ประเมินภาวะโภชนาการ</p>
        </div>
      </div>

      <div className="info3 card mt-4">
        <div className="header">
          <b>การคำนวณพลังงาน</b>
        </div>
        {/* <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-people-fill" style={{ color: "#008000" }}></i> เพื่อนบ้าน</p>
        </div> */}
        <div className="m-1">
          <label className='ms-4 mb-0'> <i class="bi bi-check-circle" style={{ color: "#008000" }}></i> เพศ :</label>
          <label style={{ marginLeft: '10px', color: "#444" }}> {gender}</label><br></br>
          <label className="ms-4 mb-0"><i class="bi bi-check-circle" style={{ color: "#008000" }}></i> อายุ (ปี) :</label>
          <label style={{ marginLeft: '10px', color: "#444" }}>{userAge} ปี {userAgeInMonths} เดือน</label>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mb-0">น้ำหนัก (กก.)</label>
          <span style={{ color: 'red' }}> *</span><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="weight"
              control={control}
              defaultValue={nutritionData.weight}
              render={({ field }) => (
                <input
                  type="number"
                  className="form-control"
                  placeholder="กรอกน้ำหนัก"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange('weight', e.target.value);
                  }}
                />
              )}
            />

          </div>
        </div>
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">ส่วนสูง (ซม.)</label>
          <span style={{ color: 'red' }}> *</span><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="height"
              control={control}
              defaultValue={nutritionData.height}
              render={({ field }) => (
                <input
                  type="number"
                  className="form-control"
                  placeholder="กรอกส่วนสูง"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange('height', e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">ค่า BMR (หน่วย: กิโลกรัม น้ำหนักตัว)</label>
          <span style={{ color: 'red' }}> *</span>
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginLeft: '15px' }}
          >
          </span>
          <div className="ms-4 me-4">
            <h4 className="m-1 mb-1"> <CountUp end={bmr ? bmr.toFixed(0) : 0} duration={0.5} style={{ color: "#28a745" }} /> </h4>
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">กิจกรรมที่ทำทุกวัน</label>
          <span style={{ color: 'red' }}> *</span><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="activityLevel"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <select
                  className="form-select"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setActivityLevel(e.target.value); // อัปเดต activityLevel
                    handleInputChange('activityLevel', e.target.value); // อัปเดตใน useForm
                  }}
                >
                  <option value="">เลือกกิจกรรม</option>
                  <option value="sedentary">1. ออกกำลังกายน้อยมาก หรือไม่ออกเลย</option>
                  <option value="lightly_active">2. ออกกำลังกาย 1-3 ครั้งต่อสัปดาห์</option>
                  <option value="moderately_active">3. ออกกำลังกาย 4-5 ครั้งต่อสัปดาห์</option>
                  <option value="very_active">4. ออกกำลังกาย 6-7 ครั้งต่อสัปดาห์</option>
                  <option value="super_active">5. ออกกำลังกายวันละ 2 ครั้งขึ้นไป</option>
                </select>
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">ค่า TDEE (กิโลแคลอรีต่อวัน)</label>
          <span style={{ color: 'red' }}> *</span>
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginLeft: '15px' }}
          >
          </span>
          <div className="ms-4 me-4">
            <h4 className="m-1 mb-1"> <CountUp end={tdee ? tdee.toFixed(0) : 0} duration={0.5} style={{ color: "#fd7e14" }} /> </h4>
          </div>
        </div>
      </div>

      <div className='info3 card mt-3'>
        <div className='m-4'>
          <label className="form-label">ช่องทางการรับอาหาร<span style={{ color: 'red' }}> *</span></label>
          <p style={{ color: "gray", marginTop: "-10px", marginBottom: "10px" }}>
            (เลือกได้มากกว่า 1 ข้อ)
          </p>
          <div>
            <Controller
              name="intakeMethod"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="กินเอง"
                  checked={field.value.includes("กินเอง")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "กินเอง"]
                      : field.value.filter((item) => item !== "กินเอง");
                    field.onChange(newValue);
                    handleInputChange("intakeMethod", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>กินเอง</span>
          </div>
          <div>
            <Controller
              name="intakeMethod"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="ผู้ดูแลป้อน"
                  checked={field.value.includes("ผู้ดูแลป้อน")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "ผู้ดูแลป้อน"]
                      : field.value.filter((item) => item !== "ผู้ดูแลป้อน");
                    field.onChange(newValue);
                    handleInputChange("intakeMethod", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>ผู้ดูแลป้อน</span>
          </div>
          <div>
            <Controller
              name="intakeMethod"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="NG tube"
                  checked={field.value.includes("NG tube")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "NG tube"]
                      : field.value.filter((item) => item !== "NG tube");
                    field.onChange(newValue);
                    handleInputChange("intakeMethod", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>NG tube</span>
          </div>
          <div>
            <Controller
              name="intakeMethod"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="OG tube"
                  checked={field.value.includes("OG tube")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "OG tube"]
                      : field.value.filter((item) => item !== "OG tube");
                    field.onChange(newValue);
                    handleInputChange("intakeMethod", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>OG tube</span>
          </div>
          <div>
            <Controller
              name="intakeMethod"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="PEG"
                  checked={field.value.includes("PEG")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "PEG"]
                      : field.value.filter((item) => item !== "PEG");
                    field.onChange(newValue);
                    handleInputChange("intakeMethod", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>PEG</span>
          </div>
          <div>
            <Controller
              name="intakeMethod"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value="IV"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("IV")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "IV"]
                      : field.value.filter((item) => item !== "IV");
                    field.onChange(newValue);
                    handleInputChange("intakeMethod", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>IV</span>
          </div>
        </div>
      </div>

      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Food Intake (ลักษณะอาหาร) <span style={{ color: 'red' }}> *</span></label>
          <p style={{ color: "gray", marginTop: "-10px", marginBottom: "10px" }}>
            (เลือกได้มากกว่า 1 ข้อ)
          </p>
          <div>
            <Controller
              name="foodTypes"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value="อาหารธรรมดา"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("อาหารธรรมดา")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "อาหารธรรมดา"]
                      : field.value.filter((item) => item !== "อาหารธรรมดา");
                    field.onChange(newValue);
                    handleInputChange("foodTypes", newValue);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>อาหารธรรมดา </span>
          </div>
          <div>
            <Controller
              name="foodTypes"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value="อาหารอ่อน"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("อาหารอ่อน")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "อาหารอ่อน"]
                      : field.value.filter((item) => item !== "อาหารอ่อน");
                    field.onChange(newValue);
                    handleInputChange("foodTypes", newValue);
                  }}
                />
              )}
            /><span style={{ marginLeft: '10px' }}>  อาหารอ่อน</span>
          </div>
          <div>
            <Controller
              name="foodTypes"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value="อาหารเหลว"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("อาหารเหลว")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "อาหารเหลว"]
                      : field.value.filter((item) => item !== "อาหารเหลว");
                    field.onChange(newValue);
                    handleInputChange("foodTypes", newValue);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>อาหารเหลว </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0 ">อาหารทางการแพทย์ <span style={{ color: 'red' }}> *</span></label><br></br>
          <div className="ms-4 me-4">
            <Controller
              name="medicalFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("medicalFood", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">อาหารที่ชอบ <span style={{ color: 'red' }}> *</span></label><br></br>
          <div className="ms-4 me-4">
            <Controller
              name="favoriteFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("favoriteFood", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1 mb-4'>
          <label className="form-label mt-3 ms-4 ">อาหารอื่นๆ (ถ้ามี) </label><br></br>
          <div className="ms-4 me-4">
            <Controller
              name="otherFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("otherFood", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">คนปรุงอาหาร <span style={{ color: 'red' }}> *</span></label>
          <p style={{ color: "gray", marginTop: "-10px", marginBottom: "10px" }}>
            (เลือกได้มากกว่า 1 ข้อ)
          </p>
          <div>
            <Controller
              name="cooks"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value="ปรุงเอง"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("ปรุงเอง")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "ปรุงเอง"]
                      : field.value.filter((item) => item !== "ปรุงเอง");
                    field.onChange(newValue);
                    handleInputChange("cooks", newValue);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>ปรุงเอง </span>
          </div>
          <div>
            <Controller
              name="cooks"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value="คนดูแลปรุงให้"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("คนดูแลปรุงให้")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "คนดูแลปรุงให้"]
                      : field.value.filter((item) => item !== "คนดูแลปรุงให้");
                    field.onChange(newValue);
                    handleInputChange("cooks", newValue);
                  }}
                />
              )}
            /><span style={{ marginLeft: '10px' }}> คนดูแลปรุงให้ </span>
          </div>
          <div>
            <Controller
              name="cooks"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value="ซื้อจากร้านอาหาร"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("ซื้อจากร้านอาหาร")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "ซื้อจากร้านอาหาร"]
                      : field.value.filter((item) => item !== "ซื้อจากร้านอาหาร");
                    field.onChange(newValue);
                    handleInputChange("cooks", newValue);
                  }}
                />
              )}
            /><span style={{ marginLeft: '10px' }}> ซื้อจากร้านอาหาร </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="header">
          <b>Mini Nutritional Assessment</b>
        </div>
        <div className="ms-4">
          <p className="mt-2 mb-2" style={{ color: "#666" }}>ประเมินภาวะโภชนาการอย่างย่อ</p>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 me-4 ">ภาวะโภชนาการ <span style={{ color: 'red' }}> *</span></label>
          <div className='ms-4 me-4'>
            <Controller
              name="nutritionStatus"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="ปกติ"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "ปกติ"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("nutritionStatus", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>ปกติ </span>
          </div>
          <div className='ms-4 me-4'>
            <Controller
              name="nutritionStatus"
              control={control}
              render={({ field }) => (
                <input
                  type="radio"
                  value="เกินเกณฑ์"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "เกินเกณฑ์"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("nutritionStatus", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>เกินเกณฑ์ </span>
          </div>
          <div className='ms-4 me-4 mb-4'>
            <Controller
              name="nutritionStatus"
              control={control}
              render={({ field }) => (
                <input
                  type="radio"
                  value="ต่ำกว่าเกณฑ์"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "ต่ำกว่าเกณฑ์"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("nutritionStatus", e.target.value);
                  }}
                />
              )}
            /><span style={{ marginLeft: '10px' }}> ต่ำกว่าเกณฑ์ </span>
          </div>
        </div>
      </div>

    </div>
  );
};
