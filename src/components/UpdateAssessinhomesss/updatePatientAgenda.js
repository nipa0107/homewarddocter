import React, { useState } from "react";

const PatientAgendaForm = ({ formData, onChange }) => {
    const [formValues, setFormValues] = useState({ ...formData });

    const handleChange = (e) => {
        const { id, value } = e.target;
        const updatedValues = { ...formValues, [id]: value };
        setFormValues(updatedValues);
        onChange(updatedValues); // ส่งค่ากลับไปยัง parent component
    };

    return (
        <form>
            <div className="m-2">
                <label className="form-label">Idea :</label>
                <textarea
                    type="text"
                    className="form-control mt-2"
                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                    style={{ resize: "vertical" }}
                    id="patient_idea"
                    value={formValues.patient_idea || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Feeling :</label>
                <textarea
                    type="text"
                    className="form-control mt-2"
                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                    style={{ resize: "vertical" }}
                    id="patient_feeling"
                    value={formValues.patient_feeling || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Function :</label>
                <textarea
                    type="text"
                    className="form-control mt-2"
                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                    style={{ resize: "vertical" }}
                    id="patient_funtion"
                    value={formValues.patient_funtion || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Expectation :</label>
                <textarea
                    type="text"
                    className="form-control mt-2"
                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                    style={{ resize: "vertical" }}
                    id="patient_expectation"
                    value={formValues.patient_expectation || ""}
                    onChange={handleChange}
                />
            </div>
        </form>
    );
};

export default PatientAgendaForm;
