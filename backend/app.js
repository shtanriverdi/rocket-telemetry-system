import { getRocketsData, getWeatherData } from "./utils/endpoints.js";

// This could have been done via get request
// For the sake of simplicity, I wanted to use this way
import rockets from "./utils/rocketsHostInfo.js";

// Import Buffer to json
import bufferToJson from "./utils/bufferToJSON.js";

// Initialize Express Backend
import express from "express";

// For TCP connection
import net from "net";

// Express Application for routes, this is not a server!
const port = 3000;
const app = express();

// For sockets.io and TCP connections
import http from "http";
import { Server } from "socket.io";

// Create socket instances
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // TODO
  },
});

// Import redis functions
import {
  enqueueWeatherData,
  dequeueWeatherData,
} from "./redis/redisWeatherQueue.js";

import {
  enqueueRocketData,
  dequeueRocketData,
} from "./redis/redisRocketsQueue.js";

// Fix cors error, add middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// ------------------------ Weather ------------------------

// Weather middlewares { status: "on" | "off" }
app.get("/weather/:status", (req, res) => {
  const status = req.params.status;
  let response = "empty";
  // console.log("status:", status);
  if (status === "on") {
    runWeatherSocket();
    response = "connected";
  } else if (status === "off") {
    stopWeatherSocket();
    response = "disconnected";
  }
  // Set the response in the JSON object
  res.json({ response });
});

function stopWeatherSocket() {
  const weatherRedisInterval = app.get("weatherRedisInterval");
  // console.log("weatherRedisInterval", weatherRedisInterval);
  clearInterval(weatherRedisInterval);
}

// Gets the weather data and pushes to the redis queue
// Data storing frequency on redis
function runWeatherSocket() {
  const weatherRedisInterval = setInterval(async () => {
    // console.log("Redis enqueueing...");
    const { data: weatherData } = await getWeatherData();
    // console.log("Weather data: ", weatherData);
    await enqueueWeatherData(weatherData);
    // await printAllData();
  }, 100);
  app.set("weatherRedisInterval", weatherRedisInterval);
  // console.log("weatherRedisInterval:", app.get("weatherRedisInterval"));
}

// Creates a listener for weather
const weatherNamespace = io.of("/weather");

weatherNamespace.on("connection", (socket) => {
  console.log("Weather namespace connected:", socket.id);

  // Sends weather data every 2 second
  const weatherInterval = setInterval(async () => {
    // Pull the data from Redis
    const redisWeatherJSON = await dequeueWeatherData();
    // Send the data to socket
    weatherNamespace.emit("weatherData", redisWeatherJSON);
  }, 150);

  // Clear interval on disconnection
  socket.on("disconnect", () => {
    console.log("Weather namespace disconnected:", socket.id);
    clearInterval(weatherInterval);
  });
});

// ------------------------ Rockets ------------------------

// Create a TCP connection for each rocket
rockets.forEach((rocket) => {
  // Creates new TCP Socket
  const TCPSocket = new net.Socket();
  const { id, host, port } = rocket;

  // Create a socket.io namespace for each rocket
  const rocketNamespace = io.of(`/rockets/${id}`);

  // Listen for connection on this namespace
  rocketNamespace.on("connection", (socket) => {
    console.log(`Socket.io connected for rocket: ${id}`);
  });

  // Establish the connection
  TCPSocket.connect(port, host, () => {
    console.log(`Connected via TCP for rocket: ${id}`);
  });

  // When data is received
  TCPSocket.on("data", async (bufferData) => {
    const { rocketID, altitude, speed, acceleration, thrust, temperature } =
      bufferToJson(bufferData);
    // console.log(rocketID, altitude, speed, acceleration, thrust, temperature);
    const rocketTelemetryData = {
      altitude,
      speed,
      acceleration,
      thrust,
      temperature,
    };

    // Save data to redis queue of specific rocket
    await enqueueRocketData(rocketTelemetryData, rocketID);
    // printAllRocketDataAsJSON(rocketID);
    // printAllRocketDataAsString(rocketID);
    // This data comes from redis queue which is cleaned & validified data
    const poppedData = await dequeueRocketData(rocketID);
    // console.log("poppedData: ", poppedData);
    rocketNamespace.emit("rocketData", poppedData);
  });

  TCPSocket.on("close", () => {
    console.log(`TCP connection ended for rocket: ${id}`);
  });

  // Error
  TCPSocket.on("error", (err) => {
    console.error(`Socket/TCP Error: ${err.message}`);
  });
});


// ------------------------ Express --------------------------
// Starts the server
server.listen(port, () => {
  console.log(`Rocket Server is up and running on port ${port}`);
});

app.get("*", (req, res) => {
  res.send("Route Not Found!");
});
