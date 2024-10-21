import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Housing = () => {
  const { control, register, setValue, getValues, watch } = useFormContext();
  const [otherRelationship, setOtherRelationship] = useState('');

  useEffect(() => {
    const savedValue = getValues("otherNeighborRelationship"); // Get the saved value from the form state
    if (savedValue) {
      setOtherRelationship(savedValue); // Set the saved value to the input
    }
  }, [getValues]);

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
              name="environment.houseType"
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
          <label className="form-label">วัสดุที่ใช้ทำ :</label><br></br>
          <div>
            <Controller
              name="environment.material"
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
      {/* <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label"> :</label><br></br>
          <div>
            <Controller
              name=""
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
      </div> */}
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">มีกี่ชั้น :</label><br></br>
          <div>
            <Controller
              name="environment.numFloors"
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
          <label className="form-label">มีกี่ห้อง :</label><br></br>
          <div>
            <Controller
              name="environment.numRooms"
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
          <label className="form-label">ผู้ป่วยอาศัยอยู่ชั้นไหน :</label><br></br>
          <div>
            <Controller
              name="environment.patientFloor"
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
        <div className="header">
          <b>Home environment</b>
        </div>
        <div className='m-4'>
          <label className="form-label">ความสะอาดในบ้าน :</label>
          <div>
            <input
              type="radio"
              name="cleanliness"
              value="สะอาด"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("cleanliness")} />
            <span style={{ marginLeft: '10px' }}>
              สะอาด </span>
          </div>
          <div>
            <input
              type="radio"
              name="cleanliness"
              value="ไม่สะอาด"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("cleanliness")} />
            <span style={{ marginLeft: '10px' }}>ไม่สะอาด </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ความเป็นระเบียบเรียบร้อยในบ้าน :</label>
          <div>
            <input
              type="radio"
              name="orderliness"
              value="เป็นระเบียบเรียบร้อย"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("orderliness")} />
            <span style={{ marginLeft: '10px' }}>
              เป็นระเบียบเรียบร้อย </span>
          </div>
          <div>
            <input
              type="radio"
              name="orderliness"
              value="ไม่เป็นระเบียบเรียบร้อย"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("orderliness")} />
            <span style={{ marginLeft: '10px' }}>ไม่เป็นระเบียบเรียบร้อย </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">แสงสว่างในบ้าน :</label>
          <div>
            <input
              type="radio"
              name="lighting"
              value="แสงสว่างเพียงพอ"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("lighting")} />
            <span style={{ marginLeft: '10px' }}>
              แสงสว่างเพียงพอ </span>
          </div>
          <div>
            <input
              type="radio"
              name="lighting"
              value="ไม่แสงสว่างเพียงพอ"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("lighting")} />
            <span style={{ marginLeft: '10px' }}>ไม่แสงสว่างเพียงพอ </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อากาศภายในบ้าน :</label>
          <div>
            <input
              type="radio"
              name="ventilation"
              value="อากาศถ่ายเทสะดวก"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("ventilation")} />
            <span style={{ marginLeft: '10px' }}>
              อากาศถ่ายเทสะดวก </span>
          </div>
          <div>
            <input
              type="radio"
              name="ventilation"
              value="ไม่อากาศถ่ายเทสะดวก"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("ventilation")} />
            <span style={{ marginLeft: '10px' }}>ไม่อากาศถ่ายเทสะดวก </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">สภาพสิ่งแวดล้อมรอบๆบ้าน :</label>
          <div>
            <input
              type="checkbox"
              value="ชื้นแฉะ มีน้ำขังเป็นย่อมๆ"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("homeEnvironment.aroundHouseConditions")}
              onChange={(e) => {
                const values = getValues("homeEnvironment.aroundHouseConditions") || [];
                setValue(
                  "homeEnvironment.aroundHouseConditions",
                  e.target.checked
                    ? [...values, e.target.value]
                    : values.filter(value => value !== e.target.value)
                );
              }}
            />
            <span style={{ marginLeft: '10px' }}>
              ชื้นแฉะ มีน้ำขังเป็นย่อมๆ </span>
          </div>
          <div>
            <input
              type="checkbox"
              value="หญ้าหรือต้นไม้ขึ้นรอบๆ"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("homeEnvironment.aroundHouseConditions")}
              onChange={(e) => {
                const values = getValues("homeEnvironment.aroundHouseConditions") || [];
                setValue(
                  "homeEnvironment.aroundHouseConditions",
                  e.target.checked
                    ? [...values, e.target.value]
                    : values.filter(value => value !== e.target.value)
                );
              }}
            />
            <span style={{ marginLeft: '10px' }}>หญ้าหรือต้นไม้ขึ้นรอบๆ</span>
          </div>
          <div>
            <input
              type="checkbox"
              value="มีรั้วบ้านล้อมรอบ"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("homeEnvironment.aroundHouseConditions")}
              onChange={(e) => {
                const values = getValues("homeEnvironment.aroundHouseConditions") || [];
                setValue(
                  "homeEnvironment.aroundHouseConditions",
                  e.target.checked
                    ? [...values, e.target.value]
                    : values.filter(value => value !== e.target.value)
                );
              }}
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
              name="homeEnvironment.petType"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type='text'
                  className="google-form-input"
                  placeholder="กรอกชนิดของสัตว์"
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อื่นๆ(ถ้ามี) :</label><br></br>
          <div>
            <input
              type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register("other_home_environment")}
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
            <input
              type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ความสัมพันธ์กับเพื่อนบ้าน :</label><br></br>
          <div>
            <input
              type="radio"
              value="ดี"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("neighborRelationship")}
            />
            <span style={{ marginLeft: '10px' }}>ดี</span>
          </div>
          <div>
            <input
              type="radio"
              value="ไม่ดี"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("neighborRelationship")}
            />
            <span style={{ marginLeft: '10px' }}>ไม่ดี</span>
          </div>
          {/* <div>
            <input
              type="radio"
              value="อื่นๆ"
              style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
              {...register("neighborRelationship")}
            /><span style={{ marginLeft: '10px' }}>อื่นๆ</span>
            <Controller
              name="otherNeighborRelationship"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="ความสัมพันธ์อื่นๆ"
                  {...field}
                  disabled={neighborRelationship !== "อื่นๆ"}
                />
              )}
            />
          </div> */}
          <div>
            <Controller
              name="otherNeighborRelationship" // Name for the form value
              control={control}
              defaultValue={getValues("otherNeighborRelationship") || ""} // Use the saved value as default
              render={({ field }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}> {/* Flexbox for horizontal alignment */}
                  {/* Text input for 'Other' */}
                  <span style={{ marginLeft: '4px' }}> อื่นๆ</span>
                  <input
                    type="text"
                    placeholder="กรอกความสัมพันธ์อื่นๆ"
                    className="google-form-input"
                    value={otherRelationship}
                    onChange={(e) => {
                      setOtherRelationship(e.target.value); // Update the local state
                      field.onChange(e.target.value); // Sync with form state
                    }}
                    style={{
                      borderBottom: '1px solid #4285f4', // Google Forms-like underline
                      outline: 'none',
                      marginLeft: '40px', // Space between label and input
                      width: '85%' // Adjust width as needed
                    }}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ความช่วยเหลือกันของเพื่อนบ้าน :</label><br></br>
          <div>
          <input
                  type="radio"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  value="ช่วยเหลือกันดีเมื่อมีปัญหา"
                  {...register("neighborHelp")}
                /> 
            <span style={{ marginLeft: '10px' }}> ช่วยเหลือกันดีเมื่อมีปัญหา</span>
          </div>
          <div>
          <input
                  type="radio"
                  style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                  value="ไม่ช่วยเหลือกัน"
                  {...register("neighborHelp")}
                /> 
            <span style={{ marginLeft: '10px' }}> ไม่ช่วยเหลือกัน</span>
          </div>
        </div>
      </div>
    </div>
  );
};
