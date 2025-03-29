import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import Collapse from '@mui/material/Collapse';

export const CaregiverAgenda = ({ userid, onDataChange }) => {
  const { control, getValues, setValue } = useFormContext();
  const { fields: existingCaregivers, replace: replaceExisting } = useFieldArray({ control, name: "existingCaregivers" });
  const { fields: newCaregivers, replace: replaceNew } = useFieldArray({ control, name: "newCaregivers" });

  const [openIndex, setOpenIndex] = useState({ existing: 0, new: null });
  const location = useLocation();
  const { id } = location.state || {};

  // ✅ ฟังก์ชันสร้างคีย์ `localStorage` ตาม `userId`
  const getLocalStorageKey = (key) => `agenda_${userid}_${key}`;

  useEffect(() => {
    if (!userid) return; // ถ้า userId ไม่มีค่าให้หยุดทำงาน
    const savedData = JSON.parse(localStorage.getItem(getLocalStorageKey("caregiverAgendaData")));

    if (savedData) {
      console.log("Loaded from localStorage:", savedData); // ✅ Debugging

      if (!Array.isArray(savedData.existingCaregivers)) {
        savedData.existingCaregivers = [];
      }
      if (!Array.isArray(savedData.newCaregivers)) {
        savedData.newCaregivers = [];
      }

      replaceExisting(savedData.existingCaregivers);
      replaceNew(savedData.newCaregivers);
    }
  }, [userid]); // ✅ โหลดครั้งเดียวเมื่อ component mount


  /** ✅ บันทึกข้อมูลลง `localStorage` ตาม `userId` */
  useEffect(() => {
    if (userid) {
      localStorage.setItem(getLocalStorageKey("caregiverAgendaData"), JSON.stringify({
        existingCaregivers: getValues("existingCaregivers") || [],
        newCaregivers: getValues("newCaregivers") || []
      }));
    }
  }, [existingCaregivers, newCaregivers, getValues, userid]);

  const toggleCollapse = (index, type) => {
    setOpenIndex((prev) => ({
      ...prev,
      [type]: prev[type] === index ? null : index,
    }));
  };

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getCaregiverstoAgenda/${id}`);
        const data = await response.json();

        if (data.status === "ok" && Array.isArray(data.data)) {
          if (getValues("existingCaregivers").length === 0) {
            replaceExisting(
              data.data.map((cg) => ({
                CaregiverId: cg.id || "",
                firstName: cg.firstName || "",
                lastName: cg.lastName || "",
                relationship: cg.relationship || "ไม่ระบุความสัมพันธ์",
                caregiver_idea: cg.caregiver_idea || "",
                caregiver_feeling: cg.caregiver_feeling || "",
                caregiver_function: cg.caregiver_function || "",
                caregiver_expectation: cg.caregiver_expectation || "",
                isNew: false,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching caregivers:", error);
      }
    };

    if (id) {
      fetchCaregivers();
    }
  }, [id, replaceExisting, getValues]);

  useEffect(() => {
    handleFieldChange(); // อัปเดตข้อมูลเมื่อ existingCaregivers เปลี่ยนแปลง
  }, [existingCaregivers, newCaregivers, getValues]);

  /** ✅ ดึงข้อมูลผู้ดูแลใหม่จาก API */
  useEffect(() => {
    const fetchNewCaregivers = async () => {
      try {
        const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getcaregivesotherpeople/${id}`);
        const data = await response.json();

        if (data.status === "ok" && Array.isArray(data.data)) {
          console.log("Fetched new caregivers:", data.data); // ✅ Debugging

          // ถ้า newCaregivers ใน form มีข้อมูลแล้ว ไม่ต้อง replace
          if (getValues("newCaregivers").length === 0) {
            replaceNew(
              data.data.map((cg) => ({
                firstName: cg.firstName || "",
                lastName: cg.lastName || "",
                relationship: cg.relationship || "ไม่ระบุความสัมพันธ์",
                caregiver_idea: cg.caregiver_idea || "",
                caregiver_feeling: cg.caregiver_feeling || "",
                caregiver_function: cg.caregiver_function || "",
                caregiver_expectation: cg.caregiver_expectation || "",
                isNew: true,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching new caregivers:", error);
      }
    };

    if (id) {
      fetchNewCaregivers();
    }
  }, [id]); // ✅ ไม่ใส่ replaceNew ใน dependency เพื่อป้องกัน override ค่าผิดพลาด


  /** ✅ อัปเดตข้อมูลทุกครั้งที่มีการเปลี่ยนแปลง */
  const handleFieldChange = () => {
    const existingData = existingCaregivers.map((cg, index) => ({
      CaregiverId: cg.CaregiverId || "",
      firstName: getValues(`existingCaregivers.${index}.firstName`) || cg.firstName || "",
      lastName: getValues(`existingCaregivers.${index}.lastName`) || cg.lastName || "",
      relationship: getValues(`existingCaregivers.${index}.relationship`) || cg.relationship || "",
      caregiver_idea: getValues(`existingCaregivers.${index}.caregiver_idea`) || "",
      caregiver_feeling: getValues(`existingCaregivers.${index}.caregiver_feeling`) || "",
      caregiver_function: getValues(`existingCaregivers.${index}.caregiver_function`) || "",
      caregiver_expectation: getValues(`existingCaregivers.${index}.caregiver_expectation`) || "",
      isNew: false,
    }));

    const newData = newCaregivers.map((cg, index) => ({
      firstName: getValues(`newCaregivers.${index}.firstName`) || cg.firstName || "",
      lastName: getValues(`newCaregivers.${index}.lastName`) || cg.lastName || "",
      relationship: getValues(`newCaregivers.${index}.relationship`) || "",
      caregiver_idea: getValues(`newCaregivers.${index}.caregiver_idea`) || "",
      caregiver_feeling: getValues(`newCaregivers.${index}.caregiver_feeling`) || "",
      caregiver_function: getValues(`newCaregivers.${index}.caregiver_function`) || "",
      caregiver_expectation: getValues(`newCaregivers.${index}.caregiver_expectation`) || "",
      isNew: true,
    }));

    onDataChange({
      existingCaregivers: existingData,
      newCaregivers: newData,
    });
    // ✅ บันทึกข้อมูลแยก userId ลง `localStorage`
    if (userid) {
      localStorage.setItem(getLocalStorageKey("caregiverAgendaData"), JSON.stringify({
        existingCaregivers: existingData,
        newCaregivers: newData,
      }));
    }
  };

  return (
    <div>
      <div className="title-form mt-1">
        <div className="header">
          <b>Caregiver Agenda</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-person-check" style={{ color: "#008000" }}></i> ประเมินผู้ดูแลเบื้องต้น</p>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="m-4">
          <b>ข้อมูลผู้ดูแล</b>
          {existingCaregivers.map((caregiver, index) => (
            <div key={caregiver.id}>
              <span
                onClick={() => toggleCollapse(index, "existing")}
                style={{ cursor: "pointer", color: "#007BFF", display: "block" }}
              >
                <b>{`ผู้ดูแลคนที่ ${index + 1} : ${caregiver.firstName} ${caregiver.lastName} (${caregiver.relationship})`}</b>
              </span>
              <Collapse in={openIndex.existing === index}>
                <div>
                  <label className="form-label mt-2">Idea <span style={{ color: "#666", fontSize: "15px" }}>(ระบุแนวคิดหลักเกี่ยวกับบทบาทของผู้ดูแล เช่น หน้าที่ในการดูแล)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.caregiver_idea`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />
                  <label className="form-label mt-4">Feeling <span style={{ color: "#666", fontSize: "15px" }}>(ระบุความรู้สึกของผู้ดูแลว่ามีความกังวลในการดูแลผู้ป่วยหรือไม่)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.caregiver_feeling`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />
                  <label className="form-label mt-4">Function <span style={{ color: "#666", fontSize: "15px" }}>(ระบุหน้าที่ที่ผู้ดูแลต้องทำในแต่ละวัน)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.caregiver_function`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />
                  <label className="form-label mt-4">Expectation <span style={{ color: "#666", fontSize: "15px" }}>(ระบุสิ่งที่ผู้ดูแลคาดหวัง เช่น การอบรม คำแนะนำการดูแล)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.caregiver_expectation`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />
                </div>
              </Collapse>
            </div>
          ))}
          {/* <div className="mt-2">
            <b >ข้อมูลคนในครอบครัว</b>
          </div> */}
          {/* {newCaregivers.map((caregiver, index) => (
            <div key={caregiver.id}>
              <span
                onClick={() => toggleCollapse(index, "new")}
                style={{ cursor: "pointer", color: "#007BFF", display: "block", marginTop: "8px" }}
              >
                <b>{`คนที่ ${index + 1} : ${caregiver.firstName} ${caregiver.lastName} (${caregiver.relationship})`}</b>
              </span>
              <Collapse in={openIndex.new === index}>
                <div>
                  <label className="form-label mt-2">Idea <span style={{ color: "#666", fontSize: "15px" }}>(ระบุว่ามีส่วนร่วมในกระบวนการดูแลผู้ป่วยอย่างไร เช่น การแบ่งหน้าที่กับผู้ดูแลหลัก)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.caregiver_idea`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />
                  <label className="form-label mt-4">Feeling <span style={{ color: "#666", fontSize: "15px" }}>(ระบุว่าคนในครอบครัวรู้สึกอย่างไรเกี่ยวกับการดูแลผู้ป่วย)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.caregiver_feeling`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />
                  <label className="form-label mt-4">Function <span style={{ color: "#666", fontSize: "15px" }}>(ระบุว่าคนในครอบครัวคาดหวังอะไรจากระบบการดูแล เช่น การสนับสนุนเพิ่มเติม)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.caregiver_function`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />
                  <label className="form-label mt-4">Expectation <span style={{ color: "#666", fontSize: "15px" }}>(ระบุความรู้สึกของผู้ดูแลว่ามีความกังวลในการดูแลผู้ป่วยหรือไม่)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.caregiver_expectation`}
                    control={control}
                    render={({ field }) => (
                      <textarea
                        className="form-control"
                        placeholder="กรอกคำตอบ"
                        rows="2"
                        style={{ resize: "vertical" }}
                        {...field} onChange={(e) => {
                          field.onChange(e);
                          handleFieldChange();
                        }} />
                    )}
                  />

                </div>
              </Collapse>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
};
