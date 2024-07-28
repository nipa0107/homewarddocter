import React, { useState } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Otherpeople = () => {
    const { control, register, getValues } = useFormContext();
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState('');
  const [customOccupation, setCustomOccupation] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [customEducation, setCustomEducation] = useState('');
  const [selectedIncome, setSelectedIncome] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState('');

  const handleEducationChange = (e) => {
    setSelectedEducation(e.target.value);
    if (e.target.value !== "อื่นๆ") {
      setCustomEducation("");
    }
  };

  const handleOccupationChange = (e) => {
    setSelectedOccupation(e.target.value);
    if (e.target.value !== "อื่นๆ") {
      setCustomOccupation("");
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    if (e.target.value !== 'อื่นๆ') {
      setCustomRole('');
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleIncomeChange = (e) => {
    setSelectedIncome(e.target.value);
  };

  const handleBenefitChange = (e) => {
    setSelectedBenefit(e.target.value);
  };

  return (
    <div><div className="info3 card mt-4">
    <div className="header" align="center">
      <b>Other people</b>
    </div>
    <div className='m-4'>
      <table className='nutrition-table'>
        <tbody >
          <tr>
            <td><b>Family census</b></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>ชื่อ: </td>
            <td colSpan="2">
              <input
                type="text"
                className="form-control"
                {...register("firstName")}
              />
            </td>
          </tr>
          <tr>
            <td>สกุล:</td>
            <td colSpan="2">
              <input
                type="text"
                className="form-control"
                {...register("lastName")}
              />
            </td>
          </tr>
          <tr>
            <td>วันเกิด:</td>
            <td colSpan="2">
              <input
                type="date"
                className="form-control"
                {...register("birthDate")}
              />
            </td>
          </tr>
          <tr>
            <td>บทบาท:</td>
            <td colSpan="2">
              <select className="form-select" value={selectedRole} onChange={handleRoleChange}>
                <option value="">กรุณาเลือกบทบาท</option>
                <option value="ลูก">ลูก</option>
                <option value="พ่อ">บิดา</option>
                <option value="แม่">มารดา</option>
                <option value="คู่สมรส">คู่สมรส</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </td>
          </tr>
          {selectedRole === 'อื่นๆ' && (
            <tr>
              <td></td>
              <td colSpan="2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="กรอกบทบาทอื่นๆ"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  {...register("customRole")}
                />
              </td>
            </tr>
          )}
          <tr>
            <td>อาชีพ:</td>
            <td colSpan="2">
              <select className="form-select" value={selectedOccupation} onChange={handleOccupationChange}>
                <option value="">กรุณาเลือกอาชีพ</option>
                <option value="ข้าราชการ">ข้าราชการ</option>
                <option value="รับจ้างทั่วไป">รับจ้างทั่วไป</option>
                <option value="พนักงานบริษัทเอกชน">พนักงานบริษัทเอกชน</option>
                <option value="นักเรียน/นักศึกษา">นักเรียน/นักศึกษา</option>
                <option value="ว่างงาน">ว่างงาน</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </td>
          </tr>
          {selectedOccupation === 'อื่นๆ' && (
            <tr>
              <td></td>
              <td colSpan="2">
                <Controller
                  name="customOccupation"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="กรอกอาชีพอื่นๆ"
                      value={customOccupation}
                      onChange={(e) => {
                        field.onChange(e);
                        setCustomOccupation(e.target.value);
                      }}
                    />
                  )}
                />
              </td>
            </tr>
          )}
          <tr>
            <td>สถานภาพ:</td>
            <td colSpan="2">
              <select className="form-select" value={selectedStatus} onChange={handleStatusChange}>
                <option value="">กรุณาเลือกสถานภาพ</option>
                <option value="โสด">โสด</option>
                <option value="แต่งงาน">แต่งงาน</option>
                <option value="หย่าร้าง">หย่าร้าง</option>
                <option value="หม้าย">หม้าย</option>
                <option value="แยกกันอยู่">แยกกันอยู่</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>การศึกษา:</td>
            <td colSpan="2">
              <select className="form-select" value={selectedEducation} onChange={handleEducationChange}>
                <option value="">กรุณาเลือกการศึกษา</option>
                <option value="ประถมศึกษา">ประถมศึกษา</option>
                <option value="มัธยมศึกษาตอนต้น">มัธยมศึกษาตอนต้น</option>
                <option value="มัธยมศึกษาตอนปลาย">มัธยมศึกษาตอนปลาย</option>
                <option value="ปวช.">ปวช.</option>
                <option value="ปวส.">ปวส.</option>
                <option value="ปริญญาตรี">ปริญญาตรี</option>
                <option value="ปริญญาโท">ปริญญาโท</option>
                <option value="ปริญญาเอก">ปริญญาเอก</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </td>
          </tr>
          {selectedEducation === 'อื่นๆ' && (
            <tr>
              <td></td>
              <td colSpan="2">
                <Controller
                  name="customEducation"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="กรอกการศึกษาอื่นๆ"
                      value={customEducation}
                      onChange={(e) => {
                        field.onChange(e);
                        setCustomEducation(e.target.value);
                      }}
                    />
                  )}
                />
              </td>
            </tr>
          )}
          <tr>
            <td>รายได้ต่อเดือน:</td>
            <td colSpan="2">
              <select className="form-select" value={selectedIncome} onChange={handleIncomeChange}>
                <option value="">กรุณาเลือกรายได้</option>
                <option value="ต่ำกว่า 10,000 บาท">ต่ำกว่า 10,000 บาท</option>
                <option value="10,000 - 20,000 บาท">10,000 - 20,000 บาท</option>
                <option value="20,001 - 30,000 บาท">20,001 - 30,000 บาท</option>
                <option value="30,001 - 50,000 บาท">30,001 - 50,000 บาท</option>
                <option value="มากกว่า 50,000 บาท">มากกว่า 50,000 บาท</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>สิทธิ:</td>
            <td colSpan="2">
              <select className="form-select" value={selectedBenefit} onChange={handleBenefitChange}>
                <option value="">กรุณาเลือกสิทธิ</option>
                <option value="บัตรทอง">บัตรทอง</option>
                <option value="ประกันสังคม">ประกันสังคม</option>
                <option value="ประกันสุขภาพ">ประกันสุขภาพ</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </td>
          </tr>
          {selectedBenefit === 'อื่นๆ' && (
            <tr>
              <td></td>
              <td colSpan="2">
                <Controller
                  name="customBenefit"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="กรอกสิทธิอื่นๆ"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </td>
            </tr>
          )}
          <tr>
            <td>U/D(โรคประจำตัว):</td>
            <td colSpan="2">
              <input
                type="text"
                className="form-control"
                {...register("UD")}
              />
            </td>
          </tr>
          <tr>
            <td>อุปนิสัย:</td>
            <td colSpan="2">
              <input
                type="text"
                className="form-control"
                {...register("habit")}
              />
            </td>
          </tr>
          <tr>
            <td>รายละเอียดการดูแลผู้ป่วย:</td>
            <td colSpan="2">
              <input
                type="text"
                className="form-control"
                {...register("careDetails")}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div></div>
  )
}
