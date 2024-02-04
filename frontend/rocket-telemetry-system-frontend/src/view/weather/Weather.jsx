import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { formatTime } from "../../utils/formatTime";
import "./style/weather.css";

// Socket.io server address, autoconnect is off
const socket = io("http://localhost:3000/weather", {
  autoConnect: false,
});

export default function Weather() {
  // Socket connection state
  const [isConnected, setIsConnected] = useState(false);

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

  const handleSocketConnection = (isConnected) => {
    // Connect to socket
    if (isConnected === true) {
      socket.connect();
      setIsConnected(true);
    }
    // Disconnect socket
    else {
      setIsConnected(false);
      socket.disconnect();
    }
  };

  useEffect(() => {
    // no-op if the socket is already connected
    // socket.connect();

    const runFethingData = async () => {
      socket.on("weatherData", (data) => {
        setWeatherData(data);
        setIsConnected("Connected");
      });

      // Triggers re-rendering
      setWeatherData((prevData) => ({ ...prevData }));

      return () => {
        setIsConnected(false);
        socket.disconnect();
      };
    };

    runFethingData();
  }, [isConnected]);

  return (
    <>
      <p>Time: {formatTime(weatherData.time)}</p>
      <p>
        Status:{" "}
        <span style={{ color: !isConnected ? "red" : "green" }}>
          {!isConnected ? "Disconnected" : "Connected"}
        </span>
      </p>
      <h3 className="text-center">Weather Forecast</h3>
      <main className="weather-container m-b">
        <div>
          <p>Temperature: {weatherData.temperature.toFixed(2)} °C</p>
          <p>Humidity: {weatherData.humidity.toFixed(2)}</p>
          <p>Pressure: {weatherData.pressure.toFixed(2)}</p>
        </div>

        <div className="p-x">
          <p>Precipitation</p>
          <p>probability: {weatherData.precipitation.probability.toFixed(2)}</p>
          <p>rain: {weatherData.precipitation.rain.toString()}</p>
          <p>snow: {weatherData.precipitation.snow.toString()}</p>
          <p>sleet: {weatherData.precipitation.sleet.toString()}</p>
          <p>hail: {weatherData.precipitation.hail.toString()}</p>
        </div>

        <div>
          <p>Wind</p>
          <p>Direction: {weatherData.wind.direction}</p>
          <p>Angle: {weatherData.wind.angle.toFixed(2)}</p>
          <p>Speed: {weatherData.wind.speed.toFixed(2)}</p>
        </div>
      </main>
      <button
      className="btn"
        onClick={() => {
          handleSocketConnection(!isConnected);
        }}>
        {!isConnected ? "Run System" : "Stop System"}
      </button>
    </>
  );
}
