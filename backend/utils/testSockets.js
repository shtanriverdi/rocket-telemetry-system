import { io } from "socket.io-client"; // REMOVE AFTER TRY npm uninstall...

// Socket.io server address
const weatherSocket = io("http://localhost:3000/weather", {
  autoConnect: false,
});

// const [weatherData, setWeatherData] = useState({
//   temperature: 0,
//   humidity: 0,
//   pressure: 0,
//   precipitation: {
//     probability: 0,
//     rain: false,
//     snow: false,
//     sleet: false,
//     hail: false,
//   },
//   time: "2024",
//   wind: {
//     direction: "*",
//     angle: 0,
//     speed: 0,
//   },
// });

console.log("weatherSocket testing");

// no-op if the socket is already connected
weatherSocket.connect();

// weatherSocket.disconnect();

weatherSocket.on("weatherData", (data) => {
  console.log("weatherSocket connected");
  console.log("Received weather data:", data);
});

// Listen for disconnection
weatherSocket.on("disconnect", () => {
  console.log("weatherSocket disconnected");
});