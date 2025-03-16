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
            const confirmSave = window.confirm("ไม่มีการเปลี่ยนแปลงข้อมูล ต้องการบันทึกหรือไม่?");
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
                                { id: "care", label: "Care" },
                                { id: "affection", label: "Affection" },
                                { id: "rest", label: "Rest" },
                                { id: "empathy", label: "Empathy" },
                                { id: "goalOfCare", label: "Goal Of Care" },
                                { id: "information", label: "Information" },
                                { id: "ventilation", label: "Ventilation" },
                                { id: "empowerment", label: "Empowerment" },
                                { id: "resource", label: "Resource" },
                            ].map((item) => (
                                <div className="m-2" key={item.id}>
                                    <label className="form-label mt-3">{item.label}</label>
                                    <textarea
                                        id={item.id}
                                        className="form-control mt-1"
                                        rows="2"
                                        style={{ resize: "vertical" }}
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
