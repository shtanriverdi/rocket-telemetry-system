// Fetch rockets data
import { getRocketsData, getWeatherData } from "./utils/endpoints.js";

// Represents a real time Socket.IO server
import { Server } from "socket.io";
// Represents Http library
import { createServer } from 'node:http';

// Initialize Express Backend
import express from "express";
// Express Application for routes, this is not a server!
const port = 3000;
const app = express();
// Creates "server" for socket.io
const server = createServer(app);
// Server constructor
const io = new Server(server);

// // Socket.io
// io.on('connection', (socket) => {
//   console.log('a user connected');
// });

app.get("/", (req, res) => {
  res.send("Home Page");
});

// Rockets
app.get("/getRocketsData", async (req, res) => {
  const rocketsData = await getRocketsData();
  console.log("rocketsData: ", rocketsData, typeof rocketsData);
  // for (const rocket in rocketsData) {
  //   console.log(typeof rocket, rocket);
  // }
  res.json(rocketsData);
  // res.send("Getting rockets data...");
});

// Weather
app.get("/getWeatherData", async (req, res) => {
  const weatherData = await getWeatherData();
  console.log("weatherData: ", weatherData, typeof weatherData);
  // for (const rocket in rocketsData) {
  //   console.log(typeof rocket, rocket);
  // }
  res.json(weatherData);
  // res.send("Getting weather data...");
});

app.listen(port, () => {
  console.log(`Rocket Telemetry Server is up and running on port ${port}`);
});

app.get("*", (req, res) => {
  res.send("Route Not Found!");
});