import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const ROCKETS_URL = "http://localhost:3000";

import headers from "./headers";

const MAX_RETRY_COUNT = 10;
const RETRY_INTERVAL_MS = 1000; // 1 second

export default function Rocket({ rocketData }) {
  const socket = io(ROCKETS_URL + `/rockets/${rocketData.id}`, {
    autoConnect: false,
  });

  // Telemetry Data
  const { host, port } = rocketData.telemetry;
  const {
    id,
    model,
    mass,
    payload,
    altitude,
    speed,
    acceleration,
    thrust,
    temperature,
    status,
    timestamps,
  } = rocketData;

  const [telemetryState, setTelemetryState] = useState({
    altitude,
    speed,
    acceleration,
    thrust,
    temperature,
  });

  const [isRocketConnected, setRocketConnected] = useState(0);

  const handleSocketConnection = () => {
    if (isRocketConnected === 0) {
      setRocketConnected(1);
      socket.connect();

      socket.on("connect", () => {
        console.log("Socket.io connected for Rocket: ", id);
        setRocketConnected(2);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket.io connection error:", error);
        socket.disconnect();
        setRocketConnected(0);
      });
    } else if (isRocketConnected === 2) {
      socket.disconnect();
      setRocketConnected(0);
      socket.on("disconnect", () => {
        console.log("On disconnect for Rocket: ", id);
        socket.disconnect();
        setRocketConnected(0);
      });
    }
  };

  useEffect(() => {
    // socket.on("connect", () => {
    //   console.log("Socket.io connected for Rocket: ", id);
    //   setRocketConnected(2);
    // });

    // socket.on("disconnect", () => {
    //   console.log("On disconnect for Rocket: ", id);
    //   socket.disconnect();
    //   setRocketConnected(0);
    // });

    socket.on("rocketData", (data) => {
      setTelemetryState(data);
    });

    // socket.on("connect_error", (error) => {
    //   console.error("Socket.io connection error:", error);
    //   socket.disconnect();
    //   setRocketConnected(0);
    // });
  }, [isRocketConnected]);

  const performWithRetry = async (operation, retryCount = 0) => {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= MAX_RETRY_COUNT) {
        throw new Error(`Max retry count exceeded: ${error}`);
      }
      console.log(`Retry #${retryCount + 1}: ${error}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
      return await performWithRetry(operation, retryCount + 1);
    }
  };

  const launchRocket = async () => {
    try {
      await performWithRetry(async () => {
        const response = await fetch(
          `http://localhost:5000/rocket/${id}/status/launched`,
          {
            method: "PUT",
            headers: headers,
            redirect: "follow",
          }
        );

        if (response.status === 304) {
          console.log("Rocket is already launched.");
        }

        // setRocketState((prevState) => ({ ...prevState, status: "launched" }));
      });
    } catch (error) {
      console.error("An error occurred while launching the rocket:", error);
    }
  };

  const deployRocket = async () => {
    try {
      await performWithRetry(async () => {
        const response = await fetch(
          `http://localhost:5000/rocket/${id}/status/deployed`,
          {
            method: "PUT",
            headers: headers,
            redirect: "follow",
          }
        );

        if (response.status === 304) {
          console.log("Rocket is already deployed.");
        }

        // setRocketState((prevState) => ({ ...prevState, status: "deployed" }));
      });
    } catch (error) {
      console.error("An error occurred while deploying the rocket:", error);
    }
  };

  const cancelRocket = async () => {
    try {
      await performWithRetry(async () => {
        const response = await fetch(
          `http://localhost:5000/rocket/${id}/status/launched`,
          {
            method: "DELETE",
            headers: headers,
            redirect: "follow",
          }
        );

        if (response.status === 304) {
          console.log("Rocket is not yet launched.");
        }

        // setRocketState((prevState) => ({ ...prevState, status: "cancelled" }));
      });
    } catch (error) {
      console.error("An error occurred while canceling the rocket:", error);
    }
  };

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
        <b>Rocket Status:</b>{" "}
        <span
          style={{
            color:
              status === "launched"
                ? "green"
                : status === "deployed"
                ? "purple"
                : status === "cancelled"
                ? "gray"
                : status === "waiting"
                ? "orange"
                : "red",
          }}>
          {status}
        </span>
        <li className="no-bullet">
          <b>Host/Port:</b> {host + ":" + port}
        </li>
      </p>
      <div className="flex-container">
        <button disabled={isRocketConnected === 0} onClick={launchRocket}>
          Launch
        </button>
        <button
          disabled={isRocketConnected === 0}
          className="m-x"
          onClick={cancelRocket}>
          Cancel
        </button>
        <button disabled={isRocketConnected === 0} onClick={deployRocket}>
          Deploy
        </button>
      </div>
    </div>
  );
}
