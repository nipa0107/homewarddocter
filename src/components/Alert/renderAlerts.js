export const renderAlerts = (
  alerts,
  token,
  userId,
  navigate,
  setAlerts,
  setUnreadCount,
  formatDate
) => {
  return alerts.map((alert) => (
    <div
      key={alert._id}
      className={`alert-item ${
        Array.isArray(alert.viewedBy) && alert.viewedBy.includes(userId)
          ? ""
          : "not-viewed"
      }`}
      onClick={async () => {
        if (!alert._id) {
          console.error("Error: alert._id is undefined or null");
          return; // หาก alert._id ไม่มีค่า ก็หยุดการทำงาน
        }
        try {
          const response = await fetch(
            `http://localhost:5000/alerts/${alert._id}/viewed`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ userId }), // ส่ง userId ไปกับ request body
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
            state: { id: alert.patientFormId},
          });
          setUnreadCount(
            updatedAlerts.filter(
              (a) => !Array.isArray(a.viewedBy) || !a.viewedBy.includes(userId)
            ).length
          );

          // const updatedAlerts = alerts.map(a =>
          //   a._id === alert._id ? { ...a, viewedBy: [...a.viewedBy, userId] } : a
          // );
          // setAlerts(updatedAlerts);
          // setUnreadCount(updatedAlerts.filter(a => !Array.isArray(a.viewedBy) || !a.viewedBy.includes(userId)).length);
        } catch (error) {
          console.error("Error updating alert:", error);
        }
      }}
    >
      {/* <p >
        คุณ: {alert.user?.name || "Unknown"} {alert.user?.surname || "Unknown"}
      </p>
      <p
        className={
          alert.alertMessage === "เป็นเคสฉุกเฉิน"
            ? "emergency-alert-message"
            : ""
        }
      >
        {alert.alertMessage}
      </p> */}
      {alert.alertMessage === "เป็นเคสฉุกเฉิน" ? (
  <p>
    คุณ: {alert.user?.name || "Unknown"} {alert.user?.surname || "Unknown"}{" "}
    <span className="emergency-alert-message">{alert.alertMessage}</span>
  </p>
) : (
  <>
    <p>
      คุณ: {alert.user?.name || "Unknown"} {alert.user?.surname || "Unknown"}
    </p>
    <p>{alert.alertMessage}</p>
  </>
)}

      <p>ผู้ป่วยบันทึกเมื่อ: {formatDate(alert.patientFormCreatedAt|| "Unknown")}
      </p>
      {/* <p>ผู้ป่วยบันทึกเมื่อ: {formatDate(alert.createdAt || "Unknown")}</p> */}

      {alert.createdAtAss && (
        <p>เวลาที่ประเมิน: {formatDate(alert.createdAtAss)}</p>
      )}
{!alert.alertMessage.includes("เป็นเคสฉุกเฉิน") &&
  alert.patientFormUpdatedAt &&
  alert.patientFormUpdatedAt !== alert.patientFormCreatedAt && (
    <p>แก้ไขเมื่อ: {formatDate(alert.patientFormUpdatedAt)}</p>
)}
      {/* {alert.patientFormUpdatedAt && alert.patientFormUpdatedAt !== alert.patientFormCreatedAt && (
        <p>แก้ไขเมื่อ: {formatDate(alert.patientFormUpdatedAt)}</p>
      )}{" "} */}
      {!Array.isArray(alert.viewedBy) || !alert.viewedBy.includes(userId) ? (
        <span className="unread-dotnoti"></span>
      ) : null}
    </div>
  ));
};
