import React, { useState, useEffect } from "react";

const CaregiverAssessmentForm = ({ formData, onChange }) => {
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
            {/* ชื่อ - นามสกุล */}
            <div className="m-2">
                <label className="form-label">ชื่อ - นามสกุล :</label>
                <input
                    type="text"
                    className="form-control"
                    disabled
                    value={`${formValues.firstName || ""} ${formValues.lastName || ""}`}
                />
            </div>

            {/* Care */}
            <div className="m-2">
                <label className="form-label mt-3">Care :</label>
                <textarea
                    id="care"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.care || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Affection */}
            <div className="m-2">
                <label className="form-label mt-3">Affection :</label>
                <textarea
                    id="affection"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.affection || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Rest */}
            <div className="m-2">
                <label className="form-label mt-3">Rest :</label>
                <textarea
                    id="rest"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.rest || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Empathy */}
            <div className="m-2">
                <label className="form-label mt-3">Empathy :</label>
                <textarea
                    id="empathy"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.empathy || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Goal Of Care */}
            <div className="m-2">
                <label className="form-label mt-3">Goal Of Care :</label>
                <textarea
                    id="goalOfCare"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.goalOfCare || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Information */}
            <div className="m-2">
                <label className="form-label mt-3">Information :</label>
                <textarea
                    id="information"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.information || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Ventilation */}
            <div className="m-2">
                <label className="form-label mt-3">Ventilation :</label>
                <textarea
                    id="ventilation"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.ventilation || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Empowerment */}
            <div className="m-2">
                <label className="form-label mt-3">Empowerment :</label>
                <textarea
                    id="empowerment"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.empowerment || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Resource */}
            <div className="m-2">
                <label className="form-label mt-3">Resource :</label>
                <textarea
                    id="resource"
                    className="form-control mt-1"
                    rows="2"
                    style={{ resize: "vertical" }}
                    value={formValues.resource || ""}
                    onChange={handleChange}
                />
            </div>
        </form>
    );
};

export default CaregiverAssessmentForm;
