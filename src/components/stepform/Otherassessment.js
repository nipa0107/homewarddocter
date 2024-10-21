import React from 'react'
import { useFormContext } from 'react-hook-form';

export const Otherassessment = () => {
  const { register } = useFormContext();

  return (
    <div>
      <div className="info3 card mt-4">
        <div className="header">
          <b>Patient Assessment</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p>ประเมินผู้ป่วยเบื้องต้น</p>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Idea :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('idea')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Feeling :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('feeling')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Function :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('function')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Expectation :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('expectation')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-4">
        <div className="header">
          <b>Caregiver Assessment</b>
        </div>
        <div style={{ marginLeft: '26px' }}>
          <p>ประเมินผู้ดูแลเบื้องต้นน</p>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Care (ดูแลเรื่องอะไรบ้าง) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Care')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Affection (ส่งผลต่อตนเองอย่างไรบ้าง) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Affection')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Rest (มีเวลาพักผ่อนบ้างหรือไม่) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Rest')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Empathy (การแสดงความเข้าอกเข้าใจเป็นอย่างไรบ้าง)
            :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Empathy')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Goal of care (เป้าหมายในการรักษาของผู้ดูแลคืออะไร) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Goalofcare')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Information (การให้ข้อมูล ความรู้เพิ่มเติม) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Information')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Ventilation (การรับฟังความกังวลใจ) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Ventilation')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Empowerment (การให้กำลังใจ) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Empowerment')} />
          </div>
        </div>
      </div>
      <div className="info3 card mt-3">
        <div className='m-4'>
          <label className="form-label">Resource (แนะนำช่องทางช่วยเหลือ) :</label><br></br>
          <div>
            <input type="text"
              className="google-form-input"
              placeholder="กรอกคำตอบ"
              {...register('Resource')} />
          </div>
        </div>
      </div>
    </div>
  );
}
