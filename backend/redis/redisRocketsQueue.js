/*
  We create a queue where we will store the data we fetched from TCP telemetry connection
  So that we can fix the invalid data entries before we send them to frontend
*/
// Rockets info
import rockets from "../utils/rocketsHostInfo.js";

import Redis from "ioredis";
const redis = new Redis();

// Queue lenght limit
const MAX_QUEUE_LENGTH = 500;

const emptyData = {
  altitude: 0,
  speed: 0,
  acceleration: 0,
  thrust: 0,
  temperature: 0,
};

// Rockets data queue
const rocketsList = rockets.map((rocketData) => rocketData.id);
// Stores specific queue for each rocket using rocket IDs
const rocketsQueueMap = {};
rocketsList.forEach((rocketID) => {
  rocketsQueueMap[rocketID] = rocketID;
});

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
Seconds altitude,   speed,   acceleration, thrust, temperature
0,      0.00,      0.00,      0.00,       0.00,     20.00
1,      10.00,     5.00,       9.81,    500.00,     25.00
2,      20.00,     10.00,      9.81,    1000.00,    30.00
3,      30.00,     15.00,      9.81,    1500.00,    35.00
4,      40.00,     20.00,      9.81,    2000.00,    40.00
5,      50.00,     25.00,      9.81,    2500.00,    45.00
6,      60.00,     30.00,      9.81,    3000.00,    50.00
7,      70.00,     35.00,      9.81,    3500.00,    55.00
8,      80.00,     40.00,      9.81,    4000.00,    60.00
9,      90.00,     45.00,      9.81,    4500.00,    65.00
10,    100.00,     50.00,      9.81,    5000.00,    70.00
11,    110.00,     55.00,      9.81,    5500.00,    75.00
12,    120.00,     60.00,      9.81,    6000.00,    80.00
13,    130.00,     65.00,      9.81,    6500.00,    85.00
14,    140.00,     70.00,      9.81,    7000.00,    90.00
15,    150.00,     75.00,      9.81,    7500.00,    95.00
16,    160.00,     80.00,      9.81,    8000.00,    100.00
17,    170.00,     85.00,      9.81,    8500.00,    105.00
18,    180.00,     90.00,      9.81,    9000.00,    110.00
19,    190.00,     95.00,      9.81,    9500.00,    115.00
20,    200.00,     100.00,     9.81,    10000.00,   120.00

Average Altitude: 50 meters
Average Speed: 25 meters per second
Average Acceleration: 9.81 meters per second squared
Average Thrust: 2227.27 Newtons
Average Temperature: Approximately 41.36 degrees Celsius
*/
// Difference threshold is 2.0, we can change this value for better precision, I also used standard deviation.
// I just assumed that a rocket cannot change its for example speed or altitude from 1.xx to 8.xx in a second(1000ms)
// To be more realistic, we should talk to physicians to set this treshold :)
const isValidFloat = (
  averages,
  standardDeviations,
  dataToBeChecked,
  threshold = 2.0
) => {
  for (const [key, value] of Object.entries(dataToBeChecked)) {
    if (standardDeviations.hasOwnProperty(key)) {
      const difference = Math.abs(value - averages[key]);
      if (difference > threshold * standardDeviations[key]) {
        // console.log(`Invalid data for ${key}: ${value}`);
        return false;
      }
    }
  }
  return true;
};

const isDataValid = async (dataToBePushed, rocketID) => {
  // New data to be checked
  const {
    altitudeToBeChecked,
    speedToBeChecked,
    accelerationToBeChecked,
    thrustToBeChecked,
    temperatureToBeChecked,
  } = dataToBePushed;
  const currentData = await retrieveAllDataFromQueue(rocketID, true);
  const curDataSumCountMap = {
    altitude: { sum: 0, count: 0, sumOfSquares: 0 },
    speed: { sum: 0, count: 0, sumOfSquares: 0 },
    acceleration: { sum: 0, count: 0, sumOfSquares: 0 },
    thrust: { sum: 0, count: 0, sumOfSquares: 0 },
    temperature: { sum: 0, count: 0, sumOfSquares: 0 },
  };

  // TypeError: currentData is not iterable ???? ERROR
  for (const data of currentData) {
    curDataSumCountMap.altitude.sum += data.altitude;
    curDataSumCountMap.speed.sum += data.speed;
    curDataSumCountMap.acceleration.sum += data.acceleration;
    curDataSumCountMap.thrust.sum += data.thrust;
    curDataSumCountMap.temperature.sum += data.temperature;
    curDataSumCountMap.altitude.sumOfSquares += Math.pow(data.altitude, 2);
    curDataSumCountMap.speed.sumOfSquares += Math.pow(data.speed, 2);
    curDataSumCountMap.acceleration.sumOfSquares += Math.pow(
      data.acceleration,
      2
    );
    curDataSumCountMap.thrust.sumOfSquares += Math.pow(data.thrust, 2);
    curDataSumCountMap.temperature.sumOfSquares += Math.pow(
      data.temperature,
      2
    );
    curDataSumCountMap.altitude.count++;
    curDataSumCountMap.speed.count++;
    curDataSumCountMap.acceleration.count++;
    curDataSumCountMap.thrust.count++;
    curDataSumCountMap.temperature.count++;
  }

  const averages = {
    altitude:
      curDataSumCountMap.altitude.sum / curDataSumCountMap.altitude.count,
    speed: curDataSumCountMap.speed.sum / curDataSumCountMap.speed.count,
    acceleration:
      curDataSumCountMap.acceleration.sum /
      curDataSumCountMap.acceleration.count,
    thrust: curDataSumCountMap.thrust.sum / curDataSumCountMap.thrust.count,
    temperature:
      curDataSumCountMap.temperature.sum / curDataSumCountMap.temperature.count,
  };

  const standardDeviations = {
    altitude: Math.sqrt(
      curDataSumCountMap.altitude.sumOfSquares /
        curDataSumCountMap.altitude.count -
        Math.pow(averages.altitude, 2)
    ),
    speed: Math.sqrt(
      curDataSumCountMap.speed.sumOfSquares / curDataSumCountMap.speed.count -
        Math.pow(averages.speed, 2)
    ),
    acceleration: Math.sqrt(
      curDataSumCountMap.acceleration.sumOfSquares /
        curDataSumCountMap.acceleration.count -
        Math.pow(averages.acceleration, 2)
    ),
    thrust: Math.sqrt(
      curDataSumCountMap.thrust.sumOfSquares / curDataSumCountMap.thrust.count -
        Math.pow(averages.thrust, 2)
    ),
    temperature: Math.sqrt(
      curDataSumCountMap.temperature.sumOfSquares /
        curDataSumCountMap.temperature.count -
        Math.pow(averages.temperature, 2)
    ),
  };

  return isValidFloat(averages, standardDeviations, dataToBePushed);
};

// Appends data into the rockets queue
// Accepts first 10 data anyway for checking purposes
// Time Comp: O(1)
const enqueueRocketData = async (data, rocketID) => {
  // console.log("rocketsQueueMap: ", rocketsQueueMap);
  const currentQueueLen = await redis.llen(rocketsQueueMap[rocketID]);
  // Keep the length of the queue constant to prevent memory overflow. etc
  if (currentQueueLen >= MAX_QUEUE_LENGTH) {
    const poppedData = await redis.lpop(rocketsQueueMap[rocketID]);
    // console.log("poppedData: ", poppedData);
  }
  // Push only if data is valid, we need at least 10 data entries
  const isValid = await isDataValid(data, rocketID);
  if (currentQueueLen <= 100 || isValid) {
    // console.log("isValid: ", isValid);
    await redis.rpush(rocketsQueueMap[rocketID], JSON.stringify(data));
    // console.log("Data pushed: ", rocketsQueueMap[rocketID], rocketID);
  }
};

// Removes and gets the first data in the weather queue
const dequeueRocketData = async (rocketID) => {
  const data = await redis.lpop(rocketsQueueMap[rocketID]);
  return data ? JSON.parse(data) : emptyData;
};

// Retrieves all items in the given rocketID's queue
const retrieveAllDataFromQueue = async (rocketID, seekJSON) => {
  try {
    const data = await redis.lrange(
      rocketsQueueMap[rocketID],
      0,
      -1,
      (err, data) => {
        if (err) {
          console.error("Error getting items from the queue:", err);
        }
      }
    );
    if (seekJSON) {
      const dataList = data.map((d) => JSON.parse(d));
      return dataList;
    }
    return data;
  } catch (error) {
    console.error("Error getting items from the redis queue:", error);
  }
};

const printAllRocketDataAsJSON = async (rocketID) => {
  // Retrieve all items in the queue
  const data = await retrieveAllDataFromQueue(rocketID, true);
  console.log("Items in the queue for rocket", rocketID, ":");
  data.forEach((item) => {
    console.log(item);
  });
  console.log("\n");
};

const printAllRocketDataAsString = async (rocketID) => {
  // Retrieve all items in the queue
  const data = await retrieveAllDataFromQueue(rocketID, false);
  console.log("Items in the queue for rocket", rocketID, ":");
  console.log(data, "\n");
};

export {
  enqueueRocketData,
  dequeueRocketData,
  printAllRocketDataAsJSON,
  printAllRocketDataAsString,
};
