import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Socket.io server address, autoconnect is on
const socket = io("http://localhost:3000/weather");

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

  useEffect(() => {
    socket.on("weatherData", (data) => {
      console.log("");
      setWeatherData(data);
      setIsConnected(true);
    });

    return () => {
      setIsConnected(false);
      socket.disconnect();
    };
  }, []);

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
