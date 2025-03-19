import React, { useState, useEffect } from "react";

const CaregiverAgendaForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [isEdited, setIsEdited] = useState(false); // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่

    useEffect(() => {
        // ตรวจสอบว่าผู้ใช้แก้ไขข้อมูลหรือไม่
        setIsEdited(JSON.stringify(formValues) !== JSON.stringify(formData));
    }, [formValues, formData]);

    const handleChange = (field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [field]: value,
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

        onSave(formValues); // ส่งข้อมูลที่อัปเดตกลับไปยัง `DetailAgendaForm`
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
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Caregiver Agenda</h5>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <label className="form-label">ชื่อ - นามสกุล</label>
                                <input
                                    className="form-control"
                                    placeholder="กรอกคำตอบ"
                                    disabled
                                    value={`${formValues.firstName || ""} ${formValues.lastName || ""}`}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">Idea <span style={{ color: "#666", fontSize: "15px" }}>(แนวคิดหลักเกี่ยวกับบทบาทของผู้ดูแล เช่น หน้าที่ในการดูแล)</span></label>
                                <textarea
                                    className="form-control mt-2"
                                    placeholder="กรอกคำตอบ"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_idea || ""}
                                    onChange={(e) => handleChange("caregiver_idea", e.target.value)
                                    }
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">Feeling <span style={{ color: "#666", fontSize: "15px" }}>(ความรู้สึกของผู้ดูแลมีความกังวลในการดูแลผู้ป่วยหรือไม่)</span></label>
                                <textarea
                                    className="form-control mt-2"
                                    placeholder="กรอกคำตอบ"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_feeling || ""}
                                    onChange={(e) => handleChange("caregiver_feeling", e.target.value)
                                    }
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">Function <span style={{ color: "#666", fontSize: "15px" }}>(หน้าที่ที่ผู้ดูแลต้องทำในแต่ละวัน)</span></label>
                                <textarea
                                    className="form-control mt-2"
                                    placeholder="กรอกคำตอบ"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_function || ""}
                                    onChange={(e) => handleChange("caregiver_function", e.target.value)
                                    }
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">Expectation <span style={{ color: "#666", fontSize: "15px" }}>(สิ่งที่ผู้ดูแลคาดหวัง เช่น การอบรม คำแนะนำการดูแล)</span></label>
                                <textarea
                                    className="form-control mt-2"
                                    rows="2"
                                    placeholder="กรอกคำตอบ"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_expectation || ""}
                                    onChange={(e) => handleChange("caregiver_expectation", e.target.value)
                                    }
                                />
                            </div>
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

export default CaregiverAgendaForm;
