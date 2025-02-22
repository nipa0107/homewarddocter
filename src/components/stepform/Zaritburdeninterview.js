import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';
import Paper from '../../img/exam.png'

export const Zarit = ({ ZaritData, setZaritData }) => {
    const { control } = useFormContext();
    const [totalScore, setTotalScore] = useState(0);
    const [burdenMessage, setBurdenMessage] = useState('');

    // ฟังก์ชันคำนวณคะแนนรวมและกำหนดข้อความ
    const calculateTotalScore = () => {
        const scoreKeys = [
            'question_1', 'question_2', 'question_3', 'question_4', 'question_5',
            'question_6', 'question_7', 'question_8', 'question_9', 'question_10',
            'question_11', 'question_12'
        ];

        let total = 0;
        const updatedData = {};

        scoreKeys.forEach(key => {
            const value = parseInt(ZaritData[key], 10) || 0; // ใช้ 0 หากไม่มีค่า
            total += value;
            updatedData[key] = value;
        });

        setTotalScore(total);
        setZaritData((prevData) => ({
            ...prevData,
            ...updatedData,
            totalScore: total, // เก็บคะแนนรวมไว้ใน ZaritData
        }));

        let message = '';
        if (total <= 10) {
            message = 'ไม่มีภาระทางใจ';
        } else if (total >= 11 && total <= 20) {
            message = 'มีภาระปานกลาง';
        } else if (total > 20) {
            message = 'มีภาระหนัก';
        }

        setBurdenMessage(message);
    };

    // คำนวณคะแนนเมื่อ ZaritData มีการเปลี่ยนแปลง
    useEffect(() => {
        calculateTotalScore();
    }, [ZaritData]);

    const renderQuestion = (label, name) => (
        <div className="card m-3 mt-4" style={{ width: "105%" }}>
            <div className="card-header pt-3" style={{ backgroundColor: "#e8f5fd" }}>
                <p>{label}<span style={{ color: 'red' }}> *</span></p>
            </div>
            <div className="card-body" >
                <div className="row p-3 " style={{ marginRight: "auto", marginLeft: "auto" }}>
                    {[4, 3, 2, 1, 0].map((value, index) => (
                        <div className="col-2 text-center" key={value} style={{ marginRight: "auto", marginLeft: "auto" }}>
                            <Controller
                                name={name}
                                control={control}
                                render={({ field }) => (

                                    <div className="form-check">
                                        <label className="form-check-label d-block" style={{ marginRight: "30px" }}>
                                            {value}
                                        </label>

                                        <input

                                            className="form-check-input "
                                            type="radio"
                                            style={{ transform: 'scale(1.3)', border: "1px solid #777", marginRight: "auto", marginLeft: "auto" }}
                                            value={value}
                                            checked={field.value === String(value)}
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                                setZaritData((prevData) => ({
                                                    ...prevData,
                                                    [name]: e.target.value,
                                                }));
                                            }}
                                        />

                                    </div>
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const getGroupStyle = () => {
        if (totalScore !== null) {
            if (totalScore > 20) {
                return 'text-danger'; // Red for heavy burden
            } else if (totalScore >= 11) {
                return 'text-primary'; // Blue for moderate burden
            } else if (totalScore >= 0) {
                return 'text-success'; // Green for no burden
            }
        }
        return 'text-dark'; // Default (Black) if score is not yet available
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
                <p style={{ color: 'red' , marginLeft: '26px' }}>* = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
                <b style={{ marginLeft: '26px'}}>การให้คะแนน</b>
                <div style={{ marginLeft: '26px', marginTop: '10px', lineHeight: '25px' }}>
                    <p>4 = แทบทุกครั้ง , 3 = ค่อนข้างบ่อย , 2 = บางครั้ง , 1 = นานๆครั้ง , 0 = ไม่มีเลย</p>
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
                
                <div className="card m-3 mt-4 shadow mb-5 rounded" style={{ width: "105%" , backgroundColor:"#95d7ff" , border:"none" }}>
                   
                    <div className="card-body" >
                        <div className="row"style={{marginLeft:"1px"}}>
                        <h4 className='text-center' >ประเมินผลคะแนน</h4>
                            <div className="col mt-2" style={{borderRadius:"5px" ,backgroundColor:"white"}}>
                                <b>{totalScore !== null && (
                                    <div className={`text-center m-3 ${getGroupStyle()}`} >
                                        <h1><CountUp end={totalScore} duration={2} /> คะแนน</h1>
                                        <h5>{burdenMessage}</h5>
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
