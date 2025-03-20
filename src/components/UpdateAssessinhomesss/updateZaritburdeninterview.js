import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
// import { Modal, Button } from "react-bootstrap";

const ZaritburdeninterviewForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [totalScore, setTotalScore] = useState(0);
    const [burdenMessage, setBurdenMessage] = useState("");
    const [isEdited, setIsEdited] = useState(false); // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่

    useEffect(() => {
        // ตรวจสอบว่าผู้ใช้แก้ไขข้อมูลหรือไม่
        setIsEdited(JSON.stringify(formValues) !== JSON.stringify(formData));
    }, [formValues, formData]);

    useEffect(() => {
        calculateTotalScore();
    }, [formValues]);

    const handleChange = (name, value) => {
        setFormValues((prev) => ({
            ...prev,
            [name]: Number(value),
        }));
    };

    const calculateTotalScore = () => {
        const scoreKeys = Object.keys(formValues).filter((key) =>
            key.startsWith("question_")
        );

        let total = 0;
        scoreKeys.forEach((key) => {
            total += formValues[key] || 0;
        });

        setTotalScore(total);

        if (total <= 10) {
            setBurdenMessage("ไม่มีภาระทางใจ");
        } else if (total >= 11 && total <= 20) {
            setBurdenMessage("มีภาระปานกลาง");
        } else if (total > 20) {
            setBurdenMessage("มีภาระหนัก");
        }
    };
    // 🔹 ฟังก์ชันเคลียร์ค่าทั้งหมด
    const handleClearSelections = () => {
        const clearedValues = {};
        Object.keys(formValues).forEach(key => {
            if (key.startsWith("question_")) {
                clearedValues[key] = null;
            }
        });
        setFormValues({ ...formValues, ...clearedValues });
        setTotalScore(0);
        setBurdenMessage("");
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // 🔹 ถ้าข้อมูลไม่มีการเปลี่ยนแปลง แจ้งเตือนก่อนบันทึก
        if (!isEdited) {
            const confirmSave = window.confirm("ไม่มีการแก้ไขข้อมูล ต้องการบันทึกหรือไม่?");
            if (!confirmSave) return;
        }
        onSave({ ...formValues, totalScore });
    };
    const handleCancel = () => {
        // 🔹 ถ้ามีการแก้ไขแล้วกดยกเลิก ให้แสดงแจ้งเตือน
        if (isEdited) {
            const confirmExit = window.confirm("ต้องการยกเลิกการแก้ไขหรือไม่?\nหากยกเลิก การแก้ไขที่ไม่ได้บันทึกจะถูกละทิ้ง");
            if (!confirmExit) return;
        }
        onClose(); // ปิด Modal
    };
    const renderRadioGroup = (label, name) => (
        <div className="m-1">
            <label className="form-label ms-2 mb-0 mt-3">{label} <span style={{ color: 'red' }}> *</span></label>

            {[4, 3, 2, 1, 0].map((value) => (
                <div key={value} className='ms-4 mt-2 d-flex align-items-center'>
                    <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={formValues[name] === value}
                        onChange={(e) => handleChange(name, e.target.value)}
                        style={{
                            transform: 'scale(1.5)', // ลดขนาดให้เท่ากับ label
                            marginRight: '8px',
                            verticalAlign: 'middle'
                        }}
                    />
                    <label className="form-check-label" style={{ marginBottom: "0px", verticalAlign: "middle", marginLeft: "8px" }}>
                        {value} คะแนน
                    </label>
                </div>
            ))}
        </div>
    );


    const getGroupStyle = () => {
        if (totalScore > 20) return "text-danger"; // สีแดงสำหรับภาระหนัก
        if (totalScore >= 11) return "text-primary"; // สีฟ้าสำหรับภาระปานกลาง
        if (totalScore >= 0) return "text-success"; // สีเขียวสำหรับไม่มีภาระ
        return "text-dark"; // สีดำเป็นค่าเริ่มต้น
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Zarit Burden Interview</h5>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <b>การให้คะแนน</b>
                                <span style={{ color: "red" }}> *</span>
                                <p className="mt-3">4 = แทบทุกครั้ง</p>
                                <p>3 = ค่อนข้างบ่อย</p>
                                <p>2 = บางครั้ง</p>
                                <p>1 = นานๆครั้ง</p>
                                <p>0 = ไม่มีเลย</p>
                            </div>

                            {/* คำถามทั้งหมด */}
                            {[
                                { name: "question_1", label: "1. คุณรู้สึกว่าไม่มีเวลาสำหรับตัวคุณเองเพราะต้องใช้เวลาดูแลญาติของคุณหรือไม่?" },
                                { name: "question_2", label: "2. คุณรู้สึกเครียดเพราะต้องดูแลญาติของคุณในขณะที่ยังต้องรับผิดชอบครอบครัวและงานของคุณหรือไม่?" },
                                { name: "question_3", label: "3. คุณรู้สึกโกรธกับญาติของคุณหรือไม่?" },
                                { name: "question_4", label: "4. คุณรู้สึกว่าอาการของญาติทำให้ความสัมพันธ์ระหว่างคุณกับสมาชิกคนอื่นๆ ในครอบครัวและเพื่อนๆ เป็นไปในทางลบหรือไม่?" },
                                { name: "question_5", label: "5. คุณรู้สึกเหนื่อยล้าเมื่อต้องอยู่ใกล้กับญาติของคุณหรือไม่?" },
                                { name: "question_6", label: "6. คุณรู้สึกเป็นทุกข์กับสังคมเพราะการดูแลญาติของคุณหรือไม่?" },
                                { name: "question_7", label: "7. คุณรู้สึกว่าคุณไม่มีความเป็นตัวของตัวเองที่คุณอยากได้เพราะญาติของคุณหรือไม่?" },
                                { name: "question_8", label: "8. คุณรู้สึกว่าการดูแลญาติทำให้ชีวิตทางสังคมมีปัญหาหรือไม่?" },
                                { name: "question_9", label: "9. คุณรู้สึกว่าอาการหรือความรู้สึกของคุณเองนั้นแย่ลงที่เกิดจากญาติของคุณหรือไม่?" },
                                { name: "question_10", label: "10. คุณรู้สึกไม่แน่ใจว่าจะต้องทำอย่างไรกับปัญหานี้หรือไม่?" },
                                { name: "question_11", label: "11. คุณรู้สึกว่าคุณสูญเสียความสามารถในการตัดสินใจเพียงเพราะญาติของคุณหรือไม่?" },
                                { name: "question_12", label: "12. คุณรู้สึกว่าคุณควรจะทำหน้าที่ดูแลญาติของคุณได้ดีกว่านี้หรือไม่?" },
                            ].map((item) => renderRadioGroup(item.label, item.name))}
                            <div className="d-flex justify-content-end mt-2">
                                <span className="clear-selection text-secondary"
                                    onClick={handleClearSelections}>
                                    เคลียร์คำตอบ
                                </span>
                            </div>
                            <div className="m-3">
                                <b>
                                    {totalScore !== null && (
                                        <div className={`mt-4 ${getGroupStyle()}`}>
                                            <h4>คะแนนรวม = <CountUp end={totalScore} duration={2} /></h4>
                                            <p>{burdenMessage}</p>
                                        </div>
                                    )}
                                </b>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between">
                        <button className="btn-EditMode btn-secondary" onClick={handleCancel}>
                            ยกเลิก
                        </button>
                        <button className="btn-EditMode btnsave" onClick={handleSubmit}>
                            บันทึก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZaritburdeninterviewForm;
