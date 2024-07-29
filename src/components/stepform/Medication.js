import React, { useState } from "react";
import { useForm, Controller, useFormContext } from 'react-hook-form';

export const Medication = () => {
  const { register, control } = useFormContext();
  const [medicationData, setMedicationData] = useState({
    prescribedMedication: '',
    actualMedication: '',
    supplements: '',
    administration: '', // New state for radio group
    consistency: '', // New state for radio group
  });

  return (
    <div className="info3 card mt-4">
      <div className="header" align="center">
        <b>Medication</b>
      </div>
      <div className='m-4'>
        <table className='nutrition-table'>
          <tbody>
            <tr>
              <td>ยาที่แพทย์สั่ง:</td>
              <td colSpan="2">
                <Controller
                  name="prescribedMedication"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="กรอกยาที่แพทย์สั่ง"
                      {...field}
                      value={medicationData.prescribedMedication}
                      onChange={(e) => {
                        field.onChange(e);
                        setMedicationData({ ...medicationData, prescribedMedication: e.target.value });
                      }}
                    />
                  )}
                />
              </td>
            </tr>
            <tr>
              <td>การใช้ยาจริง:</td>
              <td colSpan="2">
                <Controller
                  name="actualMedication"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="กรอกการใช้ยาจริง"
                      {...field}
                      value={medicationData.actualMedication}
                      onChange={(e) => {
                        field.onChange(e);
                        setMedicationData({ ...medicationData, actualMedication: e.target.value });
                      }}
                    />
                  )}
                />
              </td>
            </tr>
            <tr>
              <td>อาหารเสริม:</td>
              <td colSpan="2">
                <Controller
                  name="supplements"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="กรอกอาหารเสริม"
                      {...field}
                      value={medicationData.supplements}
                      onChange={(e) => {
                        field.onChange(e);
                        setMedicationData({ ...medicationData, supplements: e.target.value });
                      }}
                    />
                  )}
                />
              </td>
            </tr>
            <tr>
              <td>การบริหารยา:</td>
              <td>
                <input
                  type="radio"
                  {...register("administration")}
                  value="selfAdministered"
                  checked={medicationData.administration === "selfAdministered"}
                  onChange={(e) => setMedicationData({ ...medicationData, administration: e.target.value })}
                /> จัดยาด้วยตนเอง
              </td>
              <td>
                <input
                  type="radio"
                  {...register("administration")}
                  value="administeredByOther"
                  checked={medicationData.administration === "administeredByOther"}
                  onChange={(e) => setMedicationData({ ...medicationData, administration: e.target.value })}
                /> มีคนจัดยาให้
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <input
                  type="radio"
                  {...register("administration")}
                  value="selfTaken"
                  checked={medicationData.administration === "selfTaken"}
                  onChange={(e) => setMedicationData({ ...medicationData, administration: e.target.value })}
                /> กินยาด้วยตัวเอง
              </td>
              <td>
                <input
                  type="radio"
                  {...register("administration")}
                  value="preparedEachMeal"
                  checked={medicationData.administration === "preparedEachMeal"}
                  onChange={(e) => setMedicationData({ ...medicationData, administration: e.target.value })}
                /> มีคนเตรียมยาแต่ละมื้อให้
              </td>
            </tr>
            <tr>
              <td>ความสม่ำเสมอ:</td>
              <td>
                <input
                  type="radio"
                  {...register("consistency")}
                  value="consistent"
                  checked={medicationData.consistency === "consistent"}
                  onChange={(e) => setMedicationData({ ...medicationData, consistency: e.target.value })}
                /> สม่ำเสมอทุกวัน
              </td>
              <td>
                <input
                  type="radio"
                  {...register("consistency")}
                  value="occasionalMiss"
                  checked={medicationData.consistency === "occasionalMiss"}
                  onChange={(e) => setMedicationData({ ...medicationData, consistency: e.target.value })}
                /> หลงลืมบางครั้ง
              </td>
            </tr>
            <tr>
              <td></td>
              <td colSpan="2">
                <input
                  type="radio"
                  {...register("consistency")}
                  value="inconsistent"
                  checked={medicationData.consistency === "inconsistent"}
                  onChange={(e) => setMedicationData({ ...medicationData, consistency: e.target.value })}
                /> ไม่สม่ำเสมอ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
