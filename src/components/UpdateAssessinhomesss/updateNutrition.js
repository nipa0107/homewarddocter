import React, { useState, useEffect } from "react";
import CountUp from "react-countup";

const NutritionForm = ({ formData, onSave, onClose, name, surname }) => {
    const [formValues, setFormValues] = useState({ ...formData });
    const [bmr, setBmr] = useState(formData?.bmr || 0);
    const [tdee, setTdee] = useState(formData?.tdee || 0);
    const [isEdited, setIsEdited] = useState(false); // ตรวจสอบว่ามีการเปลี่ยนแปลงหรือไม่
    const [errors, setErrors] = useState({}); // ✅ State เก็บข้อผิดพลาด

    useEffect(() => {
        // ตรวจสอบว่าผู้ใช้แก้ไขข้อมูลหรือไม่
        setIsEdited(JSON.stringify(formValues) !== JSON.stringify(formData));
    }, [formValues, formData]);

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

        let calculatedBmr = gender === "ชาย"
            ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * userAge
            : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * userAge;

        setBmr(Math.round(calculatedBmr));
        setFormValues((prev) => ({ ...prev, bmr: Math.round(calculatedBmr) }));
    };

    const calculateTdee = () => {
        if (!bmr || !formValues.activityLevel) return;
        setTdee(Math.round(bmr * (activityFactors[formValues.activityLevel] || 1)));
        setFormValues((prev) => ({ ...prev, tdee: Math.round(bmr * (activityFactors[formValues.activityLevel] || 1)) }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [id]: value,
        }));

        // ✅ ลบ error ทันทีเมื่อผู้ใช้พิมพ์
        if (value.trim() !== "") {
            setErrors((prev) => ({
                ...prev,
                [id]: "",
            }));
        }
    };

    const handleBlur = (e) => {
        const { id, value } = e.target;

        // ✅ ถ้าผู้ใช้ลบข้อความจนหมด ให้ขึ้น error
        if (value.trim() === "") {
            setErrors((prev) => ({
                ...prev,
                [id]: `กรุณากรอก${id === "weight" ? "น้ำหนัก" : "ส่วนสูง"}`,
            }));
        }
    };

    const validateForm = () => {
        let newErrors = {};

        // ✅ ตรวจสอบว่าฟิลด์สำคัญถูกกรอกหรือไม่
        if (!formValues.weight) newErrors.weight = "กรุณากรอกน้ำหนัก";
        if (!formValues.height) newErrors.height = "กรุณากรอกส่วนสูง";
        if (!formValues.activityLevel) newErrors.activityLevel = "กรุณาเลือกกิจกรรมที่ทำ";
        if (!formValues.medicalFood) newErrors.medicalFood = "กรุณากรอกอาหารทางการแพทย์";
        if (!formValues.favoriteFood) newErrors.favoriteFood = "กรุณากรอกอาหารที่ชอบ";
        if (!formValues.nutritionStatus) newErrors.nutritionStatus = "กรุณาเลือกภาวะโภชนาการ";

        // ✅ ตรวจสอบว่าผู้ใช้เลือก checkbox หรือไม่
    if (!formValues.intakeMethod || formValues.intakeMethod.length === 0) {
        newErrors.intakeMethod = "กรุณาเลือกอย่างน้อย 1 ข้อ";
    }
    if (!formValues.foodTypes || formValues.foodTypes.length === 0) {
        newErrors.foodTypes = "กรุณาเลือกอย่างน้อย 1 ข้อ";
    }
    if (!formValues.cooks || formValues.cooks.length === 0) {
        newErrors.cooks = "กรุณาเลือกอย่างน้อย 1 ข้อ";
    }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // ✅ ถ้าไม่มี error ส่งคืนค่า `true`
    };

    const handleCheckboxChange = (fieldName, option, checked) => {
        setFormValues((prev) => {
            const currentValues = prev[fieldName] || [];
            const updatedValues = checked
                ? [...currentValues, option]
                : currentValues.filter((item) => item !== option);
    
            // ✅ ลบ error ทันทีเมื่อเลือก checkbox
            setErrors((prevErrors) => ({
                ...prevErrors,
                [fieldName]: updatedValues.length === 0 ? "กรุณาเลือกอย่างน้อย 1 ข้อ" : "",
            }));
    
            return {
                ...prev,
                [fieldName]: updatedValues,
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (JSON.stringify(formValues) === JSON.stringify(formData)) {
            const confirmSave = window.confirm("ไม่มีการแก้ไขข้อมูล ต้องการบันทึกหรือไม่?");
            if (!confirmSave) return;
        }

        if (!validateForm()) {
            // alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }


        onSave(formValues);
    };

    const handleCancel = () => {
        // 🔹 ถ้ามีการแก้ไขแล้วกดยกเลิก ให้แสดงแจ้งเตือน
        if (isEdited) {
            const confirmExit = window.confirm("ต้องการยกเลิกการแก้ไขหรือไม่?\nหากยกเลิก การแก้ไขที่ไม่ได้บันทึกจะถูกละทิ้ง");
            if (!confirmExit) return;
        }
        onClose(); // ปิด Modal
    };

    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header d-flex justify-content-center">
                        <h5 className="modal-title text-black text-center">แก้ไข Nutrition</h5>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="m-2">
                                <label className="form-label">ชื่อ-นามสกุล :</label>
                                <input type="text" className="form-control" id="gender" disabled value={`${name} ${surname}`} />
                            </div>
                            <div className="m-2">
                                <label className="form-label">เพศ :</label>
                                <input type="text" className="form-control" id="gender" disabled value={formValues.gender || ""} />
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">อายุ :</label>
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
                                <label className="form-label mt-2">น้ำหนัก (กิโลกรัม) : <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขหรือทศนิยม เช่น 40, 50.5)</span></label>
                                <input type="number"
                                    className={`form-control ${errors.weight ? "is-invalid" : ""}`}
                                    id="weight"
                                    placeholder="กรอกน้ำหนัก"
                                    style={{ width: "35%" }}
                                    value={formValues.weight || ""}
                                    onChange={handleChange}
                                    onBlur={handleBlur} // ✅ เช็คตอนออกจากช่อง
                                />
                                {errors.weight && <p className="text-danger mt-2">{errors.weight}</p>}
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">ส่วนสูง (เซ็นติเมตร) : <span style={{ color: "#666", fontSize: "15px" }}>(ระบุเป็นตัวเลขหรือทศนิยม เช่น 145, 165.5)</span></label>
                                <input type="number"
                                    className={`form-control ${errors.height ? "is-invalid" : ""}`}
                                    id="height" placeholder="กรอกส่วนสูง"
                                    style={{ width: "35%" }}
                                    value={formValues.height || ""}
                                    onChange={handleChange}
                                    onBlur={handleBlur} // ✅ เช็คตอนออกจากช่อง
                                />
                                {errors.height && <p className="text-danger mt-2">{errors.height}</p>}
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">ค่า BMR (กิโลแคลอรีต่อวัน) :</label>
                                <h5 style={{ color: "#28a745" }}><CountUp end={bmr || 0} duration={1} /></h5>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-2">กิจกรรมที่ทำ :</label>
                                <select className={`form-select ${errors.activityLevel ? "is-invalid" : ""}`}
                                    id="activityLevel"
                                    value={formValues.activityLevel || ""}
                                    onChange={handleChange}
                                    onBlur={handleBlur} // ✅ เช็คตอนออกจากช่อง
                                >
                                    <option value="">เลือกกิจกรรม</option>
                                    <option value="sedentary">ออกกำลังกายน้อยมาก</option>
                                    <option value="lightly_active">ออกกำลังกาย 1-3 ครั้ง/สัปดาห์</option>
                                    <option value="moderately_active">ออกกำลังกาย 4-5 ครั้ง/สัปดาห์</option>
                                    <option value="very_active">ออกกำลังกาย 6-7 ครั้ง/สัปดาห์</option>
                                    <option value="super_active">ออกกำลังกายวันละ 2 ครั้งขึ้นไป</option>
                                </select>
                                {errors.activityLevel && <p className="text-danger mt-2">{errors.activityLevel}</p>}
                            </div>

                            <div className="m-2">
                                <label className="form-label mt-2">ค่า TDEE (กิโลแคลอรีต่อวัน) :</label>
                                <h5 style={{ color: "#fd7e14" }}><CountUp end={tdee || 0} duration={1} /></h5>
                            </div>

                            {/* ช่องทางการรับอาหาร */}
                            <div className="mt-2">
                                <div className="m-2">
                                    <label className="form-label mt-3">ช่องทางการรับอาหาร :</label>
                                    <p style={{ color: "gray" }}>(เลือกได้มากกว่า 1 ข้อ)</p>
                                    {["กินเอง", "ผู้ดูแลป้อน", "NG tube", "OG tube", "PEG", "IV"].map((option) => (
                                        <div className="ms-2 d-flex align-items-center" key={option} style={{ lineHeight: "35px" }}>
                                            <input type="checkbox" value={option}
                                                checked={formValues.intakeMethod?.includes(option) || false}
                                                style={{
                                                    transform: "scale(1.5)",
                                                    verticalAlign: 'middle'
                                                }}
                                                onChange={(e) => handleCheckboxChange("intakeMethod", option, e.target.checked)} />
                                            <span style={{ marginLeft: "10px" }}>{option}</span>
                                        </div>
                                    ))}
                                    {errors.intakeMethod && <p className="text-danger mt-2">{errors.intakeMethod}</p>}
                                </div>
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">Food Intake (ลักษณะอาหาร) :</label>
                                <p style={{ color: "gray" }}>(เลือกได้มากกว่า 1 ข้อ)</p>
                                {["อาหารธรรมดา", "อาหารอ่อน", "อาหารเหลว"].map((option) => (
                                    <div className="ms-2 d-flex align-items-center" key={option} style={{ lineHeight: "35px" }}>
                                        <input type="checkbox" value={option}
                                            checked={formValues.foodTypes?.includes(option) || false}
                                            style={{
                                                transform: "scale(1.5)",
                                                verticalAlign: 'middle'
                                            }}
                                            onChange={(e) => handleCheckboxChange("foodTypes", option, e.target.checked)} />
                                        <span style={{ marginLeft: "8px" }}>{option}</span>
                                    </div>
                                ))}
                                {errors.foodTypes && <p className="text-danger mt-2">{errors.foodTypes}</p>}
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">อาหารทางการแพทย์ : <span style={{ color: "#666", fontSize: "15px" }}>(ระบุชื่อผลิตภัณฑ์ หากไม่มี ให้พิมพ์ "ไม่มี" )</span></label>
                                <textarea
                                    className={`form-control ${errors.medicalFood ? "is-invalid" : ""}`}
                                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                                    style={{ resize: "vertical" }}
                                    placeholder="กรอกอาหารทางการแพทย์"
                                    id="medicalFood"
                                    value={formValues.medicalFood || ""}
                                    onChange={handleChange}
                                    onBlur={handleBlur} // ✅ เช็คตอนออกจากช่อง
                                />
                                {errors.medicalFood && <p className="text-danger mt-2">{errors.medicalFood}</p>}
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">อาหารที่ชอบ : <span style={{ color: "#666", fontSize: "15px" }}>(ระบุประเภทอาหาร เช่น ข้าวผัด หากไม่มี ให้พิมพ์ "ไม่มี")</span></label>
                                <textarea
                                    className={`form-control ${errors.favoriteFood ? "is-invalid" : ""}`}
                                    rows="2" // กำหนดจำนวนแถวเริ่มต้น
                                    style={{ resize: "vertical" }}
                                    placeholder="กรอกอาหารทางการแพทย์"
                                    id="favoriteFood"
                                    value={formValues.favoriteFood || ""}
                                    onChange={handleChange}
                                    onBlur={handleBlur} // ✅ เช็คตอนออกจากช่อง
                                />
                                {errors.favoriteFood && <p className="text-danger mt-2">{errors.favoriteFood}</p>}
                            </div>
                            <div className="m-2">
                                <label className="form-label mt-3">คนปรุงอาหาร :</label>
                                <p style={{ color: "gray" }}>(เลือกได้มากกว่า 1 ข้อ)</p>
                                {["ปรุงเอง", "คนดูแลปรุงให้", "ซื้อจากร้านอาหาร"].map((option) => (
                                    <div className="ms-2 d-flex align-items-center" key={option} style={{ lineHeight: "35px" }}>
                                        <input type="checkbox" value={option}
                                            checked={formValues.cooks?.includes(option) || false}
                                            style={{
                                                transform: "scale(1.5)",
                                                verticalAlign: 'middle'
                                            }}
                                            onChange={(e) => handleCheckboxChange("cooks", option, e.target.checked)} />
                                        <span style={{ marginLeft: "10px" }}>{option}</span>
                                    </div>
                                ))}
                                {errors.cooks && <p className="text-danger mt-2">{errors.cooks}</p>}
                            </div>
                            {/* ภาวะโภชนาการ */}
                            <div className="m-2">
                                <label className="form-label mt-2">ภาวะโภชนาการ :</label>
                                {["ปกติ", "เกินเกณฑ์", "ต่ำกว่าเกณฑ์"].map((option) => (
                                    <div className="ms-2 d-flex align-items-center" key={option} style={{ lineHeight: "35px" }}>
                                        <input
                                            type="radio"
                                            id={option}  // เพิ่ม id ให้ตรงกับค่า
                                            name="nutritionStatus"
                                            value={option}
                                            checked={formValues.nutritionStatus === option}
                                            style={{ transform: "scale(1.6)", verticalAlign: 'middle' }}
                                            onChange={(e) => setFormValues(prev => ({ ...prev, nutritionStatus: e.target.value }))} // ใช้ setFormValues โดยตรง
                                        />
                                        <span style={{ marginLeft: "10px" }}>{option}</span>
                                    </div>
                                ))}
                                {errors.nutritionStatus && <p className="text-danger mt-2">{errors.nutritionStatus}</p>}
                            </div>

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between">
                        <button className="btn-EditMode btn-secondary" onClick={handleCancel}>ยกเลิก</button>
                        <button className="btn-EditMode btnsave" onClick={handleSubmit}>บันทึก</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionForm;
