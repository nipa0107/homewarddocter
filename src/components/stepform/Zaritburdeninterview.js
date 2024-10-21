import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';

export const Zarit = () => {
    const { control, getValues, setValue } = useFormContext();
    const [totalScore, setTotalScore] = useState(null);
    const [burdenMessage, setBurdenMessage] = useState('');  // State to store the burden message

    const handleCalculate = () => {
        const values = getValues();

        // List of question field names
        const scoreKeys = [
            'q1', 'q2', 'q3', 'q4', 'q5',
            'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12'
        ];

        let total = 0;
        scoreKeys.forEach(key => {
            total += parseInt(values[key] || 0, 10);  // Sum up the values
        });

        setTotalScore(total);
        setValue('totalScore', total);  // Update the form's totalScore field

        // Determine the burden level based on total score
        if (total <= 10) {
            setBurdenMessage('ไม่มีภาระทางใจ');
        } else if (total >= 11 && total <= 20) {
            setBurdenMessage('มีภาระปานกลาง');
        } else if (total > 20) {
            setBurdenMessage('มีภาระหนัก');
        } else {
            setBurdenMessage('');
        }
    };
    const getGroupStyle = () => {
        if (totalScore !== null) {
            if (totalScore >= 20) {
                return 'text-danger'; // Red for group 3
            } else if (totalScore >= 11 && totalScore <= 20) {
                return 'text-primary'; // Orange for group 2
            } else if (totalScore >= 0 && totalScore <= 10) {
                return 'text-success'; // Green for group 1
            }
        }
        return ''; // Default
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
                                { name: 'q1', label: 'คุณรู้สึกว่าไม่มีเวลาสำหรับตัวคุณเองเพราะต้องใช้เวลาดูแลญาติของคุณหรือไม่' },
                                { name: 'q2', label: 'คุณรู้สึกเครียดเพราะต้องดูแลญาติของคุณในขณะที่ยังต้องรับผิดชอบครอบครัวและงานของคุณหรือไม่?' },
                                { name: 'q3', label: 'คุณรู้สึกโกรธกับญาติของคุณหรือไม่?' },
                                { name: 'q4', label: 'คุณรู้สึกว่าอาการของญาติทำให้ความสัมพันธ์ระหว่างคุณกับสมาชิกคนอื่นๆ ในครอบครัว และเพื่อนๆ ชวนนี้เป็นไปในทางลบหรือไม่?' },
                                { name: 'q5', label: 'คุณรู้สึกเหนื่อยล้าเมื่อต้องอยู่ใกล้กับญาติของคุณหรือไม่?' },
                                { name: 'q6', label: 'คุณรู้สึกเป็นทุกข์กับสังคมเพราะการดูแลญาติของคุณหรือไม่?' },
                                { name: 'q7', label: 'คุณรู้สึกว่าคุณไม่มีความเป็นตัวของตัวเองที่คุณอยากได้เพราะญาติของคุณหรือไม่?' },
                                { name: 'q8', label: 'คุณรู้สึกว่าการดูแลญาติทำให้ชีวิตทางสังคมมีปัญหาหรือไม่?' },
                                { name: 'q9', label: 'คุณรู้สึกว่าอาการหรือความรู้สึกของคุณเองนั้นแย่ลงที่เกิดจากญาติของคุณหรือไม่?' },
                                { name: 'q10', label: 'คุณรู้สึกไม่แน่ใจว่าจะต้องทำอย่างไรกับปัญหานี้หรือไม่?' },
                                { name: 'q11', label: 'คุณรู้สึกว่าคุณสูญเสียความสามารถในการตัดสินใจเพียงเพราะญาติของคุณหรือไม่?' },
                                { name: 'q12', label: 'คุณรู้สึกว่าคุณควรจะทำหน้าที่ดูแลญาติของคุณได้ดีกว่านี้หรือไม่?' }
                            ].map((item, index) => (
                                <tr key={index}>
                                    <td>{item.label}</td>
                                    {[4, 3, 2, 1, 0].map(value => (
                                        <td key={value}>
                                            <Controller
                                                name={item.name}
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        type="radio"
                                                        style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                                                        value={value}
                                                        checked={field.value === String(value)}
                                                        onChange={() => field.onChange(String(value))}
                                                    />
                                                )}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="info3 card mt-3">
                <div className="header">
                    <b>การประเมินผล</b>
                </div>
                <div className="m-4">
                    <div className='grid' align="center">
                        <div className='col'>
                            <b>คะแนนรวม = </b>
                        </div>
                        <div className='col'>
                            <b>{totalScore !== null && (
                                <div className={`text-center mt-1 ${getGroupStyle()}`}>
                                    <h4><CountUp end={totalScore} duration={2} /> คะแนน</h4>
                                    <p>{burdenMessage}</p> {/* Display burden message here */}
                                </div>
                            )}</b>
                        </div>
                        <div className='col'>
                            <button type="button" className="btn btn-outline-primary py-2 border-0" onClick={handleCalculate}>
                                คำนวณ
                            </button>
                        </div>
                    </div>
                    {/* Hidden input to store the total score in the form */}
                    <Controller
                        name="totalScore"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <input
                                type="hidden"
                                {...field}
                                value={totalScore !== null ? totalScore : ''}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
