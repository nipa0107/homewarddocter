import React, { useState } from "react";

const SSSForm = ({ formData, onSave, onClose, currentSection }) => {
    const [formValues, setFormValues] = useState({ ...formData });

    const handleChange = (field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // ฟังก์ชันสร้าง Radio Button
    const renderRadioGroup = (label, field) => (
        <div className="m-3">
            <label className="form-label">{label} :</label>
            <div>
                {["ปลอดภัย", "ไม่ปลอดภัย"].map((option) => (
                    <div key={option} className="mt-1 ms-3">
                        <input
                            type="radio"
                            name={field}
                            value={option}
                            checked={formValues[field] === option}
                            onChange={(e) => handleChange(field, e.target.value)}
                            style={{ transform: "scale(1.5)" }}
                        />
                        <label className="form-check-label" style={{ marginLeft: "5px" }}>
                            {option}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    // ฟังก์ชันสร้าง Text Input
    const renderTextField = (label, field) => (
        <div className="m-3">
            <label className="form-label">{label} :</label>
            <textarea
                className="form-control "
                rows="2"
                style={{ resize: "vertical" }}
                value={formValues[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
            />
        </div>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues);
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข {currentSection.replace("SSS_", "")}</h5>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>

                            {/* 🔹 Section: Safety */}
                            {currentSection === "SSS_Safety" && (
                                <>
                                    <p style={{ color: "#666" }}><i class="bi bi-shield-check" style={{ color: "#008000" }}></i> ความปลอดภัย</p>
                                    {[  
                                        { name: "cleanliness", label: "1. แสงไฟ" },
                                        { name: "floorSafety", label: "2. พื้นต่างระดับ" },
                                        { name: "stairsSafety", label: "3. บันได" },
                                        { name: "handrailSafety", label: "4. ราวจับ" },
                                        { name: "sharpEdgesSafety", label: "5. เหลี่ยมคม" },
                                        { name: "slipperyFloorSafety", label: "6. ความลื่นของพื้น" },
                                        { name: "toiletSafety", label: "7. ลักษณะโถส้วม" },
                                        { name: "stoveSafety", label: "8. เตาที่ใช้หุงต้ม" },
                                        { name: "storageSafety", label: "9. การเก็บของในบ้าน" },
                                        { name: "waterSafety", label: "10. น้ำที่ใช้ดื่ม" },
                                    ].map((item) => renderRadioGroup(item.label, item.name))}

                                    {renderTextField("11. อันตรายอื่นๆ (ถ้ามี)", "otherHazards")}
                                    {renderTextField("12. ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร", "emergencyContact")}
                                </>
                            )}

                            {/* 🔹 Section: Spiritual Health */}
                            {currentSection === "SSS_SpiritualHealth" && (
                                <>
                                <p style={{ color: "#666" }}><i class="bi bi-clipboard-heart" style={{ color: "#FF6A6A" }}></i> สุขภาพจิตวิญญาณ</p>
                                    {[  
                                        { name: "faithBelief", label: "Faith and belief" },
                                        { name: "importance", label: "Importance" },
                                        { name: "community", label: "Community" },
                                        { name: "addressInCare", label: "Address in care" },
                                        { name: "love", label: "Love" },
                                        { name: "religion", label: "Religion" },
                                        { name: "forgiveness", label: "Forgiveness" },
                                        { name: "hope", label: "Hope" },
                                        { name: "meaningOfLife", label: "Meaning of life" },
                                    ].map((item) => renderTextField(item.label, item.name))}
                                </>
                            )}

                            {/* 🔹 Section: Service */}
                            {currentSection === "SSS_Service" && (
                                <>
                                <p style={{ color: "#666" }}><i class="bi bi-hospital" style={{ color: "#008000" }}></i> การรับบริการ เช่น โรงพยาบาล สถานพยาบาล คลินิก ร้านขายยา</p>
                                    {renderTextField("เมื่อเจ็บป่วย ท่านรับบริการที่ใด", "serviceLocation")}
                                    {renderTextField("อื่นๆ (ถ้ามี)", "otherServices")}
                                </>
                            )}

                        </form>
                    </div>
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

export default SSSForm;
