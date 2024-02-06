// import { io } from "socket.io-client";
import rocketsData from "./rocketsData";
import Rocket from "./Rocket";
import { useState } from "react";

export default function Rockets() {
  // All rockets state
  const [rocketsState, setRocketsState] = useState(rocketsData);

  const rocketsListItems = rocketsState.map((rocketData) => {
    return <Rocket key={rocketData.id} rocketData={rocketData} />;
  });

  return (
    <>
      <h1>Rockets</h1>
      {rocketsListItems}
    </>
  );
}
