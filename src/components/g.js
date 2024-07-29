useEffect(() => {
    const fetchDataBloodPressure = async () => {
      try {
        if (patientFormsone.user) {
          const response = await fetch(
            `http://localhost:5000/getBloodPressureData/${patientFormsone.user}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await response.json();
          if (data.status === "ok") {
            const filteredData = filterDataByTimeRange(data.data);
            setBloodPressureData(filteredData);
          } else {
            console.error("Error fetching Blood Pressure data");
          }
        }
      } catch (error) {
        console.error("Error fetching Blood Pressure data:", error);
      }
    };

    fetchDataBloodPressure();
  }, [patientFormsone.user, timeRange]);