import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFormContext } from "react-hook-form";
import Collapse from '@mui/material/Collapse';

export const CaregiverAssessment = ({ onDataChange }) => {
  const { control, setValue } = useFormContext();
  const [caregivers, setCaregivers] = useState([]);
  const [newCaregivers, setNewCaregivers] = useState([]);
  const [careAssessment, setCareAssessment] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const location = useLocation();
  const { id } = location.state || {};

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getCaregiverstoAgenda/${id}`);
        const data = await response.json();
        if (data.status === "ok") {
          setCaregivers(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch caregivers:", error);
      }
    };

    if (id) fetchCaregivers();
  }, [id]);

  useEffect(() => {
    const fetchNewCaregivers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getcaregivesotherpeople/${id}`);
        const data = await response.json();
        console.log("Fetched new caregivers:", data); // ตรวจสอบข้อมูลใน console
        if (data.status === "ok") {
          setNewCaregivers(data.data); // อัปเดต state newCaregivers
        } else {
          console.error("Failed to fetch new caregivers:", data.message);
        }
      } catch (error) {
        console.error("Error fetching new caregivers:", error);
      }
    };
  
    if (id) fetchNewCaregivers();
  }, [id]);

  useEffect(() => {
    const combinedCaregivers = [
      ...caregivers.map((c) => ({
        id: c.id,
        firstName: c.name,
        lastName: c.surname,
        care: "",
        affection: "",
        rest: "",
        empathy: "",
        goalOfCare: "",
        information: "",
        ventilation: "",
        empowerment: "",
        resource: "",
      })),
      ...newCaregivers.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        care: "",
        affection: "",
        rest: "",
        empathy: "",
        goalOfCare: "",
        information: "",
        ventilation: "",
        empowerment: "",
        resource: "",
      })),
    ];
    setCareAssessment(combinedCaregivers);
  }, [caregivers, newCaregivers]);

  useEffect(() => {
    onDataChange(careAssessment);
  }, [careAssessment]);

  const toggleFormVisibility = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleInputChange = (index, field, value) => {
    setCareAssessment((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  return (
    <div>
      <div className="info3 card mt-4">
        <div className="header">
          <b>Caregiver Assessment</b>
        </div>
        <div className="m-4">
          {careAssessment.map((item, index) => (
            <div key={item.id}>
              <span
                onClick={() => toggleFormVisibility(index)}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#5cb3fd",
                  marginBottom: "8px",
                }}
              >
                {`คนที่ ${index + 1}. ${item.firstName} ${item.lastName}`}
              </span>
              <Collapse in={openIndex === index}>
                <div className="p-2">
                  {[
                    { name: "care", label: "Care (ดูแลเรื่องอะไรบ้าง)" },
                    { name: "affection", label: "Affection (ส่งผลต่อตนเองอย่างไรบ้าง)" },
                    { name: "rest", label: "Rest (มีเวลาพักผ่อนบ้างหรือไม่)" },
                    { name: "empathy", label: "Empathy (การแสดงความเข้าอกเข้าใจเป็นอย่างไรบ้าง)" },
                    { name: "goalOfCare", label: "Goal of care (เป้าหมายในการรักษาของผู้ดูแลคืออะไร)" },
                    { name: "information", label: "Information (การให้ข้อมูล ความรู้เพิ่มเติม)" },
                    { name: "ventilation", label: "Ventilation (การรับฟังความกังวลใจ)" },
                    { name: "empowerment", label: "Empowerment (การให้กำลังใจ)" },
                    { name: "resource", label: "Resource (แนะนำช่องทางช่วยเหลือ)" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="form-label">{field.label}:</label>
                      <Controller
                        name={`careAssessment_${index}_${field.name}`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <input
                            type="text"
                            className="google-form-input"
                            placeholder="กรอกคำตอบ"
                            {...controllerField}
                            value={item[field.name]}
                            onChange={(e) => {
                              controllerField.onChange(e);
                              handleInputChange(index, field.name, e.target.value);
                            }}
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
