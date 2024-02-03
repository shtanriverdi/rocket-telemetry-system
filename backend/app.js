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
const io = new Server(server);

// ------------------------ Socket.io ------------------------
const telemetryNamespace = io.of("/rockets-telemetry");
const telemetryConnections = {};

// Creates a listener
telemetryNamespace.on("connection", (socket) => {
  console.log("A rocket connected to telemetry namespace");

  // Runs every 100 milisecond
  const intervalId = setInterval(async () => {
    try {
      const { data: rocketsData } = await getRocketsData();

      // Create TCP Telemetry connection for each rocket
      rocketsData.forEach((rocket) => {
        // If the connection is not created before
        if (!telemetryConnections[rocket.id]) {
          // Craete new telemetry connection
          const { host, port } = rocket.telemetry;
          const rocketSocket = io.connect(host + ":" + port);
          // const rocketSocket = io.connect("http://" + host + ":" + port); // TRY
          rocketSocket.on("rocket-telemetry", (telemetryData) => {
            telemetryNamespace.emit(
              `rocket-telemetry-${rocket.id}`,
              telemetryData
            );
          });

          // Store the socket with rocket id
          telemetryConnections[rocket.id] = rocketSocket;
        }
      });
    } catch (error) {
      console.log("Error fetching rocket telemetry data: ", error.message);
    }
  }, 1000);

  // Clear the interval when disconnected
  socket.on("disconnect", () => {
    console.log("A client disconnected from telemetry namespace");
    // Stop the interval
    clearInterval(intervalId);
    // Shut down all the telemetry connection of the rockets
    Object.values(telemetryConnections).forEach((rocketSocket) => {
      rocketSocket.disconnect();
    });
  });
});

// ------------------------ Express --------------------------
// Starts the server
server.listen(port, () => {
  console.log(`Rocket Telemetry Server is up and running on port ${port}`);
});

// Rockets
app.get("/getRocketsData", async (req, res) => {
  const { data: rocketsData } = await getRocketsData();
  console.log("Rockets data: ");
  for (const rocket of rocketsData) {
    console.log(rocket);
  }
  res.json(rocketsData);
});

// Weather
app.get("/getWeatherData", async (req, res) => {
  const { data: weatherData } = await getWeatherData();
  console.log("Weather data: ", weatherData);
  res.json(weatherData);
});

app.get("*", (req, res) => {
  res.send("Route Not Found!");
});
