// Takes: 2024-02-04T17:41:04.016020
// Returns: [ '04/02/2024', '17:41:04' ]
const formatTime = (timeString = "2024-02-04T17:41:04.016020") => {
  const [date, time] = timeString.split("T");
  return date.split("-").reverse().join("/") + " " + time.split(".")[0];
};

export { formatTime };
