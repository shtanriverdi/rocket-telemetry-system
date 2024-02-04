import axios from "axios";
/*
  Fetch functions here may result "503: Service Unavailable" with %20 possibility
  Also, endpoints will be giving result within 0.4 - 2.3 seconds delay
*/

// Setting custom headers for Axios instances
const instance = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "X-API-Key": "API_KEY_1",
  },
});

// Fetches and returns the data according to given path
// Path can be either "/weather", or "/rockets"
async function fetchData(attemps, path) {
  try {
    // 0.4 - 2.3 seconds delayed result
    const data = await instance.get(path);
    return data;
  } catch (error) {
    console.error(
      "Error occured!",
      error.request,
      "Get Request Attemps:",
      attemps
    );
  }

  return false;
}

// This function will keep trying to fetch until it gets the data
async function attemptGettingData(path) {
  // let data = false;
  let attemps = 1;
  // while (data === false) {
    const data = await fetchData(attemps, path);
    // attemps += 1;
  // }
  return data;
}

// Returns rockets data
async function getRocketsData() {
  const data = await attemptGettingData("/rockets");
  return data;
}

// Returns weather data
async function getWeatherData() {
  const data = await attemptGettingData("/weather");
  return data;
}

export { getRocketsData, getWeatherData };
