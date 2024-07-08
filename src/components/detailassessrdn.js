import React from 'react';

const Result = ({ data }) => (
  <div>
    <h2>ผลการประเมิน</h2>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);

export default Result;
