import React from 'react'
import { useFormContext } from 'react-hook-form';

export const SSS = () => {
  const { register } = useFormContext();

  return (
    <div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>S:Safety S:Spiritual S:Service</b>
        </div>
        <div className='m-4'>
          <b>Safety</b>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td>แสงไฟ</td>
                <td><input type="radio" name="cleanliness" value="ปลอดภัย" {...register('cleanliness')} /> ปลอดภัย</td>
                <td><input type="radio" name="cleanliness" value="ไม่ปลอดภัย" {...register('cleanliness')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>พื้นต่างระดับ</td>
                <td><input type="radio" name="floorSafety" value="ปลอดภัย" {...register('floorSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="floorSafety" value="ไม่ปลอดภัย" {...register('floorSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>บันได</td>
                <td><input type="radio" name="stairsSafety" value="ปลอดภัย" {...register('stairsSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="stairsSafety" value="ไม่ปลอดภัย" {...register('stairsSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>ราวจับ</td>
                <td><input type="radio" name="handrailSafety" value="ปลอดภัย" {...register('handrailSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="handrailSafety" value="ไม่ปลอดภัย" {...register('handrailSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>เหลี่ยมคม</td>
                <td><input type="radio" name="sharpEdgesSafety" value="ปลอดภัย" {...register('sharpEdgesSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="sharpEdgesSafety" value="ไม่ปลอดภัย" {...register('sharpEdgesSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>ความลื่นของพื้น</td>
                <td><input type="radio" name="slipperyFloorSafety" value="ปลอดภัย" {...register('slipperyFloorSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="slipperyFloorSafety" value="ไม่ปลอดภัย" {...register('slipperyFloorSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>ลักษณะโถส้วม</td>
                <td><input type="radio" name="toiletSafety" value="ปลอดภัย" {...register('toiletSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="toiletSafety" value="ไม่ปลอดภัย" {...register('toiletSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>เตาที่ใช้หุงต้ม</td>
                <td><input type="radio" name="stoveSafety" value="ปลอดภัย" {...register('stoveSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="stoveSafety" value="ไม่ปลอดภัย" {...register('stoveSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>การเก็บของ/การวางของในบ้าน เช่น มีด</td>
                <td><input type="radio" name="storageSafety" value="ปลอดภัย" {...register('storageSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="storageSafety" value="ไม่ปลอดภัย" {...register('storageSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>น้ำที่ใช้ดื่ม</td>
                <td><input type="radio" name="waterSafety" value="ปลอดภัย" {...register('waterSafety')} /> ปลอดภัย</td>
                <td><input type="radio" name="waterSafety" value="ไม่ปลอดภัย" {...register('waterSafety')} /> ไม่ปลอดภัย</td>
              </tr>
              <tr>
                <td>อันตรายอื่นๆ</td>
                <td colSpan="2">
                  <input type="text" className="form-control" placeholder="อื่นๆ" {...register('otherHazards')} />
                </td>
              </tr>
              <tr>
                <td>ภาวะฉุกเฉิน ติดต่อความช่วยเหลืออย่างไร</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('emergencyContact')} />
                </td>
              </tr>
              <b>Spiritual</b>
              <tr>
                <td>Faith and belief:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('faithBelief')} />
                </td>
              </tr>
              <tr>
                <td>Importance:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('importance')} />
                </td>
              </tr>
              <tr>
                <td>Community:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('community')} />
                </td>
              </tr>
              <tr>
                <td>Address in care:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('addressInCare')} />
                </td>
              </tr>
              <tr>
                <td>Love:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('love')} />
                </td>
              </tr>
              <tr>
                <td>Religion:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('religion')} />
                </td>
              </tr>
              <tr>
                <td>Forgiveness:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('forgiveness')} />
                </td>
              </tr>
              <tr>
                <td>Hope:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('hope')} />
                </td>
              </tr>
              <tr>
                <td>Meaning of life:</td>
                <td colSpan="2">
                  <input type="text" className="form-control" {...register('meaningOfLife')} />
                </td>
              </tr>
              <b>Service</b>
              <tr>
                <td>เมื่อเจ็บป่วย ท่านรับบริการที่ใด:</td>
                <td>
                  <input type="checkbox" {...register('serviceLocation')} /> โรงพยาบาลรัฐ
                </td>
                <td>
                  <input type="text" className="form-control" placeholder='ระบุชื่อโรงพยาบาล' {...register('serviceHospital')} />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="checkbox" {...register('privateHospital')} /> โรงพยาบาลเอกชน
                </td>
                <td>
                  <input type="text" className="form-control" placeholder='ระบุชื่อโรงพยาบาล' {...register('privateHospitalName')} />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="checkbox" {...register('privateClinic')} /> คลินิกเอกชน
                </td>
                <td>
                  <input type="text" className="form-control" placeholder='ระบุคลินิกเอกชน' {...register('privateClinicName')} />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="checkbox" {...register('communityCenter')} /> ศูนย์ชุมชน
                </td>
                <td>
                  <input type="text" className="form-control" placeholder='ระบุศูนย์ชุมชน' {...register('communityCenterName')} />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="checkbox" {...register('pharmacy')} /> ร้านขายยา
                </td>
                <td>
                  <input type="text" className="form-control" placeholder='ระบุร้านขายยา' {...register('pharmacyName')} />
                </td>
              </tr>
              <tr>
                <td>อื่นๆ</td>
                <td colSpan={2}>
                  <input type="text" className="form-control"  placeholder="อื่นๆ"  {...register('otherServices')} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
