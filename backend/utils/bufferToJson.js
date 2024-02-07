// Converts bufferData to JSON format
export default function (bufferData) {
  /*
      Looking at the toJSON() output of the data buffer,
      we can look at the data that each element corresponds to:
  
      <Buffer 82 44 53 53 76 57 37 56 4c 6d 62 77 14 00 00 00
      00 00 00 00 00 00 00 00 00 4c 05 e5 58 00 00 00 00 d1 45 80>
      {
        type: 'Buffer',
        data: [
          130, 68,  83, 83, 118, 87,  55, 86,  76,
          109, 98, 119, 20,   0,  0,   0,  0,   0,
            0,  0,   0,  0,   0,  0,   0, 76,   5,
          229, 88,   0,  0,   0,  0, 209, 69, 128
        ]
      }
  
      The first element (130) represents the start byte (Packet start byte).
      The next 10 elements (68, 83, 83, 118, 87, 55, 86, 76, 109, 98) form the rocket ID.
      Item (119) represents the package number.
      item (20) represents the package size.
      14-17. The elements (0, 0, 0, 0) represent the altitude of the rocket.
      18-21. The elements (0, 0, 0, 0) represent the speed of the rocket.
      22-25. The elements (76, 5, 229, 88) represent the acceleration of the rocket.
      26-29. The elements (0, 0, 0, 0) represent the thrust of the rocket.
      30-33. The elements (209, 69, 128) represent the temperature of the rocket.
      34-35. items (Short) represent CRC16/BUYPASS value.
      The last element (80) represents the delimiter byte (Delimiter).
      Based on this information, we can parse the data buffer and place each piece of data
      in the corresponding field. For example,
      you can concatenate the string value between the 2nd and 11th elements
      to get the rocket ID (68, 83, 83, 118, 87, 55, 86, 76, 109, 98 -> "DSSvW7VLmb").
      Similarly, you can access other data fields.
      */
  const jsonData = JSON.stringify(bufferData.toJSON());

  // Parse bufferData to extract meaningful information
  const packetStartByte = bufferData[0]; // Packet start byte
  const rocketID = String.fromCharCode(...bufferData.slice(1, 11)); // Rocket ID
  const packetNumber = bufferData[11]; // Packet number
  const packetSize = bufferData[12]; // Packet size
  const altitude = bufferData.readFloatBE(13); // Altitude as meter
  const speed = bufferData.readFloatBE(17); // Speed as meter per second
  const acceleration = bufferData.readFloatBE(21); // Acceleration as meter per second per second
  const thrust = bufferData.readFloatBE(25); // Thrust as Newton
  const temperature = bufferData.readFloatBE(29); // Temperature as degree Celsius
  const crc16 = bufferData.readUInt16BE(33); // CRC16/BUYPASS value
  const delimiter = bufferData[35]; // Delimiter byte

  // Construct the data object with extracted information
  const rocketData = {
    packetStartByte,
    rocketID,
    packetNumber,
    packetSize,
    altitude,
    speed,
    acceleration,
    thrust,
    temperature,
    crc16,
    delimiter,
  };

  return rocketData;
}
