import React, { useState, useEffect } from "react";
import CountUp from "react-countup";

const ImmobilityForm = ({ formData, onSave, onClose }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [totalScore, setTotalScore] = useState(0);
    const [groupMessage, setGroupMessage] = useState("");

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
        const keys = [
            "Pick_up_food",
            "Clean_up",
            "Put_on_clothes",
            "Shower",
            "Using_the_toilet",
            "Get_up",
            "Walk_inside",
            "Up_down_stairs",
            "Continence_urine",
            "Continence_stool",
            "Walk_outside",
            "Cooking",
            "Household_chores",
            "Shopping",
            "Taking_public_transportation",
            "Taking_medicine",
        ];

        let total = 0;
        keys.forEach((key) => {
            total += formValues[key] || 0;
        });

        setTotalScore(total);

        if (total >= 16 && total <= 20) {
            setGroupMessage("กลุ่มที่ 1 (ช่วยเหลือตัวเองดี ไม่ต้องการความช่วยเหลือ)");
        } else if (total >= 21 && total <= 35) {
            setGroupMessage("กลุ่มที่ 2 (ช่วยเหลือตัวเองได้ปานกลาง ต้องการความช่วยเหลือบางส่วน)");
        } else if (total >= 36) {
            setGroupMessage("กลุ่มที่ 3 (ช่วยเหลือตัวเองได้น้อย หรือไม่ได้เลย ต้องการความช่วยเหลือจากผู้อื่นทั้งหมด)");
        } else {
            setGroupMessage("-");
        }
    };

    // ฟังก์ชันเคลียร์ค่าทั้งหมด
    const handleClearSelections = () => {
        setFormValues({
            Pick_up_food: null,
            Clean_up: null,
            Put_on_clothes: null,
            Shower: null,
            Using_the_toilet: null,
            Get_up: null,
            Walk_inside: null,
            Up_down_stairs: null,
            Continence_urine: null,
            Continence_stool: null,
            Walk_outside: null,
            Cooking: null,
            Household_chores: null,
            Shopping: null,
            Taking_public_transportation: null,
            Taking_medicine: null,
        });
        setTotalScore(0);
        setGroupMessage("-");
    };
    const [isEdited, setIsEdited] = useState(false); // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
    useEffect(() => {
        // ตรวจสอบว่าผู้ใช้แก้ไขข้อมูลหรือไม่
        setIsEdited(JSON.stringify(formValues) !== JSON.stringify(formData));
    }, [formValues, formData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // ตรวจสอบว่ามีข้อไหนยังไม่ได้เลือกหรือไม่
        const keys = [
            "Pick_up_food", "Clean_up", "Put_on_clothes", "Shower",
            "Using_the_toilet", "Get_up", "Walk_inside", "Up_down_stairs",
            "Continence_urine", "Continence_stool", "Walk_outside",
            "Cooking", "Household_chores", "Shopping",
            "Taking_public_transportation", "Taking_medicine"
        ];

        const isComplete = keys.every(key => formValues[key] !== null && formValues[key] !== undefined);

        if (!isComplete) {
            window.alert("กรุณาเลือกคำตอบให้ครบทุกข้อ");
            return;
        }

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

            {[1, 2, 3].map((value) => (
                <div key={value} className='ms-4 mt-2 d-flex align-items-center'>
                    <input
                        type="radio"
                        name={name}
                        value={value}
                        checked={formValues[name] === value}
                        onChange={(e) => handleChange(name, e.target.value)}
                        style={{
                            transform: 'scale(1.5)',
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
        if (totalScore >= 36) return "text-danger"; // สีแดงสำหรับกลุ่มที่ 3
        if (totalScore >= 21) return "text-primary"; // สีฟ้าสำหรับกลุ่มที่ 2
        if (totalScore >= 16) return "text-success"; // สีเขียวสำหรับกลุ่มที่ 1
        return "text-dark"; // สีดำเป็นค่าเริ่มต้น
    };


    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Immobility</h5>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <b>การให้คะแนน</b>
                                <span style={{ color: "red" }}> *</span>
                                <p className="mt-3">1 = ทำได้ด้วยตัวเอง</p>
                                <p>2 = ทำได้บ้าง ต้องมีคนช่วย</p>
                                <p>3 = ทำไม่ได้เลย</p>
                            </div>

                            {/* คำถามทั้งหมด */}
                            {[
                                { name: "Pick_up_food", label: "1. ตัก/หยิบอาหารรับประทาน" },
                                { name: "Clean_up", label: "2. ล้างหน้า แปรงฟัน หวีผม" },
                                { name: "Put_on_clothes", label: "3. สวมใส่เสื้อผ้า" },
                                { name: "Shower", label: "4. อาบน้ำ" },
                                { name: "Using_the_toilet", label: "5. การใช้ห้องส้วม" },
                                { name: "Get_up", label: "6. ลุกจากที่นอน/เตียง" },
                                { name: "Walk_inside", label: "7. เดินหรือเคลื่อนที่ในบ้าน" },
                                { name: "Up_down_stairs", label: "8. ขึ้นลงบันได 1 ชั้น" },
                                { name: "Continence_urine", label: "9. กลั้นปัสสาวะ" },
                                { name: "Continence_stool", label: "10. กลั้นอุจจาระ" },
                                { name: "Walk_outside", label: "11. เดินหรือเคลื่อนที่นอกบ้าน" },
                                { name: "Cooking", label: "12. ทำหรือเตรียมอาหาร" },
                                { name: "Household_chores", label: "13. กวาด/ถูบ้าน ซักรีดผ้า" },
                                { name: "Shopping", label: "14. การซื้อของ/จ่ายตลาด" },
                                { name: "Taking_public_transportation", label: "15. ใช้บริการระบบขนส่งสาธารณะ" },
                                { name: "Taking_medicine", label: "16. การรับประทานยาตามแพทย์สั่ง" },
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
                                            <p>{groupMessage}</p>
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

export default ImmobilityForm;
