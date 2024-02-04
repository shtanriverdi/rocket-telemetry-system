import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

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
      <h1>Weather Status</h1>
      <p>
        Socket:{" "}
        <span style={{ color: !isConnected ? "red" : "green" }}>
          {!isConnected ? "Disconnected" : "Connected"}
        </span>
      </p>
      <p>Temperature: {weatherData.temperature.toFixed(2)} °C</p>
      <p>Humidity: {weatherData.humidity.toFixed(2)}</p>
      <p>Pressure: {weatherData.pressure.toFixed(2)}</p>
      <p>Time: {weatherData.time}</p>
      <p>probability: {weatherData.precipitation.probability.toFixed(2)}</p>
      <p>rain: {weatherData.precipitation.rain.toString()}</p>
      <p>snow: {weatherData.precipitation.snow.toString()}</p>
      <p>sleet: {weatherData.precipitation.sleet.toString()}</p>
      <p>hail: {weatherData.precipitation.hail.toString()}</p>
      <p>Direction: {weatherData.wind.direction}</p>
      <p>Angle: {weatherData.wind.angle.toFixed(2)}</p>
      <p>Speed: {weatherData.wind.speed.toFixed(2)}</p>
      <button
        onClick={() => {
          handleSocketConnection(!isConnected);
        }}>
        {!isConnected ? "Run System" : "Stop System"}
      </button>
    </>
  );
}
