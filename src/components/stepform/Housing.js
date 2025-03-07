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
      <div className="title-form mt-1">
        <div className="header">
          <b>Housing</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p className="mt-2" style={{ color: "#666" }}><i class="bi bi-house-check-fill" style={{ color: "#008000" }}></i> ประเมินที่อยู่อาศัย</p>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header">
          <b>ข้อมูลลักษณะบ้านของผู้ป่วย
          </b>
        </div>
        <div className="ms-4">
          <p className="mt-2 mb-2" style={{ color: "#666" }}>
            <i class="bi bi-house" style={{ color: "#008000" }}></i> ประเมินสภาพแวดล้อมและความเหมาะสมสำหรับการดูแลผู้ป่วย
          </p>
        </div>
        <div className="m-1">
          <label className="form-label ms-4 mb-0">ลักษณะบ้าน </label><br></br>
          <div className='ms-4 me-4 mt-2'>
            <Controller
              name="houseType"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
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
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">วัสดุที่ใช้ทำ </label><br></br>
          <div className='ms-4 me-4 mt-2'>
            <Controller
              name="material"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
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
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">จำนวนชั้น </label><br></br>
          <div className='ms-4 me-4 mt-2'>
            <Controller
              name="numFloors"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
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
        <div className='m-1'>
          <label className="form-label mt-3 ms-4 mb-0">จำนวนห้อง </label><br></br>
          <div className='ms-4 me-4 mt-2'>
            <Controller
              name="numRooms"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
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
        <div className='m-1 mb-4'>
          <label className="form-label mt-3 ms-4 mb-0">ผู้ป่วยอาศัยอยู่ชั้นไหน </label><br></br>
          <div className='ms-4 me-4 mt-2'>
            <Controller
              name="patientFloor"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
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
        <div className="ms-4">
          <p className="mt-2 mb-2" style={{ color: "#666" }}><i class="bi bi-tree-fill" style={{ color: "#008000" }}></i> ประเมินสิ่งแวดล้อมรอบบ้าน</p>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 me-4">ความสะอาดภายในบ้าน </label>
          <div className='ms-4 me-4'>
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
          <div className='ms-4 me-4'>
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
        <div className='m-1'>
          <label className="form-label ms-4 me-4 mt-3">ความเป็นระเบียบเรียบร้อยในบ้าน </label>
          <div className='ms-4 me-4'>
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
            /><span style={{ marginLeft: '10px' }}>เป็นระเบียบเรียบร้อย </span>
          </div>
          <div className='ms-4 me-4'>
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
            /><span style={{ marginLeft: '10px' }}>ไม่เป็นระเบียบเรียบร้อย </span>
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 me-4 mt-3">แสงสว่างในบ้าน </label>
          <div className='ms-4 me-4'>
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
            /><span style={{ marginLeft: '10px' }}>แสงสว่างเพียงพอ </span>
          </div>
          <div className='ms-4 me-4'>
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
            /><span style={{ marginLeft: '10px' }}>แสงสว่างไม่เพียงพอ </span>
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 me-4 mt-3">การระบายอากาศ </label>
          <div className='ms-4 me-4'>
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
            /><span style={{ marginLeft: '10px' }}>อากาศถ่ายเทสะดวก </span>
          </div>
          <div className='ms-4 me-4'>
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
          <label className="form-label">สภาพสิ่งแวดล้อมรอบๆบ้าน </label>
          <p style={{ color: "gray", marginTop: "-10px", marginBottom: "10px" }}>
            (เลือกได้มากกว่า 1 ข้อ)
          </p>
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
      <div className="info3 card mt-2">
        <div className='m-1'>
          <label className="form-label ms-4 me-4 mt-3">เลี้ยงสัตว์ใต้ถุนบ้าน/รอบๆบ้าน (ถ้ามี) </label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="homeEnvironment_petType"
              control={control}
              render={({ field }) => (
                <input
                  type='text'
                  className="form-control"
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
        <div className='m-1 mb-4'>
          <label className="form-label ms-4 me-4 mt-3">อื่นๆ (ถ้ามี) </label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="otherHomeEnvironment"
              control={control}
              render={({ field }) => (
                <input
                  type='text'
                  className="form-control"
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
        <div className="ms-4">
          <p className="mt-2 mb-2" style={{ color: "#666" }}><i class="bi bi-people-fill" style={{ color: "#008000" }}></i> เพื่อนบ้าน</p>
        </div>
        <div className="m-1">
          <label className="form-label ms-4 me-4">จำนวนเพื่อนบ้าน </label><br></br>
          <div className="ms-4 me-4">
            <Controller
              name="numneighbor"
              control={control}
              render={({ field }) => (
                <input
                  type='text'
                  className="form-control"
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
        <div className='m-1'>
          <label className="form-label ms-4 me-4 mt-4">ความสัมพันธ์กับเพื่อนบ้าน </label><br></br>
          <div className='ms-4 me-4'>
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
                      className="form-control"
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
        <div className='m-1 mb-4'>
          <label className="form-label ms-4 me-4 mt-4">ความช่วยเหลือกันของเพื่อนบ้าน </label><br></br>
          <div className='ms-4 me-4'>
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
          <div className='ms-4 me-4'>
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
