import React, { useState, useEffect } from "react";
import CountUp from "react-countup";

const NutritionForm = ({ formData, onSave, fetchBmrTdee }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [bmr, setBmr] = useState(formData?.bmr || 0);
    const [tdee, setTdee] = useState(formData?.tdee || 0);


    useEffect(() => {
        if (fetchBmrTdee) {
            fetchBmrTdee().then((data) => {
                setBmr(data.bmr || 0);
                setTdee(data.tdee || 0);
                setFormValues((prev) => ({
                    ...prev,
                    bmr: data.bmr || 0,
                    tdee: data.tdee || 0,
                }));
            });
        }
    }, [fetchBmrTdee]);

    const activityFactors = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        super_active: 1.9,
    };

    useEffect(() => {
        calculateBmr();
    }, [formValues.weight, formValues.height, formValues.userAge, formValues.gender]);

    useEffect(() => {
        calculateTdee();
    }, [bmr, formValues.activityLevel]);

    const calculateBmr = () => {
        const { weight, height, userAge, gender } = formValues;
        if (!weight || !height || !userAge || !gender) return;

        let calculatedBmr = 0;
        if (gender === "ชาย") {
            calculatedBmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * userAge;
        } else if (gender === "หญิง") {
            calculatedBmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * userAge;
        }
        setBmr(Math.round(calculatedBmr));
        setFormValues((prev) => ({ ...prev, bmr: Math.round(calculatedBmr) }));
    };

    const calculateTdee = () => {
        if (!bmr || !formValues.activityLevel) return;
        const calculatedTdee = bmr * (activityFactors[formValues.activityLevel] || 1);
        setTdee(Math.round(calculatedTdee));
        setFormValues((prev) => ({ ...prev, tdee: Math.round(calculatedTdee) }));
    };
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues);
    };

    const renderCheckboxGroupWithOther = (fieldName, options, label) => (
        <div className="mt-2">
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

    return (
        <form onSubmit={handleSubmit}>
            <div className="m-2">
                <label className="form-label">1. เพศ :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="gender"
                    disabled
                    value={formValues.gender || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">2. อายุ :</label>
                <div className="d-flex align-items-center">
                    <input
                        type="number"
                        className="form-control me-2"
                        id="userAge"
                        disabled
                        placeholder="ปี"
                        value={formValues.userAge || ""}
                        onChange={handleChange}
                        style={{ width: "60px" }}
                    />
                    <span style={{ marginRight: "10px" }}>ปี</span>
                    <input
                        type="number"
                        className="form-control me-2"
                        id="userAgeInMonths"
                        disabled
                        placeholder="เดือน"
                        value={formValues.userAgeInMonths || ""}
                        onChange={handleChange}
                        style={{ width: "60px" }}
                    />
                    <span>เดือน</span>
                </div>
            </div>

            <div className="m-2">
                <label className="form-label mt-3">3. น้ำหนัก (kg.) :</label>
                <input
                    type="number"
                    className="form-control mt-1"
                    id="weight"
                    value={formValues.weight || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">4. ส่วนสูง (cm.) :</label>
                <input
                    type="number"
                    className="form-control mt-1"
                    id="height"
                    value={formValues.height || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">5. กิจกรรมที่ทำ :</label>
                <select
                    className="form-select mt-1"
                    id="activityLevel"
                    value={formValues.activityLevel || ""}
                    onChange={handleChange}
                >
                    <option value="">เลือกกิจกรรม</option>
                    <option value="sedentary">1. ออกกำลังกายน้อยมาก หรือไม่ออกเลย</option>
                    <option value="lightly_active">2. ออกกำลังกาย 1-3 ครั้งต่อสัปดาห์</option>
                    <option value="moderately_active">3. ออกกำลังกาย 4-5 ครั้งต่อสัปดาห์</option>
                    <option value="very_active">4. ออกกำลังกาย 6-7 ครั้งต่อสัปดาห์</option>
                    <option value="super_active">5. ออกกำลังกายวันละ 2 ครั้งขึ้นไป</option>
                </select>
            </div>
            <div className="m-2">
                <label className="form-label mt-3">6. ค่า BMR (kcal) :</label>
                <h5 className="mt-1">
                    = <CountUp end={bmr || 0} duration={1} />
                </h5>
            </div>
            <div className="m-2">
                <label className="form-label mt-3">7. ค่า TDEE (kcal) :</label>
                <h5 className="mt-1">
                    = <CountUp end={tdee || 0} duration={1} />
                </h5>
            </div>

            {renderCheckboxGroupWithOther(
                "intakeMethod",
                ["กินเอง", "ผู้ดูแลป้อน", "NG tube", "OG tube", "PEG", "IV"],
                "8. ช่องทางการรับอาหาร"
            )}
            {renderCheckboxGroupWithOther(
                "foodTypes",
                ["อาหารธรรมดา", "อาหารอ่อน", "อาหารเหลว"],
                "9. ลักษณะอาหาร"
            )}
            <div className="m-2">
                <label className="form-label mt-3">10. อาหารทางการแพทย์ :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="medicalFood"
                    value={formValues.medicalFood || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">9. อาหารที่ชอบ :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="favoriteFood"
                    value={formValues.favoriteFood || ""}
                    onChange={handleChange}
                />
            </div>
            <div className="m-2">
                <label className="form-label mt-3">10. อาหารอื่นๆ (ถ้ามี) :</label>
                <input
                    type="text"
                    className="form-control mt-1"
                    id="otherFood"
                    value={formValues.otherFood || ""}
                    onChange={handleChange}
                />
            </div>

            {renderCheckboxGroupWithOther(
                "cooks",
                ["ปรุงเอง", "คนดูแลปรุงให้", "ซื้อจากร้านอาหาร"],
                "11. คนปรุงอาหาร"
            )}
            <div className="mt-2">
                <div className="m-2">
                    <label className="form-label mt-3">12. ภาวะโภชนาการ :</label>
                    <div className="mt-2">
                        <input
                            type="radio"
                            id="nutritionStatus"
                            value="ปกติ"
                            checked={formValues.nutritionStatus === "ปกติ"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>ปกติ</span>
                    </div>
                    <div className="mt-3">
                        <input
                            type="radio"
                            id="nutritionStatus"
                            value="เกินเกณฑ์"
                            checked={formValues.nutritionStatus === "เกินเกณฑ์"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>เกินเกณฑ์</span>
                    </div>
                    <div className="mt-3"> 
                        <input
                            type="radio"
                            id="nutritionStatus"
                            value="ต่ำกว่าเกณฑ์"
                            checked={formValues.nutritionStatus === "ต่ำกว่าเกณฑ์"}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", marginLeft: "5px" }}
                        />
                        <span style={{ marginLeft: "10px" }}>ต่ำกว่าเกณฑ์</span>
                    </div>
                </div>
                <div className="modal-footer mt-3">
                    <button type="submit" className="btn">บันทึก</button>
                </div>
            </div>
        </form>
    );
};

export default NutritionForm;
