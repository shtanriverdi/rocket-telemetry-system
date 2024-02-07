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
  redis,
  enqueueWeatherData,
  dequeueWeatherData,
  printAllData,
} from "./redis/redisWeatherQueue.js";
import { Console } from "console";

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

// ------------------------ Rockets ------------------------

// Creates namespace for each rocket
console.log("Rockets:");
// rockets.forEach((rocket) => {
// const { id, host, port } = rocket;
// console.log(id, host, port);
// const rocketNamespace = io.of(`/rocket-${id}`);

// rocketNamespace.on("connection", (socket) => {
//   console.log(`Connected to telemetry of rocket ${id} at ${host}:${port}`);

//   socket.on("telemetry", (data) => {
//     console.log(`Telemetry data from rocket ${id}:`, data);
//   });
// });

// const telemetrySocket = io(`http://${host}:${port}`);
// telemetrySocket.on("connect", () => {
//   console.log(`Connected to telemetry of rocket ${id}`);
// });
// });

// Create a TCP connection for each rocket
rockets.forEach((rocket) => {
  // Creates new TCP Socket
  const TCPSocket = new net.Socket();
  const { id, host, port } = rocket;

  // Establish the connection
  TCPSocket.connect(port, host, () => {
    console.log(`Connected via TCP for rocket: ${id}`);
  });

  // When data is received
  TCPSocket.on("data", (bufferData) => {
    const rocketData = bufferToJson(bufferData);
    const rocketID = rocketData.rocketID;
    console.log(rocketData);
    // Emit rocketData to the specific rocket room
    io.to(rocketID).emit("rocketData", rocketData);
  });

  TCPSocket.on("close", () => {
    console.log(`TCP connection ended for rocket: ${id}`);
  });

  // Error
  TCPSocket.on("error", (err) => {
    console.error(`Socket/TCP Error: ${err.message}`);
  });

  // Create a socket.io room for each rocket
  io.on("connection", (socket) => {
    console.log(`Socket.io connected for rocket: ${id}`);
    socket.join(id);
  });
});

function runRocketSocket(rocketId) {}

function stopRocketSocket(rocketId) {}

// Rockets middlewares { status: "on" | "off" }
app.get("/rockets/:rocketId/:status", (req, res) => {
  const rocketId = req.params.rocketId;
  const status = req.params.status;
  let response = "empty";
  console.log("rocketId:", rocketId, " status:", status);
  if (status === "on") {
    runRocketSocket(rocketId);
    response = "connected";
  } else if (status === "off") {
    stopRocketSocket(rocketId);
    response = "disconnected";
  }
  // Set the response in the JSON object
  res.json({ response });
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
