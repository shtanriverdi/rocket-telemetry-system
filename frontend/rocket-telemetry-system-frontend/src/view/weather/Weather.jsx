import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { formatTime } from "../../utils/formatTime";
import "./style/weather.css";

const WEATHER_URL = "http://localhost:3000/weather";

// Socket.io server address, autoconnect is off
const socket = io(WEATHER_URL, {
  autoConnect: false,
});

export default function Weather() {
  // Socket connection has 3 states: { 0: disconnected, 1: connecting..., 2: connected }
  const [isConnected, setIsConnected] = useState(0);

  // Weather state
  const [weatherData, setWeatherData] = useState({
    temperature: 0,
    humidity: 0,
    pressure: 0,
    precipitation: {
      probability: 0,
      rain: 0,
      snow: 0,
      sleet: 0,
      hail: 0,
    },
    time: "0000-00-00T00:00:0.016020",
    wind: {
      direction: 0,
      angle: 0,
      speed: 0,
    },
  });

  const handleWeatherSocketConnection = async () => {
    // Connect weather socket
    if (isConnected === 0) {
      // Loading state
      setIsConnected(1);
      // Send conection signal to the server
      try {
        const response = await fetch(WEATHER_URL + "/on");
        const { response: data } = await response.json();
        if (data === "connected") {
          socket.connect();
          setIsConnected(2);
          return;
        }
      } catch (error) {
        console.log("error: ", error);
        // Otherwise, get back to initial state
        setIsConnected(0);
      }
    }
    // Close the donnection
    else if (isConnected === 2) {
      const response = await fetch(WEATHER_URL + "/off");
      const { response: data } = await response.json();
      console.log("data on close", data);
      socket.disconnect();
      socket.off("weatherData");
      setIsConnected(0);
    }
  };

  useEffect(() => {
    const runFethingData = async () => {
      socket.on("weatherData", (data) => {
        setWeatherData(data);
      });

      // // Triggers re-rendering
      // setWeatherData((prevData) => ({ ...prevData }));

      return () => {
        socket.disconnect();
        socket.off("weatherData");
      };
    };

    runFethingData();
  }, [isConnected]);

  return (
    <>
      <p className="text-center">Time: {formatTime(weatherData.time)}</p>
      <hr />
      <h2 className="text-center ">Weather Forecast</h2>
      <div className="status-container m-b">
        <p className="m-x">
          Status:{" "}
          <span
            style={{
              color:
                isConnected === 0
                  ? "red"
                  : isConnected === 1
                  ? "gray"
                  : "green",
            }}>
            {isConnected === 0 && "Disconnected"}
            {isConnected === 1 && "Loading..."}
            {isConnected === 2 && "Connected"}
          </span>
        </p>
        <button
          disabled={isConnected === 1}
          className="btn"
          onClick={() => {
            handleWeatherSocketConnection();
          }}>
          {isConnected === 0 ? "Run Weather Data" : "Stop Weather Data"}
        </button>
      </div>
      <main className="weather-container m-b">
        <div>
          <p>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415" />
              <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1" />
            </svg>
            Temperature: {weatherData.temperature.toFixed(2)} °C
          </p>
          <p>Humidity: {weatherData.humidity.toFixed(2)}</p>
          <p>Pressure: {weatherData.pressure.toFixed(2)}</p>
        </div>

        <div className="p-x">
          <p>Precipitation</p>
          <p>Probability: {weatherData.precipitation.probability.toFixed(2)}</p>
          <p>Rain: {weatherData.precipitation.rain.toString()}</p>
          <p>Snow: {weatherData.precipitation.snow.toString()}</p>
          <p>Sleet: {weatherData.precipitation.sleet.toString()}</p>
          <p>Hail: {weatherData.precipitation.hail.toString()}</p>
        </div>

        <div>
          <p>Wind</p>
          <p>Direction: {weatherData.wind.direction}</p>
          <p>Angle: {weatherData.wind.angle.toFixed(2)}</p>
          <p>Speed: {weatherData.wind.speed.toFixed(2)}</p>
        </div>
      </main>
      <hr />
      <button
        className="btn"
        onClick={() => {
          window.location.reload();
        }}>
        Reset Entire System
      </button>
    </>
  );
}
