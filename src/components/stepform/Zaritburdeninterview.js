import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';

export const Zarit = ({ ZaritData, setZaritData }) => {
    const { control, setValue, watch } = useFormContext();
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
        <tr>
            <td>{label}</td>
            {[4, 3, 2, 1, 0].map((value) => (
                <td key={value}>
                    <Controller
                        name={name}
                        control={control}
                        render={({ field }) => (
                            <input
                                type="radio"
                                value={value}
                                checked={field.value === String(value)}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    setZaritData((prevData) => ({
                                        ...prevData,
                                        [name]: e.target.value,
                                    }));
                                }}
                                style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                            />
                        )}
                    />
                </td>
            ))}
        </tr>
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
            <div className="info3 card">
                <div className="header">
                    <b>Zarit burden interview</b>
                </div>
                <div className="m-4">
                    <b>ประเมินภาระการดูแล</b><span style={{ color: 'red' }}> *</span>
                    <div style={{ marginLeft: '26px', marginTop: '10px', lineHeight: '25px' }}>
                        <p>4 = แทบทุกครั้ง</p>
                        <p>3 = ค่อนข้างบ่อย</p>
                        <p>2 = บางครั้ง</p>
                        <p>1 = นานๆครั้ง</p>
                        <p>0 = ไม่มีเลย</p>
                    </div>
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>4</th>
                                <th>3</th>
                                <th>2</th>
                                <th>1</th>
                                <th>0</th>
                            </tr>
                        </thead>
                        <tbody>
                        {[
                                { name: 'question_1', label: 'คุณรู้สึกว่าไม่มีเวลาสำหรับตัวคุณเองเพราะต้องใช้เวลาดูแลญาติของคุณหรือไม่' },
                                { name: 'question_2', label: 'คุณรู้สึกเครียดเพราะต้องดูแลญาติของคุณในขณะที่ยังต้องรับผิดชอบครอบครัวและงานของคุณหรือไม่?' },
                                { name: 'question_3', label: 'คุณรู้สึกโกรธกับญาติของคุณหรือไม่?' },
                                { name: 'question_4', label: 'คุณรู้สึกว่าอาการของญาติทำให้ความสัมพันธ์ระหว่างคุณกับสมาชิกคนอื่นๆ ในครอบครัว และเพื่อนๆ ชวนนี้เป็นไปในทางลบหรือไม่?' },
                                { name: 'question_5', label: 'คุณรู้สึกเหนื่อยล้าเมื่อต้องอยู่ใกล้กับญาติของคุณหรือไม่?' },
                                { name: 'question_6', label: 'คุณรู้สึกเป็นทุกข์กับสังคมเพราะการดูแลญาติของคุณหรือไม่?' },
                                { name: 'question_7', label: 'คุณรู้สึกว่าคุณไม่มีความเป็นตัวของตัวเองที่คุณอยากได้เพราะญาติของคุณหรือไม่?' },
                                { name: 'question_8', label: 'คุณรู้สึกว่าการดูแลญาติทำให้ชีวิตทางสังคมมีปัญหาหรือไม่?' },
                                { name: 'question_9', label: 'คุณรู้สึกว่าอาการหรือความรู้สึกของคุณเองนั้นแย่ลงที่เกิดจากญาติของคุณหรือไม่?' },
                                { name: 'question_10', label: 'คุณรู้สึกไม่แน่ใจว่าจะต้องทำอย่างไรกับปัญหานี้หรือไม่?' },
                                { name: 'question_11', label: 'คุณรู้สึกว่าคุณสูญเสียความสามารถในการตัดสินใจเพียงเพราะญาติของคุณหรือไม่?' },
                                { name: 'question_12', label: 'คุณรู้สึกว่าคุณควรจะทำหน้าที่ดูแลญาติของคุณได้ดีกว่านี้หรือไม่?' },
                            ].map((item, index) => renderQuestion(item.label, item.name))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="info3 card mt-3">
                <div className="header">
                    <b>การประเมินผล</b>
                </div>
                <div className='m-4'>
                    <div className='grid' align="center">
                        <div className='col'>
                            <b>คะแนนรวม = </b>
                        </div>
                        <div className='col'>
                            <b>{totalScore !== null && (
                                <div className={`text-center mt-1 ${getGroupStyle()}`}>
                                    <h4><CountUp end={totalScore} duration={2} /> คะแนน</h4>
                                    <p>{burdenMessage}</p>
                                </div>
                            )}</b>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
