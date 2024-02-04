/*
  We create a queue where we will store the data we fetched from REST API
  Then we will enqueue these data before the frontend consumes it
  We use redis for this purpose due to its performance and in memory mechanism
*/
import Redis from "ioredis";
const redis = new Redis();

// Queue lenght limit
const MAX_QUEUE_LENGTH = 10;

// Last processed data, cached data
const lastRecentWeatherData = {};

// Weather data queue
const weatherQueueName = "weatherQueue";

const printAllData = async () => {
  // Retrieve all items in the queue
  redis.lrange(weatherQueueName, 0, -1, (err, items) => {
    if (err) {
      console.error("Error getting items from the queue:", err);
    } else {
      console.log("Items in the queue: ");
      items.forEach((item) => {
        // const jsonItem = JSON.parse(item);
        // console.log(jsonItem);
        console.log(item);
      });
    }
  });
};

// Appends data into the weather queue
// Time Comp: O(1)
const enqueueWeatherData = async (data) => {
  try {
    const currentQueueLen = await redis.llen(weatherQueueName);
    // Keep the length of the queue constant to prevent memory overflow. etc
    if (currentQueueLen >= MAX_QUEUE_LENGTH) {
      const poppedData = await redis.lpop(weatherQueueName);
      console.log("poppedData: ", poppedData);
    }
    const stringifiedData = JSON.stringify(data);
    await redis.rpush(weatherQueueName, stringifiedData);
    // Update last recent data
    lastRecentWeatherData = stringifiedData;
    console.log("Added data into the queue: ", data);
  } catch (error) {
    console.log("error enqueue: ", error);
  }
};

// Removes and gets the first data in the weather queue
const dequeueWeatherData = async () => {
  try {
    const data = await redis.lpop(weatherQueueName);
    console.log("Removed data from queue: ", data);
    return data ? JSON.parse(data) : lastRecentWeatherData;
  } catch (error) {
    console.log("error dequeue: ", error);
  }
};

export { enqueueWeatherData, dequeueWeatherData, printAllData, redis };
