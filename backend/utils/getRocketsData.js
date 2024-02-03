import axios from "axios";

// Setting custom headers for Axios instances
const instance = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "X-API-Key": "API_KEY_1",
  },
});

// May yield "503: Service Unavailable" with %20 possibility
// This function will keep trying until it gets the data
async function fetchRockets(attemps) {
  try {
    // 0.4 - 2.3 seconds delayed result
    const { data } = await instance.get("/rockets");
    return data;
  } catch (error) {
    console.error(
      "Error happened: ",
      // error,
      "Response status:",
      error.response.status,
      "Get Request Attemps:",
      attemps
    );
  }
  // Couldn't fetch the data
  return false;
}

// This function will keep trying until it gets the data
async function getRocketsData() {
  let data = false;
  let attemps = 1;
  while (data === false) {
    data = await fetchRockets(attemps);
    attemps += 1;
  }
  return data;
  // try {
  //   // 0.4 - 2.3 seconds delayed result
  //   const { data } = await instance.get("/rockets");
  //   console.log("Get Request Attemps:", attemps);
  //   return data;
  // } catch (error) {
  //   // Try to get data as long as there is an error
  //   if (error || error.response.status !== 200) {
  //     console.error("Attempting again...");
  //     return getRocketsData(attemps + 1);
  //   }
  //   console.error(
  //     "Error happened: ",
  //     error,
  //     "data.response.status:",
  //     error.response.status,
  //     "Get Request Attemps:",
  //     attemps
  //   );
  // }
}

export { getRocketsData };
