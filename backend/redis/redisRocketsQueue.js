/*
  We create a queue where we will store the data we fetched from REST API
  Then we will enqueue these data before the frontend consumes it
  We use redis for this purpose due to its performance and in memory mechanism
*/
import Redis from "ioredis";
const redis = new Redis();

// Queue lenght limit
const MAX_QUEUE_LENGTH = 100;

// Rockets data queue
const rocketsQueueName = "rocketsTelemetryQueue";

// Appends data into the rockets queue
// Time Comp: O(1)
const enqueueRocketsData = async (data) => {
  const currentQueueLen = await redis.llen(rocketsQueueName);
  // Keep the length of the queue constant to prevent memory overflow. etc
  if (currentQueueLen === MAX_QUEUE_LENGTH) {
    const poppedData = await redis.lpop(rocketsQueueName);
    console.log("poppedData: ", poppedData);
  }
  await redis.rpush(rocketsQueueName, JSON.stringify(data));
};

// Removes and gets the first data in the weather queue
const dequeueRocketsData = async () => {
  const data = await redis.lpop(rocketsQueueName);
  return data ? JSON.parse(data) : "empty";
};

export { enqueueRocketsData, dequeueRocketsData };
