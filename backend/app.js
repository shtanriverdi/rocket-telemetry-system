// Fetch rockets data
import { getRocketsData, getWeatherData } from "./utils/endpoints.js";

// Initialize Express Backend
import express from "express";
// Express Application for routes, this is not a server!
const port = 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("Home Page");
});

// Rockets
app.get("/getRocketsData", async (req, res) => {
  const rocketsData = await getRocketsData();
  console.log("Rockets data: ");
  for (const rocket of rocketsData) {
    console.log(rocket);
  }
  res.json(rocketsData);
});

// Weather
app.get("/getWeatherData", async (req, res) => {
  const weatherData = await getWeatherData();
  console.log("Weather data: ");
  for (const weather of weatherData) {
    console.log(weather);
  }
  res.json(weatherData);
});

app.listen(port, () => {
  console.log(`Rocket Telemetry Server is up and running on port ${port}`);
});

app.get("*", (req, res) => {
  res.send("Route Not Found!");
});