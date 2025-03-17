import React, { useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const PatientAgenda = ({ onDataChange }) => {
    const { control, setValue, getValues } = useFormContext();

  useEffect(() => {
    // Load stored data from localStorage
    const savedData = JSON.parse(localStorage.getItem("patientAgendaData")) || {};
    Object.keys(savedData).forEach((key) => setValue(key, savedData[key]));
    onDataChange(getValues());
  }, []);
    
  const handleInputChange = (name, value) => {
    setValue(name, value);
    const updatedValues = { ...getValues(), [name]: value };
    localStorage.setItem("patientAgendaData", JSON.stringify(updatedValues));
    onDataChange(updatedValues);
  };
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
