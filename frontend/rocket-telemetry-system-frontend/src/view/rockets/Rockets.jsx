// import { io } from "socket.io-client";
import rocketsData from "./rocketsData";
import { useState } from "react";

export default function Rockets() {
  // All rockets state
  const [rockets, setRockets] = useState([
    {
      id: "DSSvW7VLmb",
      model: "Saturn V",
      mass: 2970000,
      payload: {
        description:
          "Apollo CSM-109 Odyssey, Apollo LM-7 Aquarius, 3 Astronauts",
        weight: 1542,
      },
      telemetry: {
        host: "0.0.0.0",
        port: 4000,
      },
      status: "waiting",
      timestamps: {
        launched: null,
        deployed: null,
        failed: null,
        cancelled: null,
      },
      altitude: 0.0,
      speed: 0.0,
      acceleration: 0.0,
      thrust: 35100000,
      temperature: 0.0,
    },
  ]);

  return (
    <>
      <h1>Rockets</h1>
      <ul>
        <li>Rocket 1</li>
        <li>Rocket 2</li>
        <li>Rocket 3</li>
        <li>Rocket 4</li>
        <li>Rocket 5</li>
        <li>Rocket 6</li>
      </ul>
    </>
  );
}
