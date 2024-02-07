/*
  We create a queue where we will store the data we fetched from TCP telemetry connection
  So that we can fix the invalid data entries before we send them to frontend
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

// Discards invalid data
// We check the previously enqueued data and their cumulative average and see if new data is valid.
// Thus, we discard the invalida data beforehand.
/*
    altitude,
    speed,
    acceleration,
    thrust,
    temperature,
*/
/* Sample Values For A Rocket from take-off to 20 seconds in the air
Seconds altitude,   speed,   acceleration, thrust, temperature,
  0,      0.00,      0.00,      0.00,       0.00,     20.00
  1,      10.00,     10.00,       9.81,    500.00,     25.00
  2,      20.00,     20.00,       9.81,    1000.00,    30.00
  3,      30.00,     30.00,       9.81,    1500.00,    35.00
  4,      40.00,     40.00,       9.81,    2000.00,    40.00
  5,      50.00,     50.00,       9.81,    2500.00,    45.00
  6,      60.00,     60.00,       9.81,    3000.00,    50.00
  7,      70.00,     70.00,       9.81,    3500.00,    55.00
  8,      80.00,     80.00,       9.81,    4000.00,    60.00
  9,      90.00,     90.00,       9.81,    4500.00,    65.00
  10,    100.00,     100.00,      9.81,    5000.00,    70.00
  11,    110.00,     110.00,      9.81,    5500.00,    75.00
  12,    120.00,     120.00,      9.81,    6000.00,    80.00
  13,    130.00,     130.00,      9.81,    6500.00,    85.00
  14,    140.00,     140.00,      9.81,    7000.00,    90.00
  15,    150.00,     150.00,      9.81,    7500.00,    95.00
  16,    160.00,     160.00,      9.81,    8000.00,    100.00
  17,    170.00,     170.00,      9.81,    8500.00,    105.00
  18,    180.00,     180.00,      9.81,    9000.00,    110.00
  19,    190.00,     190.00,      9.81,    9500.00,    115.00
  20,    200.00,     200.00,      9.81,    10000.00,     120.00
*/
// Difference threshold is 1.0, we can change this value for better precision
// I just assumed that a rocket cannot change its for example speed or altitude from 1.xx to 8.xx in a second(1000ms)
// To be more realistic, we should talk to physicians to set this treshold :)
const diffAvgMap = {
  altitude: 1.0,
  speed: 1.0,
  acceleration: 1.0,
  thrust: 1.0,
  temperature: 1.0,
};

const isValidFloat = (avgFloat, floatToBeChecked) => {
  const difference = Math.abs(avgFloat - floatToBeChecked);
  if (difference <= 2.0) {
  }
  return true;
};

const isDataValid = (dataToBePushed, rocketID) => {
  // New data to be checked
  const {
    altitudeToBeChecked,
    speedToBeChecked,
    accelerationToBeChecked,
    thrustToBeChecked,
    temperatureToBeChecked,
  } = dataToBePushed;

  const currentData = retrieveAllDataFromQueue(rocketID);

  const curDataSumAvgeMap = {
    altitude: [0, 0], // [Sum, Avg]
    speed: [0, 0],
    acceleration: [0, 0],
    thrust: [0, 0],
    temperature: [0, 0],
  };

  for (const data of currentData) {
    curDataSumAvgeMap[altitude][0] += data.altitude;
    curDataSumAvgeMap[speed][0] += data.speed;
    curDataSumAvgeMap[acceleration][0] += data.acceleration;
    curDataSumAvgeMap[thrust][0] += data.thrust;
    curDataSumAvgeMap[temperature][0] += data.temperature;
  }

  // Calculated the average for each floating point
  curDataSumAvgeMap[altitude][1] = curDataSumAvgeMap[altitude][0] / 10;
  curDataSumAvgeMap[speed][1] = curDataSumAvgeMap[speed][0] / 10;
  curDataSumAvgeMap[acceleration][1] = curDataSumAvgeMap[acceleration][0] / 10;
  curDataSumAvgeMap[thrust][1] = curDataSumAvgeMap[thrust][0] / 10;
  curDataSumAvgeMap[temperature][1] = curDataSumAvgeMap[temperature][0] / 10;

  getAverage(curDataSumMap);
};

// Appends data into the rockets queue
// Accepts first 10 data anyway for checking purposes
// Time Comp: O(1)
const enqueueRocketData = async (data, rocketID) => {
  const currentQueueLen = await redis.llen(rocketsQueueMap[rocketID]);
  // Keep the length of the queue constant to prevent memory overflow. etc
  if (currentQueueLen >= MAX_QUEUE_LENGTH) {
    const poppedData = await redis.lpop(rocketsQueueMap[rocketID]);
    console.log("poppedData: ", poppedData);
  }
  // Push only if data is valid, we need at least 10 data entries
  if (currentQueueLen <= 10 || isDataValid(data, rocketID)) {
    await redis.rpush(rocketsQueueMap[rocketID], JSON.stringify(data));
    console.log(
      "Data pushed: ",
      poppedData,
      rocketsQueueMap[rocketID],
      rocketID
    );
  }
};

// Removes and gets the first data in the weather queue
const dequeueRocketData = async (rocketID) => {
  const data = await redis.lpop(rocketsQueueMap[rocketID]);
  return data ? JSON.parse(data) : emptyData;
};

// Retrieves all items in the given rocketID's queue
const retrieveAllDataFromQueue = (rocketID) => {
  redis.lrange(rocketsQueueMap[rocketID], 0, -1, (err, data) => {
    if (err) {
      console.error("Error getting items from the queue:", err);
    }
    return data.map((d) => JSON.parse(d));
  });
};

const printAllRocketData = (rocketID) => {
  // Retrieve all items in the queue
  const data = retrieveAllDataFromQueue(rocketID);
  console.log("Items in the queue: ");
  data.forEach((item) => {
    console.log(item);
  });
};

export { enqueueRocketData, dequeueRocketData, printAllRocketData };
