import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const ROCKETS_URL = "http://localhost:3000";
const headers = new Headers();
headers.append("x-api-key", "API_KEY_1");
headers.append("Connection", "keepalive");
headers.append("Accept-Encoding", "gzip, deflate, br");
headers.append("Accept", "*/*");
headers.append("User-Agent", "PostmanRuntime/7.36.1");
headers.append("Content-Length", "0");
headers.append("Postman-Token", "<calculated when request is sent>");

/*
  Launch Rocket, PUT Request:
  http://localhost:5000/rocket/DSSvW7VLmb/status/launched
  Response:
  If launched: 304 NOT MODIFIED
  If not launched:
  {
      "id": "DSSvW7VLmb",
      "model": "Saturn V",
      "mass": 2970000,
      "payload": {
          "description": "Apollo CSM-109 Odyssey, Apollo LM-7 Aquarius, 3 Astronauts",
          "weight": 1542
      },
      "telemetry": {
          "host": "0.0.0.0",
          "port": 4000
      },
      "status": "launched",
      "timestamps": {
          "launched": "2024-02-08T05:48:29.012781",
          "deployed": null,
          "failed": null,
          "cancelled": null
      },
      "altitude": 0.0,
      "speed": 0.0,
      "acceleration": 0.0,
      "thrust": 35100000,
      "temperature": 0.0
  }


  Deploy Rocket, PUT Request:
  http://localhost:5000/rocket/FvxKSGLkVC/status/deployed
  Response:
  If deployed: 304 NOT MODIFIED
  If not deployed:
  {
      "id": "DSSvW7VLmb",
      "model": "Saturn V",
      "mass": 2970000,
      "payload": {
          "description": "Apollo CSM-109 Odyssey, Apollo LM-7 Aquarius, 3 Astronauts",
          "weight": 1542
      },
      "telemetry": {
          "host": "0.0.0.0",
          "port": 4000
      },
      "status": "launched",
      "timestamps": {
          "launched": "2024-02-08T05:48:29.012781",
          "deployed": "2024-02-08T06:55:22.012781",
          "failed": null,
          "cancelled": null
      },
      "altitude": 0.0,
      "speed": 0.0,
      "acceleration": 0.0,
      "thrust": 35100000,
      "temperature": 0.0
  }



  Cancel Rocket, DEL Request:
  http://localhost:5000/rocket/FvxKSGLkVC/status/launched
  Response:
  If not launched:
  {
    "code": 400,
    "message": "Rocket DSSvW7VLmb is not launched yet.",
    "key": "bad_request",
    "payload": null
  }

  If not launched:
  {
      "id": "DSSvW7VLmb",
      "model": "Saturn V",
      "mass": 2970000,
      "payload": {
          "description": "Apollo CSM-109 Odyssey, Apollo LM-7 Aquarius, 3 Astronauts",
          "weight": 1542
      },
      "telemetry": {
          "host": "0.0.0.0",
          "port": 4000
      },
      "status": "launched",
      "timestamps": {
          "launched": "2024-02-08T05:48:29.012781",
          "deployed": null,
          "failed": null,
          "cancelled": "2024-02-08T06:55:22.012781"
      },
      "altitude": 0.0,
      "speed": 0.0,
      "acceleration": 0.0,
      "thrust": 35100000,
      "temperature": 0.0
  }
*/

export default function Rocket({ rocketData }) {
  // Socket.io server address, autoconnect is off
  const socket = io(ROCKETS_URL + `/rockets/${rocketData.id}`, {
    autoConnect: false,
  });

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
    } else if (isRocketConnected === 2) {
      // socket.off("rocketData");
      socket.disconnect();
      setRocketConnected(0);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket.io connected for Rocket: ", id);
      setRocketConnected(2);
    });
    
    socket.on("disconnect", () => {
      console.log("On disconnect for Rocket: ", id);
      // socket.off("rocketData");
      socket.disconnect();
      setRocketConnected(0);
    });

    socket.on("rocketData", (data) => {
      // console.log(`Roket data received (${id}):`, data);
      setTelemetryState(data);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
      // Leaves tor specific room
      // socket.emit("leaveRoom", id);
      // Disconnects the socket manually. In that case, the socket will not try to reconnect.
      socket.disconnect();
      // socket.off("rocketData");
      setRocketConnected(0);
    });
  }, [isRocketConnected]);

  // Handles the states of a rocket: launched, deployed, canceled
  // postfix: "launched", "deployed" or "cancelled" ?
  // method: "PUT" or "DEL"
  // const handleRocket = async (postfix, method) => {
  //   try {
  //     const headers = new Headers();
  //     headers.append("x-api-key", "API_KEY_1");

  //     const response = await fetch(
  //       `http://localhost:5000/rocket/${rocketData.id}/status/launched`,
  //       {
  //         method: "PUT",
  //         headers: headers,
  //         redirect: "follow",
  //       }
  //     );

  //     if (response.status === 304) {
  //       console.log("Roket zaten başlatılmış.");
  //     } else {
  //       setRocketState((prevState) => ({ ...prevState, status: "launched" }));
  //     }
  //   } catch (error) {
  //     console.error("Roket başlatılırken bir hata oluştu:", error);
  //   }
  // };

  const launchRocket = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/rocket/${id}/status/launched`,
        {
          method: "PUT",
          headers: headers,
          redirect: "follow",
        }
      );

      if (response.status === 304) {
        // Rocket is already launched
        console.log("Rocket is already launched.");
      } else {
        // Rocket launched successfully, update the status
        setRocketState((prevState) => ({ ...prevState, status: "launched" }));
      }
    } catch (error) {
      console.error("An error occurred while launching the rocket:", error);
    }
  };

  const deployRocket = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/rocket/${id}/status/deployed`,
        {
          method: "PUT",
          headers: headers,
          redirect: "follow",
        }
      );

      if (response.status === 304) {
        // Rocket is already deployed
        console.log("Rocket is already deployed.");
      } else {
        // Rocket deployed successfully, update the status
        setRocketState((prevState) => ({ ...prevState, status: "deployed" }));
      }
    } catch (error) {
      console.error("An error occurred while deploying the rocket:", error);
    }
  };

  const cancelRocket = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/rocket/${id}/status/launched`,
        {
          method: "DELETE",
          headers: headers,
          redirect: "follow",
        }
      );

      if (response.status === 304) {
        // Rocket is not yet launched
        console.log("Rocket is not yet launched.");
      } else {
        // Rocket canceled successfully, update the status
        setRocketState((prevState) => ({ ...prevState, status: "cancelled" }));
      }
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
        <b>Rocket Status:</b> {status}
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
