            <div className="contentgraph">
              <div className="inline-containers">
                <div className="graph-label">
                  <div className="Temperature"></div>
                  <span className="head-graph">อุณหภูมิ (°C)</span>
                </div>
              </div>
              {patientdata && (
                 <div className="chart-wrapper"> 
                <div className="chart-containerass1">
                <ResponsiveContainer width={chartWidth} height={chartHeight}>

                    <ComposedChart
                      // width={1000}
                      // height={300}
                      data={patientdata}
                       margin={
                           timeRange === "1month"
                             ? { top: 10, right: 30, left: 0, bottom: 0 }  
                             : { top: 10, right: 30, left: 0, bottom: 10 } 
                         }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      {/* <XAxis
                        dataKey="createdAt"
                        tickFormatter={formatDateTime}
                        interval="preserveStartEnd"
                        minTickGap={5}
                        tickLine={timeRange === "1month" ? false : true}
                        tick={
                          timeRange === "1month"
                            ? false
                            : { fontSize: 10, lineHeight: 1.5 }
                        }
                      />{" "} */}
                        <XAxis 
                          dataKey="createdAt"
                          tickFormatter={timeRange === "1month" ? undefined : formatDateTime} 
                          interval="preserveStartEnd"
                          minTickGap={5}
                          tickLine={timeRange === "1month" ? false : true}
                          tick={
                            timeRange === "1month"
                              ? false
                              : (props) => {
                                  const { x, y, payload } = props;
                                  const formattedText = formatDateTime(payload.value).split("\n"); // แยกบรรทัด
                                  const fontSize = window.innerWidth < 768 ? 8 : 10;
                                  return (
                                    <g transform={`translate(${x},${y+10})`}>
                                      <text textAnchor="middle"fontSize={fontSize} fill="#666" >
                                        <tspan x="0" dy="0">{formattedText[0]}</tspan>
                                        <tspan x="0" dy="1.2em">{formattedText[1]}</tspan>
                                      </text>
                                    </g>
                                  );
                                }
                          }
                        />
                      <YAxis
                        domain={[30, 40]}
                        tick={{ fontSize: window.innerWidth < 768 ? 8 : 10 }} 
                        ticks={[30, 32, 34, 36, 38, 40]}
                        // hide={timeRange !== "1month"}
                      />
                      <Tooltip content={<CustomTooltipTemperature />} />
                      <ReferenceLine
                        y={min.Temperature}
                        stroke="#00b300"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Min",
                          fill: "#00b300",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <ReferenceLine
                        y={max.Temperature}
                        stroke="#ff0000"
                        strokeDasharray="5 5"
                        label={{
                          position: "right",
                          value: "Max",
                          fill: "#ff0000",
                          fontSize: dynamicFontSize,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Temperature"
                        stroke="rgb(229, 113, 63)"
                        fill="rgb(229, 113, 63,0.3)"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="Temperature"
                        stroke="#e5713f"
                        strokeWidth={3}
                        dot={timeRange === "1month" ? false : { r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1500}
                        connectNulls={true}
                      >
                        {/* {timeRange !== "1month" && (
                          <LabelList
                            dataKey="Temperature"
                            position="inside"
                            style={{ fill: "white", fontSize: "10" }}
                          />
                        )} */}
                      </Line>
                      {/* {timeRange === "1month" && (
                      <Brush
                        tickFormatter={formatDateTime}
                        dataKey="createdAt"
                        height={15}
                        style={{ fontSize: "10" }}
                        stroke="#878787"
                      />
                    )} */}
                    </ComposedChart>
                  </ResponsiveContainer>
                  
                </div>
                
                </div>
                
              )}
              {timeRange === "1month" &&
                patientdata &&
                patientdata.length > 0 && (
                  <p className="textgraph">
                    ข้อมูลระหว่างวันที่ {formatDate(patientdata[0].createdAt)} -{" "}
                    {formatDate(patientdata[patientdata.length - 1].createdAt)}
                  </p>
                )}
            </div>