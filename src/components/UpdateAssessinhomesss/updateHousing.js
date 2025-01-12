import React, { useState, useEffect } from "react";

const HousingForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [tempOtherValue, setTempOtherValue] = useState("");
    const [selectedNeighborRelationship, setSelectedNeighborRelationship] = useState("");

    // ตั้งค่าเริ่มต้นเมื่อฟอร์มโหลด
    useEffect(() => {
        if (
            formData.neighborRelationship !== "ดี" &&
            formData.neighborRelationship !== "ไม่ดี"
        ) {
            setTempOtherValue(formData.neighborRelationship || "");
            setSelectedNeighborRelationship("อื่นๆ");
        } else {
            setSelectedNeighborRelationship(formData.neighborRelationship);
        }
    }, [formData]);

    const renderRadioGroupWithOther = (fieldName, options, label) => (
        <div className="mt-3">
            <div className="m-2">
                <label className="form-label mt-3">{label} :</label>
                {options.map((option) => (
                    <div key={option} style={{ lineHeight: "40px" }}>
                        <input
                            type="radio"
                            name={fieldName}
                            value={option}
                            checked={selectedNeighborRelationship === option}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                            onChange={(e) => {
                                setSelectedNeighborRelationship(e.target.value);
                            }}
                        />
                        <span style={{ marginLeft: "10px" }}>{option}</span>
                    </div>
                ))}
                {/* ตัวเลือก "อื่นๆ" */}
                <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                    <span style={{ marginLeft: "10px" }}>อื่นๆ</span>
                    <input
                        type="text"
                        placeholder="กรอกคำตอบอื่นๆ"
                        className="google-form-input"
                        value={tempOtherValue}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setTempOtherValue(newValue);
                            setSelectedNeighborRelationship("อื่นๆ");
                        }}
                        style={{
                            borderBottom: "1px solid #4285f4",
                            outline: "none",
                            marginLeft: "20px",
                            width: "70%",
                        }}
                    />
                </div>
            </div>
        </div>
    );
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleCheckboxChange = (fieldName, option, checked) => {
        setFormValues((prev) => {
            const currentValues = prev[fieldName] || [];
            return {
                ...prev,
                [fieldName]: checked
                    ? [...currentValues, option]
                    : currentValues.filter((item) => item !== option),
            };
        });
    };

    const renderCheckboxGroup = (fieldName, options, label) => (
        <div className="mt-3">
            <div className="m-2">
                <label className="form-label mt-3">{label} :</label>
                <p style={{ color: "gray" }}>(เลือกได้มากกว่า 1 ข้อ)</p>
                {options.map((option) => (
                    <div key={option} style={{ lineHeight: "40px" }}>
                        <input
                            type="checkbox"
                            value={option}
                            checked={formValues[fieldName]?.includes(option) || false}
                            style={{ transform: "scale(1.3)", marginLeft: "5px" }}
                            onChange={(e) =>
                                handleCheckboxChange(fieldName, option, e.target.checked)
                            }
                        />
                        <span style={{ marginLeft: "10px" }}>{option}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedValues = { ...formValues };
        // บันทึกค่าที่เลือกหรือที่กรอกในช่อง "อื่นๆ"
        if (selectedNeighborRelationship === "อื่นๆ") {
            updatedValues.neighborRelationship = tempOtherValue;
        } else {
            updatedValues.neighborRelationship = selectedNeighborRelationship;
        }
        onSave(updatedValues); // ส่งข้อมูลที่อัปเดตกลับไป
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="m-2">
                <label className="form-label">1. ลักษณะบ้าน :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="houseType"
                    value={formValues.houseType || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">2. วัสดุที่ใช้ทำ :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="material"
                    value={formValues.material || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">3. จำนวนชั้น :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="numFloors"
                    value={formValues.numFloors || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">4. จำนวนห้อง :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="numRooms"
                    value={formValues.numRooms || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">5. ผู้ป่วยอาศัยอยู่ชั้นไหน :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="patientFloor"
                    value={formValues.patientFloor || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">6. ความสะอาดในบ้าน :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="cleanliness"
                            value="สะอาด"
                            checked={formValues.cleanliness === "สะอาด"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>สะอาด</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="cleanliness"
                            value="ไม่สะอาด"
                            checked={formValues.cleanliness === "ไม่สะอาด"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>ไม่สะอาด</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">7. ความเป็นระเบียบเรียบร้อยในบ้าน :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="orderliness"
                            value="เป็นระเบียบเรียบร้อย"
                            checked={formValues.orderliness === "เป็นระเบียบเรียบร้อย"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>เป็นระเบียบเรียบร้อย</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="orderliness"
                            value="ไม่เป็นระเบียบเรียบร้อย"
                            checked={formValues.orderliness === "ไม่เป็นระเบียบเรียบร้อย"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>ไม่เป็นระเบียบเรียบร้อย</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">8. แสงสว่างในบ้าน :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="lighting"
                            value="แสงสว่างเพียงพอ"
                            checked={formValues.lighting === "แสงสว่างเพียงพอ"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>แสงสว่างเพียงพอ</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="lighting"
                            value="แสงสว่างไม่เพียงพอ"
                            checked={formValues.lighting === "แสงสว่างไม่เพียงพอ"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>แสงสว่างไม่เพียงพอ</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">9. การระบายอากาศ :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="ventilation"
                            value="อากาศถ่ายเทสะดวก"
                            checked={formValues.ventilation === "อากาศถ่ายเทสะดวก"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>อากาศถ่ายเทสะดวก</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="ventilation"
                            value="อากาศถ่ายเทไม่สะดวก"
                            checked={formValues.ventilation === "อากาศถ่ายเทไม่สะดวก"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>อากาศถ่ายเทไม่สะดวก</span>
                    </div>
                </div>
            </div>
            {renderCheckboxGroup(
                "intakeMethod",
                ["ชื้นแฉะ มีน้ำขังเป็นย่อมๆ", "หญ้าหรือต้นไม้ขึ้นรอบๆ", "มีรั้วบ้านล้อมรอบ"],
                "10. สภาพสิ่งแวดล้อมรอบๆบ้าน"
            )}
            <div className="m-2">
                <label className="form-label mt-3">11. เลี้ยงสัตว์ใต้ถุนบ้าน/รอบๆบ้าน (ถ้ามี) :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="homeEnvironment_petType"
                    value={formValues.homeEnvironment_petType || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">12. อื่นๆ (ถ้ามี) :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="otherHomeEnvironment"
                    value={formValues.otherHomeEnvironment || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">13. จำนวนเพื่อนบ้าน :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="patientFloor"
                    value={formValues.patientFloor || ""}
                    onChange={handleChange}
                />
            </div>
            {renderRadioGroupWithOther(
                "neighborRelationship",
                ["ดี", "ไม่ดี" ],
                "14. ความสัมพันธ์กับเพื่อนบ้าน"
            )}
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">15. ความช่วยเหลือกันของเพื่อนบ้าน :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="neighborHelp"
                            value="ช่วยเหลือกันดีเมื่อมีปัญหา"
                            checked={formValues.neighborHelp === "ช่วยเหลือกันดีเมื่อมีปัญหา"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>ช่วยเหลือกันดีเมื่อมีปัญหา</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="neighborHelp"
                            value="ไม่ช่วยเหลือกัน"
                            checked={formValues.neighborHelp === "ไม่ช่วยเหลือกัน"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>ไม่ช่วยเหลือกัน</span>
                    </div>
                </div>
            </div>
            <div className="modal-footer mt-3">
                {/* <button type="button" class="btn" data-bs-dismiss="modal">ยกเลิก</button> */}
                <button type="submit" className="btn">
                    บันทึก
                </button>
            </div>
        </form>
    );
};

export default HousingForm;