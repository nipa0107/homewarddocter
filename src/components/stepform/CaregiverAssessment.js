import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import Collapse from '@mui/material/Collapse';

export const CaregiverAssessment = ({ userid,onDataChange }) => {
  const { control, getValues } = useFormContext();
  const { fields: existingCaregivers, replace: replaceExisting } = useFieldArray({ control, name: "existingCaregivers" });
  const { fields: newCaregivers, replace: replaceNew } = useFieldArray({ control, name: "newCaregivers" });
  const [openIndex, setOpenIndex] = useState({ existing: 0, new: null });
  const location = useLocation();
  const { id } = location.state || {};

   const getLocalStorageKey = (key) =>  `agenda_${userid}_${key}`;

  useEffect(() => {
    if (!userid) return; // ถ้า userId ไม่มีค่าให้หยุดทำงาน
    const savedData = JSON.parse(localStorage.getItem(getLocalStorageKey("careAssessmentData")));
  
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

  useEffect(() => {
    if (userid) {
      localStorage.setItem(getLocalStorageKey("careAssessmentData"), JSON.stringify({
      existingCaregivers: getValues("existingCaregivers") || [],
      newCaregivers: getValues("newCaregivers") || []
    }));
  }
  }, [existingCaregivers, newCaregivers, getValues, userid]);

  useEffect(() => {
    handleFieldChange(); // อัปเดตข้อมูลเมื่อ existingCaregivers เปลี่ยนแปลง
  }, [existingCaregivers, newCaregivers, getValues]);

  /** ✅ เปิด/ปิด Collapse */
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
                care: cg.care || "",
                affection: cg.affection || "",
                rest: cg.rest || "",
                empathy: cg.empathy || "",
                goalOfCare: cg.goalOfCare || "",
                information: cg.information || "",
                ventilation: cg.ventilation || "",
                empowerment: cg.empowerment || "",
                resource: cg.resource || "",
                isNew: false,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch caregivers:", error);
      }
    };
    if (id) {
      fetchCaregivers();
    }
  }, [id, replaceExisting, getValues]);

  useEffect(() => {
    const fetchNewCaregivers = async () => {
      try {
        const response = await fetch(`https://backend-deploy-render-mxok.onrender.com/getcaregivesotherpeople/${id}`);
        const data = await response.json();
        console.log("Fetched new caregivers:", data); // ตรวจสอบข้อมูลใน console
        if (data.status === "ok" && Array.isArray(data.data)) {
          if (getValues("newCaregivers").length === 0) {
            replaceNew(
              data.data.map((cg) => ({
                firstName: cg.firstName || "",
                lastName: cg.lastName || "",
                relationship: cg.relationship || "ไม่ระบุความสัมพันธ์",
                care: cg.care || "",
                affection: cg.affection || "",
                rest: cg.rest || "",
                empathy: cg.empathy || "",
                goalOfCare: cg.goalOfCare || "",
                information: cg.information || "",
                ventilation: cg.ventilation || "",
                empowerment: cg.empowerment || "",
                resource: cg.resource || "",
                isNew: false,
              }))
            );
          }
        } else {
          console.error("Failed to fetch new caregivers:", data.message);
        }
      } catch (error) {
        console.error("Error fetching new caregivers:", error);
      }
    };

    if (id) {
      fetchNewCaregivers();
    }
  }, [id]);

  /** ✅ อัปเดตข้อมูลทุกครั้งที่มีการเปลี่ยนแปลง */
  const handleFieldChange = () => {
    const existingData = existingCaregivers.map((cg, index) => ({
      CaregiverId: cg.CaregiverId || "",
      firstName: getValues(`existingCaregivers.${index}.firstName`) || cg.firstName || "",
      lastName: getValues(`existingCaregivers.${index}.lastName`) || cg.lastName || "",
      relationship: getValues(`existingCaregivers.${index}.relationship`) || cg.relationship || "",
      care: getValues(`existingCaregivers.${index}.care`) || "",
      affection: getValues(`existingCaregivers.${index}.affection`) || "",
      rest: getValues(`existingCaregivers.${index}.rest`) || "",
      empathy: getValues(`existingCaregivers.${index}.empathy`) || "",
      goalOfCare: getValues(`existingCaregivers.${index}.goalOfCare`) || "",
      information: getValues(`existingCaregivers.${index}.information`) || "",
      ventilation: getValues(`existingCaregivers.${index}.ventilation`) || "",
      empowerment: getValues(`existingCaregivers.${index}.empowerment`) || "",
      resource: getValues(`existingCaregivers.${index}.resource`) || "",
      isNew: false,
    }));

    const newData = newCaregivers.map((cg, index) => ({
      firstName: getValues(`newCaregivers.${index}.firstName`) || cg.firstName || "",
      lastName: getValues(`newCaregivers.${index}.lastName`) || cg.lastName || "",
      relationship: getValues(`newCaregivers.${index}.relationship`) || cg.relationship || "",
      care: getValues(`newCaregivers.${index}.care`) || "",
      affection: getValues(`newCaregivers.${index}.affection`) || "",
      rest: getValues(`newCaregivers.${index}.rest`) || "",
      empathy: getValues(`newCaregivers.${index}.empathy`) || "",
      goalOfCare: getValues(`newCaregivers.${index}.goalOfCare`) || "",
      information: getValues(`newCaregivers.${index}.information`) || "",
      ventilation: getValues(`newCaregivers.${index}.ventilation`) || "",
      empowerment: getValues(`newCaregivers.${index}.empowerment`) || "",
      resource: getValues(`newCaregivers.${index}.resource`) || "",
      isNew: false,
    }));

    onDataChange({
      existingCaregivers: existingData,
      newCaregivers: newData,
    });

    if (userid) {
      localStorage.setItem(getLocalStorageKey("careAssessmentData"), JSON.stringify({
        existingCaregivers: existingData,
        newCaregivers: newData,
      }));
    }
  };

  return (
    <div>
      <div className="title-form mt-1">
        <div className="header">
          <b>Caregiver Assessment</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-person-check" style={{ color: "#008000" }}></i> ประเมินภาระในการดูแลและปัญหาสุขภาพจิตของผู้ดูแล</p>
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
                  <label className="form-label mt-2">Care <span style={{ color: "#666", fontSize: "15px" }}>(ดูแลเรื่องอะไรบ้าง)</span> </label>
                  <Controller
                    name={`existingCaregivers.${index}.care`}
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
                  <label className="form-label mt-4">Affection <span style={{ color: "#666", fontSize: "15px" }}>(ส่งผลต่อตนเองอย่างไรบ้าง)</span> </label>
                  <Controller
                    name={`existingCaregivers.${index}.affection`}
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
                  <label className="form-label mt-4">Rest <span style={{ color: "#666", fontSize: "15px" }}>(มีเวลาพักผ่อนบ้างหรือไม่)</span> </label>
                  <Controller
                    name={`existingCaregivers.${index}.rest`}
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
                  <label className="form-label mt-4">Empathy <span style={{ color: "#666", fontSize: "15px" }}>(การแสดงความเข้าอกเข้าใจเป็นอย่างไรบ้าง) </span></label>
                  <Controller
                    name={`existingCaregivers.${index}.empathy`}
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
                  <label className="form-label mt-4">Goal of care <span style={{ color: "#666", fontSize: "15px" }}>(เป้าหมายในการรักษาของผู้ดูแลคืออะไร)</span> </label>
                  <Controller
                    name={`existingCaregivers.${index}.goalOfCare`}
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
                  <label className="form-label mt-4">Information <span style={{ color: "#666", fontSize: "15px" }}>(การให้ข้อมูล ความรู้เพิ่มเติม)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.information`}
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
                  <label className="form-label mt-4">Ventilation <span style={{ color: "#666", fontSize: "15px" }}>(การรับฟังความกังวลใจ)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.ventilation`}
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
                  <label className="form-label mt-4">Empowerment <span style={{ color: "#666", fontSize: "15px" }}>(การให้กำลังใจ)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.empowerment`}
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
                  <label className="form-label mt-4">Resource <span style={{ color: "#666", fontSize: "15px" }}>(แนะนำช่องทางช่วยเหลือ)</span></label>
                  <Controller
                    name={`existingCaregivers.${index}.resource`}
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
          <div className="mt-2">
            <b >ข้อมูลคนในครอบครัว</b>
          </div>
          {newCaregivers.map((caregiver, index) => (
            <div key={caregiver.id}>
              <span
                onClick={() => toggleCollapse(index, "new")}
                style={{ cursor: "pointer", color: "#007BFF", display: "block", marginTop: "8px" }}
              >
                <b>{`คนที่ ${index + 1} : ${caregiver.firstName} ${caregiver.lastName} (${caregiver.relationship})`}</b>
              </span>
              <Collapse in={openIndex.new === index}>
                <div>
                  <label className="form-label mt-2">Care <span style={{ color: "#666", fontSize: "15px" }}>(ดูแลเรื่องอะไรบ้าง)</span> </label>
                  <Controller
                    name={`newCaregivers.${index}.care`}
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
                  <label className="form-label mt-4">Affection <span style={{ color: "#666", fontSize: "15px" }}>(ส่งผลต่อตนเองอย่างไรบ้าง)</span> </label>
                  <Controller
                    name={`newCaregivers.${index}.affection`}
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
                  <label className="form-label mt-4">Rest <span style={{ color: "#666", fontSize: "15px" }}>(มีเวลาพักผ่อนบ้างหรือไม่)</span> </label>
                  <Controller
                    name={`newCaregivers.${index}.rest`}
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
                  <label className="form-label mt-4">Empathy <span style={{ color: "#666", fontSize: "15px" }}>(การแสดงความเข้าอกเข้าใจเป็นอย่างไรบ้าง)</span> </label>
                  <Controller
                    name={`newCaregivers.${index}.empathy`}
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
                  <label className="form-label mt-4">Goal of care <span style={{ color: "#666", fontSize: "15px" }}>(เป้าหมายในการรักษาของผู้ดูแลคืออะไร)</span> </label>
                  <Controller
                    name={`newCaregivers.${index}.goalOfCare`}
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
                  <label className="form-label mt-4">Information <span style={{ color: "#666", fontSize: "15px" }}>(การให้ข้อมูล ความรู้เพิ่มเติม)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.information`}
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
                  <label className="form-label mt-4">Ventilation <span style={{ color: "#666", fontSize: "15px" }}>(การรับฟังความกังวลใจ)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.ventilation`}
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
                  <label className="form-label mt-4">Empowerment <span style={{ color: "#666", fontSize: "15px" }}>(การให้กำลังใจ)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.empowerment`}
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
                  <label className="form-label mt-4">Resource <span style={{ color: "#666", fontSize: "15px" }}>(แนะนำช่องทางช่วยเหลือ)</span></label>
                  <Controller
                    name={`newCaregivers.${index}.resource`}
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
        </div>
      </div>
    </div>
  );
};
