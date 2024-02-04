import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Socket.io server address
const socket = io("http://localhost:3000/weather-telemetry", {
  autoConnect: false,
});

export default function Weather() {
  // Weather state
  const [isConnected, setIsConnected] = useState(false);
  const [weatherData, setWeatherData] = useState({
    temperature: 0,
    humidity: 0,
    pressure: 0,
    precipitation: {
      probability: 0,
      rain: false,
      snow: false,
      sleet: false,
      hail: false,
    },
    time: "2024",
    wind: {
      direction: "*",
      angle: 0,
      speed: 0,
    },
  });

  const handleSocketConnection = (isConnected) => {
    setIsConnected(isConnected);
  };

  // Handles connect/disconnect to server socket
  useEffect(() => {
    // no-op if the socket is already connected
    socket.connect();

    // Close the socket on unmount of component
    // To prevent duplicate event registrations
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array to run only once

  // Listens to weather data and connection events
  useEffect(() => {
    // Listen for weather data
    socket.on("weatherData", (data) => {
      console.log("Socket connected");
      console.log("Received weather data:", data);
      setWeatherData(data);
      handleSocketConnection(true); // Update connection status
    });

    // Listen for disconnection
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      handleSocketConnection(false); // Update connection status
    });
  }, [socket]); // Run when socket changes

  return (
    <>
      <h1>Weather Status</h1>
      <p>Socket: {isConnected.toString()}</p>
      <p>Humidity: {weatherData.humidity}</p>
      <p>probability: {weatherData.precipitation.probability}</p>
      <p>rain: {weatherData.precipitation.rain}</p>
      <p>snow: {weatherData.precipitation.snow}</p>
      <p>sleet: {weatherData.precipitation.sleet}</p>
      <p>hail: {weatherData.precipitation.hail}</p>
      <p>Pressure: {weatherData.pressure}</p>
      <p>Temperature: {weatherData.temperature}</p>
      <p>Time: {weatherData.time}</p>
      <p>Wind: {weatherData.wind.direction}</p>
      <p>direction: {weatherData.wind.angle}</p>
      <p>speed: {weatherData.wind.speed}</p>
      <button
        onClick={() => {
          handleSocketConnection(true);
        }}>
        Run System
      </button>
    </>
  );
}
