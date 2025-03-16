import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import CountUp from 'react-countup';

export const Immobility = ({ Immobilitydata, setImmobilityData, setHasError, showError, setShowError, control }) => {
  const [totalScore, setTotalScore] = useState(null);
  const [group, setGroup] = useState('');

  const scoreKeys = [
    'Pick_up_food', 'Clean_up', 'Put_on_clothes', 'Shower', 'Using_the_toilet',
    'Get_up', 'Walk_inside', 'Up_down_stairs', 'Continence_urine', 'Continence_stool',
    'Walk_outside', 'Cooking', 'Household_chores', 'Shopping', 'Taking_public_transportation',
    'Taking_medicine'
  ];

  const calculateTotalScore = () => {
    if (!Immobilitydata || typeof Immobilitydata !== "object") return; // ✅ กัน Error 

    let total = 0;
    let hasMissing = false;

    scoreKeys.forEach(key => {
      if (!Immobilitydata?.[key]) { // ✅ ใช้ ?. ป้องกัน undefined
        hasMissing = true;
      } else {
        total += parseInt(Immobilitydata[key], 10) || 0;
      }
    });

    setHasError(hasMissing);
    if (!hasMissing) setShowError(false);
    setTotalScore(total);
    setImmobilityData(prevData => ({ ...prevData, totalScore: total }));

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


  const getGroupStyle = () => {
    if (totalScore !== null) {
      if (totalScore >= 36) {
        return 'text-danger';
      } else if (totalScore >= 21) {
        return 'text-primary';
      } else if (totalScore >= 16) {
        return 'text-success';
      }
    }
    return '';
  };

  // ✅ ฟังก์ชันเคลียร์ข้อมูลทั้งหมด
  const clearAllAnswers = () => {
    setImmobilityData({}); // ล้างข้อมูลทั้งหมด
    setTotalScore(null); // รีเซ็ตคะแนน
    setGroup(''); // รีเซ็ตกลุ่ม
    setHasError(false); // ซ่อน error
    setShowError(false); // ซ่อน error
  };

  useEffect(() => {
    calculateTotalScore(); // เรียกฟังก์ชันทุกครั้งที่ Immobilitydata เปลี่ยน
  }, [Immobilitydata]);

  const renderTable = (title, description, questions, category) => {
    if (!Immobilitydata || typeof Immobilitydata !== "object") return null; // ✅ กัน Error 

    const hasErrors = showError && questions.some((item) => item.name !== 'description' && !Immobilitydata?.[item.name]);

    return (
      <div
        id={category}
        className="info3 card mt-4"
        style={{ border: hasErrors ? '1px solid red' : '1px solid #dee2e6' }} // ✅ ใช้ style กำหนดขอบ
        data-error={hasErrors ? "true" : "false"} // ✅ ใช้ attribute เพื่อให้ JavaScript ตรวจจับได้
      >

        <div className='header'>
          <b>{title}</b>
        </div>

        <div className="description m-2">
          {description}
        </div>

        <table className='nutrition-table mt-2 mb-4' style={{ width: "95%" }}>
          <thead>
            <tr>
              <th style={{ width: "55%" }}>คำถาม</th>
              <th className='text-center'>1</th>
              <th className='text-center'>2</th>
              <th className='text-center'>3</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((item, index) => (
              item.name === 'description' ? (
                <tr key={index}>
                  <td colSpan="4" className="text-center" style={{ backgroundColor: "#f8f9fa" }}>
                    {item.label}
                  </td>
                </tr>
              ) : (
                <tr key={item.name}>
                  <td style={{ width: "55%" }}>{item.label} <span style={{ color: 'red' }}>*</span></td>
                  {[1, 2, 3].map((value) => (
                    <td className='text-center' key={value}>
                      <Controller
                        name={`Immobility.${item.name}`}
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <input
                            type="radio"
                            value={value}
                            checked={Immobilitydata?.[item.name] === String(value)}
                            style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setImmobilityData(prev => ({
                                ...prev,
                                [item.name]: e.target.value
                              }));
                              calculateTotalScore();
                            }}
                          />
                        )}
                      />
                    </td>
                  ))}
                </tr>
              )
            ))}
          </tbody>

        </table>

        {/* ✅ แสดงข้อความเตือนใต้กรอบถ้ายังไม่ได้เลือกครบ */}
        {hasErrors && (
          <div className=" text-center mb-3" style={{ color: "red" }}>
            กรุณาเลือกคำตอบให้ครบทุกข้อ
          </div>
        )}
      </div>

    );
  };



  return (
    <div>
      <div className="title-form mt-1">
        <div className="header">
          <b>Immobility</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}>
            <i className="bi bi-person-walking" style={{ color: "#008000" }}></i> ประเมินความสามารถในการเคลื่อนไหว
          </p>
        </div>
      </div>

      {/* ตาราง: กิจวัตรประจำวันพื้นฐาน + การให้คะแนนข้อ 9-10 */}
      {renderTable('กิจวัตรประจำวันพื้นฐาน',
        <>
          <div className='m-1'>
            <p className='ms-3 mb-0' style={{ color: "red" }}>
              <span style={{ fontSize: "1.2em", fontWeight: "bold" }}>* </span>
              = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
            <p className='ms-3'><b >การให้คะแนน :</b></p>
            <div style={{ marginLeft: '26px', marginTop: '10px', lineHeight: '25px' }}>
              <div className='grid' align="center">
                <div className='col'>
                  <p><b>1</b> = ทำได้ด้วยตัวเอง (รวมใช้อุปกรณ์ช่วย)</p>
                </div>
                <div className='col'>
                  <p><b>2</b> = ทำได้ด้วยตัวเองได้บ้าง ต้องมีคนช่วย</p>
                </div>
                <div className='col'>
                  <p><b>3</b> = ทำด้วยตนเองไม่ได้เลย</p>
                </div>
              </div>
            </div>
          </div>
        </>,
        [
          { name: 'Pick_up_food', label: '1. ตัก/หยิบอาหารรับประทาน' },
          { name: 'Clean_up', label: '2. ล้างหน้า แปรงฟัน หวีผม' },
          { name: 'Put_on_clothes', label: '3. สวมใส่เสื้อผ้า' },
          { name: 'Shower', label: '4. อาบน้ำ' },
          { name: 'Using_the_toilet', label: '5. ใช้ห้องส้วม/ทำความสะอาดหลังขับถ่าย' },
          { name: 'Get_up', label: '6. ลุกจากที่นอน/เตียง' },
          { name: 'Walk_inside', label: '7. เดินหรือเคลื่อนที่ในบ้าน' },
          { name: 'Up_down_stairs', label: '8. ขึ้นลงบันได 1 ชั้น' },

          // เพิ่มคำอธิบายให้มี colspan 4
          {
            name: 'description', label:
              <div className='m-1'>
                <p><b >การให้คะแนนข้อ 9-10 :</b></p>
                <div style={{ lineHeight: '25px' }}>
                  <div className='grid' align="center">
                    <div className='col'>
                      <p><b>1</b> = กลั้นได้ปกติ</p>
                    </div>
                    <div className='col'>
                      <p><b>2</b> = กลั้นไม่ได้บางครั้ง</p>
                    </div>
                    <div className='col'>
                      <p><b>3</b> = กลั้นไม่ได้เลย</p>
                    </div>
                  </div>
                </div>
              </div>
          },

          { name: 'Continence_urine', label: '9. กลั้นปัสสาวะ' },
          { name: 'Continence_stool', label: '10. กลั้นอุจจาระ' },
        ])}

      {/* ตาราง: กิจวัตรที่ซับซ้อน */}
      {renderTable('กิจวัตรที่ซับซ้อน',
        <div className='m-1'>
          <p className='ms-3 mb-0' style={{ color: "red" }}>
            <span style={{ fontSize: "1.2em", fontWeight: "bold" }}> *</span>
            = ระบุว่าเป็นคําถามที่จําเป็นต้องตอบ</p>
          <p className='ms-3'><b >การให้คะแนน :</b></p>
          <div style={{ marginLeft: '26px', marginTop: '10px', lineHeight: '25px' }}>
            <div className='grid' align="center">
              <div className='col'>
                <p><b>1</b> = ทำได้ด้วยตัวเอง (รวมใช้อุปกรณ์ช่วย)</p>
              </div>
              <div className='col'>
                <p><b>2</b> = ทำได้ด้วยตัวเองได้บ้าง ต้องมีคนช่วย</p>
              </div>
              <div className='col'>
                <p><b>3</b> = ทำด้วยตนเองไม่ได้เลย</p>
              </div>
            </div>
          </div>
        </div>, [
        { name: 'Walk_outside', label: '11. เดินหรือเคลื่อนที่นอกบ้าน' },
        { name: 'Cooking', label: '12. ทำหรือเตรียมอาหาร' },
        { name: 'Household_chores', label: '13. กวาด/ถูบ้านหรือซักรีดผ้า' },
        { name: 'Shopping', label: '14. การซื้อของ/จ่ายตลาด' },
        { name: 'Taking_public_transportation', label: '15. ใช้บริการขนส่งสาธารณะ' },
        { name: 'Taking_medicine', label: '16. การรับประทานยาตามแพทย์สั่ง' }
      ])}
      {/* ✅ ปุ่มเคลียร์คำตอบทั้งหมด */}
      <div className="d-flex justify-content-end me-4 mb-2">
        <span className="clear-selection text-secondary"
          onClick={clearAllAnswers}
        >
          เคลียร์คำตอบ
        </span>
      </div>
      {/* แสดงคะแนนรวม */}
      <div className='m-4'>
        <div className="card mt-4 shadow rounded" style={{ backgroundColor: "#95d7ff", border: "none" }}>
          <div className="card-body">
            <h4 className='text-center'>ประเมินผลคะแนน</h4>
            <div className="text-center m-3 p-3" style={{ backgroundColor: "white", borderRadius: "5px" }}>
              {totalScore !== null && (
                <div className={`text-center ${getGroupStyle()}`}>
                  <h1><CountUp end={totalScore} duration={2} /> คะแนน</h1>
                  <h6>{group}</h6>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};
