import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Controller, useFormContext } from "react-hook-form";
import { Collapse } from "@material-ui/core";

export const CaregiverAgenda = ({ onDataChange }) => {
  const { control, setValue } = useFormContext();
  const [caregivers, setCaregivers] = useState([]);
  const [newCaregivers, setNewCaregivers] = useState([]);
  const [careAgenda, setCareAgenda] = useState([]);
  const [openIndex, setOpenIndex] = useState(null); // ควบคุมฟอร์มที่เปิดอยู่
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
        firstName: c.name,
        lastName: c.surname,
        caregiver_idea: "",
        caregiver_feeling: "",
        caregiver_function: "",
        caregiver_expectation: "",
      })),
      ...newCaregivers.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
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
      <div className="info3 card mt-4">
        <div className="header">
          <b>Caregiver Agenda</b>
        </div>
        <div className="m-4">
          {careAgenda.map((item, index) => (
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
                  {[{ name: "caregiver_idea", label: "Idea" },
                    { name: "caregiver_feeling", label: "Feeling" },
                    { name: "caregiver_function", label: "Function" },
                    { name: "caregiver_expectation", label: "Expectation" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="form-label">{field.label}:</label>
                      <Controller
                        name={`careAgenda_${index}_${field.name}`}
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
