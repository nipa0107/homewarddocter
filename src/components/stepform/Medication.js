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
      <div className="title-form mt-1">
        <div className="header">
          <b>Medication</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p className="mt-2" style={{ color: "#666" }}><i class="bi bi-capsule" style={{ color: "#008000" }}></i> ข้อมูลการใช้ยา</p>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="header">
          <b>การใช้ยาของผู้ป่วย</b>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 me-4 mt-4">ยาที่แพทย์สั่ง</label>
          <div className='ms-4 me-4'>
            <Controller
              name="prescribedMedication"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="form-control"
                  placeholder="กรอกยาที่แพทย์สั่ง"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
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
        <div className='m-1'>
          <label className="form-label ms-4 me-4 mt-4">การใช้ยาจริง</label>
          <div className='ms-4 me-4'>
            <Controller
              name="actualMedication"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="form-control"
                  placeholder="กรอกการใช้ยาจริง"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
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
        <div className='m-1 mb-4'>
          <label className="form-label ms-4 me-4 mt-4">อาหารเสริม</label>
          <div className='ms-4 me-4'>
            <Controller
              name="supplements"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="form-control"
                  placeholder="กรอกอาหารเสริม"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
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
      </div>

      {/* Radio: Administration */}
      <div className="info3 card mt-3">
      <div className="header">
          <b>Mini Nutritional Assessment</b>
        </div>
        <div className="m-1">
          <label className="form-label ms-4 me-4">การบริหารยา</label>
          {['จัดยาด้วยตนเอง', 'มีคนจัดยาให้'].map((option) => (
            <div className='ms-4 me-4' key={option}>
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
        <div className="m-1">
          <label className="form-label ms-4 me-4">การรับประทานยา</label>
          {['รับประทานยาด้วยตัวเอง', 'มีคนเตรียมยาแต่ละมื้อให้'].map((option) => (
            <div className='ms-4 me-4' key={option}>
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
        <div className="m-1">
          <label className="form-label ms-4 me-4">ความสม่ำเสมอ</label>
          {['สม่ำเสมอทุกวัน', 'หลงลืมบางครั้ง', 'ไม่สม่ำเสมอ'].map((option) => (
            <div className='ms-4 me-4' key={option}>
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
