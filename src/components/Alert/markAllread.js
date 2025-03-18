export const markAllAsRead = (token, setAlerts, setUnreadCount) => {
    fetch(`https://backend-deploy-render-mxok.onrender.com/alerts/markAllAsRead`, {
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