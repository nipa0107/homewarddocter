import React, { useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const PatientAgenda = ({ onDataChange}) => {
    const { control, setValue, getValues } = useFormContext();

    const storageKey = `patientAgendaData`; // ✅ ใช้ userId เพื่อแยกข้อมูลแต่ละคน

    // ✅ โหลดข้อมูลจาก LocalStorage เมื่อลง Component
    useEffect(() => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.keys(parsedData).forEach((key) => setValue(key, parsedData[key]));
            onDataChange(parsedData);
        } else {
            // ✅ ถ้าไม่มีข้อมูล ให้เคลียร์ค่า
            onDataChange({});
        }
    }, ); // ✅ รันใหม่เมื่อ userid เปลี่ยน

    // ✅ บันทึกข้อมูลทุกครั้งที่มีการเปลี่ยนแปลง
    const handleInputChange = (name, value) => {
        setValue(name, value);
        const updatedData = { ...getValues(), [name]: value };
        onDataChange(updatedData);

        // ✅ บันทึกข้อมูลลง localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
    };

    return (
        <div>
            <div className="title-form mt-1">
                <div className="header">
                    <b>Patient Agenda</b>
                </div>
                <div style={{ marginLeft: '26px' }}>
                    <p style={{color:"#666"}}><i class="bi bi-person-check" style={{color:"#008000"}}></i> ประเมินผู้ป่วยเบื้องต้น</p>
                </div>
            </div>

            {/* Input Fields */}
            {[
                { name: "patient_idea", label: "Idea" },
                { name: "patient_feeling", label: "Feeling" },
                { name: "patient_function", label: "Function" },
                { name: "patient_expectation", label: "Expectation" }
            ].map((field) => (
                <div className="mt-4" key={field.name}>
                    <div className='m-4'>
                        <label className="form-label">{field.label} : </label>
                        <div>
                            <Controller
                                name={field.name}
                                control={control}
                                render={({ field: controllerField }) => (
                                    <textarea
                                    className="form-control"
                                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                                    style={{ resize: "vertical" }}
                                        placeholder="กรอกคำตอบ"
                                        {...controllerField}
                                        onChange={(e) => {
                                            controllerField.onChange(e);
                                            handleInputChange(field.name, e.target.value);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
