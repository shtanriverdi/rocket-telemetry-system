import Rockets from "./view/rockets/Rockets";
import Weather from "./view/weather/Weather";
import "./app.css";

export default function App() {
  return (
    <>
      <div className="banner">
        <h2>Rocket Telemetry System</h2>
        <p>version 0.1</p>
      </div>
      <Weather />
      <Rockets />
      <small className="m-bs">
        Created by <b>Süha Tanrıverdi.</b> 2024
      </small>
    </>
  );
}
