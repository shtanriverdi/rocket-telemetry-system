import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { formatTime } from "../../utils/formatTime";
import WeatherIcon from "./WeatherIcon";
import isLaunchable from "./isLaunchable";

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

  const [shouldLaunch, setShouldLaunch] = useState(false);

  const stopConnection = async () => {
    await fetch(WEATHER_URL + "/off");
    // const response = await fetch(WEATHER_URL + "/off");
    // const { response: data } = await response.json();
    socket.disconnect();
    socket.off("weatherData");
    setIsConnected(0);
  };

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
      await fetch(WEATHER_URL + "/off");
      // const response = await fetch(WEATHER_URL + "/off");
      // const { response: data } = await response.json();
      socket.disconnect();
      socket.off("weatherData");
      setIsConnected(0);
    }
  };

  useEffect(() => {
    const runFethingData = async () => {
      socket.on("weatherData", (data) => {
        setWeatherData(data);
        setShouldLaunch(isLaunchable(weatherData));
      });

      socket.on("disconnect", () => {
        console.log("Weather Socket Disconnected!");
        socket.disconnect();
        socket.off("weatherData");
        setIsConnected(0);
      });
    };

    runFethingData();
  }, [isConnected]);

  return (
    <div className="outer-container flex-col">
      <div className="flex-container">
        <WeatherIcon />
        <h1 className="text-center m-t">&nbsp;Weather Forecast</h1>
      </div>
      <div className="status-container m-b m">
        <div>
          <p className="m-x bold">
            Connection:{" "}
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
              {isConnected === 1 && "Connecting..."}
              {isConnected === 2 && "Connected"}
            </span>
          </p>
          <p className="text-center">{formatTime(weatherData.time)}</p>
        </div>
        <button
          disabled={isConnected === 1}
          className="btn m"
          onClick={() => {
            handleWeatherSocketConnection();
          }}>
          {isConnected === 0 ? "Run Weather Data" : "Stop Weather Data"}
        </button>
        <button
          className="btn"
          onClick={() => {
            stopConnection();
            window.location.reload();
          }}>
          Reset System
        </button>
      </div>
      <div className="m-b">
        <span className="bold">Rocket Launching Recommendation: </span>
        <span
          className="bold"
          style={{
            color: shouldLaunch ? "green" : "red",
          }}>
          {shouldLaunch ? "Launchable" : "Not Recommended"}
        </span>
      </div>
      <main className="weather-container">
        <div>
          <p>Temperature: {weatherData.temperature.toFixed(2)} °C</p>
          <p>Humidity: {weatherData.humidity.toFixed(2)}</p>
          <p>Pressure: {weatherData.pressure.toFixed(2)}</p>
        </div>

        <div className="p-x">
          <p className="bold underline">Precipitation</p>
          <p>Probability: {weatherData.precipitation.probability.toFixed(2)}</p>
          <p>Rain: {weatherData.precipitation.rain.toString()}</p>
          <p>Snow: {weatherData.precipitation.snow.toString()}</p>
          <p>Sleet: {weatherData.precipitation.sleet.toString()}</p>
          <p>Hail: {weatherData.precipitation.hail.toString()}</p>
        </div>

        <div style={{ width: "7rem" }}>
          <p className="bold underline">Wind</p>
          <p>Direction: {weatherData.wind.direction}</p>
          <p>Angle: {weatherData.wind.angle.toFixed(2)}</p>
          <p>Speed: {weatherData.wind.speed.toFixed(2)}</p>
        </div>
      </main>
    </div>
  );
}
