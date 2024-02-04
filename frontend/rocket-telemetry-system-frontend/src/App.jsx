// import Rockets from "./Rockets";
import Weather from "./view/weather/Weather";
import "./app.css"

export default function App() {
  return (
    <>
      <div className="flex-container">
        <h2>Rocket Telemetry System</h2>
        <small>&nbsp; version 0.1</small>
      </div>
      <Weather />
      {/* <Rockets /> */}
    </>
  );
}
