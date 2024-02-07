import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const ROCKETS_URL = "http://localhost:3000";

// Socket.io server address, autoconnect is off
const socket = io(ROCKETS_URL, {
  autoConnect: false,
});

export default function Rocket({ rocketData }) {
  // Telemetry
  const { host, port } = rocketData.telemetry;

  // RestAPI Data | This data comes from RestAPI
  const { id, model, mass, payload, status, timestamps } = rocketData;

  // Real time data from telemetry stream | This data comes from TCP Connection!
  const { altitude, speed, acceleration, thrust, temperature } = rocketData;

  // Rockets data state
  const [rocketState, setRocketState] = useState({
    id,
    model,
    mass,
    payload,
    status,
    timestamps,
  });

  // Rocket telemetry data state
  const [telemetryState, setTelemetryState] = useState({
    altitude,
    speed,
    acceleration,
    thrust,
    temperature,
  });
  // Socket connection has 3 states: { 0: disconnected, 1: connecting..., 2: connected }
  const [isRocketConnected, setRocketConnected] = useState(0);

  const handleSocketConnection = () => {
    if (isRocketConnected === 0) {
      setRocketConnected(1);
      // Enabled the socket
      socket.connect();
      // Join the specific rocket room
      socket.emit("joinRoom", id);
    } else if (isRocketConnected === 2) {
      // Leaves for specific room
      socket.emit("leaveRoom", id);
      // Disconnects the socket manually. In that case, the socket will not try to reconnect.
      socket.disconnect();
      setRocketConnected(0);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.io connected");
      setRocketConnected(2);
    });

    socket.on("rocketData", (data) => {
      // console.log(`Roket data received (${id}):`, data);
      setTelemetryState(data);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
      // Leaves tor specific room
      socket.emit("leaveRoom", id);
      // Disconnects the socket manually. In that case, the socket will not try to reconnect.
      socket.disconnect();
      setRocketConnected(0);
    });
  }, [isRocketConnected]);

  return (
    <div className="rocket-container p">
      <div className="flex-container-outer">
        <div className="m-bs flex-container-centerize">
          <p>
            <b>Connection:&nbsp;</b>
          </p>
          <p
            className="inline-block"
            style={{
              color:
                isRocketConnected === 0
                  ? "red"
                  : isRocketConnected === 1
                  ? "gray"
                  : "green",
            }}>
            {isRocketConnected === 0 && "Disconnected"}
            {isRocketConnected === 1 && "Connecting..."}
            {isRocketConnected === 2 && "Connected"}&nbsp;
          </p>
        </div>
        <p className="text-center m-b">
          <b>Rocket: </b>
          {id}&nbsp;&nbsp;
        </p>
        <button
          disabled={isRocketConnected === 1}
          onClick={handleSocketConnection}>
          {isRocketConnected === 0 && "Connect"}
          {isRocketConnected === 1 && "Connecting"}
          {isRocketConnected === 2 && "Disconnect"}
        </button>
      </div>
      <div className="m-b">
        <p>
          <b>Payload:</b> {payload.description}
        </p>
        <p>
          <b>Weight:</b> {payload.weight}
        </p>
        <div className="no-bullet">
          <li>
            <b>Model:</b> {model}
          </li>
          <li>
            <b>Mass:</b> {mass}
          </li>
        </div>
      </div>

      <div className="tele-container no-bullet">
        <div className="m-b">
          <li className="bold underline m-r">Telemetry Data</li>
          <li>Altitude: {telemetryState.altitude}</li>
          <li>Speed: {telemetryState.speed}</li>
          <li>Acceleration: {telemetryState.acceleration}</li>
          <li>Thrust: {telemetryState.thrust}</li>
          <li>Temperature: {telemetryState.temperature}</li>
        </div>
        <div>
          <li className="bold underline">Timestamps</li>
          <li>launched: {timestamps.launched ?? "-"}</li>
          <li>deployed: {timestamps.deployed ?? "-"}</li>
          <li>failed: {timestamps.failed ?? "-"}</li>
          <li>cancelled: {timestamps.cancelled ?? "-"}</li>
        </div>
      </div>
      <p className="m-t m-b">
        <b>Rocket Status:</b> {status}
        <li className="no-bullet">
          <b>Host/Port:</b> {host + ":" + port}
        </li>
      </p>
      <div className="flex-container">
        <button disabled={isRocketConnected === 0} className="m-r">
          Launch
        </button>
        <button disabled={isRocketConnected === 0}>Cancel</button>
      </div>
    </div>
  );
}
