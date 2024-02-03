import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Socket.io server address
const socket = io("http://localhost:3000/weather-telemetry");

export default function Weather() {
  // Weather state
  const [weatherData, setWeatherData] = useState(null);

  // Runs only at the beginning
  useEffect(() => {
    // Listens weather data from the server
    socket.on("weatherData", (data) => {
      console.log("Received weather data:", data);
      setWeatherData(data);
    });

    // Listen disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      // Do stuff when disconnection happens
    });

    // Close the socket on unmount of component
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <h1>Weather Status</h1>
      <p>Wehather data: </p>
      {weatherData}
    </>
  );
}
