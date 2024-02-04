/*
  We create a queue where we will store the data we fetched from REST API
  Then we will enqueue these data before the frontend consumes it
  We use redis for this purpose due to its performance and in memory mechanism
*/
import Redis from "ioredis";
const redis = new Redis();

// Queue lenght limit
const MAX_QUEUE_LENGTH = 100;

// Weather data queue
const weatherQueueName = "weatherQueue";

// Appends data into the weather queue
// Time Comp: O(1)
const enqueueWeatherData = async (data) => {
  const currentQueueLen = await redis.llen(weatherQueueName);
  // Keep the length of the queue constant to prevent memory overflow. etc
  if (currentQueueLen === MAX_QUEUE_LENGTH) {
    const poppedData = await redis.lpop(weatherQueueName);
    console.log("poppedData: ", poppedData);
  }
  await redis.rpush(weatherQueueName, JSON.stringify(data));
};

// Removes and gets the first data in the weather queue
const dequeueWeatherData = async () => {
  const data = await redis.lpop(weatherQueueName);
  return data ? JSON.parse(data) : "empty";
};

export { enqueueWeatherData, dequeueWeatherData };
