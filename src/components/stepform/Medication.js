import React, { useState } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Medication = () => {
  const { register, control } = useFormContext();
  const [medicationData, setMedicationData] = useState({
    prescribedMedication: '',
    actualMedication: '',
    supplements: '',
    administration: '',
    intake: '',
    consistency: ''
  });

  const handleRadioChange = (e, fieldName) => {
    setMedicationData({ ...medicationData, [fieldName]: e.target.value });
  };

  return (
    <div>
      {/* Text input: Prescribed medication */}
      <div className="info3 card">
        <div className="header">
          <b>Medication</b>
        </div>
        <div className="m-4">
          <label className="form-label">ยาที่แพทย์สั่ง :</label><br></br>
          <div>
            <Controller
              name="prescribedMedication"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="google-form-input"
                  placeholder="กรอกยาที่แพทย์สั่ง"
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Text input: Actual medication */}
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">การใช้ยาจริง :</label><br></br>
          <Controller
            name="actualMedication"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <textarea
                className="google-form-input"
                placeholder="กรอกการใช้ยาจริง"
                {...field}
              />
            )}
          />
        </div>
      </div>

      {/* Text input: Supplements */}
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อาหารเสริม :</label><br></br>
          <Controller
            name="supplements"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <textarea
                className="google-form-input"
                placeholder="กรอกอาหารเสริม"
                {...field}
              />
            )}
          />
        </div>
      </div>

      {/* Radio buttons: Administration */}
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">การบริหารยา :</label><br></br>
          <div>
            <input
              type="radio"
              {...register("administration")}
              value="selfAdministered"
              style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
              checked={medicationData.administration === "selfAdministered"}
              onChange={(e) => handleRadioChange(e, 'administration')}
            /><span style={{ marginLeft: '10px' }}> จัดยาด้วยตนเอง </span> 
          </div>
          <div>
            <input
              type="radio"
              {...register("administration")}
              value="administeredByOther"
              style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
              checked={medicationData.administration === "administeredByOther"}
              onChange={(e) => handleRadioChange(e, 'administration')}
            /><span style={{ marginLeft: '10px' }}> มีคนจัดยาให้ </span> 
          </div>
        </div>
      </div>

      {/* Radio buttons: Intake */}
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">การรับประทานยา :</label><br></br>
          <div>
            <input
              type="radio"
              {...register("intake")}
              value="selfTaken"
              style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
              checked={medicationData.intake === "selfTaken"}
              onChange={(e) => handleRadioChange(e, 'intake')}
            /><span style={{ marginLeft: '10px' }}> รับประทานยาด้วยตัวเอง </span> 
          </div>
          <div>
            <input
              type="radio"
              {...register("intake")}
              value="preparedEachMeal"
              style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
              checked={medicationData.intake === "preparedEachMeal"}
              onChange={(e) => handleRadioChange(e, 'intake')}
            /><span style={{ marginLeft: '10px' }}> มีคนเตรียมยาแต่ละมื้อให้ </span> 
          </div>
        </div>
      </div>

      {/* Radio buttons: Consistency */}
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ความสม่ำเสมอ :</label><br></br>
          <div>
            <input
              type="radio"
              {...register("consistency")}
              value="consistent"
              style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
              checked={medicationData.consistency === "consistent"}
              onChange={(e) => handleRadioChange(e, 'consistency')}
            /><span style={{ marginLeft: '10px' }}>สม่ำเสมอทุกวัน</span> 
          </div>
          <div>
            <input
              type="radio"
              {...register("consistency")}
              value="occasionalMiss"
              style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
              checked={medicationData.consistency === "occasionalMiss"}
              onChange={(e) => handleRadioChange(e, 'consistency')}
            /><span style={{ marginLeft: '10px' }}> หลงลืมบางครั้ง </span> 
          </div>
          <div>
            <input
              type="radio"
              {...register("consistency")}
              value="inconsistent"
              style={{ transform: 'scale(1.3)', marginLeft: '5px' }}
              checked={medicationData.consistency === "inconsistent"}
              onChange={(e) => handleRadioChange(e, 'consistency')}
            /><span style={{ marginLeft: '10px' }}> ไม่สม่ำเสมอ </span> 
          </div>
        </div>
      </div>
    </div>
  );
};
