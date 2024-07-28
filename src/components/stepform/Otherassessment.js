import React from 'react'
import { useFormContext } from 'react-hook-form';

export const Otherassessment = () => {
  const { register } = useFormContext();

  return (
    <div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Other Assessment</b>
        </div>
        <div className='m-4'>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td><b>Patient assessment</b></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Idea:</td>
                <td colSpan={"2"}>
                  <input
                    type="text"
                    className="form-control"
                    {...register('idea')}
                  />
                </td>
              </tr>
              <tr>
                <td>Feeling:</td>
                <td colSpan={"2"}>
                  <input
                    type="text"
                    className="form-control"
                    {...register('feeling')}
                  />
                </td>
              </tr>
              <tr>
                <td>Function:</td>
                <td colSpan={"2"}>
                  <input
                    type="text"
                    className="form-control"
                    {...register('function')}
                  />
                </td>
              </tr>
              <tr>
                <td>Expectation:</td>
                <td colSpan={"2"}>
                  <input
                    type="text"
                    className="form-control"
                    {...register('expectation')}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
