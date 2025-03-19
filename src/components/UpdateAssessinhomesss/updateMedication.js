import React, { useState, useEffect } from "react";

const MedicationForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [isEdited, setIsEdited] = useState(false); // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่

    useEffect(() => {
        // ตรวจสอบว่าผู้ใช้แก้ไขข้อมูลหรือไม่
        setIsEdited(JSON.stringify(formValues) !== JSON.stringify(formData));
    }, [formValues, formData]);
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🔹 เช็คว่ามีการเปลี่ยนแปลงหรือไม่
        if (JSON.stringify(formValues) === JSON.stringify(formData)) {
            const confirmSave = window.confirm("ไม่มีการแก้ไขข้อมูล ต้องการบันทึกหรือไม่?");
            if (!confirmSave) {
                return; // ❌ ถ้าผู้ใช้กดยกเลิก ไม่ต้องบันทึก
            }
        }

        onSave(formValues); // ✅ บันทึกข้อมูล
    };

    const handleCancel = () => {
        // 🔹 ถ้ามีการแก้ไขแล้วกดยกเลิก ให้แสดงแจ้งเตือน
        if (isEdited) {
            const confirmExit = window.confirm("ต้องการยกเลิกการแก้ไขหรือไม่?\nหากยกเลิก การแก้ไขที่ไม่ได้บันทึกจะถูกละทิ้ง");
            if (!confirmExit) return;
        }
        onClose(); // ปิด Modal
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Medication</h5>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <label className="form-label">ยาที่แพทย์สั่ง <span style={{ color: "#666", fontSize: "15px" }}>(ระบุชื่อยา ปริมาณ และวิธีใช้ตามที่แพทย์สั่ง)</span></label>
                                <textarea
                                    className="form-control"
                                    placeholder="กรอกยาที่แพทย์สั่ง"
                                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                                    id="prescribedMedication"
                                    value={formValues.prescribedMedication || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">การใช้ยาจริง <span style={{ color: "#666", fontSize: "15px" }}>(ระบุว่าผู้ป่วยรับประทานยาตามแพทย์สั่งได้ หรือลืมกินหรือไม่)</span></label>
                                <textarea
                                    className="form-control"
                                    placeholder="กรอกการใช้ยาจริง"
                                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                                    id="actualMedication"
                                    value={formValues.actualMedication || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">อาหารเสริม <span style={{ color: "#666", fontSize: "15px" }}>(เช่น น้ำมันปลา โปรตีนเสริม)</span></label>
                                <textarea
                                    className="form-control"
                                    placeholder="กรอกอาหารเสริมที่รับประทานเป็นประจำ"
                                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                                    style={{ resize: "vertical" }}
                                    id="supplements"
                                    value={formValues.supplements || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mt-2">
                                <div className="m-2">
                                    <label className="form-label mt-3">การบริหารยา </label>
                                    <div className="mt-2">
                                        <input
                                            type="radio"
                                            id="administration"
                                            value="จัดยาด้วยตนเอง"
                                            checked={formValues.administration === "จัดยาด้วยตนเอง"}
                                            onChange={handleChange}
                                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>จัดยาด้วยตนเอง</span>
                                    </div>
                                    <div className="mt-3">
                                        <input
                                            type="radio"
                                            id="administration"
                                            value="มีคนจัดยาให้"
                                            checked={formValues.administration === "มีคนจัดยาให้"}
                                            onChange={handleChange}
                                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>มีคนจัดยาให้</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="m-2">
                                    <label className="form-label mt-3">การรับประทานยา </label>
                                    <div className="mt-2">
                                        <input
                                            type="radio"
                                            id="intake"
                                            value="รับประทานยาด้วยตัวเอง"
                                            checked={formValues.intake === "รับประทานยาด้วยตัวเอง"}
                                            onChange={handleChange}
                                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>รับประทานยาด้วยตัวเอง</span>
                                    </div>
                                    <div className="mt-3">
                                        <input
                                            type="radio"
                                            id="intake"
                                            value="มีคนเตรียมยาแต่ละมื้อให้"
                                            checked={formValues.intake === "มีคนเตรียมยาแต่ละมื้อให้"}
                                            onChange={handleChange}
                                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>มีคนเตรียมยาแต่ละมื้อให้</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2">
                                <div className="m-2">
                                    <label className="form-label mt-3">ความสม่ำเสมอ </label>
                                    <div className="mt-2">
                                        <input
                                            type="radio"
                                            id="consistency"
                                            value="สม่ำเสมอทุกวัน"
                                            checked={formValues.consistency === "สม่ำเสมอทุกวัน"}
                                            onChange={handleChange}
                                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>สม่ำเสมอทุกวัน</span>
                                    </div>
                                    <div className="mt-3">
                                        <input
                                            type="radio"
                                            id="consistency"
                                            value="หลงลืมบางครั้ง"
                                            checked={formValues.consistency === "หลงลืมบางครั้ง"}
                                            onChange={handleChange}
                                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>หลงลืมบางครั้ง</span>
                                    </div>
                                    <div className="mt-3">
                                        <input
                                            type="radio"
                                            id="consistency"
                                            value="ไม่สม่ำเสมอ"
                                            checked={formValues.consistency === "ไม่สม่ำเสมอ"}
                                            onChange={handleChange}
                                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>ไม่สม่ำเสมอ</span>
                                    </div>
                                </div>
                            </div>
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

export default MedicationForm;