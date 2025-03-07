import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFormContext } from "react-hook-form";
import Collapse from '@mui/material/Collapse';

export const CaregiverAgenda = ({ onDataChange }) => {
  const { control, setValue } = useFormContext();
  const [caregivers, setCaregivers] = useState([]);
  const [newCaregivers, setNewCaregivers] = useState([]);
  const [careAgenda, setCareAgenda] = useState([]);
  const [openIndex, setOpenIndex] = useState(0); // ควบคุมฟอร์มที่เปิดอยู่
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


  // อัปเดต careAgenda เมื่อข้อมูล caregivers หรือ newCaregivers ถูกโหลด
  useEffect(() => {
    const combinedCaregivers = [
      ...caregivers.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        relationship: c.relationship,
        caregiver_idea: "",
        caregiver_feeling: "",
        caregiver_function: "",
        caregiver_expectation: "",
      })),
      ...newCaregivers.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        relationship: c.relationship,
        caregiver_idea: "",
        caregiver_feeling: "",
        caregiver_function: "",
        caregiver_expectation: "",
      })),
    ];
    setCareAgenda(combinedCaregivers);
  }, [caregivers, newCaregivers]);

  // ส่งข้อมูลที่อัปเดตกลับไปยัง Parent ผ่าน onDataChange
  useEffect(() => {
    onDataChange(careAgenda);
  }, [careAgenda]);

  const toggleFormVisibility = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleInputChange = (index, field, value) => {
    setCareAgenda((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
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
      <div className="m-4">
        {careAgenda.map((item, index) => (
          <div key={item.id}>
            <span
              onClick={() => toggleFormVisibility(index)}
              style={{
                cursor: "pointer",
                color: "#007BFF",
                display: "block", // ทำให้แต่ละบรรทัดเป็น block
                marginTop: "20px",
                transition: "color 0.3s ease", // ทำให้การเปลี่ยนสีมีการเคลื่อนไหว
              }}
              onMouseEnter={(e) => e.target.style.color = "#95d7ff"} // เมื่อ hover
              onMouseLeave={(e) => e.target.style.color = "#007BFF"} // เมื่อออกจาก hover
            >
              <b>{`ผู้ดูแลคนที่ ${index + 1}. ${item.firstName} ${item.lastName} (${item.relationship})`}</b>
            </span>

            <Collapse in={openIndex === index}>
              <div>
                {[{ name: "caregiver_idea", label: "Idea" },
                { name: "caregiver_feeling", label: "Feeling" },
                { name: "caregiver_function", label: "Function" },
                { name: "caregiver_expectation", label: "Expectation" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="form-label mt-2">{field.label} :</label>
                    <Controller
                      name={`careAgenda_${index}_${field.name}`}
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
