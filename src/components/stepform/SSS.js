import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';
import Paper from '../../img/exam.png'

export const SSS = ({ userid,onDataChange }) => {
  const { control, setValue, getValues } = useFormContext();

  const getLocalStorageKey = (userid, key) => `Assessinhomesss_${userid}_${key}`;

  useEffect(() => {
    if (!userid) return;
    const savedData = JSON.parse(localStorage.getItem(getLocalStorageKey(userid, "sssData"))) || {};
    Object.keys(savedData).forEach((key) => setValue(key, savedData[key]));
    onDataChange(getValues());
  }, [userid]);

  const handleInputChange = (group, name, value) => {
    const currentValues = getValues(group) || {}; 
    const updatedValues = { ...currentValues, [name]: value }; 
    setValue(group, updatedValues); 
    const updatedData = { ...getValues(), [group]: updatedValues };
    localStorage.setItem(getLocalStorageKey(userid, "sssData"), JSON.stringify(updatedData));
    onDataChange(updatedData);
  };

  return (
    <div>
      <div className="title-form mt-1">
        <div className="header">
          <b>SSS Assessment</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}>
            <img src={Paper} className="zarit" alt="assessment" /> ประเมินระบบการดูแลผู้ป่วย
          </p>
        </div>
      </div>
      <div className="m-4">
        <div style={{ marginLeft: '26px', marginTop: '20px', lineHeight: '20px' }}>
          <p><i class="bi bi-shield-check" style={{ color: "#008000" }}></i> <b>S</b> = Safety (ความปลอดภัย)</p>
          <p><i class="bi bi-clipboard-heart" style={{ color: "#008000" }}></i> <b>S</b> = Spiritual Health (สุขภาพจิตวิญญาณ)</p>
          <p><i class="bi bi-hospital" style={{ color: "#008000" }}></i> <b>S</b> = Service (การรับบริการ)</p>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className='header'>
          <b>Safety</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-shield-check" style={{ color: "#008000" }}></i> ความปลอดภัย</p>
        </div>
        <table className='nutrition-table'>
          <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <thead>
            <tr>
              <th>คำถาม</th>
              <th className='text-center'>ปลอดภัย</th>
              <th className='text-center'>ไม่ปลอดภัย</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "cleanliness", label: "1. แสงไฟ" },
              { name: "floorSafety", label: "2. พื้นต่างระดับ" },
              { name: "stairsSafety", label: "3. บันได" },
              { name: "handrailSafety", label: "4. ราวจับ" },
              { name: "sharpEdgesSafety", label: "5. เหลี่ยมคม" },
              { name: "slipperyFloorSafety", label: "6. ความลื่นของพื้น" },
              { name: "toiletSafety", label: "7. ลักษณะโถส้วม" },
              { name: "stoveSafety", label: "8. เตาที่ใช้หุงต้ม" },
              { name: "storageSafety", label: "9. การเก็บของในบ้าน" },
              { name: "waterSafety", label: "10. น้ำที่ใช้ดื่ม" },
            ].map((item) => (
              <tr key={item.name}>
                <td>{item.label}</td>
                <td className='text-center'>
                  <Controller
                    name={`Safety.${item.name}`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input

                        type="radio"
                        value="ปลอดภัย"
                        checked={field.value === "ปลอดภัย"}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          handleInputChange("Safety", item.name, e.target.value);
                        }}
                      />
                    )}
                  />
                </td>
                <td className='text-center'>
                  <Controller
                    name={`Safety.${item.name}`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="radio"
                        value="ไม่ปลอดภัย"
                        checked={field.value === "ไม่ปลอดภัย"}
                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          handleInputChange("Safety", item.name, e.target.value);
                        }}
                      />
                    )}
                  />
                </td>
              </tr>
            ))}


          </tbody>
        </table>
        <div className='mt-3 ms-4 me-4 mb-4'>
          <label className="form-label">ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร</label><br></br>
          <div>
            <Controller
              name="Safety.emergencyContact"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  type="text"
                  {...field}
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Safety", "emergencyContact", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='ms-4 me-4 mb-4'>
          <label className="form-label">อันตรายอื่นๆ (ถ้ามี)</label><br></br>
          <div>
            <Controller
              name="Safety.otherHealthHazards"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="form-control"
                  rows="2"
                  style={{ resize: "vertical" }}
                  {...field}
                  placeholder="กรอกคำตอบ"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Safety", "otherHealthHazards", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div>
        
      </div>
      <div>
        
      </div>
      <div className="info3 card mt-4">
        <div className="header">
          <b>Spiritual Health</b>
        </div>
        <div className='ms-4 me-4 mt-1 mb-0'>
          <p style={{ color: "#666" }}><i class="bi bi-clipboard-heart" style={{ color: "#FF6A6A" }}></i> สุขภาพจิตวิญญาณ</p>
        </div>

        {/* ลด margin-bottom ของแต่ละข้อ */}
        {[
          { label: "Faith and belief", name: "faithBelief" },
          { label: "Importance", name: "importance" },
          { label: "Community", name: "community" },
          { label: "Address in care", name: "addressInCare" },
          { label: "Love", name: "love" },
          { label: "Religion", name: "religion" },
          { label: "Forgiveness", name: "forgiveness" },
          { label: "Hope", name: "hope" },
          { label: "Meaning of life", name: "meaningOfLife" }
        ].map(({ label, name }) => (
          <div className="mb-4">
            <div className='ms-4 me-4' key={name}>
              <label className="form-label m-0">{label}</label>
              <Controller
                name={`SpiritualHealth.${name}`}
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <textarea
                    type="text"
                    className="form-control"
                    rows="2"
                    style={{ resize: "vertical", padding: "5px" }}
                    placeholder="กรอกคำตอบ"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleInputChange("SpiritualHealth", name, e.target.value);
                    }}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </div>


      <div className="info3 card mt-4">
        <div className="header">
          <b>Service</b>
        </div>
        <div style={{ marginLeft: '26px', marginTop: '20px', lineHeight: '25px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-hospital" style={{ color: "#008000" }}></i> การรับบริการ เช่น โรงพยาบาล สถานพยาบาล คลินิก ร้านขายยา</p>
        </div>
        <div className="mt-3 ms-4 me-4 mb-4">
          <label className="form-label">เมื่อเจ็บป่วย ท่านรับบริการที่ใด </label><br />
          <p style={{ color: 'gray' }}>(ให้ระบุชื่อสถานที่ สามารถกรอกได้มากกว่า 1 สถานที่)</p>
          <div>
            <Controller
              name="Service.serviceLocation"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="ระบุชื่อสถานที่"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Service", "serviceLocation", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className="mt-0 ms-4 me-4 mb-4">
          <label className="form-label">อื่นๆ (ถ้ามี)</label><br />
          <div>
            <Controller
              name="Service.otherServices"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="form-control"
                  rows="2"
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Service", "otherServices", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div>

      </div>
      <div>
        
      </div>

    </div>
  );
}
