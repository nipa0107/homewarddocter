export const markAllAsRead = (token, setAlerts, setUnreadCount) => {
    fetch(`http://localhost:5000/alerts/markAllAsRead`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((updatedAlerts) => {
        setAlerts(updatedAlerts);
        setUnreadCount(0);
      })
      .catch((error) => {
        console.error("Error marking all alerts as read:", error);
      });
  };