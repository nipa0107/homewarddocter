import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import Collapse from '@mui/material/Collapse';

export const CaregiverAgenda = ({ onDataChange }) => {
  const { control, getValues, setValue } = useFormContext();
  const { fields: existingCaregivers, replace: replaceExisting } = useFieldArray({ control, name: "existingCaregivers" });
  const { fields: newCaregivers, replace: replaceNew } = useFieldArray({ control, name: "newCaregivers" });

  const [openIndex, setOpenIndex] = useState({ existing: 0, new: null });
  const location = useLocation();
  const { id } = location.state || {};

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

  /** ✅ ดึงข้อมูลผู้ดูแลเดิมจาก API */
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getCaregiverstoAgenda/${id}`);
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
                caregiver_funtion: cg.caregiver_function || "",
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

  /** ✅ ดึงข้อมูลผู้ดูแลใหม่จาก API */
  useEffect(() => {
    const fetchNewCaregivers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getcaregivesotherpeople/${id}`);
        const data = await response.json();

        if (data.status === "ok" && Array.isArray(data.data)) {
          if (getValues("newCaregivers").length === 0) {
            replaceNew(
              data.data.map((cg) => ({
                firstName: cg.firstName || "",
                lastName: cg.lastName || "",
                relationship: cg.relationship || "ไม่ระบุความสัมพันธ์", 
                caregiver_idea: cg.caregiver_idea || "",
                caregiver_feeling: cg.caregiver_feeling || "",
                caregiver_funtion: cg.caregiver_function || "",
                caregiver_expectation: cg.caregiver_expectation || "",
                isNew: false,
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
  }, [id, replaceNew, getValues]);

  /** ✅ อัปเดตข้อมูลทุกครั้งที่มีการเปลี่ยนแปลง */
  const handleFieldChange = () => {
    const existingData = existingCaregivers.map((cg, index) => ({
      CaregiverId: cg.CaregiverId || "",
      firstName: getValues(`existingCaregivers.${index}.firstName`) || cg.firstName || "",
      lastName: getValues(`existingCaregivers.${index}.lastName`) || cg.lastName || "",
      relationship: getValues(`existingCaregivers.${index}.relationship`) || cg.relationship || "",
      caregiver_idea: getValues(`existingCaregivers.${index}.caregiver_idea`) || "",
      caregiver_feeling: getValues(`existingCaregivers.${index}.caregiver_feeling`) || "",
      caregiver_funtion: getValues(`existingCaregivers.${index}.caregiver_function`) || "",
      caregiver_expectation: getValues(`existingCaregivers.${index}.caregiver_expectation`) || "",
      isNew: false,
    }));

    const newData = newCaregivers.map((cg, index) => ({
      firstName: getValues(`newCaregivers.${index}.firstName`) || cg.firstName || "",
      lastName: getValues(`newCaregivers.${index}.lastName`) || cg.lastName || "",
      relationship: getValues(`newCaregivers.${index}.relationship`) || "",
      caregiver_idea: getValues(`newCaregivers.${index}.caregiver_idea`) || "",
      caregiver_feeling: getValues(`newCaregivers.${index}.caregiver_feeling`) || "",
      caregiver_funtion: getValues(`newCaregivers.${index}.caregiver_function`) || "",
      caregiver_expectation: getValues(`newCaregivers.${index}.caregiver_expectation`) || "",
      isNew: true,
    }));

    onDataChange({
      existingCaregivers: existingData,
      newCaregivers: newData,
    });
  };

  return (
    <div>
      <div className="title-form mt-1">
        <div className="header">
          <b>Caregiver Agenda</b>
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
                  <label className="form-label mt-2">Idea </label>
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
                  <label className="form-label mt-4">Feeling </label>
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
                  <label className="form-label mt-4">Funtion </label>
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
                  <label className="form-label mt-4">Expectation </label>
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
          <div className="mt-2">
            <b >ข้อมูลคนในครอบครัว</b>
          </div>
          {newCaregivers.map((caregiver, index) => (
            <div key={caregiver.id}>
              <span
                onClick={() => toggleCollapse(index, "new")}
                style={{ cursor: "pointer", color: "#007BFF", display: "block", marginTop:"8px" }}
              >
                <b>{`คนที่ ${index + 1} : ${caregiver.firstName} ${caregiver.lastName} (${caregiver.relationship})`}</b>
              </span>
              <Collapse in={openIndex.new === index}>
                <div>
                  <label className="form-label mt-2">Idea</label>
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
                  <label className="form-label mt-4">Feeling </label>
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
                  <label className="form-label mt-4">Function</label>
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
                  <label className="form-label mt-4">Expectation </label>
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
          ))}
        </div>
      </div>
    </div>
  );
};
