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
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Nutrition</b>
        </div>
        <div className='m-4'>
          <b>Basal Metabolic Rate (BMR)</b>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td align="center">เพศ</td>
                <td >
                  <p className="textnutrition">
                    <label>{gender}</label>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center">อายุ (ปี)</td>
                <td >
                  <p className="textnutrition">
                    <label>{userAge} ปี {userAgeInMonths} เดือน</label>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center">น้ำหนัก (kg.)</td>
                <td >
                  <Controller
                    name="weight"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type='text'
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td align="center">ส่วนสูง (cm.)</td>
                <td >
                  <Controller
                    name="height"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type='text'
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <br></br>
          <div className='grid' align="center">
            <div className='col mt-3'>
              <b>ค่า BMR (kcal) = </b>
            </div>
            <div className='col mt-4'>
              <b>
                <div >
                  <h4><CountUp end={bmr.toFixed(0)} duration={0.5} /></h4>
                </div>
              </b>
            </div>
            <div className='col'>
              <button type='button' className="btn btn-outline-primary py-2 border-0" onClick={calculateBmr}>
                คำนวณ
              </button>
            </div>
          </div>
          <hr></hr>
          <b>Activity</b>
          <table className='nutrition-table'>
            <tbody >
              <tr style={{ backgroundColor: 'f9f9f9' }}>
                <td align="center" >เลือกกิจกรรมที่ทำทุกวัน</td>
                <td >
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
                </td>
              </tr>
            </tbody>
          </table>
          <br></br>
          <div className='grid' align="center">
            <div className='col mt-3'>
              <b>ค่า TDEE = </b>
            </div>
            <div className='col mt-4 '>
              <h4><CountUp end={tdee.toFixed(2)} duration={0.5} /></h4>
            </div>
            <div className='col'>
              <button
                type='button'
                className="btn btn-outline-primary py-2 border-0 "
                onClick={calculateTdee}
              >
                คำนวณ
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Nutrition</b>
        </div>
        <div className='m-4'>
          <b>Intake route (ช่องทางการรับอาหาร)</b>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td>ปาก</td>
                <td><Controller
                  name="intakeOwn"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> กินเอง</td>
                <td><Controller
                  name="intakeCaregiver"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> ผู้ดูแลป้อน</td>
              </tr>
              <tr>
                <td></td>
                <td><Controller
                  name="intakeNG"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> NG tube</td>
                <td><Controller
                  name="intakeOG"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> OG tube</td>
              </tr>
              <tr>
                <td></td>
                <td><Controller
                  name="intakePEG"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> PEG</td>
                <td><Controller
                  name="intakeIV"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> IV</td>
              </tr>
              <tr>
                <td><b>Food Intake (ลักษณะอาหาร)</b></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>อาหารที่รับประทาน</td>
                <td><Controller
                  name="foodNormal"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> อาหารธรรมดา</td>
                <td><Controller
                  name="foodSoft"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> อาหารอ่อน</td>
              </tr>
              <tr>
                <td></td>
                <td><Controller
                  name="foodLiquid"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> อาหารเหลว</td>
                <td></td>
              </tr>
              <tr>
                <td>อาหารทางการแพทย์ ระบุ</td>
                <td colSpan="2"><Controller
                  name="medicalFood"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input type='text' className="form-control" {...field} />
                  )}
                /></td>
              </tr>
              <tr>
                <td>อื่นๆ ระบุ</td>
                <td colSpan="2"><Controller
                  name="otherFood"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input type='text' className="form-control" {...field} />
                  )}
                /></td>
              </tr>
              <tr>
                <td>อาหารที่ชอบ</td>
                <td colSpan="2"><Controller
                  name="favoriteFood"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input type='text' className="form-control" {...field} />
                  )}
                /></td>
              </tr>
              <tr>
                <td>คนปรุงอาหาร</td>
                <td><Controller
                  name="cookOwn"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> ปรุงเอง</td>
                <td><Controller
                  name="cookCaregiver"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> คนดูแลปรุงให้</td>
              </tr>
              <tr>
                <td></td>
                <td><Controller
                  name="cookStore"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} {...field} />
                  )}
                /> ซื้อจากร้านอาหาร</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Mini Nutritional Assessment</b>
        </div>
        <div className='m-4'>
          {/* <b>ภาวะโภชนาการ</b> */}
          <table className='nutrition-table'>
            <tbody>
            <tr>
                <td><b>ประเมินภาวะโภชนาการอย่างย่อ</b></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>ภาวะโภชนาการ</td>
                <td><Controller
                  name="normal"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="radio" checked={field.value} {...field} />
                  )}
                /> ปกติ</td>
                <td><Controller
                  name=""
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="radio" checked={field.value} {...field} />
                  )}
                /> เกินเกณฑ์</td>
                {/* <td>ต่ำกว่าเกณฑ์</td> */}
              </tr>
              <tr>
                <td></td>
                <td><Controller
                  name=""
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <input type="radio" checked={field.value} {...field} />
                  )}
                /> ต่ำกว่าเกณฑ์</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
