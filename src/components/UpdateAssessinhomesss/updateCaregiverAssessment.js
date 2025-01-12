import React, { useState } from "react";

const CaregiverAssessmentsForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState(formData?.Care_Assessment || []);
    const [openIndexes, setOpenIndexes] = useState([0]); // เปิดฟอร์มคนที่ 1 โดยค่าเริ่มต้น

    const handleChange = (index, field, value) => {
        const updatedValues = [...formValues];
        updatedValues[index][field] = value;
        setFormValues(updatedValues);
    };

    const toggleForm = (index) => {
        setOpenIndexes((prev) => (prev.includes(index) ? [] : [index])); // เปิด/ปิดฟอร์ม
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ Care_Assessment: formValues }); // ส่งข้อมูลที่อัปเดตกลับไปยัง parent component
    };

    return (
        <form onSubmit={handleSubmit}>
            {formValues.length > 0 ? (
                formValues.map((agenda, index) => {
                    const isOpen = openIndexes.includes(index);
                    return (
                        <div key={index}>
                            <div className="mt-3">
                                <b
                                    className="form-label"
                                    style={{
                                        textDecoration: "underline",
                                        color: "#87CEFA",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => toggleForm(index)}
                                >
                                    {`คนที่ ${index + 1}.`}
                                </b>
                            </div>
                            {isOpen && (
                                <div >
                                    <div className="m-2">
                                        <label className="form-label">{`1. ชื่อ - นามสกุล :`}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            disabled
                                            value={`${agenda.firstName || ""} ${agenda.lastName || ""}`}
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">2. Care :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.care || ""}
                                            onChange={(e) =>
                                                handleChange(index, "care", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">3. Affection :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.affection || ""}
                                            onChange={(e) =>
                                                handleChange(index, "affection", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">4. Rest :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.rest || ""}
                                            onChange={(e) =>
                                                handleChange(index, "rest", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">5. Empathy :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.empathy || ""}
                                            onChange={(e) =>
                                                handleChange(index, "empathy", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">6. Goal Of Care :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.goalOfCare || ""}
                                            onChange={(e) =>
                                                handleChange(index, "goalOfCare", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">7. Information :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.information || ""}
                                            onChange={(e) =>
                                                handleChange(index, "information", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">8. Ventilation :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.ventilation || ""}
                                            onChange={(e) =>
                                                handleChange(index, "ventilation", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">9. Empowerment :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.empowerment || ""}
                                            onChange={(e) =>
                                                handleChange(index, "empowerment", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">10. Resource :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.resource || ""}
                                            onChange={(e) =>
                                                handleChange(index, "resource", e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <p>No caregiver agenda available.</p>
            )}
            <div className="modal-footer mt-3">
                <button type="submit" className="btn">บันทึก</button>
            </div>
        </form>
    );
};

export default CaregiverAssessmentsForm;
