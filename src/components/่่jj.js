export const renderAlerts = (alerts, token, navigate, setAlerts, setUnreadCount, formatDate) => {
  return alerts.map(alert => (
    <div
      key={alert._id}
      className={`alert-item ${alert.viewed ? '' : 'not-viewed'}`}
      onClick={async () => {
        try {
          const response = await fetch(`http://localhost:5000/alerts/${alert._id}/viewed`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          navigate("/assessmentuserone", {
            state: { id: alert.patientFormId},
          });

          const updatedAlerts = alerts.map(a =>
            a._id === alert._id ? { ...a, viewed: true } : a
          );
          setAlerts(updatedAlerts);
          setUnreadCount(updatedAlerts.filter(a => !a.viewed).length);
        } catch (error) {
          console.error("Error updating alert:", error);
        }
      }}
    >
      <p>คุณ: {alert.user.name} {alert.user.surname}</p>
      <p>{alert.alertMessage}</p>
      <p>{formatDate(alert.createdAt)}</p>
      {!alert.viewed && <span className="unread-dotnoti"></span>}
    </div>
  ));
};