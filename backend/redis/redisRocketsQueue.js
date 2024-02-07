/*
  We create a queue where we will store the data we fetched from TCP telemetry connection
  So that we can fix the invalid data entries before we send them to frontend
  We check the previously enqueued data and their cumulative average and see if a data is valid.
  Thus, we discard the invalida data beforehand.
  */
// Rockets info
import rockets from "./utils/rocketsHostInfo.js";

import Redis from "ioredis";
const redis = new Redis();

// Queue lenght limit
const MAX_QUEUE_LENGTH = 100;

const emptyData = {
  altitude: 0,
  speed: 0,
  acceleration: 0,
  thrust: 0,
  temperature: 0,
};

// Rockets data queue
const rocketsList = rockets.map((rocketData) => rocketData.rocketID);
// Stores specific queue for each rocket using rocket IDs
const rocketsQueueMap = { ...rocketsList };

// Appends data into the rockets queue
// Time Comp: O(1)
const enqueueRocketData = async (data, rocketID) => {
  const currentQueueLen = await redis.llen(rocketsQueueMap[rocketID]);
  // Keep the length of the queue constant to prevent memory overflow. etc
  if (currentQueueLen >= MAX_QUEUE_LENGTH) {
    const poppedData = await redis.lpop(rocketsQueueMap[rocketID]);
    console.log("poppedData: ", poppedData);
  }
  await redis.rpush(rocketsQueueMap[rocketID], JSON.stringify(data));
  console.log("Data pushed: ", poppedData, rocketsQueueMap[rocketID], rocketID);
};

// Removes and gets the first data in the weather queue
const dequeueRocketData = async (rocketID) => {
  const data = await redis.lpop(rocketsQueueMap[rocketID]);
  return data ? JSON.parse(data) : emptyData;
};

export { enqueueRocketData, dequeueRocketData };
