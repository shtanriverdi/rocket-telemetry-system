export default function Rocket({ rocketData }) {
  // Telemetry
  const { host, port } = rocketData.telemetry;
  // RestAPI Data
  const { id, model, mass, payload, status, timestamps } = rocketData;
  // Real time data from telemetry stream
  const { altitude, speed, acceleration, thrust, temperature } = rocketData;

  return (
    <div className="rocket-container p">
      <div className="m-b">
        <p className="text-center m-bs">
          <b>Rocket:</b> {id}
        </p>
        <p>
          <b>Payload:</b> {payload.description}
        </p>
        <p>
          <b>Weight:</b> {payload.weight}
        </p>
        <div className="no-bullet">
          <li>
            <b>Model:</b> {model}
          </li>
          <li>
            <b>Mass:</b> {mass}
          </li>
        </div>
      </div>

      <div className="tele-container no-bullet">
        <div>
          <li className="bold m-r">Telemetry Data</li>
          <li>Altitude: {altitude}</li>
          <li>Speed: {speed}</li>
          <li>Acceleration: {acceleration}</li>
          <li>Thrust: {thrust}</li>
          <li>Temperature: {temperature}</li>
        </div>
        <div>
          <li className="bold">Timestamps</li>
          <li>launched: {timestamps.launched ?? "-"}</li>
          <li>deployed: {timestamps.deployed ?? "-"}</li>
          <li>failed: {timestamps.failed ?? "-"}</li>
          <li>cancelled: {timestamps.cancelled ?? "-"}</li>
        </div>
      </div>
      <p className="m-t">
        <b>Status:</b> {status}
        <li className="no-bullet">
          <b>Host/Port:</b> {host + ":" + port}
        </li>
      </p>
    </div>
  );
}
