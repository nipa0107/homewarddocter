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
        setGender(data.gender);
        setBirthday(data.birthday);
        // Update form values with fetched data
        Object.keys(data).forEach(key => {
          setValue(key, data[key]);
        });

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [id, setValue]);

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
    };

    calculateTdee();
  }, [bmr, activityLevel]); // คำนวณใหม่เมื่อ BMR หรือ activityLevel เปลี่ยน


  const handleInputChange = (name, value) => {
    const updatedValue = value || (typeof nutritionData[name] === 'number' ? 0 : "");
    const updatedData = {
      ...nutritionData,
      [name]: updatedValue,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
    };
    setNutritionData(updatedData);
    onDataChange(updatedData); // ส่งข้อมูลไปยัง parent
  };


  return (
    <div>
      <div className="info3 card ">
        <div className="header">
          <b>Nutrition</b>
        </div>
        <div className='m-4'>
          <label className="form-label">เพศ</label>
          <br></br>
          <div>
            <input
              type="radio"
              name="gender"
              disabled
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
            />
            <label style={{ marginLeft: '10px' }}> {gender}</label>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อายุ (ปี)</label>
          <br></br>
          <div>
            <input
              type="radio"
              disabled
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
            />
            <label style={{ marginLeft: '10px' }}>{userAge} ปี {userAgeInMonths} เดือน</label>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">น้ำหนัก (kg.)</label>
          <span style={{ color: 'red' }}> *</span><br></br>
          <div>
            <Controller
              name="weight"
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <input
                  type="number"
                  className="google-form-input"
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
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ส่วนสูง (cm.)</label>
          <span style={{ color: 'red' }}> *</span><br></br>
          <div>
            <Controller
              name="height"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="number"
                  className="google-form-input"
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
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ค่า BMR (kcal)</label>
          <span style={{ color: 'red' }}> *</span>
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginLeft: '15px' }}
          >
          </span>
          <div>
            <h5>= <CountUp end={bmr ? bmr.toFixed(0) : 0} duration={0.5} /> </h5>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">กิจกรรมที่ทำทุกวัน</label>
          <span style={{ color: 'red' }}> *</span><br></br>
          <div>
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
                  <option value="sedentary">1. Sedentary: little or no exercise</option>
                  <option value="lightly_active">2. Lightly active: light exercise or sports 1-3 days a week</option>
                  <option value="moderately_active">3. Moderately active: moderate exercise or sports 3-5 days a week</option>
                  <option value="very_active">4. Very active: hard exercise or sports 6-7 days a week</option>
                  <option value="super_active">5. Super active: very hard exercise, physical job, or training twice a day</option>
                </select>
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ค่า TDEE </label>
          <span style={{ color: 'red' }}> *</span>
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline', marginLeft: '15px' }}
          >
          </span>
          <div>
            <h5>= <CountUp end={tdee ? tdee.toFixed(0) : 0} duration={0.5} /> </h5>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ปาก</label>
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
            <span style={{ marginLeft: '10px' }}> PEG</span>
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
          <label className="form-label">Food Intake (ลักษณะอาหาร)</label>
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
        <div className='m-4'>
          <label className="form-label">อาหารทางการแพทย์ :</label><br></br>
          <div>
            <Controller
              name="medicalFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
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
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อาหารที่ชอบ :</label><br></br>
          <div>
            <Controller
              name="favoriteFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
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
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อาหารอื่นๆ (ถ้ามี) :</label><br></br>
          <div>
            <Controller
              name="otherFood"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
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
          <label className="form-label">คนปรุงอาหาร</label>
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
            /><span style={{ marginLeft: '10px' }}>คนดูแลปรุงให้ </span>
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
        <div style={{ marginLeft: '26px' }}>
          <p>ประเมินภาวะโภชนาการอย่างย่อ</p>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ภาวะโภชนาการ</label>
          <div>
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
          <div>
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
          <div>
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
