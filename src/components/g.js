{BloodPressuredata && (
    <div className="chart-containerass">
      <ComposedChart
        width={1500}
        height={400}
        data={BloodPressuredata}
        margin={{ right: 45, left: 45 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="createdAt"
          tickFormatter={formatDateTime}
          interval={0}
          minTickGap={5}
          tickLine={timeRange === "1month" ? false : true}
          tick={
            timeRange === "1month"
              ? false
              : { fontSize: 12, lineHeight: 1.5 }
          }
        />
        {timeRange === "1month" && <YAxis />}
        <Tooltip content={<CustomTooltipBloodPressure />} />
        {/* <Legend verticalAlign="top" align="center" wrapperStyle={{ color: '#000' }} /> */}
        <Area
          type="monotone"
          dataKey="SBP"
          stroke="#5ec1ff"
          fill="rgb(94, 193, 255,0.3)"
          connectNulls={true}
          dot={
            timeRange === "1month" ? (
              false
            ) : (
              <CustomDot dataKey="SBP" />
            )
          }
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="SBP"
          name="ความดันตัวบน"
          stroke="#5ec1ff"
          strokeWidth={3}
          dot={
            timeRange === "1month" ? (
              false
            ) : (
              <CustomDot dataKey="SBP" />
            )
          }
          connectNulls={true}
        >
          {timeRange !== "1month" && (
            <LabelList
              dataKey="SBP"
              position="inside"
              style={{ fill: "white", fontSize: "12px" }}
              dot={<CustomDot dataKey="SBP" />}
            />
          )}
        </Line>
        <Area
          type="monotone"
          dataKey="DBP"
          stroke="rgb(44, 223, 71)"
          fill="rgb(44, 223, 71,0.3)"
          connectNulls={true}
          legendType="none"
        />
        <Line
          type="monotone"
          dataKey="DBP"
          name="ความดันตัวล่าง"
          stroke="rgb(44, 223, 71)"
          strokeWidth={3}
          dot={
            timeRange === "1month" ? (
              false
            ) : (
              <CustomDot dataKey="DBP" />
            )
          }
          connectNulls={true}
        >
          {timeRange !== "1month" && (
            <LabelList
              dataKey="DBP"
              position="inside"
              style={{ fill: "white", fontSize: "12px" }}
              dot={<CustomDot dataKey="DBP" />}
            />
          )}
        </Line>
        {timeRange === "1month" && (
          <Brush
            tickFormatter={formatDateTime}
            dataKey="createdAt"
            height={15}
            style={{ fontSize: "12px" }}
            stroke="#878787"
          />
        )}
      </ComposedChart>
    </div>
  )}