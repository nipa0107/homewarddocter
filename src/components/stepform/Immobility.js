import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import CountUp from 'react-countup';

export const Immobility = ({ Immobilitydata, setImmobilityData }) => {
  const [totalScore, setTotalScore] = useState(null);
  const [group, setGroup] = useState('');

  const calculateTotalScore = () => {
    const scoreKeys = [
      'Pick_up_food',
      'Clean_up',
      'Put_on_clothes',
      'Shower',
      'Using_the_toilet',
      'Get_up',
      'Walk_inside',
      'Up_down_stairs',
      'Continence_urine',
      'Continence_stool',
      'Walk_outside',
      'Cooking',
      'Household_chores',
      'Shopping',
      'Taking_public_transportation',
      'Taking_medicine',
    ];

    let total = 0;
    scoreKeys.forEach(key => {
      const value = parseInt(Immobilitydata[key], 10) || 0;
      total += value;
    });

    setTotalScore(total); // อัปเดตคะแนนรวมใน State แยก
    setImmobilityData((prevData) => ({
      ...prevData,
      totalScore: total, // เก็บคะแนนรวมไว้ใน Immobilitydata
    }));

    if (total >= 16 && total <= 20) {
      setGroup('กลุ่มที่ 1 (ช่วยเหลือตัวเองดี)');
    } else if (total >= 21 && total <= 35) {
      setGroup('กลุ่มที่ 2 (ช่วยเหลือตัวเองได้ปานกลาง)');
    } else if (total >= 36 && total <= 48) {
      setGroup('กลุ่มที่ 3 (ช่วยเหลือตัวเองได้น้อย)');
    } else {
      setGroup('');
    }
  };
  // Function to apply different styles based on group
  const getGroupStyle = () => {
    if (totalScore !== null) {
      if (totalScore >= 36) {
        return 'text-danger'; // Red for group 3
      } else if (totalScore >= 21) {
        return 'text-primary'; // Orange for group 2
      } else if (totalScore >= 16) {
        return 'text-success'; // Green for group 1
      }
    }
    return ''; // Default
  };

  useEffect(() => {
    calculateTotalScore(); // เรียกฟังก์ชันทุกครั้งที่ Immobilitydata เปลี่ยน
  }, [Immobilitydata]);

  const renderQuestion = (label, name, options) => (
    <tr>
      <td>{label}</td>
      {options.map(option => (
        <td key={option.value}>
          <input
            type="radio"
            value={option.value}
            checked={Immobilitydata[name] === String(option.value)}
            onChange={(e) => setImmobilityData({ ...Immobilitydata, [name]: e.target.value })}
            style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <div>
      <div className="info3 card ">
        <div className="header">
          <b>Immobility</b>
        </div>
        <div className='m-4'>
          <b>กิจวัตรประจำวันพื้นฐาน</b><span style={{ color: 'red' }}> *</span>
          <div className='grid' align="center">
            <div className='col'>
              <p>1 = ทำได้ด้วยตัวเอง (รวมใช้อุปกรณ์ช่วย)</p>
            </div>
            <div className='col'>
              <p>2 = ทำได้ด้วยตัวเองได้บ้าง ต้องมีคนช่วย</p>
            </div>
            <div className='col'>
              <p>3 = ทำด้วยตนเองไม่ได้เลย</p>
            </div>
          </div>
          <table className="feedback-table">
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <thead>
              <tr>
                <th></th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Pick_up_food', label: '1. ตัก/หยิบอาหารรับประทาน' },
                { name: 'Clean_up', label: '2. ล้างหน้า แปรงฟัน หวีผม' },
                { name: 'Put_on_clothes', label: '3. สวมใส่เสื้อผ้า' },
                { name: 'Shower', label: '4. อาบน้ำ' },
                { name: 'Using_the_toilet', label: '5. การใช้ห้องส้วมและทำความสะอาดหลังขับถ่าย' },
                { name: 'Get_up', label: '6. ลุกจากที่นอน/เตียง' },
                { name: 'Walk_inside', label: '7. เดินหรือเคลื่อนที่ในบ้าน' },
                { name: 'Up_down_stairs', label: '8. ขึ้นลงบันได 1 ชั้น' },
              ].map((item, index) => (
                renderQuestion(item.label, item.name, [
                  { value: 1, label: '1 = ทำได้ด้วยตัวเอง' },
                  { value: 2, label: '2 = ทำได้ด้วยตัวเองได้บ้าง' },
                  { value: 3, label: '3 = ทำด้วยตนเองไม่ได้เลย' },
                ])
              ))}
            </tbody>
            <thead>
              <tr>
                <th></th>
                <th>1 = กลั้นได้ปกติ</th>
                <th>2 = กลั้นไม่ได้บางครั้ง</th>
                <th>3 = กลั้นไม่ได้เลย</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Continence_urine', label: '9. กลั้นปัสสาวะ' },
                { name: 'Continence_stool', label: '10. กลั้นอุจจาระ' }
              ].map((item, index) => (
                renderQuestion(item.label, item.name, [
                  { value: 1, label: '1 = ทำได้ด้วยตัวเอง' },
                  { value: 2, label: '2 = ทำได้ด้วยตัวเองได้บ้าง' },
                  { value: 3, label: '3 = ทำด้วยตนเองไม่ได้เลย' },
                ])
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <b>กิจวัตรที่ซับซ้อน</b><span style={{ color: 'red' }}> *</span>
          <div className='grid' align="center">
            <div className='col'>
              <p>1 = ทำได้ด้วยตัวเอง (รวมใช้อุปกรณ์ช่วย)</p>
            </div>
            <div className='col'>
              <p>2 = ทำได้ด้วยตัวเองได้บ้าง ต้องมีคนช่วย</p>
            </div>
            <div className='col'>
              <p>3 = ทำด้วยตนเองไม่ได้เลย</p>
            </div>
          </div>
          <table className="feedback-table">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <thead>
              <tr>
                <th></th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Walk_outside', label: '1. เดินหรือเคลื่อนที่นอกบ้าน' },
                { name: 'Cooking', label: '2. ทำหรือเตรียมอาหาร' },
                { name: 'Household_chores', label: '3. กวาด/ถูบ้านหรือซักรีดผ้า' },
                { name: 'Shopping', label: '4. การซื้อของ/จ่ายตลาด' },
                { name: 'Taking_public_transportation', label: '5. ใช้บริการระบบขนส่งสาธารณะ เช่น รถโดยสาร รถเมล์ แท็กซี่ รถไฟ' },
                { name: 'Taking_medicine', label: '6. การรับประทานยาตามแพทย์สั่ง' }
              ].map((item, index) => (
                renderQuestion(item.label, item.name, [
                  { value: 1, label: '1 = ทำได้ด้วยตัวเอง' },
                  { value: 2, label: '2 = ทำได้ด้วยตัวเองได้บ้าง' },
                  { value: 3, label: '3 = ทำด้วยตนเองไม่ได้เลย' },
                ])
              ))}
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
                  <p>{group}</p>
                </div>
              )}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};