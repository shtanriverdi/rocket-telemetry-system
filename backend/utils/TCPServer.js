// To communicate through TCP
import net from "net";

const client = new net.Socket();
client.connect(4008, "0.0.0.0", function () {
  console.log("Connected");
  client.write("Hello, server! Rocket 4008");
});
