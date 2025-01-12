import React, { useState } from "react";

const CaregiverAgendaForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState(formData?.Care_Agenda || []);
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
        onSave({ Care_Agenda: formValues }); // ส่งข้อมูลที่อัปเดตกลับไปยัง parent component
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
                                        <label className="form-label mt-3">2. Caregiver Idea :</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.caregiver_idea || ""}
                                            onChange={(e) =>
                                                handleChange(index, "caregiver_idea", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">3. Caregiver Feeling:</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.caregiver_feeling || ""}
                                            onChange={(e) =>
                                                handleChange(index, "caregiver_feeling", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">4. Caregiver Function:</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.caregiver_funtion || ""}
                                            onChange={(e) =>
                                                handleChange(index, "caregiver_funtion", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="m-2">
                                        <label className="form-label mt-3">5. Caregiver Expectation:</label>
                                        <input
                                            className="form-control mt-1"
                                            value={agenda.caregiver_expectation || ""}
                                            onChange={(e) =>
                                                handleChange(index, "caregiver_expectation", e.target.value)
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

export default CaregiverAgendaForm;
