import React, { useState, useEffect } from "react";

const HousingForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [otherNeighborRelationship, setOtherNeighborRelationship] = useState("");
    const [showOtherInput, setShowOtherInput] = useState(false);

    // ตรวจสอบค่าเริ่มต้นของฟิลด์ "ความสัมพันธ์กับเพื่อนบ้าน"
    useEffect(() => {
        if (formData.neighborRelationship !== "ดี" && formData.neighborRelationship !== "ไม่ดี") {
            setOtherNeighborRelationship(formData.neighborRelationship || "");
            setShowOtherInput(true);
        }
    }, [formData.neighborRelationship]);

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

    const handleRelationshipChange = (e) => {
        const value = e.target.value;
        if (value === "อื่นๆ") {
            setShowOtherInput(true);
            setFormValues((prev) => ({
                ...prev,
                neighborRelationship: otherNeighborRelationship || "", // ใช้ค่าที่เคยกรอกไว้
            }));
        } else {
            setShowOtherInput(false);
            setFormValues((prev) => ({
                ...prev,
                neighborRelationship: value,
            }));
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        // อัปเดตค่า neighborRelationship เป็นค่าที่กรอกในช่อง "อื่นๆ" ถ้ามี
        const updatedFormValues = {
            ...formValues,
            neighborRelationship: showOtherInput ? otherNeighborRelationship : formValues.neighborRelationship,
        };

        onSave(updatedFormValues);
    };



    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Housing</h5>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <label className="form-label">ลักษณะบ้าน :</label>
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    id="houseType"
                                    value={formValues.houseType || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">วัสดุที่ใช้ทำ :</label>
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    id="material"
                                    value={formValues.material || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">จำนวนชั้น :</label>
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    id="numFloors"
                                    value={formValues.numFloors || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">จำนวนห้อง :</label>
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    id="numRooms"
                                    value={formValues.numRooms || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">ผู้ป่วยอาศัยอยู่ชั้นไหน :</label>
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
                                    <label className="form-label mt-3">ความสะอาดในบ้าน :</label>
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
                                    <label className="form-label mt-3">ความเป็นระเบียบเรียบร้อยในบ้าน :</label>
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
                                    <label className="form-label mt-3">แสงสว่างในบ้าน :</label>
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
                                    <label className="form-label mt-3">การระบายอากาศ :</label>
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
                            {/* {renderCheckboxGroup(
                            "intakeMethod",
                            ["ชื้นแฉะ มีน้ำขังเป็นย่อมๆ", "หญ้าหรือต้นไม้ขึ้นรอบๆ", "มีรั้วบ้านล้อมรอบ"],
                            "10. สภาพสิ่งแวดล้อมรอบๆบ้าน"
                        )} */}
                            <div className="mt-2">
                                <div className="m-2">
                                    <label className="form-label mt-3">สภาพสิ่งแวดล้อมรอบๆบ้าน :</label>
                                    <p style={{ color: "gray" }}>(เลือกได้มากกว่า 1 ข้อ)</p>
                                    {["ชื้นแฉะ มีน้ำขังเป็นย่อมๆ", "หญ้าหรือต้นไม้ขึ้นรอบๆ", "มีรั้วบ้านล้อมรอบ"].map((option) => (
                                        <div className="ms-2 d-flex align-items-center" key={option} style={{ lineHeight: "35px" }}>
                                            <input type="checkbox" value={option}
                                                checked={formValues.homeEnvironment?.includes(option) || false}
                                                style={{
                                                    transform: "scale(1.5)",
                                                    verticalAlign: 'middle'
                                                }}
                                                onChange={(e) => handleCheckboxChange("homeEnvironment", option, e.target.checked)} />
                                            <span style={{ marginLeft: "10px" }}>{option}</span>

                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">เลี้ยงสัตว์ใต้ถุนบ้าน/รอบๆบ้าน (ถ้ามี) :</label>
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    id="homeEnvironment_petType"
                                    value={formValues.homeEnvironment_petType || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">อื่นๆ (ถ้ามี) :</label>
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    id="otherHomeEnvironment"
                                    value={formValues.otherHomeEnvironment || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">จำนวนเพื่อนบ้าน :</label>
                                <input
                                    type="text"
                                    className="form-control mt-1"
                                    id="patientFloor"
                                    value={formValues.patientFloor || ""}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">ความสัมพันธ์กับเพื่อนบ้าน :</label>
                                {["ดี", "ไม่ดี"].map((option) => (
                                    <div key={option} className="d-flex align-items-center" style={{ lineHeight: "35px" }}>
                                        <input
                                            type="radio"
                                            name="neighborRelationship"
                                            value={option}
                                            checked={formValues.neighborRelationship === option}
                                            onChange={handleRelationshipChange}
                                            style={{ transform: "scale(1.5)" }}
                                        />
                                        <span style={{ marginLeft: "10px" }}>{option}</span>
                                    </div>
                                ))}
                                <div className="d-flex align-items-center mt-2">
                                    <input
                                        type="radio"
                                        name="neighborRelationship"
                                        value="อื่นๆ"
                                        checked={showOtherInput}
                                        onChange={() => {
                                            setShowOtherInput(true);
                                            setFormValues({ ...formValues, neighborRelationship: otherNeighborRelationship });
                                        }}
                                        style={{ transform: "scale(1.5)" }}
                                    />
                                    <span style={{ marginLeft: "10px" }}>อื่นๆ</span>
                                </div>
                                {showOtherInput && (
                                    <div className="mt-2">
                                        <label>ระบุความสัมพันธ์อื่นๆ</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={otherNeighborRelationship}
                                            onChange={(e) => {
                                                setOtherNeighborRelationship(e.target.value);
                                                setFormValues((prev) => ({
                                                    ...prev,
                                                    neighborRelationship: e.target.value,
                                                }));
                                            }}
                                        />

                                    </div>
                                )}
                            </div>
                            <div className="mt-2">
                                <div className="m-2">
                                    <label className="form-label mt-3">ความช่วยเหลือกันของเพื่อนบ้าน :</label>
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

                        </form>
                    </div>
                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between">
                        <button className="btn-EditMode btn-secondary" onClick={onClose}>ยกเลิก</button>
                        <button className="btn-EditMode btnsave" onClick={handleSubmit}>บันทึก</button>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default HousingForm;