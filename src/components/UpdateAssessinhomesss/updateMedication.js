import React, { useState } from "react";

const MedicationForm = ({ formData, onSave }) => {
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
                <label className="form-label">1. ยาที่แพทย์สั่ง :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="prescribedMedication"
                    value={formValues.prescribedMedication || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">2. การใช้ยาจริง :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="actualMedication"
                    value={formValues.actualMedication || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">3. อาหารเสริม :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="supplements"
                    value={formValues.supplements || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">4. การบริหารยา :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="administration"
                            value="จัดยาด้วยตนเอง"
                            checked={formValues.administration === "จัดยาด้วยตนเอง"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>จัดยาด้วยตนเอง</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="administration"
                            value="มีคนจัดยาให้"
                            checked={formValues.administration === "มีคนจัดยาให้"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>มีคนจัดยาให้</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">5. การรับประทานยา :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="intake"
                            value="รับประทานยาด้วยตัวเอง"
                            checked={formValues.intake === "รับประทานยาด้วยตัวเอง"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>รับประทานยาด้วยตัวเอง</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="intake"
                            value="มีคนเตรียมยาแต่ละมื้อให้"
                            checked={formValues.intake === "มีคนเตรียมยาแต่ละมื้อให้"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>มีคนเตรียมยาแต่ละมื้อให้</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">6. ความสม่ำเสมอ :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="consistency"
                            value="สม่ำเสมอทุกวัน"
                            checked={formValues.consistency === "สม่ำเสมอทุกวัน"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>สม่ำเสมอทุกวัน</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="consistency"
                            value="หลงลืมบางครั้ง"
                            checked={formValues.consistency === "หลงลืมบางครั้ง"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>หลงลืมบางครั้ง</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="consistency"
                            value="ไม่สม่ำเสมอ"
                            checked={formValues.consistency === "ไม่สม่ำเสมอ"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>ไม่สม่ำเสมอ</span>
                    </div>
                </div>
            </div>
            <div className="modal-footer mt-3">
                <button type="submit" className="btn">
                    บันทึก
                </button>
            </div>
        </form>
    );
};

export default MedicationForm;