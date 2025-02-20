import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Housing = ({ onDataChange }) => {
  const { control, setValue, getValues } = useFormContext();

  // ดึงค่าเริ่มต้นจาก form
  const initialNeighborRelationship = getValues("neighborRelationship") || "";
  const [neighborRelationship, setNeighborRelationship] = useState(
    ["ดี", "ไม่ดี"].includes(initialNeighborRelationship) ? initialNeighborRelationship : ""
  );

  const [tempOtherRelationship, setTempOtherRelationship] = useState(
    ["ดี", "ไม่ดี"].includes(initialNeighborRelationship) ? "" : initialNeighborRelationship
  );


  const handleInputChange = (name, value) => {
    setValue(name, value); // อัปเดต react-hook-form state โดยตรง
    onDataChange({ ...getValues() }); // ส่งค่าล่าสุดทั้งหมดกลับไป
  };

  useEffect(() => {
    if (neighborRelationship === "อื่นๆ" && tempOtherRelationship.trim() !== "") {
      handleInputChange("neighborRelationship", tempOtherRelationship);
    }
  }, [tempOtherRelationship, neighborRelationship]);


  const handleRadioChange = (value) => {
    setNeighborRelationship(value);
    if (value === "ดี" || value === "ไม่ดี") {
      handleInputChange("neighborRelationship", value);
    } else if (value === "อื่นๆ") {
      handleInputChange("neighborRelationship", tempOtherRelationship);
    }
  };

  return (
    <div>
      <div className="info3 card">
        <div className="header">
          <b>Housing</b>
        </div>
        <div className='m-4'>
          <label className="form-label">ลักษณะบ้าน :</label><br></br>
          <div>
            <Controller
              name="houseType"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("houseType", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">วัสดุที่ใช้ทำ :</label><br></br>
          <div>
            <Controller
              name="material"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("material", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">จำนวนชั้น :</label><br></br>
          <div>
            <Controller
              name="numFloors"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("numFloors", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">จำนวนห้อง :</label><br></br>
          <div>
            <Controller
              name="numRooms"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("numRooms", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ผู้ป่วยอาศัยอยู่ชั้นไหน :</label><br></br>
          <div>
            <Controller
              name="patientFloor"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("patientFloor", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="header">
          <b>Home environment</b>
        </div>
        <div className='m-4'>
          <label className="form-label">ความสะอาดในบ้าน :</label>
          <div>
            <Controller
              name="cleanliness"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="สะอาด"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "สะอาด"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("cleanliness", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>สะอาด </span>
          </div>
          <div>
            <Controller
              name="cleanliness"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="ไม่สะอาด"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "ไม่สะอาด"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("cleanliness", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>ไม่สะอาด </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ความเป็นระเบียบเรียบร้อยในบ้าน :</label>
          <div>
            <Controller
              name="orderliness"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="เป็นระเบียบเรียบร้อย"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "เป็นระเบียบเรียบร้อย"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("orderliness", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>เป็นระเบียบเรียบร้อย </span>
          </div>
          <div>
            <Controller
              name="orderliness"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="ไม่เป็นระเบียบเรียบร้อย"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "ไม่เป็นระเบียบเรียบร้อย"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("orderliness", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>ไม่เป็นระเบียบเรียบร้อย </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">แสงสว่างในบ้าน :</label>
          <div>
            <Controller
              name="lighting"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="แสงสว่างเพียงพอ"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "แสงสว่างเพียงพอ"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("lighting", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>แสงสว่างเพียงพอ </span>
          </div>
          <div>
            <Controller
              name="lighting"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="แสงสว่างไม่เพียงพอ"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "แสงสว่างไม่เพียงพอ"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("lighting", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>แสงสว่างไม่เพียงพอ </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">การระบายอากาศ :</label>
          <div>
            <Controller
              name="ventilation"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="อากาศถ่ายเทสะดวก"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "อากาศถ่ายเทสะดวก"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("ventilation", e.target.value);
                  }}
                />
              )}
            /> <span style={{ marginLeft: '10px' }}>อากาศถ่ายเทสะดวก </span>
          </div>
          <div>
            <Controller
              name="ventilation"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="อากาศถ่ายเทไม่สะดวก"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "อากาศถ่ายเทไม่สะดวก"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("ventilation", e.target.value);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>อากาศถ่ายเทไม่สะดวก </span>
          </div>
        </div>
      </div>

      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">สภาพสิ่งแวดล้อมรอบๆบ้าน :</label>
          <div>
            <Controller
              name="homeEnvironment"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  value="ชื้นแฉะ มีน้ำขังเป็นย่อมๆ"
                  checked={field.value.includes("ชื้นแฉะ มีน้ำขังเป็นย่อมๆ")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "ชื้นแฉะ มีน้ำขังเป็นย่อมๆ"]
                      : field.value.filter((item) => item !== "ชื้นแฉะ มีน้ำขังเป็นย่อมๆ");
                    field.onChange(newValue);
                    handleInputChange("homeEnvironment", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>
              ชื้นแฉะ มีน้ำขังเป็นย่อมๆ </span>
          </div>
          <div>
            <Controller
              name="homeEnvironment"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  value="หญ้าหรือต้นไม้ขึ้นรอบๆ"
                  checked={field.value.includes("หญ้าหรือต้นไม้ขึ้นรอบๆ")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "หญ้าหรือต้นไม้ขึ้นรอบๆ"]
                      : field.value.filter((item) => item !== "หญ้าหรือต้นไม้ขึ้นรอบๆ");
                    field.onChange(newValue);
                    handleInputChange("homeEnvironment", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>หญ้าหรือต้นไม้ขึ้นรอบๆ</span>
          </div>
          <div>
            <Controller
              name="homeEnvironment"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  value="มีรั้วบ้านล้อมรอบ"
                  checked={field.value.includes("มีรั้วบ้านล้อมรอบ")}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...field.value, "มีรั้วบ้านล้อมรอบ"]
                      : field.value.filter((item) => item !== "มีรั้วบ้านล้อมรอบ");
                    field.onChange(newValue);
                    handleInputChange("homeEnvironment", newValue);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}>มีรั้วบ้านล้อมรอบ</span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">เลี้ยงสัตว์ใต้ถุนบ้าน/รอบๆบ้าน (ถ้ามี) :</label><br></br>
          <div>
            <Controller
              name="homeEnvironment_petType"
              control={control}
              render={({ field }) => (
                <input
                  type='text'
                  className="google-form-input"
                  placeholder="กรอกชนิดของสัตว์"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("homeEnvironment_petType", e.target.value);
                  }}
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
              name="otherHomeEnvironment"
              control={control}
              render={({ field }) => (
                <input
                  type='text'
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("otherHomeEnvironment", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div className="info3 card mt-4">
        <div className="header">
          <b>Neighbors</b>
        </div>
        <div className='m-4'>
          <label className="form-label">จำนวนเพื่อนบ้าน :</label><br></br>
          <div>
            <Controller
              name="numneighbor"
              control={control}
              render={({ field }) => (
                <input
                  type='text'
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("numneighbor", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-4">
        
        <div className='m-4'>
          <label className="form-label">ความสัมพันธ์กับเพื่อนบ้าน :</label><br></br>
          <div>
            <Controller
              name="neighborRelationship"
              control={control}
              defaultValue={getValues("neighborRelationship") || ""}
              render={({ field }) => (
                <>
                  {/* ตัวเลือก ดี */}
                  <input
                    type="radio"
                    value="ดี"
                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    checked={neighborRelationship === "ดี"}
                    onChange={(e) => {
                      handleRadioChange(e.target.value);
                      field.onChange(e.target.value);
                    }}
                  />
                  <span style={{ marginLeft: '10px' }}>ดี</span>
                  <br />

                  {/* ตัวเลือก ไม่ดี */}
                  <input
                    type="radio"
                    value="ไม่ดี"
                    style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                    checked={neighborRelationship === "ไม่ดี"}
                    onChange={(e) => {
                      handleRadioChange(e.target.value);
                      field.onChange(e.target.value);
                    }}
                  />
                  <span style={{ marginLeft: '10px' }}>ไม่ดี</span>
                  <br />

                  {/* ช่องกรอกสำหรับ "อื่นๆ" */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginLeft: '4px' }}>อื่นๆ</span>
                    <input
                      type="text"
                      placeholder="กรอกความสัมพันธ์อื่นๆ"
                      className="google-form-input"
                      value={tempOtherRelationship}
                      onChange={(e) => {
                        setTempOtherRelationship(e.target.value);
                        setNeighborRelationship("อื่นๆ");
                        if (e.target.value.trim() !== "") {
                          handleInputChange("neighborRelationship", e.target.value);
                          field.onChange(e.target.value);
                        }
                      }}
                      style={{
                        borderBottom: '1px solid #4285f4',
                        outline: 'none',
                        marginLeft: '30px',
                        width: '85%'
                      }}
                    />
                  </div>
                </>
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ความช่วยเหลือกันของเพื่อนบ้าน :</label><br></br>
          <div>
            <Controller
              name="neighborHelp"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="ช่วยเหลือกันดีเมื่อมีปัญหา"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "ช่วยเหลือกันดีเมื่อมีปัญหา"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("neighborHelp", e.target.value);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}> ช่วยเหลือกันดีเมื่อมีปัญหา</span>
          </div>
          <div>
            <Controller
              name="neighborHelp"
              control={control}
              defaultValue=" "
              render={({ field }) => (
                <input
                  type="radio"
                  value="ไม่ช่วยเหลือกัน"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  checked={field.value === "ไม่ช่วยเหลือกัน"}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("neighborHelp", e.target.value);
                  }}
                />
              )}
            />
            <span style={{ marginLeft: '10px' }}> ไม่ช่วยเหลือกัน</span>
          </div>
        </div>
      </div>
    </div>
  );
};
