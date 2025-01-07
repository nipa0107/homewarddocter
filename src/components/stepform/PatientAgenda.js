import React, { useEffect } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const PatientAgenda = ({ onDataChange }) => {
    const { control, setValue, getValues } = useFormContext();

    useEffect(() => {
        onDataChange(getValues()); // ส่งค่าเริ่มต้นให้ Parent Component
    }, []);

    const handleInputChange = (name, value) => {
        setValue(name, value);
        onDataChange({ ...getValues() });
    };

    return (
        <div>
            <div className="info3 card mt-4">
                <div className="header">
                    <b>Patient Agenda</b>
                </div>
                <div style={{ marginLeft: '26px' }}>
                    <p>ประเมินผู้ป่วยเบื้องต้น</p>
                </div>
            </div>

            {/* Input Fields */}
            {[
                { name: "patient_idea", label: "Idea" },
                { name: "patient_feeling", label: "Feeling" },
                { name: "patient_function", label: "Function" },
                { name: "patient_expectation", label: "Expectation" }
            ].map((field) => (
                <div className="info3 card" key={field.name}>
                    <div className='m-4'>
                        <label className="form-label">{field.label}:</label>
                        <div>
                            <Controller
                                name={field.name}
                                control={control}
                                render={({ field: controllerField }) => (
                                    <input
                                        type="text"
                                        className="google-form-input"
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
