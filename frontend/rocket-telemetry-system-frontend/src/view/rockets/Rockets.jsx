// import { io } from "socket.io-client";
import rocketsData from "./rocketsData";
import Rocket from "./Rocket";
import { useEffect, useState } from "react";
import RocketIcon from "./RocketIcon";
import headers from "./headers";

export default function Rockets() {
  // All rockets state
  const [rocketsState, setRocketsState] = useState(rocketsData);

  /*
    status: "waiting",
    timestamps: {
      launched: null,
      deployed: null,
      failed: null,
      cancelled: null,
    },
*/
  const rocketsListItems = rocketsState.map((rocketData) => {
    return <Rocket key={rocketData.id} rocketData={rocketData} />;
  });

  useEffect(() => {
    let retries = 0;

    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/rockets", {
          method: "GET",
          headers: headers,
          redirect: "follow",
        });
        if (response.ok) {
          const data = await response.json();
          console.log("data:", data);
          setRocketsState(data);
        } else {
          throw new Error("Service unavailable");
        }
      } catch (error) {
        // console.error("Fetch error:", error);
        if (retries < 100) {
          setTimeout(fetchData, 2400);
          retries++;
        } else {
          console.error("Exceeded maximum retries.");
        }
      }
    };

    fetchData();
  }, [rocketsState]);

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
