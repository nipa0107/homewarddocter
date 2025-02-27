export const fetchAlerts = async (token,userId) => {
  try {
    const response = await fetch(`http://localhost:5000/alerts?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const alertData = await response.json();
    const filteredAlerts = alertData.alerts.filter(alert => alert.user);

    return filteredAlerts;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};



