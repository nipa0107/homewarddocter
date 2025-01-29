import React, { useState } from "react";

const OtherPeopleForm = ({ formData, onSave }) => {
    const [formValues, setFormValues] = useState({
        existingCaregivers: formData.existingCaregivers || [],
        newCaregivers: formData.newCaregivers || []
    });

    const [openIndexes, setOpenIndexes] = useState({
        existingCaregivers: [0], // เปิดฟอร์มคนที่ 1 ในกลุ่มผู้ดูแลเก่า
        newCaregivers: [] // ค่าเริ่มต้นปิดฟอร์มในกลุ่มคนในครอบครัว
    });

    const handleCaregiverChange = (type, index, field, value) => {
        setFormValues((prev) => {
            const updatedCaregivers = prev[type].map((cg, i) =>
                i === index ? { ...cg, [field]: value } : cg
            );
            return {
                ...prev,
                [type]: updatedCaregivers
            };
        });
    };

    const toggleForm = (type, index) => {
        setOpenIndexes((prev) => ({
            ...prev,
            [type]: [index] // เปิดฟอร์มใหม่และปิดฟอร์มอื่นในกลุ่มเดียวกัน
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues); // ส่งข้อมูลที่อัปเดตกลับไปยังฟังก์ชันที่เรียกใช้
    };

    const renderCaregiverForm = (type, title, caregivers) => (
        <div>
            <h4 className="mt-2"><b>{title}</b></h4>
            {caregivers.map((cg, index) => {
                const isOpen = openIndexes[type]?.includes(index);
                return (
                    <div key={index}>
                        <div className="mt-3">
                            <b
                                className="form-label"
                                style={{
                                    textDecoration: "underline",
                                    color: "#87CEFA",
                                    cursor: "pointer"
                                }}
                                onClick={() => toggleForm(type, index)}
                            >
                                {`คนที่ ${index + 1}`}
                            </b>
                        </div>
                        {isOpen && (
                            <div>
                                <div className="m-2">
                                    <label className="form-label">{`1. ชื่อ - นามสกุล :`}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        disabled
                                        value={`${cg.firstName || ""} ${cg.lastName || ""}`}
                                    />
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">2. วันเกิด :</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={cg.birthDate}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "birthDate", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">3. บทบาท :</label>
                                    <select
                                        className="form-select"
                                        value={cg.role}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "role", e.target.value)
                                        }
                                    >
                                        <option value="">เลือกบทบาท</option>
                                        <option value="ลูก">ลูก</option>
                                        <option value="บิดา">บิดา</option>
                                        <option value="มารดา">มารดา</option>
                                        <option value="คู่สมรส (สามี/ภรรยา)">คู่สมรส (สามี/ภรรยา)</option>
                                        <option value="ญาติ">ญาติ</option>
                                        <option value="ปู่/ย่า/ตา/ยาย">ปู่/ย่า/ตา/ยาย</option>
                                        <option value="พี่ชาย/พี่สาว">พี่ชาย/พี่สาว</option>
                                        <option value="น้องชาย/น้องสาว">น้องชาย/น้องสาว</option>
                                        <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                                    </select>
                                </div>

                                <div className="m-2">
                                    <label className="form-label mt-2">4. อาชีพ :</label>
                                    <select
                                        className="form-select"
                                        value={cg.occupation}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "occupation", e.target.value)
                                        }
                                    >
                                        <option value="">เลือกอาชีพ</option>
                                        <option value="ข้าราชการ">ข้าราชการ</option>
                                        <option value="รับจ้างทั่วไป">รับจ้างทั่วไป</option>
                                        <option value="พนักงานบริษัทเอกชน">พนักงานบริษัทเอกชน</option>
                                        <option value="นักเรียน/นักศึกษา">นักเรียน/นักศึกษา</option>
                                        <option value="ว่างงาน">ว่างงาน</option>
                                        <option value="เจ้าของธุรกิจ">เจ้าของธุรกิจ</option>
                                        <option value="อาชีพอิสระ">อาชีพอิสระ</option>
                                        <option value="ค้าขาย">ค้าขาย</option>
                                        <option value="เกษตรกร">เกษตรกร</option>
                                        <option value="ครู/อาจารย์ ">ครู/อาจารย์ </option>
                                        <option value="แพทย์/พยาบาล/บุคลากรทางการแพทย์">แพทย์/พยาบาล/บุคลากรทางการแพทย์</option>
                                        <option value="วิศวกร">วิศวกร</option>
                                        <option value="เกษียณอายุ">เกษียณอายุ</option>
                                    </select>
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">5. สถานภาพ :</label>
                                    <select
                                        className="form-select"
                                        value={cg.status}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "status", e.target.value)
                                        }
                                    >
                                        <option value="">เลือกสถานภาพ</option>
                                        <option value="โสด">โสด</option>
                                        <option value="แต่งงาน">แต่งงาน</option>
                                        <option value="หย่าร้าง">หย่าร้าง</option>
                                        <option value="หม้าย">หม้าย</option>
                                        <option value="แยกกันอยู่">แยกกันอยู่</option>
                                    </select>
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">6. การศึกษา :</label>
                                    <select
                                        className="form-select"
                                        value={cg.education}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "education", e.target.value)
                                        }
                                    >
                                        <option value="">เลือกการศึกษา</option>
                                        <option value="ไม่ได้รับการศึกษา">ไม่ได้รับการศึกษา</option>
                                        <option value="ประถมศึกษา">ประถมศึกษา</option>
                                        <option value="มัธยมศึกษาตอนต้น">มัธยมศึกษาตอนต้น</option>
                                        <option value="มัธยมศึกษาตอนปลาย">มัธยมศึกษาตอนปลาย</option>
                                        <option value="ปวช.">ปวช.</option>
                                        <option value="ปวส.">ปวส.</option>
                                        <option value="ปริญญาตรี">ปริญญาตรี</option>
                                        <option value="ปริญญาโท">ปริญญาโท</option>
                                        <option value="ปริญญาเอก">ปริญญาเอก</option>
                                    </select>
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">7. รายได้ต่อเดือน :</label>
                                    <select
                                        className="form-select"
                                        value={cg.income}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "income", e.target.value)
                                        }
                                    >
                                        <option value="">เลือกรายได้</option>
                                        <option value="ต่ำกว่า 10,000 บาท">ต่ำกว่า 10,000 บาท</option>
                                        <option value="10,000 - 20,000 บาท">10,000 - 20,000 บาท</option>
                                        <option value="20,001 - 30,000 บาท">20,001 - 30,000 บาท</option>
                                        <option value="30,001 - 50,000 บาท">30,001 - 50,000 บาท</option>
                                        <option value="มากกว่า 50,000 บาท">มากกว่า 50,000 บาท</option>
                                    </select>
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">8. สิทธิ :</label>
                                    <select
                                        className="form-select"
                                        value={cg.benefit}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "benefit", e.target.value)
                                        }
                                    >
                                        <option value="">เลือกสิทธิ</option>
                                        <option value="บัตรทอง">บัตรทอง</option>
                                        <option value="ประกันสังคม">ประกันสังคม</option>
                                        <option value="ประกันสุขภาพ">ประกันสุขภาพเอกชน</option>
                                        <option value="สวัสดิการข้าราชการ">สวัสดิการข้าราชการ</option>
                                        <option value="กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)">กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)</option>
                                        <option value="บัตรสวัสดิการแห่งรัฐ (บัตรคนจน)">บัตรสวัสดิการแห่งรัฐ (บัตรคนจน)</option>
                                    </select>
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">9. โรคประจำตัว :</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cg.ud}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "ud", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">10. อุปนิสัย :</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cg.habit}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "habit", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="m-2">
                                    <label className="form-label mt-2">8. รายละเอียดการดูแลผู้ป่วย :</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cg.careDetails}
                                        onChange={(e) =>
                                            handleCaregiverChange(type, index, "careDetails", e.target.value)
                                        }
                                    />
                                </div>
                                <hr />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <form onSubmit={handleSubmit}>
            {renderCaregiverForm(
                "existingCaregivers",
                "ผู้ดูแล",
                formValues.existingCaregivers
            )}
            {renderCaregiverForm(
                "newCaregivers",
                "คนในครอบครัว",
                formValues.newCaregivers
            )}
            <div className="modal-footer mt-3">
                <button type="submit" className="btn">บันทึก</button>
            </div>
        </form>
    );
};

export default OtherPeopleForm;
