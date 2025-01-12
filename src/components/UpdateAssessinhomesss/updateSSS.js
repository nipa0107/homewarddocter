import React, { useState } from "react";

const SSSForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState({ ...formData });

    // Handle input change
    const handleChange = (group, field, value) => {
        setFormValues((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                [field]: value,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues); // ส่งข้อมูลกลับไปยัง parent component
    };

    const renderTextField = (label, group, field) => (
        <div className="m-3">
            <label className="form-label mt-2">{label} :</label>
            <input
                type="text"
                className="form-control"
                value={formValues[group]?.[field] || ""}
                onChange={(e) => handleChange(group, field, e.target.value)}
            />
        </div>
    );

    const renderRadioGroup = (label, group, field) => (
        <div className="m-3">
            <label className="form-label mt-1">{label} :</label>
            <div>
                {["ปลอดภัย", "ไม่ปลอดภัย"].map((option) => (
                    <div key={option} className="form-check mt-1">
                        <input
                            type="radio"
                            className="form-check-input"
                            name={`${group}-${field}`}
                            value={option}
                            checked={formValues[group]?.[field] === option}
                            onChange={(e) => handleChange(group, field, e.target.value)}
                            style={{ transform: "scale(1.2)" }}
                        />
                        <label className="form-check-label" style={{ marginLeft: "5px" }}>
                            {option}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            {/* <div className="info3 card">
        <div className="header">
          <b>SSS Assessment</b>
        </div>
        <div style={{ marginLeft: "26px", marginTop: "20px", lineHeight: "25px" }}>
          <p>S = Safety</p>
          <p>S = Spiritual Health</p>
          <p>S = Service</p>
        </div>
      </div> */}

            {/* Safety Section */}
            <div className="m-3">
                <h5><b>1. Safety (ความปลอดภัย)</b></h5>
            </div>
            {[
                { name: "cleanliness", label: "1. แสงไฟ" },
                { name: "floorSafety", label: "2. พื้นต่างระดับ" },
                { name: "stairsSafety", label: "3. บันได" },
                { name: "handrailSafety", label: "4. ราวจับ" },
                { name: "sharpEdgesSafety", label: "5. เหลี่ยมคม" },
                { name: "slipperyFloorSafety", label: "6. ความลื่นของพื้น" },
                { name: "toiletSafety", label: "7. ลักษณะโถส้วม" },
                { name: "stoveSafety", label: "8. เตาที่ใช้หุงต้ม" },
                { name: "storageSafety", label: "9. การเก็บของในบ้าน" },
                { name: "waterSafety", label: "10. น้ำที่ใช้ดื่ม" },
            ].map((item) => renderRadioGroup(item.label, "Safety", item.name))}

            {renderTextField("11. อันตรายอื่นๆ (ถ้ามี)", "Safety", "otherHazards")}
            {renderTextField("12. ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร", "Safety", "emergencyContact")}

            <hr></hr>
            {/* Spiritual Health Section */}
            <div className="m-3">
                <h5><b>2. Spiritual Health (จิตวิญญาณ)</b></h5>
            </div>
            {[
                { name: "faithBelief", label: "1. Faith and belief" },
                { name: "importance", label: "2. Importance" },
                { name: "community", label: "3. Community" },
                { name: "addressInCare", label: "4. Address in care" },
                { name: "love", label: "5. Love" },
                { name: "religion", label: "6. Religion" },
                { name: "forgiveness", label: "7. Forgiveness" },
                { name: "hope", label: "8. Hope" },
                { name: "meaningOfLife", label: "9. Meaning of life" },
            ].map((item) => renderTextField(item.label, "SpiritualHealth", item.name))}

            <hr></hr>
            {/* Service Section */}
            <div className="m-3">
                <h5><b>3. Service (การบริการ)</b></h5>
            </div>
            {renderTextField("1. เมื่อเจ็บป่วย ท่านรับบริการที่ใด", "Service", "serviceLocation")}
            {renderTextField("2. อื่นๆ (ถ้ามี)", "Service", "otherServices")}

            <div className="modal-footer mt-3">
                <button type="submit" className="btn">
                    บันทึก
                </button>
            </div>
        </form>
    );
};

export default SSSForm;
