export const renderAlerts = (
  alerts,
  token,
  userId,
  navigate,
  setAlerts,
  setUnreadCount,
  formatDate
) => {
  return alerts.map((alert) => {
    let alertContent = null;
    let alertClass = "";

    if (alert.alertType === "assessment") {
      alertClass = "alert-assessment"; 
      alertContent = (
        <div>
        <p className="alert-mpersonnel">
        <span className="alert-nametitle-mp">{alert.MPersonnel?.nametitle || ""}</span>{" "}
         {alert.MPersonnel?.name || "Unknown"} {alert.MPersonnel?.surname || "Unknown"}  
        </p>
         <p>
         ประเมินอาการของ{" "}
          ผู้ป่วย{" "}
          <span className="alert-name">
            {alert.user?.name || "Unknown"} {alert.user?.surname || "Unknown"}
          </span>{" "}
          เป็น{" "}
          {alert.alertMessage === "เคสฉุกเฉิน" ? (
            <span className="status-alert emergency-alert-message">{alert.alertMessage}</span> // ✅ กรอบแดง
          ) : (
            <span  className={`status-alert ${
              alert.alertMessage === "ปกติ" ? "status-normal" :
              alert.alertMessage === "ผิดปกติ" ? "status-abnormal" :
              alert.alertMessage === "สิ้นสุดการรักษา" ? "status-completed" :
              ""
            }`}>{alert.alertMessage}</span>
          )}
         </p>
        </div> 
      );
    } 
    else if (alert.alertType === "abnormal" || alert.alertType === "normal") {
      alertClass = alert.alertType === "abnormal" ? "alert-abnormal" : "alert-normal";
      alertContent = (
      <div>
        <p>
          <span className="alert-nametitle-user">
          ผู้ป่วย
          </span> 
          {" "}
          <span className="alert-name">
            {alert.user?.name || "Unknown"} {alert.user?.surname || "Unknown"}
          </span> 
        </p>
        <p className={`status-alert ${alert.alertType === "abnormal" ? "abnormal-alert-message" : ""}`}>
        {alert.alertMessage}
        </p>
        </div>
       
      );
    } 
    
    else {
      alertClass = "alert-default";
      alertContent = (
        <p>
          <span className="alert-name">
            {alert.user?.name || "Unknown"} {alert.user?.surname || "Unknown"}
          </span>{" "}
          {alert.alertMessage}
        </p>
      );
    }

    return (
      <div
        key={alert._id}
        className={`alert-item ${alertClass} ${
          Array.isArray(alert.viewedBy) && alert.viewedBy.includes(userId)
            ? ""
            : "not-viewed"
        }`}
        onClick={async () => {
          if (!alert._id) {
            console.error("Error: alert._id is undefined or null");
            return;
          }
          try {
            const response = await fetch(
              `https://backend-deploy-render-mxok.onrender.com/alerts/${alert._id}/viewed`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
              }
            );

            if (!response.ok) {
              throw new Error("Network response was not ok");
            }

            const updatedAlerts = alerts.map((a) =>
              a._id === alert._id
                ? { ...a, viewedBy: [...a.viewedBy, userId] }
                : a
            );
            setAlerts(updatedAlerts);
            navigate("/assessmentuserone", {
              state: { id: alert.patientFormId },
            });
            setUnreadCount(
              updatedAlerts.filter(
                (a) => !Array.isArray(a.viewedBy) || !a.viewedBy.includes(userId)
              ).length
            );
          } catch (error) {
            console.error("Error updating alert:", error);
          }
        }}
      >
        {alertContent}

        {alert.alertType === "abnormal" || alert.alertType === "normal" ? (
          <p className="alert-date">
            {!alert.patientFormUpdatedAt ||
            alert.patientFormUpdatedAt === alert.patientFormCreatedAt
              ? `บันทึกเมื่อ: ${formatDate(alert.patientFormCreatedAt || "Unknown")}`
              : `แก้ไขเมื่อ: ${formatDate(alert.patientFormUpdatedAt)}`}
          </p>
        ) : (
          <>
            <p className="alert-date">
              ข้อมูลบันทึกวันที่: {formatDate(alert.patientFormCreatedAt || "Unknown")}
            </p>
            {alert.createdAtAss && (
              <p className="alert-date">เวลาที่ประเมิน: {formatDate(alert.createdAtAss)}</p>
            )}
          </>
        )}
      </div>
    );
  });
};
