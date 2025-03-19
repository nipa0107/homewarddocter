import React, { useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const PatientAgenda = ({ userid,onDataChange }) => {
    const { control, setValue, getValues } = useFormContext();

// ฟังก์ชันสร้างคีย์สำหรับ localStorage โดยใช้ userId
const getLocalStorageKey = (key) => `agenda_${userid}_${key}`;

useEffect(() => {
    if (!userid) return; // ถ้า userId ไม่มีค่าให้หยุดทำงาน

    // ✅ โหลดข้อมูลที่ถูกต้องตาม userId
    const savedData = JSON.parse(localStorage.getItem(getLocalStorageKey("patientAgendaData"))) || {};
    Object.keys(savedData).forEach((key) => setValue(key, savedData[key]));
    onDataChange(getValues());
}, [userid]);

const handleInputChange = (name, value) => {
    setValue(name, value);
    const updatedValues = { ...getValues(), [name]: value };

    // ✅ บันทึกข้อมูลตาม userId
    if (userid) {
        localStorage.setItem(getLocalStorageKey("patientAgendaData"), JSON.stringify(updatedValues));
    }
    onDataChange(updatedValues);
};
    // const handleInputChange = (name, value) => {
    //     setValue(name, value);
    //     const updatedValues = { ...getValues(), [name]: value };
    //     localStorage.setItem("patientAgendaData", JSON.stringify(updatedValues));
    //     onDataChange(updatedValues);
    // };
    return (
        <div>
            <div className="title-form mt-1">
                <div className="header">
                    <b>Patient Agenda</b>
                </div>
                <div style={{ marginLeft: '26px' }}>
                    <p style={{ color: "#666" }}><i class="bi bi-person-check" style={{ color: "#008000" }}></i> ประเมินผู้ป่วยเบื้องต้น</p>
                </div>
            </div>
            <div className="mt-4">
                <div className='m-4'>
                    <label className="form-label">Idea <span style={{ color: "#666", fontSize: "15px" }}>(แนวคิดของผู้ป่วย)</span></label>
                    <div>
                        <Controller
                            name="patient_idea"
                            control={control}
                            render={({ field: controllerField }) => (
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    placeholder="กรอกคำตอบ"
                                    {...controllerField}
                                    onChange={(e) => {
                                        controllerField.onChange(e);
                                        handleInputChange("patient_idea", e.target.value);
                                    }}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <div className='m-4'>
                    <label className="form-label">Function <span style={{ color: "#666", fontSize: "15px" }}>(ระบุความรู้สึกของผู้ป่วย ณ ขณะนั้น)</span></label>
                    <div>
                        <Controller
                            name="patient_function"
                            control={control}
                            render={({ field: controllerField }) => (
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    placeholder="กรอกคำตอบ"
                                    {...controllerField}
                                    onChange={(e) => {
                                        controllerField.onChange(e);
                                        handleInputChange("patient_function", e.target.value);
                                    }}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <div className='m-4'>
                    <label className="form-label">Feeling <span style={{ color: "#666", fontSize: "15px" }}>(ผลกระทบของอาการป่วยที่มีต่อกิจวัตรประจำวัน)</span></label>
                    <div>
                        <Controller
                            name="patient_feeling"
                            control={control}
                            render={({ field: controllerField }) => (
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    placeholder="กรอกคำตอบ"
                                    {...controllerField}
                                    onChange={(e) => {
                                        controllerField.onChange(e);
                                        handleInputChange("patient_feeling", e.target.value);
                                    }}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <div className='m-4'>
                    <label className="form-label">Expectation <span style={{ color: "#666", fontSize: "15px" }}>(ระบุสิ่งที่ผู้ป่วยคาดหวังจากการพบแพทย์)</span></label>
                    <div>
                        <Controller
                            name="patient_expectation"
                            control={control}
                            render={({ field: controllerField }) => (
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    placeholder="กรอกคำตอบ"
                                    {...controllerField}
                                    onChange={(e) => {
                                        controllerField.onChange(e);
                                        handleInputChange("patient_expectation", e.target.value);
                                    }}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
            

        </div>
    );
};
