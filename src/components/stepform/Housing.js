import React, { useState } from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Housing = () => {
  const { control, register, getValues } = useFormContext();
  const [hasPets, setHasPets] = useState(false);

  return (
    <div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Housing</b>
        </div>
        <div className='m-4'>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td><b>สภาพแวดล้อมในบ้าน</b></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>ลักษณะบ้าน: </td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                  />
                </td>
              </tr>
              <tr>
                <td>วัสดุที่ใช้ทำ: </td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                  />
                </td>
              </tr>
              <tr>
                <td>มีกี่ชั้น:</td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                  />
                </td>
              </tr>
              <tr>
                <td>มีกี่ห้อง:</td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                  />
                </td>
              </tr>
              <tr>
                <td>ผู้ป่วยอาศัยอยู่ชั้นไหน:</td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Home environment</b>
        </div>
        <div className='m-4'>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td>ความสะอาดในบ้าน:</td>
                <td><input type="radio" name="cleanliness" value="สะอาด" {...register("cleanliness")} /> สะอาด</td>
                <td><input type="radio" name="cleanliness" value="ไม่สะอาด" {...register("cleanliness")} /> ไม่สะอาด</td>
              </tr>
              <tr>
                <td>ความเป็นระเบียบเรียบร้อยในบ้าน</td>
                <td><input type="radio" name="orderliness" value="เป็นระเบียบเรียบร้อย" {...register("orderliness")} /> เป็นระเบียบเรียบร้อย</td>
                <td><input type="radio" name="orderliness" value="ไม่เป็นระเบียบเรียบร้อย" {...register("orderliness")} /> ไม่เป็นระเบียบเรียบร้อย</td>
              </tr>
              <tr>
                <td>แสงสว่างในบ้าน:</td>
                <td><input type="radio" name="lighting" value="แสงสว่างเพียงพอ" {...register("lighting")} /> แสงสว่างเพียงพอ</td>
                <td><input type="radio" name="lighting" value="แสงไม่เพียงพอ" {...register("lighting")} /> แสงไม่เพียงพอ</td>
              </tr>
              <tr>
                <td>อากาศภายในบ้าน:</td>
                <td><input type="radio" name="ventilation" value="อากาศถ่ายเทสะดวก" {...register("ventilation")} /> อากาศถ่ายเทสะดวก</td>
                <td><input type="radio" name="ventilation" value="อากาศถ่ายเทไม่สะดวก" {...register("ventilation")} /> อากาศถ่ายเทไม่สะดวก</td>
              </tr>
              <tr>
                <td>สภาพสิ่งแวดล้อมรอบๆบ้าน:</td>
                <td><input type="checkbox" name="environment" value="ชื้นแฉะ มีน้ำขังเป็นย่อมๆ" {...register("environment")} /> ชื้นแฉะ มีน้ำขังเป็นย่อมๆ</td>
                <td><input type="checkbox" name="environment" value="หญ้าหรือต้นไม้ขึ้นรอบๆ" {...register("environment")} /> หญ้าหรือต้นไม้ขึ้นรอบๆ</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="checkbox" name="environment" value="มีรั้วบ้านล้อมรอบ" {...register("environment")} /> มีรั้วบ้านล้อมรอบ</td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td colSpan="2">
                  <input
                    type="checkbox"
                    checked={hasPets}
                    onChange={(e) => setHasPets(e.target.checked)}
                  /> เลี้ยงสัตว์ใต้ถุนบ้าน/รอบๆบ้าน หากมี ระบุชนิดของสัตว์
                </td>
              </tr>
              {hasPets && (
                <tr>
                  <td></td>
                  <td colSpan="2">
                    <Controller
                      name="petType"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <input
                          type='text'
                          className="form-control"
                          placeholder="ระบุชนิดของสัตว์"
                          {...field}
                        />
                      )}
                    />
                  </td>
                </tr>
              )}
              <tr>
                <td>อื่นๆ ระบุ:</td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="อื่นๆ"
                    {...register("other_home_environment")}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Neighbors</b>
        </div>
        <div className='m-4'>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td><b>ลักษณะของเพื่อนบ้าน</b></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>จำนวนเพื่อนบ้าน: </td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ระบุตัวเลข"
                  />
                </td>
              </tr>
              <tr>
                <td>ความสัมพันธ์กับเพื่อนบ้าน: </td>
                <td>
                  <input
                    type="radio"
                  /> ดี 
                </td>
                <td><input
                    type="radio"
                  /> ไม่ดี</td>
              </tr>
              <tr>
                <td></td>
                <td colSpan="2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ความสัมพันธ์อื่นๆ"
                    {...register("OtherRelationshipNeighbor")}
                  />
                </td>
              </tr>
              <tr>
                <td>ความช่วยเหลือกันของเพื่อนบ้าน: </td>
                <td>
                  <input
                    type="radio"
                  /> ช่วยเหลือกันดีเมื่อมีปัญหา
                </td>
                <td><input
                    type="radio"
                  /> ไม่ช่วยเหลือกัน</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
