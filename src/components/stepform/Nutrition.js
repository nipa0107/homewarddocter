import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';

export const Nutrition = ({ onDataChange, setValidateForm,userid }) => {
  const { control, getValues, setValue } = useFormContext();
  const location = useLocation();
  const { id } = location.state;
  const [showError, setShowError] = useState(false); // สำหรับแสดงข้อความแจ้งเตือน
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);

  const getLocalStorageKey = (userid, key) => `Assessinhomesss_${userid}_${key}`;

  const [nutritionData, setNutritionData] = useState(() => {
    return JSON.parse(localStorage.getItem(getLocalStorageKey(userid,'nutritionData'))) || {
      weight: "", height: "", bmr: 0, tdee: 0, activityLevel: "",
      intakeMethod: [], foodTypes: [], medicalFood: "", favoriteFood: "",
      cooks: [], nutritionStatus: ""
    };
  });
  // ✅ โหลดค่าจาก LocalStorage ไปยัง React Hook Form ทันทีที่โหลดหน้า
  useEffect(() => {
    Object.keys(nutritionData).forEach(key => {
      setValue(key, nutritionData[key]);
    });
  }, [setValue, nutritionData]);

  useEffect(() => {
    if (userid) {
      localStorage.setItem(getLocalStorageKey(userid,"nutritionData"), JSON.stringify(nutritionData));
  }

  }, [nutritionData, userid]);
  
  const activityFactors = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    super_active: 1.9,
  };

  // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getuser/${id}`);
        const data = await response.json();

        setGender(data.gender);
        setBirthday(data.birthday);

        setValue("gender", data.gender);
        setValue("birthday", data.birthday);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [id, setValue]);

  // คำนวณอายุจากวันเกิด
  useEffect(() => {
    if (birthday) {
      const birthDate = new Date(birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      setUserAge(monthDiff >= 0 ? age : age - 1);
      setUserAgeInMonths(monthDiff >= 0 ? monthDiff : 12 + monthDiff);
    }
  }, [birthday]);

  // คำนวณ BMR เมื่อ เพศ, อายุ, น้ำหนัก, หรือ ส่วนสูง เปลี่ยนแปลง
  useEffect(() => {
    const calculateBmr = () => {
      const weight = parseFloat(getValues('weight'));
      const height = parseFloat(getValues('height'));

      if (!weight || !height || !userAge || !gender) return;

      let calculatedBmr = gender === "ชาย"
        ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * userAge
        : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * userAge;

      calculatedBmr = Math.round(calculatedBmr);
      setBmr(calculatedBmr);
      setValue('bmr', calculatedBmr);

      // อัปเดต nutritionData และ onDataChange
      setNutritionData(prev => {
        const updatedData = { ...prev, bmr: calculatedBmr };

        // คำนวณ TDEE ใหม่เมื่อ BMR เปลี่ยน
        if (getValues("activityLevel")) {
          const activityFactor = activityFactors[getValues("activityLevel")] || 1.2;
          updatedData.tdee = Math.round(calculatedBmr * activityFactor);
          setTdee(updatedData.tdee);
          setValue("tdee", updatedData.tdee);
        }

        onDataChange(updatedData);
        return updatedData;
      });
    };

    if (getValues('weight') && getValues('height')) {
      calculateBmr();
    }
  }, [getValues('weight'), getValues('height'), userAge, gender, setValue, onDataChange]);


  useEffect(() => {
    const activityLevel = getValues("activityLevel");

    if (bmr && activityLevel) { // ตรวจสอบว่ามี activityLevel ก่อนคำนวณ
      const activityFactor = activityFactors[activityLevel] || 1.2;
      const calculatedTdee = Math.round(bmr * activityFactor);

      setTdee(calculatedTdee);
      setValue("tdee", calculatedTdee);

      // อัปเดต nutritionData และแจ้ง onDataChange
      setNutritionData(prev => {
        const updatedData = { ...prev, tdee: calculatedTdee };
        onDataChange(updatedData);
        return updatedData;
      });
    }
  }, [bmr, getValues("activityLevel"), setValue, onDataChange]);


  const errorMessages = {
    weight: "กรุณากรอกน้ำหนัก",
    height: "กรุณากรอกส่วนสูง",
    activityLevel: "กรุณาเลือกกิจกรรมที่ทำทุกวัน",
    intakeMethod: "กรุณาเลือกช่องทางการรับอาหาร",
    foodTypes: "กรุณาเลือกลักษณะอาหาร",
    medicalFood: "กรุณากรอกอาหารทางการแพทย์",
    favoriteFood: "กรุณากรอกอาหารที่ชอบ",
    cooks: "กรุณาเลือกคนปรุงอาหาร",
    nutritionStatus: "กรุณาเลือกภาวะโภชนาการ"
  };
  const handleInputChange = (name, value) => {
    setValue(name, value);

    setNutritionData(prev => {
      const updatedData = { ...prev, ...getValues(), [name]: value };

      // ✅ เช็คเฉพาะ input ที่เป็น string
      if (typeof value === "string") {
        if (value.trim() !== "" && errors[name]) {
          setErrors(prevErrors => ({ ...prevErrors, [name]: undefined })); // ✅ ซ่อน Error ถ้ามีการกรอกข้อมูล
        }
        if (value.trim() === "") {
          setErrors(prevErrors => ({ ...prevErrors, [name]: errorMessages[name] || "กรุณากรอกข้อมูล" })); // ❌ แสดง Error ถ้าลบออกหมด
        }
      }

      // ✅ เช็ค input ที่เป็น Array (เช่น checkbox)
      if (Array.isArray(value)) {
        if (value.length > 0 && errors[name]) {
          setErrors(prevErrors => ({ ...prevErrors, [name]: undefined })); // ✅ ซ่อน Error ถ้ามีการเลือก
        }
        if (value.length === 0) {
          setErrors(prevErrors => ({ ...prevErrors, [name]: "กรุณาเลือกอย่างน้อย 1 ข้อ" })); // ❌ แสดง Error ถ้าลบออกหมด
        }
      }



      // คำนวณ BMR ใหม่เมื่อ weight, height, gender หรือ userAge เปลี่ยน
      if (["weight", "height", "gender", "userAge"].includes(name)) {
        const weight = parseFloat(getValues('weight'));
        const height = parseFloat(getValues('height'));
        const age = userAge;
        const sex = gender;

        if (weight && height && age && sex) {
          let newBmr = sex === "ชาย"
            ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
            : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;

          newBmr = Math.round(newBmr);
          setBmr(newBmr);
          setValue("bmr", newBmr);
          updatedData.bmr = newBmr;
        }
      }

      // คำนวณ TDEE ใหม่ **เฉพาะเมื่อเลือก activityLevel แล้ว**
      if (name === "activityLevel" && updatedData.bmr) {
        const activityFactor = activityFactors[value] || 1.2;
        updatedData.tdee = Math.round(updatedData.bmr * activityFactor);
        setTdee(updatedData.tdee);
        setValue("tdee", updatedData.tdee);
      }

      onDataChange(updatedData);
      return updatedData;
    });
  };


  useEffect(() => {
    if (tdee > 0) {
      setValue("tdee", tdee);
      setNutritionData(prev => ({ ...prev, tdee }));
    }
  }, [tdee, setValue]);

  const [errors, setErrors] = useState({});
  // ✅ ฟังก์ชันตรวจสอบข้อมูล
  const validateForm = () => {
    let newErrors = {};

    if (!getValues("weight")) newErrors.weight = "กรุณากรอกน้ำหนัก";
    if (!getValues("height")) newErrors.height = "กรุณากรอกส่วนสูง";
    if (!getValues("activityLevel")) newErrors.activityLevel = "กรุณาเลือกกิจกรรมที่ทำทุกวัน";
    if (!getValues("intakeMethod") || getValues("intakeMethod").length === 0)
      newErrors.intakeMethod = "กรุณาเลือกช่องทางการรับอาหาร";
    if (!getValues("foodTypes") || getValues("foodTypes").length === 0)
      newErrors.foodTypes = "กรุณาเลือกลักษณะอาหาร";
    if (!getValues("medicalFood")) newErrors.medicalFood = "กรุณากรอกอาหารทางการแพทย์";
    if (!getValues("favoriteFood")) newErrors.favoriteFood = "กรุณากรอกอาหารที่ชอบ";
    if (!getValues("cooks") || getValues("cooks").length === 0)
      newErrors.cooks = "กรุณาเลือกคนปรุงอาหาร";
    if (!getValues("nutritionStatus")) newErrors.nutritionStatus = "กรุณาเลือกภาวะโภชนาการ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // ถ้าไม่มีข้อผิดพลาดจะคืนค่า true
  };

  // ✅ ส่งฟังก์ชัน `validateForm` กลับไปให้ Component หลัก
  useEffect(() => {
    setValidateForm(() => validateForm);
  }, [setValidateForm]);

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
        <div className="m-1">
          <label className='ms-4 mb-0'> <i class="bi bi-check-circle" style={{ color: "#008000" }}></i> เพศ :</label>
          <label style={{ marginLeft: '10px', color: "#444" }}> {gender}</label><br></br>
          <label className="ms-4 mb-0"><i class="bi bi-check-circle" style={{ color: "#008000" }}></i> อายุ (ปี) :</label>
          <label style={{ marginLeft: '10px', color: "#444" }}>{userAge} ปี {userAgeInMonths} เดือน</label>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mb-0">น้ำหนัก (กก.)<span style={{ color: 'red' }}> *</span> <span style={{ color: "#666", fontSize: "15px" }}> กรอกน้ำหนักเป็นตัวเลขหรือทศนิยม เช่น 40, 50.5</span></label>
          <br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  style={{ width: "35%" }}
                  className={`form-control ${errors.weight ? "is-invalid" : ""}`}
                  placeholder="กรอกน้ำหนัก"
                  {...field}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value.trim() === "") {
                      setErrors(prevErrors => ({ ...prevErrors, weight: "กรุณากรอกน้ำหนัก" }));
                    }
                  }}
                />
              )}
            />
            
          </div>
          {errors.weight && <div className="ms-4" style={{ color: "red" }}>{errors.weight}</div>}
        </div>
        <div className='m-1'>
          <label className="form-label mt-2 ms-4 mb-0">ส่วนสูง (ซม.) <span style={{ color: 'red' }}> *</span> <span style={{ color: "#666", fontSize: "15px" }}>กรอกส่วนสูงเป็นตัวเลขหรือทศนิยม เช่น 145, 165.5</span></label>
          <br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="height"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  style={{ width: "35%" }}
                  className={`form-control ${errors.height ? "is-invalid" : ""}`}
                  placeholder="กรอกส่วนสูง"
                  {...field}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value.trim() === "") {
                      setErrors(prevErrors => ({ ...prevErrors, height: "กรุณากรอกส่วนสูง" }));
                    }
                  }}
                />
              )}
            />
            
          </div>
          {errors.height && <div className="ms-4" style={{ color: "red" }}>{errors.height}</div>}
        </div>
        <div className='m-1'>
          <label className="form-label mt-2 ms-4 mb-0">ค่า BMR (กิโลแคลอรีต่อวัน)</label>
          <span style={{ color: 'red' }}> *</span>
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginLeft: '15px' }}
          >
          </span>
          <div className="ms-4 me-4">
            <h4 className="m-1 mb-1"> <CountUp end={bmr || 0} duration={0.5} style={{ color: "#28a745" }} /> </h4>
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
                  className={`form-select ${errors.activityLevel ? "is-invalid" : ""}`}
                  {...field}
                  onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value.trim() === "") {
                      setErrors(prevErrors => ({ ...prevErrors, activityLevel: "กรุณาเลือกกิจกรรมที่ทำทุกวัน" }));
                    }
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
          {errors.activityLevel && <div className="ms-4" style={{ color: "red" }}>{errors.activityLevel}</div>}
        </div>
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">ค่า TDEE (กิโลแคลอรีต่อวัน)</label>
          <span style={{ color: 'red' }}> *</span>
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginLeft: '15px' }}
          >
          </span>
          <div className="ms-4 me-4">
            <h4 className="m-1 mb-1"> <CountUp end={tdee || 0} duration={0.5} style={{ color: "#fd7e14" }} /> </h4>
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
                  onBlur={() => {
                    const intakeMethod = getValues("intakeMethod");
                    if (Array.isArray(intakeMethod) && intakeMethod.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, intakeMethod: "กรุณาเลือกช่องทางการรับอาหาร" }));
                    }
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
                  onBlur={() => {
                    const intakeMethod = getValues("intakeMethod");
                    if (Array.isArray(intakeMethod) && intakeMethod.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, intakeMethod: "กรุณาเลือกช่องทางการรับอาหาร" }));
                    }
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
                  onBlur={() => {
                    const intakeMethod = getValues("intakeMethod");
                    if (Array.isArray(intakeMethod) && intakeMethod.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, intakeMethod: "กรุณาเลือกช่องทางการรับอาหาร" }));
                    }
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
                  onBlur={() => {
                    const intakeMethod = getValues("intakeMethod");
                    if (Array.isArray(intakeMethod) && intakeMethod.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, intakeMethod: "กรุณาเลือกช่องทางการรับอาหาร" }));
                    }
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
                  onBlur={() => {
                    const intakeMethod = getValues("intakeMethod");
                    if (Array.isArray(intakeMethod) && intakeMethod.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, intakeMethod: "กรุณาเลือกช่องทางการรับอาหาร" }));
                    }
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
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="IV"
                  checked={field.value.includes("IV")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "IV"]
                      : field.value.filter((item) => item !== "IV");

                    field.onChange(newValue);
                    handleInputChange("intakeMethod", newValue);
                  }}
                  onBlur={() => {
                    const intakeMethod = getValues("intakeMethod");
                    if (Array.isArray(intakeMethod) && intakeMethod.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, intakeMethod: "กรุณาเลือกช่องทางการรับอาหาร" }));
                    }
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>IV</span>
          </div>
          {errors.intakeMethod && <div className="ms-1" style={{ color: "red" }}>{errors.intakeMethod}</div>}
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
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="อาหารธรรมดา"
                  checked={field.value.includes("อาหารธรรมดา")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "อาหารธรรมดา"]
                      : field.value.filter((item) => item !== "อาหารธรรมดา");

                    field.onChange(newValue);
                    handleInputChange("foodTypes", newValue);
                  }}
                  onBlur={() => {
                    const foodTypes = getValues("foodTypes");
                    if (Array.isArray(foodTypes) && foodTypes.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, foodTypes: "กรุณาเลือกลักษณะอาหาร" }));
                    }
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
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="อาหารอ่อน"
                  checked={field.value.includes("อาหารอ่อน")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "อาหารอ่อน"]
                      : field.value.filter((item) => item !== "อาหารอ่อน");

                    field.onChange(newValue);
                    handleInputChange("foodTypes", newValue);
                  }}
                  onBlur={() => {
                    const foodTypes = getValues("foodTypes");
                    if (Array.isArray(foodTypes) && foodTypes.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, foodTypes: "กรุณาเลือกลักษณะอาหาร" }));
                    }
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
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="อาหารเหลว"
                  checked={field.value.includes("อาหารเหลว")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "อาหารเหลว"]
                      : field.value.filter((item) => item !== "อาหารเหลว");

                    field.onChange(newValue);
                    handleInputChange("foodTypes", newValue);
                  }}
                  onBlur={() => {
                    const foodTypes = getValues("foodTypes");
                    if (Array.isArray(foodTypes) && foodTypes.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, foodTypes: "กรุณาเลือกลักษณะอาหาร" }));
                    }
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>อาหารเหลว </span>
          </div>
          {errors.foodTypes && <div className="ms-1" style={{ color: "red" }}>{errors.foodTypes}</div>}
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0 ">อาหารทางการแพทย์ <span style={{ color: 'red' }}> *</span> <span style={{ color: "#666", fontSize: "15px" }}>(ระบุชื่อผลิตภัณฑ์ หากไม่มี ให้ใส่ "ไม่มี" หรือ - )</span></label><br></br>
          <div className="ms-4 me-4">
            <Controller
              name="medicalFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className={`form-control ${errors.medicalFood ? "is-invalid" : ""}`}
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกอาหารทางการแพทย์"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("medicalFood", e.target.value);
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim() === "") {
                      setErrors(prevErrors => ({ ...prevErrors, medicalFood: "กรุณากรอกอาหารทางการแพทย์" }));
                    }
                  }}
                />
              )}
            />
          </div>
          {errors.medicalFood && <div className="ms-4" style={{ color: "red" }}>{errors.medicalFood}</div>}
        </div>
        <div className='m-1 mb-4'>
          <label className="form-label mt-3 ms-4 mb-0">อาหารที่ชอบ <span style={{ color: 'red' }}> *</span> <span style={{ color: "#666", fontSize: "15px" }}>(ระบุประเภทอาหาร เช่น ข้าวผัด หากไม่มี ให้ใส่ "ไม่มี" หรือ - )</span></label><br></br>
          <div className="ms-4 me-4">
            <Controller
              name="favoriteFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className={`form-control ${errors.favoriteFood ? "is-invalid" : ""}`}
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกอาหารที่ชอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("favoriteFood", e.target.value);
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim() === "") {
                      setErrors(prevErrors => ({ ...prevErrors, favoriteFood: "กรุณากรอกอาหารที่ชอบ" }));
                    }
                  }}
                />
              )}
            />
          </div>
          {errors.favoriteFood && <div className="ms-4" style={{ color: "red" }}>{errors.favoriteFood}</div>}
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
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="ปรุงเอง"
                  checked={field.value.includes("ปรุงเอง")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "ปรุงเอง"]
                      : field.value.filter((item) => item !== "ปรุงเอง");

                    field.onChange(newValue);
                    handleInputChange("cooks", newValue);
                  }}
                  onBlur={() => {
                    const cooks = getValues("cooks");
                    if (Array.isArray(cooks) && cooks.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, cooks: "กรุณาเลือกคนปรุงอาหาร" }));
                    }
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
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="คนดูแลปรุงให้"
                  checked={field.value.includes("คนดูแลปรุงให้")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "คนดูแลปรุงให้"]
                      : field.value.filter((item) => item !== "คนดูแลปรุงให้");

                    field.onChange(newValue);
                    handleInputChange("cooks", newValue);
                  }}
                  onBlur={() => {
                    const cooks = getValues("cooks");
                    if (Array.isArray(cooks) && cooks.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, cooks: "กรุณาเลือกคนปรุงอาหาร" }));
                    }
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
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  value="ซื้อจากร้านอาหาร"
                  checked={field.value.includes("ซื้อจากร้านอาหาร")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "ซื้อจากร้านอาหาร"]
                      : field.value.filter((item) => item !== "ซื้อจากร้านอาหาร");

                    field.onChange(newValue);
                    handleInputChange("cooks", newValue);
                  }}
                  onBlur={() => {
                    const cooks = getValues("cooks");
                    if (Array.isArray(cooks) && cooks.length === 0) {
                      setErrors(prevErrors => ({ ...prevErrors, cooks: "กรุณาเลือกคนปรุงอาหาร" }));
                    }
                  }}
                />
              )}
            /><span style={{ marginLeft: '10px' }}> ซื้อจากร้านอาหาร </span>
          </div>
          {errors.cooks && <div className="ms-1" style={{ color: "red" }}>{errors.cooks}</div>}
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="header">
          <b>Mini Nutritional Assessment</b>
        </div>
        <div className="ms-4">
          <p className="mt-2 mb-2" style={{ color: "#666" }}>ประเมินภาวะโภชนาการอย่างย่อ</p>
        </div>
        <div className='m-1 mb-4'>
          <label className="form-label ms-4 me-4 ">ภาวะโภชนาการ <span style={{ color: 'red' }}> *</span></label>
          <div className='ms-4 me-4'>
            <Controller
              name="nutritionStatus"
              control={control}
              defaultValue=""
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
              defaultValue=""
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
          <div className='ms-4 me-4'>
            <Controller
              name="nutritionStatus"
              control={control}
              defaultValue=""
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
          {errors.nutritionStatus && <div className="ms-4" style={{ color: "red" }}>{errors.nutritionStatus}</div>}
        </div>
      </div>

    </div>
  );
};
