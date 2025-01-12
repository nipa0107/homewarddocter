import React, { useState, useEffect } from "react";

const PhysicalExaminationForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [tempOtherValues, setTempOtherValues] = useState({}); // จัดการค่าชั่วคราวของ "Other"

    useEffect(() => {
        const initializeOtherValues = () => {
            const tempValues = {};
            Object.keys(formData).forEach((key) => {
                if (key.endsWith("Other")) {
                    const fieldName = key.replace("Other", "");
                    const otherValue = formData[key]?.trim();
                    if (otherValue) {
                        tempValues[fieldName] = otherValue;
                    }
                }
            });
            setTempOtherValues(tempValues); // ตั้งค่าชั่วคราว
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

        const updatedFormValues = { ...formValues };
        Object.keys(tempOtherValues).forEach((key) => {
            if (tempOtherValues[key] && !updatedFormValues[key]?.includes(tempOtherValues[key])) {
                updatedFormValues[key] = [
                    ...(updatedFormValues[key] || []),
                    tempOtherValues[key],
                ];
            }
        });

        onSave(updatedFormValues); // ส่งข้อมูลกลับ
    };

    const renderCheckboxGroupWithOther = (fieldName, options, label) => (
        <div className="mt-2">
            <div className="m-2">
                <label className="form-label mt-4">{label} :</label>
                <p style={{ color: "gray" }}>(เลือกได้มากกว่า 1 ข้อ)</p>
                {options.map((option) => (
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
                        className="google-form-input"
                        value={
                            formValues[fieldName]?.find((item) => item.isOther)?.value || ""
                        }
                        onChange={(e) => handleOtherInputChange(fieldName, e.target.value)}
                        style={{
                            borderBottom: "1px solid #4285f4",
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
        <form onSubmit={handleSubmit}>
            <div className="m-2">
                <label className="form-label">1.Temperature (°C) :</label>
                <input
                    type="text"
                    className="form-control mt-2"
                    id="temperature"
                    value={formValues.temperature || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">2.Blood pressure (mm/Hg) :</label>
                <input
                    type="text"
                    className="form-control"
                    id="bloodPressure"
                    value={formValues.bloodPressure || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">3.Pulse (/min) :</label>
                <input
                    type="text"
                    className="form-control "
                    id="pulse"
                    value={formValues.pulse || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">4.Respiration (/min) :</label>
                <input
                    type="text"
                    className="form-control "
                    id="respiratoryRate"
                    value={formValues.respiratoryRate || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">5.General Appearance :</label>
                <input
                    type="text"
                    className="form-control "
                    id="generalAppearance"
                    value={formValues.generalAppearance || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">6.Cardiovascular System :</label>
                <br></br>
                <div>
                    <input
                        type="text"
                        className="form-control "
                        id="cardiovascularSystem"
                        value={formValues.cardiovascularSystem || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="m-2">
                <label className="form-label mt-3">7.Respiratory System :</label>
                <br></br>
                <div>
                    <input
                        type="text"
                        className="form-control "
                        id="respiratorySystem"
                        value={formValues.respiratorySystem || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="m-2">
                <label className="form-label mt-3">8.Abdominal :</label>
                <br></br>
                <div>
                    <input
                        type="text"
                        className="form-control "
                        id="abdominal"
                        value={formValues.abdominal || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="m-2">
                <label className="form-label mt-3">9.Nervous System :</label>
                <br></br>
                <div>
                    <input
                        type="text"
                        className="form-control "
                        id="nervousSystem"
                        value={formValues.nervousSystem || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="m-2">
                <label className="form-label mt-3">10.Extremities :</label>
                <br></br>
                <div>
                    <input
                        type="text"
                        className="form-control "
                        id="extremities"
                        value={formValues.extremities || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>
            {/* Checkbox groups */}
            {renderCheckboxGroupWithOther("moodandaffect", ["Euthymia", "Depressed", "Apathetic"], "11.Mood and Affect")}
            {renderCheckboxGroupWithOther(
                "appearanceAndBehavior",
                ["Cooperative", "Guarded", "Candid", "Defensive"],
                "12.Appearance and Behavior"
            )}
            {renderCheckboxGroupWithOther(
                "eyeContact",
                ["Good", "Sporadic", "Fleeting", "None"],
                "13.Eye contact"
            )}
            {renderCheckboxGroupWithOther(
                "attention",
                ["Adequate", "Inadequate"],
                "14.Attention"
            )}
            {renderCheckboxGroupWithOther(
                "orientation",
                ["Place", "Time", "Person", "Situation"],
                "15.Orientation"
            )}
            {renderCheckboxGroupWithOther(
                "thoughtProcess",
                ["Coherence", "Tangential", "Disorganized"],
                "16.Thought process"
            )}
            {renderCheckboxGroupWithOther(
                "thoughtContent",
                ["Reality", "Obsession", "Delusion"],
                "17.Thought content"
            )}
            <div className="modal-footer mt-3">
                {/* <button type="button" class="btn" data-bs-dismiss="modal">ยกเลิก</button> */}
                <button type="submit" className="btn">
                    บันทึก
                </button>
            </div>
        </form>
    );
};

export default PhysicalExaminationForm;
