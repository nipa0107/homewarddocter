import React from 'react'
import { Controller, useFormContext } from 'react-hook-form';

export const SSS = ({ onDataChange }) => {
  const { control, register, setValue, getValues, watch } = useFormContext();
  // Function to update array-based values
  const handleInputChange = (group, name, value) => {
    const currentValues = getValues(group) || {}; // ใช้ Object เป็นค่าเริ่มต้น
    const updatedValues = { ...currentValues, [name]: value }; // อัปเดตค่าของคีย์ใน Object
    setValue(group, updatedValues); // ตั้งค่าใหม่ในฟอร์ม
    if (onDataChange) {
      onDataChange({ [group]: updatedValues }); // ส่งข้อมูลกลับไปยัง Parent Component
    }
  };

  return (
    <div>
      <div className="info3 card">
        <div className="header">
          <b>SSS Assessment</b>
        </div>
        <div style={{ marginLeft: '26px', marginTop: '20px', lineHeight: '25px' }}>
          <p>S = Safety</p>
          <p>S = Spiritual Health</p>
          <p>S = Service</p>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className='m-4'>
          <b>Safety (ความปลอดภัย)</b>
          <table className='nutrition-table'>
            <thead>
              <tr>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <thead>
              <tr>
                <th></th>
                <th>ปลอดภัย</th>
                <th>ไม่ปลอดภัย</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "cleanliness", label: "1. แสงไฟ" },
                { name: "floorSafety", label: "2. พื้นต่างระดับ" },
                { name: "stairsSafety", label: "3. บันได" },
                { name: "handrailSafety", label: "4. ราวจับ" },
                { name: "sharpEdgesSafety", label: "5. เหลี่ยมคม" },
                { name: "slipperyFloorSafety", label: "6. ความลื่นของพื้น" },
                { name: "toiletSafety", label: "7. ลักษณะโถส้วม" },
                { name: "stoveSafety", label: "8. เตาที่ใช้หุงต้ม" },
                { name: "storageSafety", label: "9. การเก็บของในบ้าน" },
                { name: "waterSafety", label: "10. น้ำที่ใช้ดื่ม" },
              ].map((item) => (
                <tr key={item.name}>
                  <td>{item.label}</td>
                  <td>
                    <Controller
                      name={`Safety.${item.name}`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          type="radio"
                          value="ปลอดภัย"
                          checked={field.value === "ปลอดภัย"}
                          style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleInputChange("Safety", item.name, e.target.value);
                          }}
                        />
                      )}
                    />
                  </td>
                  <td>
                    <Controller
                      name={`Safety.${item.name}`}
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          type="radio"
                          value="ไม่ปลอดภัย"
                          checked={field.value === "ไม่ปลอดภัย"}
                          style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            handleInputChange("Safety", item.name, e.target.value);
                          }}
                        />
                      )}
                    />
                  </td>
                </tr>
              ))}


            </tbody>
          </table>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อันตรายอื่นๆ (ถ้ามี) :</label><br></br>
          <div>
            <Controller
              name="Safety.otherHealthHazards"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Safety", "otherHealthHazards", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร :</label><br></br>
          <div>
            <Controller
              name="Safety.emergencyContact"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Safety", "emergencyContact", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header">
          <b>Spiritual Health</b>
        </div>
        <div style={{ marginLeft: '26px', marginTop: '20px', lineHeight: '25px' }}>
          <p>จิตวิญญาณ</p>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Faith and belief :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.faithBelief"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "faithBelief", e.target.value);
                  }}
                />
              )}
            />

          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Importance :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.importance"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "importance", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Community :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.community"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "community", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Address in care :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.addressInCare"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "addressInCare", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Love :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.love"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "love", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Religion :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.religion"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "religion", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Forgiveness :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.forgiveness"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "forgiveness", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Hope :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.hope"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "hope", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Meaning of life :</label><br></br>
          <div>
            <Controller
              name="SpiritualHealth.meaningOfLife"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("SpiritualHealth", "meaningOfLife", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header">
          <b>Service</b>
        </div>
        <div style={{ marginLeft: '26px', marginTop: '20px', lineHeight: '25px' }}>
          <p>การรับบริการ เช่น โรงพยาบาล สถานพยาบาล คลินิก ร้านขายยา</p>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="m-4">
          <label className="form-label">เมื่อเจ็บป่วย ท่านรับบริการที่ใด :</label><br />
          <p style={{ color: 'gray' }}>(ให้ระบุชื่อสถานที่ สามารถกรอกได้มากกว่า 1 สถานที่)</p>
          <div>
            <Controller
              name="Service.serviceLocation"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  className="google-form-input"
                  placeholder="ระบุชื่อสถานที่"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Service", "serviceLocation", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className="m-4">
          <label className="form-label">อื่นๆ (ถ้ามี):</label><br />
          <div>
            <Controller
              name="Service.otherServices"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  type="text"
                  className="google-form-input"
                  placeholder="กรอกคำตอบ"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleInputChange("Service", "otherServices", e.target.value);
                  }}
                />
              )}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
