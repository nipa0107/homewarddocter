import React, { useState, useEffect } from "react";

const CaregiverAgendaForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });

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
            const confirmSave = window.confirm("ไม่มีการเปลี่ยนแปลงข้อมูล ต้องการบันทึกหรือไม่?");
            if (!confirmSave) {
                return; // ❌ ถ้าผู้ใช้กดยกเลิก ไม่ต้องบันทึก
            }
        }

        onSave(formValues); // ส่งข้อมูลที่อัปเดตกลับไปยัง `DetailAgendaForm`
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
                                    disabled
                                    value={`${formValues.firstName || ""} ${formValues.lastName || ""}`}
                                />
                            </div>
                            {/* {[
                                { id: "caregiver_idea", label: "Idea" },
                                { id: "caregiver_feeling", label: "Feeling" },
                                { id: "caregiver_funtion", label: "Function" },
                                { id: "caregiver_expectation", label: "Expectation" },
                            ].map((item) => (
                                <div className="m-2" key={item.id}>
                                    <label className="form-label">{item.label}</label>
                                    <textarea
                                        className="form-control mt-2"
                                        rows="2"
                                        style={{ resize: "vertical" }}
                                        value={formValues[item.id] || ""}
                                        onChange={(e) => handleChange(item.id, e.target.value)}
                                    />
                                </div>
                            ))} */}
                            <div className="m-2">
                                <label className="form-label mt-2">Idea</label>
                                <textarea
                                    className="form-control mt-2"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_idea || ""}
                                    onChange={(e) => handleChange("caregiver_idea", e.target.value)
                                    }
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">Feeling</label>
                                <textarea
                                    className="form-control mt-2"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_feeling || ""}
                                    onChange={(e) => handleChange("caregiver_feeling", e.target.value)
                                    }
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">Function</label>
                                <textarea
                                    className="form-control mt-2"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_function || ""}
                                    onChange={(e) => handleChange("caregiver_function", e.target.value)
                                    }
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">Expectation</label>
                                <textarea
                                    className="form-control mt-2"
                                    rows="2"
                                    style={{ resize: "vertical" }}
                                    value={formValues.caregiver_expectation || ""}
                                    onChange={(e) => handleChange("caregiver_expectation", e.target.value)
                                    }
                                />
                            </div>
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

export default CaregiverAgendaForm;
