import React, { useState, useEffect } from "react";

const CaregiverAssessmentForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState(formData || {});
    const [isEdited, setIsEdited] = useState(false); // ตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่

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
            const confirmExit = window.confirm("ต้องการออกจากหน้านี้หรือไม่?\nหากออกจากหน้านี้ การแก้ไขที่ไม่ได้บันทึกจะถูกละทิ้ง");
            if (!confirmExit) return;
        }
        onClose(); // ปิด Modal
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">

                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Caregiver Assessment</h5>
                    </div>


                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <label className="form-label">ชื่อ - นามสกุล</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled
                                    value={`${formValues.firstName || ""} ${formValues.lastName || ""}`}
                                />
                            </div>
                            {[
                                { id: "care", label: "Care" ,placeholder:"กรอกคำตอบ" },
                                { id: "affection", label: "Affection",placeholder:"กรอกคำตอบ" },
                                { id: "rest", label: "Rest",placeholder:"กรอกคำตอบ" },
                                { id: "empathy", label: "Empathy" ,placeholder:"กรอกคำตอบ"},
                                { id: "goalOfCare", label: "Goal Of Care",placeholder:"กรอกคำตอบ" },
                                { id: "information", label: "Information",placeholder:"กรอกคำตอบ" },
                                { id: "ventilation", label: "Ventilation",placeholder:"กรอกคำตอบ" },
                                { id: "empowerment", label: "Empowerment" ,placeholder:"กรอกคำตอบ"},
                                { id: "resource", label: "Resource",placeholder:"กรอกคำตอบ" },
                            ].map((item) => (
                                <div className="m-2" key={item.id}>
                                    <label className="form-label mt-3">{item.label}
                                        {item.id === "care" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (ดูแลเรื่องอะไรบ้าง)</span>
                                        )}
                                        {item.id === "affection" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (ส่งผลต่อตนเองอย่างไรบ้าง)</span>
                                        )}
                                        {item.id === "rest" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (มีเวลาพักผ่อนบ้างหรือไม่)</span>
                                        )}
                                        {item.id === "empathy" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (การแสดงความเข้าอกเข้าใจเป็นอย่างไรบ้าง)</span>
                                        )}
                                        {item.id === "goalOfCare" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (เป้าหมายในการรักษาของผู้ดูแลคืออะไร)</span>
                                        )}
                                        {item.id === "information" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (การให้ข้อมูล ความรู้เพิ่มเติม)</span>
                                        )}
                                        {item.id === "ventilation" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (การรับฟังความกังวลใจ)</span>
                                        )}
                                        {item.id === "empowerment" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (การให้กำลังใจ)</span>
                                        )}{item.id === "resource" && (
                                            <span style={{ color: "#666", fontSize: "15px" }}> (แนะนำช่องทางช่วยเหลือ)</span>
                                        )}
                                        

                                    </label>
                                    <textarea
                                        id={item.id}
                                        className="form-control mt-1"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        placeholder={item.placeholder}
                                        value={formValues[item.id] || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            ))}
                        </form>
                    </div>
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

export default CaregiverAssessmentForm;
