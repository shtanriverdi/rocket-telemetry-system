export default function Rocket({ rocketData }) {
  const dataa = {
    id: "DSSvW7VLmb",
    model: "Saturn V",
    mass: 2970000,
    payload: {
      description: "Apollo CSM-109 Odyssey, Apollo LM-7 Aquarius, 3 Astronauts",
      weight: 1542,
    },
    telemetry: {
      host: "0.0.0.0",
      port: 4000,
    },
    status: "waiting",
    timestamps: {
      launched: null,
      deployed: null,
      failed: null,
      cancelled: null,
    },
    // Telemetry data
    altitude: 0.0,
    speed: 0.0,
    acceleration: 0.0,
    thrust: 35100000,
    temperature: 0.0,
  };
  // Telemtry
  const { host, port } = rocketData.telemetry;
  // RestAPI Data
  const { id, model, mass, payload, status, timestamps } = rocketData;
  // Real time data from telemetry stream
  const { altitude, speed, acceleration, thrust, temperature } = rocketData;

  return (
    <>
      <h1>Rocket 1</h1>
    </>
  );
}
