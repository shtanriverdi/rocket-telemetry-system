// import { io } from "socket.io-client";
import rocketsData from "./rocketsData";
import Rocket from "./Rocket";
import { useState } from "react";
import RocketIcon from "./RocketIcon";

export default function Rockets() {
  // All rockets state
  const [rocketsState, setRocketsState] = useState(rocketsData);

  const rocketsListItems = rocketsState.map((rocketData) => {
    return <Rocket key={rocketData.id} rocketData={rocketData} />;
  });

  return (
    <>
      <div className="flex-container m">
        <RocketIcon />
        <h1>&nbsp;Rockets</h1>
      </div>
      <div className="grid-list m m-bxxl">{rocketsListItems}</div>
    </>
  );
}
