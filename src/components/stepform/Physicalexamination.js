import React, { useState, useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Physicalexamination = () => {
  const { register, control, getValues } = useFormContext();
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    const savedValue = getValues("otherOptionText"); // Get the saved value from the form state
    if (savedValue) {
      setOtherText(savedValue); // Set the saved value to the input
    }
  }, [getValues]);

  return (
    <div>
      <div className="info3 card">
        <div className="header">
          <b>Physical Examination</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p>การซักประวัติและการตรวจร่างกายทั่วไป</p>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="header">
          <b>Vital Signs</b>
        </div>
        <div className='m-4'>
          <label className="form-label">Temperature ( °C) :</label><br></br>
          <div>
            <Controller
              name="temperature"
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
          <label className="form-label">Blood pressure  (mm/Hg) :</label><br></br>
          <div>
            <Controller
              name="bloodPressure"
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
          <label className="form-label">Pulse (/min) :</label><br></br>
          <div>
            <Controller
              name="pulse"
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
          <label className="form-label">Respiration (/min) :</label><br></br>
          <div>
            <Controller
              name="respiratoryRate"
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
          <b>ตรวจร่างกายทั่วไป</b>
        </div>
        <div className='m-4'>
          <label className="form-label">GA (ลักษณะโดยรวม) :</label><br></br>
          <div>
            <Controller
              name="generalAppearance"
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
          <label className="form-label">CVS (ระบบหัวใจ) :</label><br></br>
          <div>
            <Controller
              name="cardiovascularSystem"
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
          <label className="form-label">RS (ระบบหายใจ) :</label><br></br>
          <div>
            <Controller
              name="respiratorySystem"
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
          <label className="form-label">Abd (ช่องท้อง) :</label><br></br>
          <div>
            <Controller
              name="abdominal"
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
          <label className="form-label">NS (ระบบประสาท) :</label><br></br>
          <div>
            <Controller
              name="nervousSystem"
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
          <label className="form-label">Ext (รยางค์แขน/ขา) :</label><br></br>
          <div>
            <Controller
              name="extremities"
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
          <b>Metal status examination</b>
        </div>
        <div className='m-4'>
          <label className="form-label">Appearance and Behavior :</label><br></br>
          <p style={{ color: 'gray'  , marginTop: '-20px' , marginBottom: '1px'  }}>(เลือกได้มากกว่า 1 ข้อ)</p>
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
            /> <span style={{ marginLeft: '10px' }}>Cooperative </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Guarded </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Candid </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Defensive </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}> Relaxed</span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Irritable </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}> Open</span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}> Shy</span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Eye contact :</label><br></br>
          <p style={{ color: 'gray'  , marginTop: '-20px' , marginBottom: '1px' }}>(เลือกได้มากกว่า 1 ข้อ)</p>
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
            /> <span style={{ marginLeft: '10px' }}>Good </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Sporadic </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Fleeting </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>none </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Mood and affect :</label><br></br>
          <p style={{ color: 'gray'  , marginTop: '-20px' , marginBottom: '1px' }}>(เลือกได้มากกว่า 1 ข้อ)</p>
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
            /> <span style={{ marginLeft: '10px' }}>Euthymia </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Depressed </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Apathetic </span>
          </div>
          <div>
            <Controller
              name="otherOptionText" // Name for the form value
              control={control}
              defaultValue={getValues("otherOptionText") || ""} // Use the saved value as default
              render={({ field }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}> {/* Flexbox for horizontal alignment */}
                  {/* Text input for 'Other' */}
                  <span style={{ marginLeft: '4px' }}> อื่นๆ</span>
                  <input
                    type="text"
                    placeholder="กรอกคำตอบอื่นๆ"
                    className="google-form-input"
                    value={otherText}
                    onChange={(e) => {
                      setOtherText(e.target.value); // Update the local state
                      field.onChange(e.target.value); // Sync with form state
                    }}
                    style={{
                      borderBottom: '1px solid #4285f4', // Google Forms-like underline
                      outline: 'none',
                      marginLeft: '30px', // Space between label and input
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
          <label className="form-label">Attention :</label><br></br>
          <p style={{ color: 'gray'  , marginTop: '-20px' , marginBottom: '1px' }}>(เลือกได้มากกว่า 1 ข้อ)</p>
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
            /> <span style={{ marginLeft: '10px' }}>Adequate </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Inadequate </span>
          </div>
          <div>
            <Controller
              name="otherOptionText" // Name for the form value
              control={control}
              defaultValue={getValues("otherOptionText") || ""} // Use the saved value as default
              render={({ field }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}> {/* Flexbox for horizontal alignment */}
                  {/* Text input for 'Other' */}
                  <span style={{ marginLeft: '4px' }}> อื่นๆ</span>
                  <input
                    type="text"
                    placeholder="กรอกคำตอบอื่นๆ"
                    className="google-form-input"
                    value={otherText}
                    onChange={(e) => {
                      setOtherText(e.target.value); // Update the local state
                      field.onChange(e.target.value); // Sync with form state
                    }}
                    style={{
                      borderBottom: '1px solid #4285f4', // Google Forms-like underline
                      outline: 'none',
                      marginLeft: '30px', // Space between label and input
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
          <label className="form-label">Orientation :</label>
          <p style={{ color: 'gray' , marginTop: '-20px' , marginBottom: '1px' }}>(เลือกได้มากกว่า 1 ข้อ)</p>
          <div >
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
            /> <span style={{ marginLeft: '10px' }}>Place </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Time </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Person </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Situation </span>
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Thought process :</label><br></br>
          <p style={{ color: 'gray'  , marginTop: '-20px' , marginBottom: '-1px'  }}>(เลือกได้มากกว่า 1 ข้อ)</p>
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
            /> <span style={{ marginLeft: '10px' }}>Coherence </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Tangential </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Disorganized </span>
          </div>
          <div>
            <Controller
              name="otherOptionText" // Name for the form value
              control={control}
              defaultValue={getValues("otherOptionText") || ""} // Use the saved value as default
              render={({ field }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}> {/* Flexbox for horizontal alignment */}
                  {/* Text input for 'Other' */}
                  <span style={{ marginLeft: '4px' }}> อื่นๆ </span>
                  <input
                    type="text"
                    placeholder="กรอกคำตอบอื่นๆ"
                    className="google-form-input"
                    value={otherText}
                    onChange={(e) => {
                      setOtherText(e.target.value); // Update the local state
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
          <label className="form-label">Thought content :</label><br></br>
          <p style={{ color: 'gray'  , marginTop: '-20px' , marginBottom: '1px' }}>(เลือกได้มากกว่า 1 ข้อ)</p>
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
            /> <span style={{ marginLeft: '10px' }}>Reality </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Obsession </span>
          </div>
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
            /> <span style={{ marginLeft: '10px' }}>Delusion </span>
          </div>
          <div>
            <Controller
              name="otherOptionText" // Name for the form value
              control={control}
              defaultValue={getValues("otherOptionText") || ""} // Use the saved value as default
              render={({ field }) => (
                <div style={{ display: 'flex', alignItems: 'center' }}> {/* Flexbox for horizontal alignment */}
                  {/* Text input for 'Other' */}
                  <span style={{ marginLeft: '4px' }}> อื่นๆ</span>
                  <input
                    type="text"
                    placeholder="กรอกคำตอบอื่นๆ"
                    className="google-form-input"
                    value={otherText}
                    onChange={(e) => {
                      setOtherText(e.target.value); // Update the local state
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
    </div>
  )
}
