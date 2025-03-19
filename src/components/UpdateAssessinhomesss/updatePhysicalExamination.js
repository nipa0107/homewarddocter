import React, { useState, useEffect } from "react";

const PhysicalExaminationForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [tempOtherValues, setTempOtherValues] = useState({}); // ค่าชั่วคราวของ "อื่นๆ"
const [isEdited, setIsEdited] = useState(false); // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่

    useEffect(() => {
        // ตรวจสอบว่าผู้ใช้แก้ไขข้อมูลหรือไม่
        setIsEdited(JSON.stringify(formValues) !== JSON.stringify(formData));
    }, [formValues, formData]);

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

        // 🔹 ถ้าข้อมูลไม่มีการเปลี่ยนแปลง แจ้งเตือนก่อนบันทึก
        if (!isEdited) {
            const confirmSave = window.confirm("ไม่มีการแก้ไขข้อมูล ต้องการบันทึกหรือไม่?");
            if (!confirmSave) return;
        }

        onSave(formValues);
    };

    const handleCancel = () => {
        // 🔹 ถ้ามีการแก้ไขแล้วกดยกเลิก ให้แสดงแจ้งเตือน
        if (isEdited) {
            const confirmExit = window.confirm("ต้องการยกเลิกการแก้ไขหรือไม่?\nหากยกเลิก การแก้ไขที่ไม่ได้บันทึกจะถูกละทิ้ง");
            if (!confirmExit) return;
        }
        onClose(); // ปิด Modal
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
                    <textarea
                        className="form-control"
                        rows="2"
                        style={{ resize: "vertical", border: "1px solid #ddd", outline: "none", marginLeft: "30px" }}
                        placeholder="กรอกคำตอบอื่นๆ"
                        value={tempOtherValues[fieldName] || ""}
                        onChange={(e) => handleOtherInputChange(fieldName, e.target.value)}
                    // style={{
                    //     outline: "none",
                    //     marginLeft: "30px",
                    //     width: "85%",
                    // }}
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
                                <label className="form-label">อุณหภูมิร่างกาย ( °C) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็มหรือทศนิยม เช่น 35,36.8)</span></label>
                                <input
                                    type="number"
                                    style={{ width: "35%" }}
                                    className="form-control"
                                    placeholder="กรอกตัวเลข"
                                    id="temperature"
                                    value={formValues.temperature || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">ความดันโลหิต (mmHg) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็ม เช่น 120/80)</span></label>
                                <input
                                    type="number"
                                    style={{ width: "35%" }}
                                    className="form-control"
                                    placeholder="กรอกตัวเลข"
                                    id="bloodPressure"
                                    value={formValues.bloodPressure || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">อัตราการเต้นของหัวใจ (bpm) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็ม เช่น 72)</span></label>
                                <input
                                    type="number"
                                    style={{ width: "35%" }}
                                    className="form-control"
                                    placeholder="กรอกตัวเลข"
                                    id="pulse"
                                    value={formValues.pulse || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">อัตราการหายใจ (min) <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขเต็ม เช่น 16)</span></label>
                                <input
                                    type="number"
                                    style={{ width: "35%" }}
                                    className="form-control"
                                    placeholder="กรอกตัวเลข"
                                    id="respiratoryRate"
                                    value={formValues.respiratoryRate || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">GA <span style={{ color: "#666", fontSize: "15px" }}>(ลักษณะโดยรวม)</span></label>
                                <textarea
                                    className="form-control mt-1"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    placeholder="กรอกคำตอบ"
                                    id="generalAppearance"
                                    value={formValues.generalAppearance || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">CVS <span style={{ color: "#666", fontSize: "15px" }}>(ระบบหัวใจ)</span></label>

                                <div>
                                    <textarea
                                        className="form-control mt-1"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        placeholder="กรอกคำตอบ"
                                        id="cardiovascularSystem"
                                        value={formValues.cardiovascularSystem || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">RS <span style={{ color: "#666", fontSize: "15px" }}>(ระบบหายใจ)</span></label>

                                <div>
                                    <textarea
                                        className="form-control mt-1"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        placeholder="กรอกคำตอบ"
                                        id="respiratorySystem"
                                        value={formValues.respiratorySystem || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Abd <span style={{ color: "#666", fontSize: "15px" }}>(ช่องท้อง)</span></label>

                                <div>
                                    <textarea
                                        className="form-control mt-1"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        placeholder="กรอกคำตอบ"
                                        id="abdominal"
                                        value={formValues.abdominal || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">NS <span style={{ color: "#666", fontSize: "15px" }}>(ระบบประสาท)</span></label>

                                <div>
                                    <textarea
                                        className="form-control mt-1"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        placeholder="กรอกคำตอบ"
                                        id="nervousSystem"
                                        value={formValues.nervousSystem || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Ext <span style={{ color: "#666", fontSize: "15px" }}>(รยางค์แขน/ขา)</span></label>

                                <div>
                                    <textarea
                                        className="form-control mt-1"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        placeholder="กรอกคำตอบ"
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
                        <button className="btn-EditMode btn-secondary" onClick={handleCancel}>
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
