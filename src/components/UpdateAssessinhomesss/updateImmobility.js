import React, { useState, useEffect } from "react";
import CountUp from 'react-countup';

const ImmobilityForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [totalScore, setTotalScore] = useState(0);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: Number(value), // Ensure values are numeric
        }));
        
    };

    // Function to calculate the total score
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
            total += formValues[key] || 0; // Default to 0 if undefined
        });
        setTotalScore(total);
    };

    useEffect(() => {
        calculateTotalScore(); // Recalculate total score whenever formValues changes
    }, [formValues]);

    const getGroup = (totalScore) => {
        if (totalScore >= 16 && totalScore <= 20) {
            return 'กลุ่มที่ 1 (ช่วยเหลือตัวเองดี ไม่ต้องการความช่วยเหลือจากผู้อื่น)';
        } else if (totalScore >= 21 && totalScore <= 35) {
            return 'กลุ่มที่ 2 (ช่วยเหลือตัวเองได้ปานกลาง ต้องการความช่วยเหลือจากผู้อื่นบางส่วน)';
        } else if (totalScore >= 36 && totalScore <= 48) {
            return 'กลุ่มที่ 3 (ช่วยเหลือตัวเองได้น้อย หรือไม่ได้เลย ต้องการความช่วยเหลือจากผู้อื่นมากหรือทั้งหมด)';
        }
        return '-';
    };
    const getGroupStyle = (totalScore) => {
        if (totalScore >= 36) {
            return 'text-danger'; // สีแดงสำหรับกลุ่มที่ 3
        } else if (totalScore >= 21) {
            return 'text-primary'; // สีส้มสำหรับกลุ่มที่ 2
        } else if (totalScore >= 16) {
            return 'text-success'; // สีเขียวสำหรับกลุ่มที่ 1
        }
        return ''; // ค่าเริ่มต้น
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formValues, totalScore }); // Include totalScore in the saved data
    };

    const renderRadioGroup = (label, name) => (
        <div className="m-3">
            <label className="form-label mt-3">{label} :</label>
            <div>
                {[1, 2, 3].map((score) => (
                    <div key={score} className="form-check">
                        <input
                            type="radio"
                            name={name}
                            value={score}
                            checked={formValues[name] === score}
                            onChange={handleChange}
                            style={{ transform: 'scale(1.5)' , marginBottom:"2px"}}
                        />
                        <label className="form-check-label" style={{ marginLeft: '5px' , marginBottom:"2px"}}>
                            {score} คะแนน
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            <div className="m-3">
                <b>กิจวัตรประจำวันพื้นฐาน</b>
                <span style={{ color: "red" }}> *</span>
                <p className="mt-3">1 คะแนน = ทำได้ด้วยตัวเอง (รวมใช้อุปกรณ์ช่วย)</p>
                <p>2 คะแนน = ทำได้ด้วยตัวเองได้บ้าง ต้องมีคนช่วย</p>
                <p>3 คะแนน = ทำด้วยตนเองไม่ได้เลย</p>
            </div>

            {renderRadioGroup("1. ตัก/หยิบอาหารรับประทาน", "Pick_up_food")}
            {renderRadioGroup("2. ล้างหน้า แปรงฟัน หวีผม", "Clean_up")}
            {renderRadioGroup("3. สวมใส่เสื้อผ้า", "Put_on_clothes")}
            {renderRadioGroup("4. อาบน้ำ", "Shower")}
            {renderRadioGroup("5. การใช้ห้องส้วมและทำความสะอาดหลังขับถ่าย", "Using_the_toilet")}
            {renderRadioGroup("6. ลุกจากที่นอน/เตียง", "Get_up")}
            {renderRadioGroup("7. เดินหรือเคลื่อนที่ในบ้าน", "Walk_inside")}
            {renderRadioGroup("8. ขึ้นลงบันได 1 ชั้น", "Up_down_stairs")}
            {/* <hr></hr> */}
            <div className="m-3">
                <p className="mt-4"><b>สำหรับข้อ 9-10</b> <span style={{ color: "red" }}> *</span></p>
                <p className="mt-1">1 คะแนน = กลั้นได้ปกติ</p>
                <p>2 คะแนน = กลั้นไม่ได้บางครั้ง</p>
                <p>3 คะแนน = กลั้นไม่ได้เลย</p>
            </div>
            {renderRadioGroup("9. กลั้นปัสสาวะ", "Continence_urine")}
            {renderRadioGroup("10. กลั้นอุจจาระ", "Continence_stool")}
            <hr></hr>
            <div className="m-3">
                <b>กิจวัตรที่ซับซ้อน</b> <span style={{ color: "red" }}> *</span>
                <p className="mt-3">1 คะแนน = ทำได้ด้วยตัวเอง (รวมใช้อุปกรณ์ช่วย)</p>
                <p>2 คะแนน = ทำได้ด้วยตัวเองได้บ้าง ต้องมีคนช่วย</p>
                <p>3 คะแนน = ทำด้วยตนเองไม่ได้เลย</p>
            </div>
            {renderRadioGroup("11. เดินหรือเคลื่อนที่นอกบ้าน", "Walk_outside")}
            {renderRadioGroup("12. ทำหรือเตรียมอาหาร", "Cooking")}
            {renderRadioGroup("13. กวาด/ถูบ้านหรือซักรีดผ้า", "Household_chores")}
            {renderRadioGroup("14. การซื้อของ/จ่ายตลาด", "Shopping")}
            {renderRadioGroup("15. ใช้บริการระบบขนส่งสาธารณะ", "Taking_public_transportation")}
            {renderRadioGroup("16. การรับประทานยาตามแพทย์สั่ง", "Taking_medicine")}


            <div className="m-3">
                <b>
                    {totalScore !== null && (
                        <div className={`mt-4 ${getGroupStyle(totalScore)}`}>
                            <h4>คะแนนรวม = <CountUp end={totalScore} duration={2} /></h4>
                            <p>{getGroup(totalScore)}</p>
                        </div>
                    )}
                </b>
            </div>


            <div className="modal-footer mt-3">
                <button type="submit" className="btn">
                    บันทึก
                </button>
            </div>
        </form>
    );
};

export default ImmobilityForm;
