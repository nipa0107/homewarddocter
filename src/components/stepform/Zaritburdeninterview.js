import React, { useState, useEffect } from 'react';
import { Controller, set, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';
import Paper from '../../img/exam.png'

export const Zarit = ({ ZaritData, setZaritData, setHasError, showError, setShowError, control,userid }) => {
    const [totalScore, setTotalScore] = useState(0);
    const [burdenMessage, setBurdenMessage] = useState('');

    // ฟังก์ชันสร้างคีย์สำหรับ localStorage โดยใช้ userId
const getLocalStorageKey = (key) => `ZaritData_${userid}_${key}`;

    const scoreKeys = [
        'question_1', 'question_2', 'question_3', 'question_4', 'question_5',
        'question_6', 'question_7', 'question_8', 'question_9', 'question_10',
        'question_11', 'question_12'
    ];

    useEffect(() => {
        calculateTotalScore();
    }, [ZaritData]);

    const [fieldErrors, setFieldErrors] = useState({});

    const calculateTotalScore = () => {
        let total = 0;
        let newErrors = {};
        let globalError = false;
        scoreKeys.forEach(key => {
            if (!ZaritData[key]) {
                newErrors[key] = true;
                globalError = true;
            } else {
                total += parseInt(ZaritData[key], 10) || 0;
            }
        });
        setFieldErrors(newErrors);
        setTotalScore(total);
        setZaritData(prevData => ({ ...prevData, totalScore: total }));
        setHasError(globalError);

        if (total <= 10) setBurdenMessage('ไม่มีภาระทางใจ');
        else if (total >= 11 && total <= 20) setBurdenMessage('มีภาระปานกลาง');
        else if (total > 20) setBurdenMessage('มีภาระหนัก');
    };


    const renderQuestion = (label, name) => {
        const hasError = fieldErrors[name];
        return (
            <div className="card m-3 mt-4"
                style={{ border: (hasError && showError) ? "1px solid red" : "1px solid #dee2e6" }}>
                <div className="card-header pt-3" style={{ backgroundColor: "#e8f5fd" }}>
                    <p>{label}<span style={{ color: 'red' }}> *</span></p>
                </div>
                <div className="card-body">
                    <div className="row p-3">
                        {[4, 3, 2, 1, 0].map(value => (
                            <div
                                className="col-2 d-flex flex-column align-items-center justify-content-center "
                                style={{ width: "20%" }}
                                key={value}
                            >
                                <Controller
                                    name={name}
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <label className="d-block mb-2">{value}</label>
                                            <input
                                                type="radio"
                                                style={{ transform: 'scale(1.6)', border: "1px solid #777" }}
                                                value={value}
                                                checked={field.value === String(value)}
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    setZaritData(prevData => ({ ...prevData, [name]: e.target.value }));
                                                    // ลบ error เฉพาะของคำถามนี้
                                                    setFieldErrors(prevErrors => ({ ...prevErrors, [name]: false }));
                                                }}
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                    {(hasError && showError) && <p className="text-danger text-center mt-2">กรุณาเลือกคำตอบ</p>}
                </div>
            </div>
        );
    };


    const { reset, setValue } = useFormContext();

    useEffect(() => {
        if (!userid) return;
        const savedData = JSON.parse(localStorage.getItem(getLocalStorageKey("ZaritData")));
        if (savedData) {
            setZaritData(savedData);

            // ✅ อัปเดตค่าใน react-hook-form
            Object.keys(savedData).forEach(key => {
                setValue(key, String(savedData[key])); // ใช้ String() เพื่อให้ค่าตรงกับ radio button
            });
        }
    }, [userid,setValue]);

       /** ✅ อัปเดต `localStorage` เมื่อมีการเปลี่ยนแปลงค่า */
       useEffect(() => {
        if (userid) {
            localStorage.setItem(getLocalStorageKey("ZaritData"), JSON.stringify(ZaritData));
        }
    }, [ZaritData, userid]);
    
    // ฟังก์ชันเคลียร์ข้อมูลทั้งหมด โดยเคลียร์ทั้ง state ของคุณเองและ state ใน react-hook-form
    const clearAllAnswers = () => {
        // รีเซ็ตค่าของ react-hook-form
        const clearedValues = scoreKeys.reduce((acc, key) => {
            acc[key] = '';
            return acc;
        }, {});
        reset(clearedValues);

        // รีเซ็ต state ภายใน component
        setZaritData({});
        setFieldErrors({});
        setTotalScore(0);
        setBurdenMessage('');
        setShowError(false);
        localStorage.removeItem("ZaritData"); // ✅ ล้างค่าจาก localStorage ด้วย
    };

    const getGroupStyle = () => {
        if (totalScore > 20) return 'text-danger';
        else if (totalScore >= 11) return 'text-primary';
        else return 'text-success';
    };

    return (
        <div>
            <div className="title-form mt-1">
                <div className="header">
                    <b>Zarit burden interview</b>
                </div>
                <div style={{ marginLeft: '26px' }}>
                    <p style={{ color: "#666" }}>
                        <img src={Paper} className="zarit" alt="assessment" /> แบบประเมินภาระการดูแลผู้ป่วยในบ้าน
                    </p>
                </div>
            </div>
            <div className="m-4">
                <p style={{ color: 'red', marginLeft: '26px' }}>* = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
                <b style={{ marginLeft: '26px' }}>การให้คะแนน</b>
                <div style={{ marginLeft: '26px', marginTop: '10px', lineHeight: '25px' }}>
                    <p>4 = แทบทุกครั้ง , 3 = ค่อนข้างบ่อย , 2 = บางครั้ง , 1 = นานๆครั้ง</p>
                    <p>0 = ไม่มีเลย</p>
                </div>

                {/* แสดงคำถามเป็น Card */}
                {[
                    { name: 'question_1', label: '1. คุณรู้สึกว่าไม่มีเวลาสำหรับตัวคุณเองเพราะต้องใช้เวลาดูแลญาติของคุณหรือไม่' },
                    { name: 'question_2', label: '2. คุณรู้สึกเครียดเพราะต้องดูแลญาติของคุณในขณะที่ยังต้องรับผิดชอบครอบครัวและงานของคุณหรือไม่?' },
                    { name: 'question_3', label: '3. คุณรู้สึกโกรธกับญาติของคุณหรือไม่?' },
                    { name: 'question_4', label: '4. คุณรู้สึกว่าอาการของญาติทำให้ความสัมพันธ์ระหว่างคุณกับสมาชิกคนอื่นๆ ในครอบครัว และเพื่อนๆ ชวนนี้เป็นไปในทางลบหรือไม่?' },
                    { name: 'question_5', label: '5. คุณรู้สึกเหนื่อยล้าเมื่อต้องอยู่ใกล้กับญาติของคุณหรือไม่?' },
                    { name: 'question_6', label: '6. คุณรู้สึกเป็นทุกข์กับสังคมเพราะการดูแลญาติของคุณหรือไม่?' },
                    { name: 'question_7', label: '7. คุณรู้สึกว่าคุณไม่มีความเป็นตัวของตัวเองที่คุณอยากได้เพราะญาติของคุณหรือไม่?' },
                    { name: 'question_8', label: '8. คุณรู้สึกว่าการดูแลญาติทำให้ชีวิตทางสังคมมีปัญหาหรือไม่?' },
                    { name: 'question_9', label: '9. คุณรู้สึกว่าอาการหรือความรู้สึกของคุณเองนั้นแย่ลงที่เกิดจากญาติของคุณหรือไม่?' },
                    { name: 'question_10', label: '10. คุณรู้สึกไม่แน่ใจว่าจะต้องทำอย่างไรกับปัญหานี้หรือไม่?' },
                    { name: 'question_11', label: '11. คุณรู้สึกว่าคุณสูญเสียความสามารถในการตัดสินใจเพียงเพราะญาติของคุณหรือไม่?' },
                    { name: 'question_12', label: '12. คุณรู้สึกว่าคุณควรจะทำหน้าที่ดูแลญาติของคุณได้ดีกว่านี้หรือไม่?' },
                ].map((item, index) => renderQuestion(item.label, item.name))}
                {/* ✅ Clear All Button */}
                <div className="d-flex justify-content-end mb-2">
                    <span className="clear-selection text-secondary" onClick={clearAllAnswers}>
                        เคลียร์คำตอบ
                    </span>
                </div>
                <div className="card m-3 mt-4 shadow mb-5 rounded" style={{ backgroundColor: "#95d7ff", border: "none" }}>
                    <div className="card-body" >
                        <div className="row" style={{ marginLeft: "1px" }}>
                            <h4 className='text-center' >ประเมินผลคะแนน</h4>
                            <div className="col mt-2" style={{ borderRadius: "5px", backgroundColor: "white" }}>
                                <b>{totalScore !== null && (
                                    <div className={`text-center m-3 ${getGroupStyle()}`} >
                                        <h1><CountUp end={totalScore} duration={2} /> คะแนน</h1>
                                        <h4>{burdenMessage}</h4>
                                    </div>
                                )}</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};
