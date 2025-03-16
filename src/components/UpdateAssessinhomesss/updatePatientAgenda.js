import React, { useState, useEffect } from "react";

const PatientAgendaForm = ({ formData, onSave, onClose }) => {
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

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Patient Agenda</h5>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            {[
                                { id: "patient_idea", label: "Idea" },
                                { id: "patient_feeling", label: "Feeling" },
                                { id: "patient_funtion", label: "Function" },
                                { id: "patient_expectation", label: "Expectation" },
                            ].map((item) => (
                                <div className="m-2" key={item.id}>
                                    <label className="form-label">{item.label}</label>
                                    <textarea
                                        className="form-control mt-2"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        id={item.id}
                                        value={formValues[item.id] || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                            ))}
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

export default PatientAgendaForm;
