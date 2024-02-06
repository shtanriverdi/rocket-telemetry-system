export default function Rocket({ rocketData }) {
  // Telemetry
  const { host, port } = rocketData.telemetry;
  // RestAPI Data
  const { id, model, mass, payload, status, timestamps } = rocketData;
  // Real time data from telemetry stream
  const { altitude, speed, acceleration, thrust, temperature } = rocketData;

  return (
    <div className="flex-container flex-col">
      <div>
        <h4>Rocket id: {id}</h4>
        <span className="bold">Payload:</span>
        <p>Weight: {payload.weight}</p>
        <p>Description: {payload.description}</p>
      </div>

      <div className="rocket-container m-b">
        <div>
          <li>Model: {model}</li>
          <li>Mass: {mass}</li>
        </div>

        <div className="p-x">
          <li>Status: {status}</li>
          <li className="bold">Timestamps:</li>
          <li>launched: {timestamps.launched ?? "-"}</li>
          <li>deployed: {timestamps.deployed ?? "-"}</li>
          <li>failed: {timestamps.failed ?? "-"}</li>
          <li>cancelled: {timestamps.cancelled ?? "-"}</li>
        </div>

        <div>
          <li className="bold">Telemetry Data:</li>
          <li>Altitude: {altitude}</li>
          <li>Speed: {speed}</li>
          <li>Acceleration: {acceleration}</li>
          <li>Thrust: {thrust}</li>
          <li>Temperature: {temperature}</li>
          <li>{host + ":" + port}</li>
        </div>
      </div>
    </div>
  );
}
