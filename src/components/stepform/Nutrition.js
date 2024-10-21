import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';

export const Nutrition = () => {
  const { control, getValues, setValue } = useFormContext();
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const location = useLocation();
  const { id } = location.state;
  const [userAge, setUserAge] = useState(0);
  const [userAgeInMonths, setUserAgeInMonths] = useState(0);
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);

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

  const calculateBmr = () => {
    const weight = parseFloat(getValues('weight'));
    const height = parseFloat(getValues('height'));

    if (isNaN(weight) || isNaN(height)) {
      alert("กรุณากรอกน้ำหนักและส่วนสูงเป็นตัวเลขที่ถูกต้อง");
      return;
    }

    let calculatedBmr = 0;

    if (gender === "ชาย") {
      calculatedBmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * userAge);
    } else if (gender === "หญิง") {
      calculatedBmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * userAge);
    }

    setBmr(calculatedBmr);
    setValue('bmr', calculatedBmr);
  };

  const calculateTdee = () => {
    const activityFactors = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      super_active: 1.9
    };

    const calculatedTdee = bmr * activityFactors[activityLevel];
    setTdee(calculatedTdee);
    setValue('tdee', calculatedTdee);
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
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกน้ำหนัก"
                  {...field}
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
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกส่วนสูง"
                  {...field}
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
            onClick={calculateBmr}
          >
            คลิกเพื่อคำนวณ
          </span>
          <div>
            <h5>= <CountUp end={bmr.toFixed(0)} duration={0.5} /> </h5>
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
              defaultValue="sedentary"
              render={({ field }) => (
                <select
                  className="form-select"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setActivityLevel(e.target.value);
                  }}
                >
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
            onClick={calculateTdee}
          >
            คลิกเพื่อคำนวณ
          </span>
          <div>
            <h5>= <CountUp end={tdee.toFixed(2)} duration={0.5} /> </h5>
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "กินเอง"]);
                    } else {
                      field.onChange(field.value.filter((item) => item !== "กินเอง"));
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "ผู้ดูแลป้อน"]);
                    } else {
                      field.onChange(field.value.filter((item) => item !== "ผู้ดูแลป้อน"));
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "NG tube"]);
                    } else {
                      field.onChange(field.value.filter((item) => item !== "NG tube"));
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "OG tube"]);
                    } else {
                      field.onChange(field.value.filter((item) => item !== "OG tube"));
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "PEG"]);
                    } else {
                      field.onChange(field.value.filter((item) => item !== "PEG"));
                    }
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "IV"]);
                    } else {
                      field.onChange(field.value.filter((item) => item !== "IV"));
                    }
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "อาหารธรรมดา"]);
                    } else {
                      field.onChange(field.value.filter(item => item !== "อาหารธรรมดา"));
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
                  value="อาหารอ่อน"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("อาหารอ่อน")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      field.onChange([...field.value, "อาหารอ่อน"]);
                    } else {
                      field.onChange(field.value.filter(item => item !== "อาหารอ่อน"));
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
                  value="อาหารเหลว"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("อาหารเหลว")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      field.onChange([...field.value, "อาหารเหลว"]);
                    } else {
                      field.onChange(field.value.filter(item => item !== "อาหารเหลว"));
                    }
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
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อื่นๆ (ถ้ามี) :</label><br></br>
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "ปรุงเอง"]);
                    } else {
                      field.onChange(field.value.filter(item => item !== "ปรุงเอง"));
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
                  value="คนดูแลปรุงให้"
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("คนดูแลปรุงให้")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      field.onChange([...field.value, "คนดูแลปรุงให้"]);
                    } else {
                      field.onChange(field.value.filter(item => item !== "คนดูแลปรุงให้"));
                    }
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
                    if (e.target.checked) {
                      field.onChange([...field.value, "ซื้อจากร้านอาหาร"]);
                    } else {
                      field.onChange(field.value.filter(item => item !== "ซื้อจากร้านอาหาร"));
                    }
                  }}
                />
              )}
            /><span style={{ marginLeft: '10px' }}> ซื้อจากร้านอาหาร </span>
          </div>
          {/* <div>
            <Controller
              name=""
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value=""
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      field.onChange([...field.value, ""]);
                    } else {
                      field.onChange(field.value.filter(item => item !== ""));
                    }
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}> </span>
          </div>
          
          <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label"> :</label><br></br>
          <p style={{ color: 'gray' }}>(เลือกได้มากกว่า 1 ข้อ)</p>
          <div>
            <Controller
              name=""
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value=""
                  style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
                  checked={field.value.includes("")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      field.onChange([...field.value, ""]);
                    } else {
                      field.onChange(field.value.filter(item => item !== ""));
                    }
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}> </span>
          </div>
        </div>
      </div>*/}
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
              defaultValue=""
              render={({ field }) => (
                <input
                  type="radio"
                  value="ปกติ"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "ปกติ"}
                  onChange={() => field.onChange("ปกติ")}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>ปกติ </span>
          </div>
          <div>
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
                  onChange={() => field.onChange("เกินเกณฑ์")}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>เกินเกณฑ์ </span>
          </div>
          <div>
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
                  onChange={() => field.onChange("ต่ำกว่าเกณฑ์")}
                />
              )}
            /><span style={{ marginLeft: '10px' }}> ต่ำกว่าเกณฑ์ </span>
          </div>
        </div>
      </div>
    </div>
  );
};
