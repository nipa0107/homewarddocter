import React, { useState } from "react";

const PatientAgendaForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState({ ...formData });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues); // ส่งข้อมูลที่อัปเดตกลับไปยังฟังก์ชันที่เรียกใช้
    };


    return (
        <form onSubmit={handleSubmit}>
            <div className="m-2">
                <label className="form-label">1.Idea :</label>
                <input
                    type="text"
                    className="form-control mt-2"
                    id="patient_idea"
                    value={formValues.patient_idea || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">2.Feeling :</label>
                <input
                    type="text"
                    className="form-control"
                    id="patient_feeling"
                    value={formValues.patient_feeling || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">3.Function :</label>
                <input
                    type="text"
                    className="form-control "
                    id="patient_funtion"
                    value={formValues.patient_funtion || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Expectation :</label>
                <input
                    type="text"
                    className="form-control "
                    id="patient_expectation"
                    value={formValues.patient_expectation || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="modal-footer mt-3">
                <button type="submit" className="btn">
                    บันทึก
                </button>
            </div>
        </form>
    );
};

export default PatientAgendaForm;
