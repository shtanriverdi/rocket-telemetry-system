import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Socket.io server address
const socket = io("http://localhost:3000/weather-telemetry");

export default function Weather() {
  // Weather state
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [weatherData, setWeatherData] = useState({
    temperature: 44.49625110792446,
    humidity: 0.37254237437334053,
    pressure: 1063.8342725422417,
    precipitation: {
      probability: 0.14629280109282006,
      rain: false,
      snow: false,
      sleet: false,
      hail: false,
    },
    time: "2024-02-03T12:49:03.005984",
    wind: {
      direction: "SW",
      angle: 113.98393803672059,
      speed: 22.481814742673823,
    },
  });

  const handleSocketConnection = (isConnected) => {
    setIsConnected(isConnected);
  };

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
      handleSocketConnection(false);
    });

    // Close the socket on unmount of component
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <h1>Weather Status</h1>
      <p>Socket: {isConnected}</p>
      <p>Humidity: {weatherData.humidity}</p>
      {/* <p>Precipitation: {weatherData.precipitation}</p> */}
      <p>Pressure: {weatherData.pressure}</p>
      <p>Temperature: {weatherData.temperature}</p>
      <p>Time: {weatherData.time}</p>
      {/* <p>Wind: {weatherData.wind}</p> */}
      {/* <p>Angle: {weatherData.angle}</p> */}
      {/* <p>Direction: {weatherData.direction}</p> */}
    </>
  );
}
