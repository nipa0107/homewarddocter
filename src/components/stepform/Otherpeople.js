import React, { useState, useEffect } from "react";
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { Collapse } from '@material-ui/core';

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
  const { fields, append, remove } = useFieldArray({ control, name: "people" });
  const [openIndex, setOpenIndex] = useState(0); // Start with no index open

  useEffect(() => {
    if (fields.length === 0) {
      append({});
    } else if (fields.length === 1) {
      setOpenIndex(0); // Ensure the first form is open by default
    }
  }, [fields, append]);

  const toggleCollapse = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleAddPerson = () => {
    append({});
    setOpenIndex(fields.length); // Automatically open the newly added form
  };

  const handleRemovePerson = (index) => {
    remove(index);
    if (fields.length === 1 || openIndex === index) {
      setOpenIndex(0); // Reset to the first form or adjust accordingly
    }
  };

  return (
    <div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Other people</b>
        </div>
        <div className='m-4'>
          {fields.map((field, index) => (
            <div key={field.id}>
              {fields.length > 1 && (
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => toggleCollapse(index)}
                  aria-controls={`person-${index}`}
                  aria-expanded={openIndex === index}
                >
                  {`คนที่ ${index + 1}`}
                </button>
              )}
              {/* <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemovePerson(index)}
              >
                ลบข้อมูล
              </button> */}
              <Collapse in={openIndex === index}>
                <div id={`person-${index}`} className="p-3">
                  <table className='nutrition-table'>
                    <tbody>
                      {/* <tr>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleRemovePerson(index)}
                          >
                            ลบข้อมูล
                          </button>
                        </td>
                      </tr> */}
                      <tr>
                        <td>ชื่อ: </td>
                        <td colSpan="2">
                          <input
                            type="text"
                            className="form-control"
                            {...register(`people.${index}.firstName`)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>สกุล:</td>
                        <td colSpan="2">
                          <input
                            type="text"
                            className="form-control"
                            {...register(`people.${index}.lastName`)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>วันเกิด:</td>
                        <td colSpan="2">
                          <input
                            type="date"
                            className="form-control"
                            {...register(`people.${index}.birthDate`)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>บทบาท:</td>
                        <td colSpan="2">
                          <select
                            className="form-select"
                            {...register(`people.${index}.role`)}
                          >
                            <option value="">กรุณาเลือกบทบาท</option>
                            <option value="ลูก">ลูก</option>
                            <option value="พ่อ">บิดา</option>
                            <option value="แม่">มารดา</option>
                            <option value="คู่สมรส">คู่สมรส</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                          </select>
                        </td>
                      </tr>
                      {getValues(`people.${index}.role`) === 'อื่นๆ' && (
                        <tr>
                          <td></td>
                          <td colSpan="2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="กรอกบทบาทอื่นๆ"
                              {...register(`people.${index}.customRole`)}
                            />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>อาชีพ:</td>
                        <td colSpan="2">
                          <select
                            className="form-select"
                            {...register(`people.${index}.occupation`)}
                          >
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
                      {getValues(`people.${index}.occupation`) === 'อื่นๆ' && (
                        <tr>
                          <td></td>
                          <td colSpan="2">
                            <Controller
                              name={`people.${index}.customOccupation`}
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="กรอกอาชีพอื่นๆ"
                                  {...field}
                                />
                              )}
                            />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>สถานภาพ:</td>
                        <td colSpan="2">
                          <select
                            className="form-select"
                            {...register(`people.${index}.status`)}
                          >
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
                          <select
                            className="form-select"
                            {...register(`people.${index}.education`)}
                          >
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
                      {getValues(`people.${index}.education`) === 'อื่นๆ' && (
                        <tr>
                          <td></td>
                          <td colSpan="2">
                            <Controller
                              name={`people.${index}.customEducation`}
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="กรอกการศึกษาอื่นๆ"
                                  {...field}
                                />
                              )}
                            />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>รายได้ต่อเดือน:</td>
                        <td colSpan="2">
                          <select
                            className="form-select"
                            {...register(`people.${index}.income`)}
                          >
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
                          <select
                            className="form-select"
                            {...register(`people.${index}.benefit`)}
                          >
                            <option value="">กรุณาเลือกสิทธิ</option>
                            <option value="บัตรทอง">บัตรทอง</option>
                            <option value="ประกันสังคม">ประกันสังคม</option>
                            <option value="ประกันสุขภาพ">ประกันสุขภาพ</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                          </select>
                        </td>
                      </tr>
                      {getValues(`people.${index}.benefit`) === 'อื่นๆ' && (
                        <tr>
                          <td></td>
                          <td colSpan="2">
                            <Controller
                              name={`people.${index}.customBenefit`}
                              control={control}
                              defaultValue=""
                              render={({ field }) => (
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="กรอกสิทธิอื่นๆ"
                                  {...field}
                                />
                              )}
                            />
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>โรคประจำตัว:</td>
                        <td colSpan="2">
                          <input
                            type="text"
                            className="form-control"
                            {...register(`people.${index}.ud`)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>อุปนิสัย:</td>
                        <td colSpan="2">
                          <input
                            type="text"
                            className="form-control"
                            {...register(`people.${index}.habit`)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>รายละเอียดการดูแลผู้ป่วย:</td>
                        <td colSpan="2">
                          <input
                            type="text"
                            className="form-control"
                            {...register(`people.${index}.careDetails`)}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Collapse>
            </div>
          ))}
          <button
            type="button"
            className="btn mt-3"
            style={{ border: 'none', backgroundColor: 'green' }}
            onClick={handleAddPerson}
          >
            เพิ่มข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
};