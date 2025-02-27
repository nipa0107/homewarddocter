import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import Collapse from '@mui/material/Collapse';

export const Otherpeople = ({ onDataChange }) => {
  const { control, register, getValues, setValue } = useFormContext();
  const { fields: existingFields, replace: replaceExisting } = useFieldArray({ control, name: "existingCaregivers" });
  const { fields: newFields, append: appendNew } = useFieldArray({ control, name: "newCaregivers" });

  const [openIndex, setOpenIndex] = useState({ existing: null, new: null });
  const location = useLocation();
  const { id } = location.state || {};

  useEffect(() => {
    handleFieldChange(); // เรียกฟังก์ชันเพื่อรวมข้อมูลใหม่ทุกครั้ง
  }, [existingFields, getValues]);
  
  /** ✅ เปิด/ปิด Collapse ตาม Index และประเภท (existing/new) */
  const toggleCollapse = (index, type) => {
    setOpenIndex((prev) => ({
      ...prev,
      [type]: prev[type] === index ? null : index,
    }));
  };

  /** ✅ ดึงข้อมูล Existing Caregivers จาก API */
  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getcaregivers/${id}`);
        const caregiverData = await response.json();

        if (caregiverData.status === "ok" && Array.isArray(caregiverData.data)) {
          // ตรวจสอบว่ามีข้อมูลใน existingCaregivers หรือไม่
          if (getValues("existingCaregivers").length === 0) {
            replaceExisting(
              caregiverData.data.map((caregiver) => ({
                CaregiverId: caregiver.id || "",
                firstName: caregiver.name || "",
                lastName: caregiver.surname || "",
                relationship: caregiver.relationship || "ไม่ระบุ",  // ใช้ relationship จาก API
                birthDate: caregiver.birthDate || "",
                role: caregiver.role || "",
                occupation: caregiver.occupation || "",
                status: caregiver.status || "",
                education: caregiver.education || "",
                income: caregiver.income || "",
                benefit: caregiver.benefit || "",
                ud: caregiver.ud || "",
                habit: caregiver.habit || "",
                careDetails: caregiver.careDetails || "",
                isNew: false,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching caregiver data:", error);
      }
    };

    if (id) {
      fetchCaregiverData();
    }
  }, [id, replaceExisting, getValues]);

  /** ✅ เพิ่มผู้ดูแลใหม่ */
  const handleAddPerson = () => {
    appendNew({
      firstName: "",
      lastName: "",
      birthDate: "",
      relationship: "",
      occupation: "",
      status: "",
      education: "",
      income: "",
      benefit: "",
      ud: "",
      habit: "",
      careDetails: "",
      isNew: true,
    });

    setOpenIndex((prev) => ({ ...prev, new: newFields.length }));
    handleFieldChange();
  };


  /** ✅ รวมข้อมูลผู้ดูแลทั้งหมดและอัปเดตผ่าน `onDataChange` */
  const handleFieldChange = () => {
    const existingCaregiversData = existingFields.map((field, index) => ({
      CaregiverId: field.CaregiverId || "",
      firstName: getValues(`existingCaregivers.${index}.firstName`) || field.firstName || "",
      lastName: getValues(`existingCaregivers.${index}.lastName`) || field.lastName || "",
      birthDate: getValues(`existingCaregivers.${index}.birthDate`) || field.birthDate || "",
      relationship: getValues(`existingCaregivers.${index}.relationship`) || field.relationship || "ไม่ระบุ", // เพิ่มส่วนนี้
      occupation: getValues(`existingCaregivers.${index}.occupation`) || field.occupation || "",
      status: getValues(`existingCaregivers.${index}.status`) || field.status || "",
      education: getValues(`existingCaregivers.${index}.education`) || field.education || "",
      income: getValues(`existingCaregivers.${index}.income`) || field.income || "",
      benefit: getValues(`existingCaregivers.${index}.benefit`) || field.benefit || "",
      ud: getValues(`existingCaregivers.${index}.ud`) || field.ud || "",
      habit: getValues(`existingCaregivers.${index}.habit`) || field.habit || "",
      careDetails: getValues(`existingCaregivers.${index}.careDetails`) || field.careDetails || "",
      isNew: false,
    }));
  
    const newCaregiversData = newFields.map((field, index) => ({
      firstName: getValues(`newCaregivers.${index}.firstName`) || "",
      lastName: getValues(`newCaregivers.${index}.lastName`) || "",
      birthDate: getValues(`newCaregivers.${index}.birthDate`) || "",
      relationship: getValues(`newCaregivers.${index}.relationship`) || "",
      occupation: getValues(`newCaregivers.${index}.occupation`) || "",
      status: getValues(`newCaregivers.${index}.status`) || "",
      education: getValues(`newCaregivers.${index}.education`) || "",
      income: getValues(`newCaregivers.${index}.income`) || "",
      benefit: getValues(`newCaregivers.${index}.benefit`) || "",
      ud: getValues(`newCaregivers.${index}.ud`) || "",
      habit: getValues(`newCaregivers.${index}.habit`) || "",
      careDetails: getValues(`newCaregivers.${index}.careDetails`) || "",
      isNew: true,
    }));
  
    onDataChange({
      ...getValues(),
      OtherPeople: {
        existingCaregivers: existingCaregiversData,
        newCaregivers: newCaregiversData,
      },
    });
  };


  return (
    <div>
      {/* Existing Caregivers */}
      <div className="info3 card">
        <div className="header">
          <b>Other people</b>
        </div>
        <div className="m-4">
          {existingFields.map((field, index) => (
            <div key={field.id}>
              <span
                onClick={() => toggleCollapse(index, "existing")}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#5cb3fd",
                  marginBottom: "8px",
                }}
              >
                {`คนที่ ${index + 1}. ${field.firstName} ${field.lastName} (${field.relationship})`}
              </span>
              <Collapse in={openIndex.existing === index}>
                <div className="p-2">
                  <div>
                    <label>ชื่อ :</label>
                    <Controller
                      name={`existingCaregivers.${index}.firstName`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          disabled
                          className="form-control"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label>นามสกุล :</label>
                    <Controller
                      name={`existingCaregivers.${index}.lastName`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          disabled
                          className="form-control"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label>วันเกิด :</label>
                    <Controller
                      name={`existingCaregivers.${index}.birthDate`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          className="form-control"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>ความสัมพันธ์ :</label>
                    <Controller
                      name={`existingCaregivers.${index}.relationship`}
                      control={control}
                      defaultValue={field.relationship || ""}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          value={field.value}
                          disabled // Prevent editing for existing caregivers
                        />
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>อาชีพ:</label>
                    <Controller
                      name={`existingCaregivers.${index}.occupation`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
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
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>สถานภาพ :</label>
                    <Controller
                      name={`existingCaregivers.${index}.status`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
                        >
                          <option value="">เลือกสถานภาพ</option>
                          <option value="โสด">โสด</option>
                          <option value="แต่งงาน">แต่งงาน</option>
                          <option value="หย่าร้าง">หย่าร้าง</option>
                          <option value="หม้าย">หม้าย</option>
                          <option value="แยกกันอยู่">แยกกันอยู่</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label >การศึกษา :</label>
                    <Controller
                      name={`existingCaregivers.${index}.education`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
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
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label >รายได้ต่อเดือน :</label>
                    <Controller
                      name={`existingCaregivers.${index}.income`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
                        >
                          <option value="">เลือกรายได้</option>
                          <option value="ต่ำกว่า 10,000 บาท">ต่ำกว่า 10,000 บาท</option>
                          <option value="10,000 - 20,000 บาท">10,000 - 20,000 บาท</option>
                          <option value="20,001 - 30,000 บาท">20,001 - 30,000 บาท</option>
                          <option value="30,001 - 50,000 บาท">30,001 - 50,000 บาท</option>
                          <option value="มากกว่า 50,000 บาท">มากกว่า 50,000 บาท</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>สิทธิ :</label>
                    <Controller
                      name={`existingCaregivers.${index}.benefit`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
                        >
                          <option value="">เลือกสิทธิ</option>
                          <option value="บัตรทอง">บัตรทอง</option>
                          <option value="ประกันสังคม">ประกันสังคม (มาตรา 33, 39, 40)</option>
                          <option value="ประกันสุขภาพ">ประกันสุขภาพเอกชน</option>
                          <option value="สวัสดิการข้าราชการ">สวัสดิการข้าราชการ</option>
                          <option value="กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)">กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)</option>
                          <option value="บัตรสวัสดิการแห่งรัฐ (บัตรคนจน)">บัตรสวัสดิการแห่งรัฐ (บัตรคนจน)</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>โรคประจำตัว :</label>
                    <Controller
                      name={`existingCaregivers.${index}.ud`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกโรคประจำตัว"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>อุปนิสัย :</label>
                    <Controller
                      name={`existingCaregivers.${index}.habit`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกอุปนิสัย"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>รายละเอียดการดูแลผู้ป่วย:</label>
                    <Controller
                      name={`existingCaregivers.${index}.careDetails`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกรายละเอียดการดูแลผู้ป่วย"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </Collapse>
            </div>
          ))}
          {newFields.map((field, index) => (
            <div key={field.id}>
              <span
                onClick={() => toggleCollapse(index, "new")}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#5cb3fd",
                  marginBottom: "8px",
                }}
              >
                {`คนที่ ${existingFields.length + index + 1}. ${field.firstName} ${field.lastName}`}
              </span>
              <Collapse in={openIndex.new === index}>
                <div className="p-2">
                  <div>
                    <label>ชื่อ :</label>
                    <Controller
                      name={`newCaregivers.${index}.firstName`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label>สกุล :</label>
                    <Controller
                      name={`newCaregivers.${index}.lastName`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label>วันเกิด :</label>
                    <Controller
                      name={`newCaregivers.${index}.birthDate`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="date"
                          className="form-control"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>ความสัมพันธ์ :</label>
                    <Controller
                      name={`newCaregivers.${index}.relationship`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
                        >
                          <option value="">เลือกความสัมพันธ์</option>
                          <option value="ลูก">ลูก</option>
                          <option value="พ่อ">พ่อ</option>
                          <option value="แม่">แม่</option>
                          <option value="คู่สมรส">คู่สมรส (สามี/ภรรยา)</option>
                          <option value="ญาติ">ญาติ</option>
                          <option value="ปู่/ย่า/ตา/ยาย">ปู่/ย่า/ตา/ยาย</option>
                          <option value="ลุง/ป้า">ลุง/ป้า</option>
                          <option value="น้า/อา">น้า/อา</option>
                          <option value="พี่ชาย/พี่สาว">พี่ชาย/พี่สาว</option>
                          <option value="น้องชาย/น้องสาว">น้องชาย/น้องสาว</option>
                          <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>อาชีพ :</label>
                    <Controller
                      name={`newCaregivers.${index}.occupation`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
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
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>สถานภาพ :</label>
                    <Controller
                      name={`newCaregivers.${index}.status`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
                        >
                          <option value="">เลือกสถานภาพ</option>
                          <option value="โสด">โสด</option>
                          <option value="แต่งงาน">แต่งงาน</option>
                          <option value="หย่าร้าง">หย่าร้าง</option>
                          <option value="หม้าย">หม้าย</option>
                          <option value="แยกกันอยู่">แยกกันอยู่</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label >การศึกษา :</label>
                    <Controller
                      name={`newCaregivers.${index}.education`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
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
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label >รายได้ต่อเดือน :</label>
                    <Controller
                      name={`newCaregivers.${index}.income`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
                        >
                          <option value="">เลือกรายได้</option>
                          <option value="ต่ำกว่า 10,000 บาท">ต่ำกว่า 10,000 บาท</option>
                          <option value="10,000 - 20,000 บาท">10,000 - 20,000 บาท</option>
                          <option value="20,001 - 30,000 บาท">20,001 - 30,000 บาท</option>
                          <option value="30,001 - 50,000 บาท">30,001 - 50,000 บาท</option>
                          <option value="มากกว่า 50,000 บาท">มากกว่า 50,000 บาท</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>สิทธิ :</label>
                    <Controller
                      name={`newCaregivers.${index}.benefit`}
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          {...field}
                        >
                          <option value="">เลือกสิทธิ</option>
                          <option value="บัตรทอง">บัตรทอง</option>
                          <option value="ประกันสังคม">ประกันสังคม (มาตรา 33, 39, 40)</option>
                          <option value="ประกันสุขภาพ">ประกันสุขภาพเอกชน</option>
                          <option value="สวัสดิการข้าราชการ">สวัสดิการข้าราชการ</option>
                          <option value="กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)">กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)</option>
                          <option value="บัตรสวัสดิการแห่งรัฐ (บัตรคนจน)">บัตรสวัสดิการแห่งรัฐ (บัตรคนจน)</option>
                        </select>
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>โรคประจำตัว :</label>
                    <Controller
                      name={`newCaregivers.${index}.ud`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกโรคประจำตัว"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>อุปนิสัย :</label>
                    <Controller
                      name={`newCaregivers.${index}.habit`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกอุปนิสัย"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="mt-2">
                    <label>รายละเอียดการดูแลผู้ป่วย :</label>
                    <Controller
                      name={`newCaregivers.${index}.careDetails`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          className="form-control"
                          placeholder="กรอกรายละเอียดการดูแลผู้ป่วย"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </Collapse>
            </div>
          ))}
          <button
            type="button"
            className="btn mt-3"
            style={{ border: "none", backgroundColor: "green" }}
            onClick={handleAddPerson}
          >
            <i className="bi bi-plus-circle" style={{ marginRight: '8px' }}></i>
            เพิ่มคนอื่นๆ
          </button>
        </div>
      </div>
    </div>
  );
};
