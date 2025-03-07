import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFormContext } from "react-hook-form";
import Collapse from '@mui/material/Collapse';

export const CaregiverAssessment = ({ onDataChange }) => {
  const { control, setValue } = useFormContext();
  const [caregivers, setCaregivers] = useState([]);
  const [newCaregivers, setNewCaregivers] = useState([]);
  const [careAssessment, setCareAssessment] = useState([]);
  const [openIndex, setOpenIndex] = useState(0);
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
        firstName: c.firstName,
        lastName: c.lastName,
        relationship: c.relationship,
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
        relationship: c.relationship,
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
      <div className="title-form mt-1">
        <div className="header">
          <b>Caregiver Assessment</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p style={{ color: "#666" }}><i class="bi bi-person-check" style={{ color: "#008000" }}></i> ประเมินภาระในการดูแลและปัญหาสุขภาพจิตของผู้ดูแล</p>
        </div>
      </div>
      <div className="m-4">

        {careAssessment.map((item, index) => (
          <div key={item.id}>
            <span
              onClick={() => toggleFormVisibility(index)}
              style={{
                cursor: "pointer",
                // textDecoration: "underline",
                color: "#007BFF",
                display: "block", // ทำให้แต่ละบรรทัดเป็น block
                marginTop: "20px",
                transition: "color 0.3s ease", // ทำให้การเปลี่ยนสีมีการเคลื่อนไหว
              }}
              onMouseEnter={(e) => e.target.style.color = "#95d7ff"} // เมื่อ hover
              onMouseLeave={(e) => e.target.style.color = "#007BFF"} // เมื่อออกจาก hover
            >
              <b > {`ผู้ดูแลคนที่ ${index + 1}. ${item.firstName} ${item.lastName} (${item.relationship})`}</b>
            </span>
            <Collapse in={openIndex === index}>
              <div >
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
                    <label className="form-label mt-3">{field.label} :</label>
                    <Controller
                      name={`careAssessment_${index}_${field.name}`}
                      control={control}
                      render={({ field: controllerField }) => (
                        <textarea
                          className="form-control"
                          placeholder="กรอกคำตอบ"
                          rows="2" // กำหนดจำนวนแถวเริ่มต้น
                          style={{ resize: "vertical" }}
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
  );
};
