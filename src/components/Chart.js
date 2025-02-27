import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const DoughnutChartComponent = ({ data, colors = ['#0088FE', '#f9a8d4', '#9ca3af'] }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            animationBegin={0}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
          {/* <Legend verticalAlign="bottom" align="center" /> */}
        </PieChart>
        
      </ResponsiveContainer>
      {/* เพิ่มคำอธิบายแบบวงกลม */}
      
    </div>
  );
};

export default DoughnutChartComponent;
