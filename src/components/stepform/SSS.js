import React from 'react'
import { Controller, useFormContext } from 'react-hook-form';

export const SSS = () => {
  const { control, register, setValue, getValues, watch } = useFormContext();

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
              <tr>
                <td>แสงไฟ</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="cleanliness" value="ปลอดภัย" {...register('cleanliness')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="cleanliness" value="ไม่ปลอดภัย" {...register('cleanliness')} /></td>
              </tr>
              <tr>
                <td>พื้นต่างระดับ</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="floorSafety" value="ปลอดภัย" {...register('floorSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="floorSafety" value="ไม่ปลอดภัย" {...register('floorSafety')} /></td>
              </tr>
              <tr>
                <td>บันได</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="stairsSafety" value="ปลอดภัย" {...register('stairsSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="stairsSafety" value="ไม่ปลอดภัย" {...register('stairsSafety')} /></td>
              </tr>
              <tr>
                <td>ราวจับ</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="handrailSafety" value="ปลอดภัย" {...register('handrailSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="handrailSafety" value="ไม่ปลอดภัย" {...register('handrailSafety')} /></td>
              </tr>
              <tr>
                <td>เหลี่ยมคม</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="sharpEdgesSafety" value="ปลอดภัย" {...register('sharpEdgesSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="sharpEdgesSafety" value="ไม่ปลอดภัย" {...register('sharpEdgesSafety')} /></td>
              </tr>
              <tr>
                <td>ความลื่นของพื้น</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="slipperyFloorSafety" value="ปลอดภัย" {...register('slipperyFloorSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="slipperyFloorSafety" value="ไม่ปลอดภัย" {...register('slipperyFloorSafety')} /></td>
              </tr>
              <tr>
                <td>ลักษณะโถส้วม</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="toiletSafety" value="ปลอดภัย" {...register('toiletSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="toiletSafety" value="ไม่ปลอดภัย" {...register('toiletSafety')} /></td>
              </tr>
              <tr>
                <td>เตาที่ใช้หุงต้ม</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="stoveSafety" value="ปลอดภัย" {...register('stoveSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="stoveSafety" value="ไม่ปลอดภัย" {...register('stoveSafety')} /></td>
              </tr>
              <tr>
                <td>การเก็บของ/การวางของในบ้าน เช่น มีด</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="storageSafety" value="ปลอดภัย" {...register('storageSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="storageSafety" value="ไม่ปลอดภัย" {...register('storageSafety')} /></td>
              </tr>
              <tr>
                <td>น้ำที่ใช้ดื่ม</td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="waterSafety" value="ปลอดภัย" {...register('waterSafety')} /></td>
                <td><input type="radio" style={{ transform: 'scale(1.5)', marginLeft: '5px' }} name="waterSafety" value="ไม่ปลอดภัย" {...register('waterSafety')} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อันตรายอื่นๆ (ถ้ามี) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('otherHazards')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('emergencyContact')} />
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
      {/* <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label"> :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('')} />
          </div>
        </div>
      </div> */}
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Faith and belief :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('faithBelief')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Importance :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('importance')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Community :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('community')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Address in care :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('addressInCare')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Love :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('love')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Religion :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('religion')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Forgiveness :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('forgiveness')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Hope :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('hope')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Meaning of life :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('meaningOfLife')} />
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
        <div className='m-4'>
          <label className="form-label">เมื่อเจ็บป่วย ท่านรับบริการที่ใด  :</label><br></br>
          <p style={{ color: 'gray' }}>(ให้ระบุชื่อสถานที่ สามารถกรอกได้มากกว่า 1 สถานที่)</p>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="ระบุชื่อสถานที่"
              {...register('serviceLocation')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">อื่นๆ (ถ้ามี) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('otherServices')} />
          </div>
        </div>
      </div>
    </div>
  );
}
