import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Medication = ({ onDataChange }) => {
  const { register, control, setValue, getValues } = useFormContext();
  useEffect(() => {
    onDataChange(getValues()); // ส่งค่าเริ่มต้นให้ Parent Component
  }, []);

  const handleInputChange = (name, value) => {
    setValue(name, value);
    onDataChange({ ...getValues() });
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
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("prescribedMedication", e.target.value);
                  }}
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
                onChange={(e) => {
                  field.onChange(e.target.value);
                  handleInputChange("actualMedication", e.target.value);
                }}
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
                onChange={(e) => {
                  field.onChange(e.target.value);
                  handleInputChange("supplements", e.target.value);
                }}
              />
            )}
          />
        </div>
      </div>

       {/* Radio: Administration */}
       <div className="info3 card mt-3">
        <div className="m-4">
          <label className="form-label">การบริหารยา :</label>
          {['จัดยาด้วยตนเอง', 'มีคนจัดยาให้'].map((option) => (
            <div key={option}>
              <Controller
                name="administration"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    type="radio"
                    value={option}
                    checked={field.value === option}
                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleInputChange("administration", e.target.value);
                    }}
                  />
                )}
              />
              <span style={{ marginLeft: '10px' }}>{option}</span>
            </div>
          ))}
        </div>
      </div>

       {/* Radio: Intake */}
       <div className="info3 card mt-3">
        <div className="m-4">
          <label className="form-label">การรับประทานยา :</label>
          {['รับประทานยาด้วยตัวเอง', 'มีคนเตรียมยาแต่ละมื้อให้'].map((option) => (
            <div key={option}>
              <Controller
                name="intake"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    type="radio"
                    value={option}
                    checked={field.value === option}
                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleInputChange("intake", e.target.value);
                    }}
                  />
                )}
              />
              <span style={{ marginLeft: '10px' }}>{option}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Radio: Consistency */}
      <div className="info3 card mt-3">
        <div className="m-4">
          <label className="form-label">ความสม่ำเสมอ :</label>
          {['สม่ำเสมอทุกวัน', 'หลงลืมบางครั้ง', 'ไม่สม่ำเสมอ'].map((option) => (
            <div key={option}>
              <Controller
                name="consistency"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    type="radio"
                    value={option}
                    checked={field.value === option}
                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleInputChange("consistency", e.target.value);
                    }}
                  />
                )}
              />
              <span style={{ marginLeft: '10px' }}>{option}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
