import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Physicalexamination = ({ userid,onDataChange }) => {
  const { control, setValue, getValues } = useFormContext();
  const [otherTexts, setOtherTexts] = useState({});

  /** ✅ ฟังก์ชันสร้าง Key สำหรับ LocalStorage ตาม userId */
  const getLocalStorageKey = (userid, key) => `Assessinhomesss_${userid}_${key}`;

  useEffect(() => {
    if (!userid) return;
    const savedData = JSON.parse(localStorage.getItem(getLocalStorageKey(userid, "physicalExaminationData"))) || {};
    Object.keys(savedData).forEach((key) => setValue(key, savedData[key]));
    onDataChange(getValues());
  }, [userid]);

  const handleInputChange = (name, value) => {
    setValue(name, value);
    const updatedValues = { ...getValues(), [name]: value };
    localStorage.setItem(getLocalStorageKey(userid, "physicalExaminationData"), JSON.stringify(updatedValues));
    onDataChange(updatedValues);
  };

  const handleCheckboxChange = (name, value, isChecked) => {
    const currentValues = getValues(name) || [];

    let updatedValues;
    if (isChecked) {
      updatedValues = [...currentValues, { value, isOther: false }];
    } else {
      updatedValues = currentValues.filter((item) => item.value !== value);
    }

    handleInputChange(name, updatedValues);
  };

  const handleOtherInputChange = (name, value) => {
    const currentValues = getValues(name) || [];
    const updatedValues = value
      ? [...currentValues.filter((item) => !item.isOther), { value, isOther: true }]
      : currentValues.filter((item) => !item.isOther);

    handleInputChange(name, updatedValues);
  };

  const renderCheckboxGroupWithOther = (fieldName, options, label) => (
    <div className="info3 card mt-3">
      <div className="m-4">
        <label className="form-label">{label}</label>
        <p style={{ color: "gray", marginTop: "-10px", marginBottom: "10px" }}>
          (เลือกได้มากกว่า 1 ข้อ)
        </p>
        {options.map((option) => (
          <div key={option}>
            <Controller
              name={fieldName}
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <input
                  type="checkbox"
                  value={option}
                  checked={field.value.some((item) => item.value === option)}
                  style={{ transform: "scale(1.3)", marginLeft: "5px" }}
                  onChange={(e) => {
                    handleCheckboxChange(fieldName, option, e.target.checked);
                    field.onChange(
                      e.target.checked
                        ? [...field.value, { value: option, isOther: false }]
                        : field.value.filter((item) => item.value !== option)
                    );
                  }}
                />
              )}
            />
            <span style={{ marginLeft: "10px" }}>{option}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
          <span style={{ marginLeft: "4px" }}> อื่นๆ</span>
          <Controller
            name={fieldName}
            control={control}
            defaultValue={[]}
            render={({ field }) => (
              <textarea
                className="form-control"
                rows="2"
                style={{ resize: "vertical", border: "1px solid #ddd", outline: "none", marginLeft: "30px" }}
                placeholder="กรอกคำตอบอื่นๆ"
                value={field.value.find((item) => item.isOther)?.value || ""}
                onChange={(e) => {
                  const otherValue = e.target.value;
                  handleOtherInputChange(fieldName, otherValue);
                  field.onChange(
                    otherValue
                      ? [...field.value.filter((item) => !item.isOther), { value: otherValue, isOther: true }]
                      : field.value.filter((item) => !item.isOther)
                  );
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="title-form mt-1">
        <div className="header">
          <b>Physical Examination</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p className="mt-2" style={{ color: "#666" }}><i class="bi bi-person-lines-fill" style={{ color: "#008000" }}></i> การซักประวัติและการตรวจร่างกายทั่วไป</p>
        </div>
      </div>

      <div className="info3 card mt-3">
        <div className="header">
          <b>Vital Sign</b>
        </div>
        <div className='ms-4 mb-0 mt-2'>
          <p style={{ color: "#666" }}><i class="bi bi-clipboard2-pulse-fill" style={{ color: "#008000" }}></i> การวัดสัญญาณชีพ</p>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4"><i class="bi bi-thermometer-half" style={{ color: "#666" }}></i> อุณหภูมิร่างกาย ( °C) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็มหรือทศนิยม เช่น 35,36.8)</span></label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="temperature"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="number"
                  style={{ width: "35%" }}
                  className="form-control"
                  placeholder="กรอกตัวเลข"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("temperature", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mt-4"><i class="bi bi-heart-pulse" style={{ color: "#666" }}></i> ความดันโลหิต (mmHg) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็ม เช่น 120/80)</span></label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="bloodPressure"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="number"
                  style={{ width: "35%" }}
                  className="form-control"
                  placeholder="กรอกตัวเลข"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("bloodPressure", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mt-4"><i class="bi bi-activity" style={{ color: "#666" }}></i> อัตราการเต้นของหัวใจ (bpm) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็ม เช่น 72)</span></label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="pulse"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="number"
                  style={{ width: "35%" }}
                  className="form-control"
                  placeholder="กรอกตัวเลข"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("pulse", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1 mb-4'>
          <label className="form-label ms-4 mt-4 "><i class="bi bi-lungs" style={{ color: "#666" }}></i> อัตราการหายใจ (min) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็ม เช่น 16)</span></label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="respiratoryRate"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="number"
                  style={{ width: "35%" }}
                  className="form-control"
                  placeholder="กรอกตัวเลข"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("respiratoryRate", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>

      <div className="info3 card mt-3">
        <div className="header">
          <b>General physical examination </b>
        </div>
        <div className='ms-4 mb-0 mt-2'>
          <p style={{ color: "#666" }}><i class="bi bi-person-standing" style={{ color: "#008000" }}></i> การตรวจร่างกายทั่วไป</p>
        </div>
        <div className='m-1 mt-0'>
          <label className="form-label ms-4 ">GA (ลักษณะโดยรวม)</label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="generalAppearance"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  type="text"
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("generalAppearance", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mt-4">CVS (ระบบหัวใจ)</label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="cardiovascularSystem"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  type="text"
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("cardiovascularSystem", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mt-4">RS (ระบบหายใจ)</label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="respiratorySystem"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  type="text"
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("respiratorySystem", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mt-4">Abd (ช่องท้อง)</label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="abdominal"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  type="text"
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("abdominal", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1'>
          <label className="form-label ms-4 mt-4">NS (ระบบประสาท)</label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="nervousSystem"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  type="text"
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("nervousSystem", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
        <div className='m-1 mb-4'>
          <label className="form-label ms-4 mt-4">Ext (รยางค์แขน/ขา)</label><br></br>
          <div className='ms-4 me-4'>
            <Controller
              name="extremities"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  type="text"
                  className="form-control"
                  rows="2" // กำหนดจำนวนแถวเริ่มต้น
                  style={{ resize: "vertical" }}
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleInputChange("extremities", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="header">
          <b>Metal status examination</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-person-heart" style={{ color: "#008000" }}></i> การตรวจสภาพจิตใจ</p>
        </div>
      </div>
      {renderCheckboxGroupWithOther("moodandaffect", ["Euthymia", "Depressed", "Apathetic"], "Mood and affect")}
      {renderCheckboxGroupWithOther(
        "appearanceAndBehavior",
        ["Cooperative", "Guarded", "Candid", "Defensive"],
        "Appearance and Behavior"
      )}
      {renderCheckboxGroupWithOther(
        "eyeContact",
        ["Good", "Sporadic", "Fleeting", "None"],
        "Eye contact"
      )}
      {renderCheckboxGroupWithOther(
        "attention",
        ["Adequate", "Inadequate"],
        "Attention"
      )}
      {renderCheckboxGroupWithOther(
        "orientation",
        ["Place", "Time", "Person", "Situation"],
        "Orientation"
      )}
      {renderCheckboxGroupWithOther(
        "thoughtProcess",
        ["Coherence", "Tangential", "Disorganized"],
        "Thought process"
      )}
      {renderCheckboxGroupWithOther(
        "thoughtContent",
        ["Reality", "Obsession", "Delusion"],
        "Thought content"
      )}
    </div>
  )
}
//ไฟนอล