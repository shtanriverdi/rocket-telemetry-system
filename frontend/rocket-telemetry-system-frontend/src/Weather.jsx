import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Socket.io server address, autoconnect is on
const socket = io("http://localhost:3000/weather");

export default function Weather() {
  // Socket connection state
  const [isConnected, setIsConnected] = useState("Disconnected");

  // Weather state
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
    time: "*",
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
    const runFethingData = async () => {
      socket.on("weatherData", (data) => {
        setWeatherData(data);
        setIsConnected("Connected");
      });

      // Triggers re-rendering
      setWeatherData((prevData) => ({ ...prevData }));

      return () => {
        setIsConnected("Disconnected");
        socket.disconnect();
      };
    };

    runFethingData();
  }, []);

  return (
    <>
      <h1>Weather Status</h1>
      <p>Socket: {isConnected}</p>
      <p>Temperature: {weatherData.temperature} °C</p>
      <p>Humidity: {weatherData.humidity}</p>
      <p>Pressure: {weatherData.pressure}</p>
      <p>Time: {weatherData.time}</p>
      <p>probability: {weatherData.precipitation.probability}</p>
      <p>rain: {weatherData.precipitation.rain.toString()}</p>
      <p>snow: {weatherData.precipitation.snow.toString()}</p>
      <p>sleet: {weatherData.precipitation.sleet.toString()}</p>
      <p>hail: {weatherData.precipitation.hail.toString()}</p>
      <p>Wind: {weatherData.wind.direction}</p>
      <p>direction: {weatherData.wind.angle}</p>
      <p>speed: {weatherData.wind.speed}</p>
      <button
        onClick={() => {
          handleSocketConnection("Connected");
        }}>
        Run System
      </button>
    </>
  );
}
