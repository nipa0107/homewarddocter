import React, { useState, useEffect } from "react";

const PhysicalExaminationForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [tempOtherValues, setTempOtherValues] = useState({}); // ค่าชั่วคราวของ "อื่นๆ"

    // กำหนดตัวเลือกที่เป็นค่า default ของแต่ละฟิลด์
    const optionLists = {
        moodandaffect: ["Euthymia", "Depressed", "Apathetic"],
        appearanceAndBehavior: ["Cooperative", "Guarded", "Candid", "Defensive"],
        eyeContact: ["Good", "Sporadic", "Fleeting", "None"],
        attention: ["Adequate", "Inadequate"],
        orientation: ["Place", "Time", "Person", "Situation"],
        thoughtProcess: ["Coherence", "Tangential", "Disorganized"],
        thoughtContent: ["Reality", "Obsession", "Delusion"]
    };

    useEffect(() => {
        // กำหนดค่าช่อง "อื่นๆ" ถ้ามีค่าที่ไม่ใช่ตัวเลือกที่กำหนดไว้
        const initializeOtherValues = () => {
            const tempValues = {};
            Object.keys(optionLists).forEach((field) => {
                if (formData[field]) {
                    const nonStandardValues = formData[field]
                        .filter((item) => !optionLists[field].includes(item.value))
                        .map((item) => item.value)
                        .join(", ");
                    if (nonStandardValues) {
                        tempValues[field] = nonStandardValues;
                    }
                }
            });
            setTempOtherValues(tempValues);
        };

        initializeOtherValues();
    }, [formData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleCheckboxChange = (fieldName, option, checked) => {
        setFormValues((prev) => {
            const currentValues = prev[fieldName] || [];
            if (checked) {
                return {
                    ...prev,
                    [fieldName]: [...currentValues, { value: option, isOther: false }],
                };
            } else {
                return {
                    ...prev,
                    [fieldName]: currentValues.filter((item) => item.value !== option),
                };
            }
        });
    };

    const handleOtherInputChange = (fieldName, value) => {
        setTempOtherValues((prev) => ({
            ...prev,
            [fieldName]: value,
        }));

        setFormValues((prev) => {
            const currentValues = prev[fieldName] || [];
            const updatedValues = currentValues.filter((item) => !item.isOther);

            if (value.trim()) {
                return {
                    ...prev,
                    [fieldName]: [...updatedValues, { value, isOther: true }],
                };
            } else {
                return {
                    ...prev,
                    [fieldName]: updatedValues,
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues);
    };

    const renderCheckboxGroupWithOther = (fieldName, label) => (
        <div className="mt-2">
            <div className="m-2">
                <label className="form-label mt-4">{label} :</label>
                <p style={{ color: "gray" }}>(เลือกได้มากกว่า 1 ข้อ)</p>
                {optionLists[fieldName].map((option) => (
                    <div key={option} style={{ lineHeight: "40px" }}>
                        <input
                            type="checkbox"
                            value={option}
                            checked={formValues[fieldName]?.some((item) => item.value === option) || false}
                            style={{ transform: "scale(1.3)", marginLeft: "5px" }}
                            onChange={(e) => handleCheckboxChange(fieldName, option, e.target.checked)}
                        />
                        <span style={{ marginLeft: "10px" }}>{option}</span>
                    </div>
                ))}
                {/* ช่องกรอก "อื่นๆ" */}
                <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                    <span style={{ marginLeft: "4px" }}> อื่นๆ</span>
                    <input
                        type="text"
                        placeholder="กรอกคำตอบอื่นๆ"
                        className="form-control"
                        value={tempOtherValues[fieldName] || ""}
                        onChange={(e) => handleOtherInputChange(fieldName, e.target.value)}
                        style={{
                            outline: "none",
                            marginLeft: "30px",
                            width: "85%",
                        }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Physical Examination</h5>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <label className="form-label">Temperature (°C) :</label>
                                <input
                                    type="text"
                                    className="form-control mt-2"
                                    id="temperature"
                                    value={formValues.temperature || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Blood pressure (mmHg) :</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="bloodPressure"
                                    value={formValues.bloodPressure || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Pulse (min) :</label>
                                <input
                                    type="text"
                                    className="form-control "
                                    id="pulse"
                                    value={formValues.pulse || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Respiration (min) :</label>
                                <input
                                    type="text"
                                    className="form-control "
                                    id="respiratoryRate"
                                    value={formValues.respiratoryRate || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">General Appearance :</label>
                                <textarea
                                    className="form-control mt-1"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    id="generalAppearance"
                                    value={formValues.generalAppearance || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Cardiovascular System :</label>
                                
                                <div>
                                    <textarea
                                    className="form-control mt-1"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                        id="cardiovascularSystem"
                                        value={formValues.cardiovascularSystem || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Respiratory System :</label>
                                
                                <div>
                                <textarea
                                    className="form-control mt-1"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                        id="respiratorySystem"
                                        value={formValues.respiratorySystem || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Abdominal :</label>
                                
                                <div>
                                <textarea
                                    className="form-control mt-1"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                        id="abdominal"
                                        value={formValues.abdominal || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Nervous System :</label>
                                
                                <div>
                                <textarea
                                    className="form-control mt-1"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                        id="nervousSystem"
                                        value={formValues.nervousSystem || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Extremities :</label>
                                
                                <div>
                                <textarea
                                    className="form-control mt-1"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                        id="extremities"
                                        value={formValues.extremities || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            {/* Checkbox groups */}
                            {renderCheckboxGroupWithOther("moodandaffect", "Mood and Affect")}
                            {renderCheckboxGroupWithOther("appearanceAndBehavior", "Appearance and Behavior")}
                            {renderCheckboxGroupWithOther("eyeContact", "Eye contact")}
                            {renderCheckboxGroupWithOther("attention", "Attention")}
                            {renderCheckboxGroupWithOther("orientation", "Orientation")}
                            {renderCheckboxGroupWithOther("thoughtProcess", "Thought process")}
                            {renderCheckboxGroupWithOther("thoughtContent", "Thought content")}
                           
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between">
                        <button className="btn-EditMode btn-secondary" onClick={onClose}>
                            ยกเลิก
                        </button>
                        <button className="btn-EditMode btnsave" onClick={handleSubmit}>
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhysicalExaminationForm;
