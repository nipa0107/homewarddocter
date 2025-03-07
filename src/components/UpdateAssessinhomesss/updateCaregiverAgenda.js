import React, { useState, useEffect } from "react";

const CaregiverAgendaForm = ({ formData, onChange }) => {
    const [formValues, setFormValues] = useState({ ...formData });

    useEffect(() => {
        setFormValues({ ...formData });
    }, [formData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        const updatedValues = { ...formValues, [id]: value };
        setFormValues(updatedValues);
        onChange(updatedValues); // ✅ ส่งค่าที่อัปเดตกลับไปยัง Parent Component
    };

    return (
        <form>
            <div className="m-2">
                <label className="form-label">ชื่อ - นามสกุล :</label>
                <input
                    type="text"
                    className="form-control"
                    disabled
                    value={`${formValues.firstName || ""} ${formValues.lastName || ""}`}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Idea :</label>
                <textarea
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    id="caregiver_idea"
                    value={formValues.caregiver_idea || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Feeling:</label>
                <textarea
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    id="caregiver_feeling"
                    value={formValues.caregiver_feeling || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Function:</label>
                <textarea
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    id="caregiver_funtion"
                    value={formValues.caregiver_funtion || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">Expectation:</label>
                <textarea
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    id="caregiver_expectation"
                    value={formValues.caregiver_expectation || ""}
                    onChange={handleChange}
                />
            </div>
        </form>
    );
};

export default CaregiverAgendaForm;
