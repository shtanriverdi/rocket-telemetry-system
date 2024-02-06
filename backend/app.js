import { getRocketsData, getWeatherData } from "./utils/endpoints.js";

// Initialize Express Backend
import express from "express";

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
  redis,
  enqueueWeatherData,
  dequeueWeatherData,
  printAllData,
} from "./redis/redisWeatherQueue.js";

// Fix cors error, add middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// ------------------------ Redis - Weather ------------------------
// Weather middlewares { status: "on" | "off" }
app.get("/weather/:status", (req, res) => {
  const status = req.params.status;
  let response = "empty";
  console.log("status:", status);
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
    console.log("Redis enqueueing...");
    const { data: weatherData } = await getWeatherData();
    // console.log("Weather data: ", weatherData);
    await enqueueWeatherData(weatherData);
    // await printAllData();
  }, 100);
  app.set("weatherRedisInterval", weatherRedisInterval);
  console.log("weatherRedisInterval:", app.get("weatherRedisInterval"));
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
    // const { data: weatherData } = await getWeatherData();
    // weatherNamespace.emit("weatherData", weatherData);
  }, 150);

  // Clear interval on disconnection
  socket.on("disconnect", () => {
    console.log("Weather namespace disconnected:", socket.id);
    clearInterval(weatherInterval);
  });
});

weatherNamespace.on("terminate", function () {
  weatherNamespace.removeAllListeners("terminate");
  weatherNamespace.disconnectSockets();
  console.log("Weather namespace disconnected:", socket.id);
});

// Creates a listener for rockets
// const rocketsTelemetryNamespace = io.of("/rockets-telemetry");
// const telemetryConnections = {};
// // Receives big-endian notation, returns JSON
// const parseTelemetryData = () => {
//   // TODO
// };

// rocketsTelemetryNamespace.on("connection", (socket) => {
//   console.log("Rocket telemetry namespace connected");

//   // Runs every second
//   const rocketsInterval = setInterval(async () => {
//     try {
//       const { data: rocketsData } = await getRocketsData();

//       // Create TCP Telemetry connection for each rocket
//       rocketsData.forEach((rocket) => {
//         // If the connection is not created before
//         if (!telemetryConnections[rocket.id]) {
//           // Craete new telemetry connection
//           const { host, port } = rocket.telemetry;
//           const rocketSocket = io.connect(host + ":" + port);
//           // const rocketSocket = io.connect("http://" + host + ":" + port); // TRY
//           rocketSocket.on("rocket-telemetry", (telemetryData) => {
//             const parsedData = parseTelemetryData(telemetryData);
//             rocketsTelemetryNamespace.emit(
//               `rocket-telemetry-${rocket.id}`,
//               telemetryData
//             );
//           });

//           // Store the socket with rocket id
//           telemetryConnections[rocket.id] = rocketSocket;
//         }
//       });
//     } catch (error) {
//       console.log("Error fetching rocket telemetry data: ", error.message);
//     }
//   }, 1000);

//   // Clear the interval when disconnected
//   socket.on("disconnect", () => {
//     console.log("A client disconnected from telemetry namespace");
//     // Stop the interval
//     clearInterval(rocketsInterval);
//     // Shut down all the telemetry connection of the rockets
//     Object.values(telemetryConnections).forEach((rocketSocket) => {
//       rocketSocket.disconnect();
//     });
//   });
// });

// ------------------------ Express --------------------------
// Starts the server
server.listen(port, () => {
  console.log(`Rocket Server is up and running on port ${port}`);
});

// Rockets
// app.get("/getRocketsData", async (req, res) => {
//   const { data: rocketsData } = await getRocketsData();
//   console.log("Rockets data: ");
//   for (const rocket of rocketsData) {
//     console.log(rocket);
//   }
//   res.json(rocketsData);
// });

// Weather
// app.get("/runWeatherSocket", (req, res) => {
//   stopWeatherSocket();
//   next();
// });

// app.get("/getWeatherData", async (req, res) => {
//   const { data: weatherData } = await getWeatherData();
//   console.log("Weather data: ", weatherData);
//   res.json(weatherData);
// });

app.get("*", (req, res) => {
  res.send("Route Not Found!");
});
