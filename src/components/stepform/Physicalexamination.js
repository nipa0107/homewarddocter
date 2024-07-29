import React from "react";
import { Controller, useFormContext } from 'react-hook-form';

export const Physicalexamination = () => {
  const { control } = useFormContext();
  
  return (
    <div>
      <div className="info3 card mt-4">
        <div className="header" align="center">
          <b>Physical Examination</b>
        </div>
        <div className='m-4'>
          <table className='nutrition-table'>
            <tbody>
              <tr>
                <td>V/S:</td>
                <td>
                  <Controller
                    name="temperature"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Temp(°C)"
                        {...field}
                      />
                    )}
                  />
                </td>
                <td>
                  <Controller
                    name="bloodPressure"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="BP(mmHg)"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <Controller
                    name="pulse"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="P(/min)"
                        {...field}
                      />
                    )}
                  />
                </td>
                <td>
                  <Controller
                    name="respiratoryRate"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="PR(/min)"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td>GA:</td>
                <td colSpan={"2"}>
                  <Controller
                    name="generalAppearance"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td>CVS:</td>
                <td colSpan={"2"}>
                  <Controller
                    name="cardiovascularSystem"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td>RS:</td>
                <td colSpan={"2"}>
                  <Controller
                    name="respiratorySystem"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td>Abd:</td>
                <td colSpan={"2"}>
                  <Controller
                    name="abdominal"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td>Ns:</td>
                <td colSpan={"2"}>
                  <Controller
                    name="nervousSystem"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td>Ext:</td>
                <td colSpan={"2"}>
                  <Controller
                    name="extremities"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        type="text"
                        className="form-control"
                        {...field}
                      />
                    )}
                  />
                </td>
              </tr>
              <tr>
                <td><b>Metal status examination</b></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Appearance and Behavior:</td>
                <td><input type="radio"></input> Cooperative</td>
                <td><input type="radio"></input> Guarded</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Candid</td>
                <td><input type="radio"></input> Defensive</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Relaxed</td>
                <td><input type="radio"></input> Irritable</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Open</td>
                <td><input type="radio"></input> Shy</td>
              </tr>
              <tr>
                <td>Eye contact:</td>
                <td><input type="radio"></input> Good</td>
                <td><input type="radio"></input> Sporadic</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Fleeting</td>
                <td><input type="radio"></input> none</td>
              </tr>
              <tr>
                <td>Mood and affect:</td>
                <td><input type="radio"></input> Euthymia</td>
                <td><input type="radio"></input> Depressed</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Apathetic</td>
                <td><input type="text" className="form-control" placeholder="อื่นๆ"></input></td>
              </tr>
              {/* <tr>
                <td></td>
                <td><input type="radio"></input></td>
                <td><input type="radio"></input></td>
              </tr> */}
              <tr>
                <td>Attention:</td>
                <td><input type="radio"></input> Adequate</td>
                <td><input type="radio"></input> Inadequate</td>
              </tr>
              <tr>
                <td>Orientation:</td>
                <td><input type="radio"></input> Place</td>
                <td><input type="radio"></input> Time</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Person</td>
                <td><input type="radio"></input> Situation</td>
              </tr>
              <tr>
                <td>Thought process:</td>
                <td><input type="radio"></input> Coherence</td>
                <td><input type="radio"></input> Tangential</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Disorganized</td>
                <td><input type="text" className="form-control" placeholder="อื่นๆ"></input></td>
              </tr>
              <tr>
                <td>Thought content:</td>
                <td><input type="radio"></input> Reality</td>
                <td><input type="radio"></input> Obsession</td>
              </tr>
              <tr>
                <td></td>
                <td><input type="radio"></input> Delusion</td>
                <td><input type="text" className="form-control" placeholder="อื่นๆ"></input></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
