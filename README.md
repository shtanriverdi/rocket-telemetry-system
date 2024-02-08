# Rocket Launch Control Application

https://github.com/shtanriverdi/rocket-telemetry-system/assets/36234545/afb9ddbf-2f11-4372-9813-f287b7cb69ef

## Description
This project involves developing a command control application for a newly established rocket launch station. The application must provide users with an interface to view the current status of rockets in the field in real-time and enable control of selected rockets through provided components.
Additionally, users should be able to access real-time weather conditions via the interface to inform launch decisions based on environmental parameters.

<!---
## Running the Backend Application
To run the application, ensure that the latest version of Docker is installed on your system. Once Docker is confirmed to be running, execute the following command to run the application:
Alternatively, you can run the application using the provided compose file (`docker-compose.yaml`).

## Access
After running the application, you can access the REST API endpoints defined in the Postman collection at http://localhost:5000.
To authenticate requests to the REST API services, ensure that the required parameters are included in the request headers, as documented.
To access the telemetry systems of the rockets, utilize the `rocket` model's `telemetry` attributes `host` and `port`, available at http://localhost:5000/rockets. Connect to each rocket using a TCP client with the provided host and port values to receive real-time data following the protocol outlined in the documentation.
Import the provided Postman collection (`Launch Site.postman_collection.json`) and environment (`Launch Site - localhost.postman_environment.json`) to test the endpoints and explore the documentation.
--->

### Notes
- The application may experience delays in responding to REST API requests due to high electromagnetic interference, typically ranging from 0.4 to 2.3 seconds.
- The REST API service may return a 503: Service Unavailable error with a 20% likelihood.
- The rocket telemetry systems have a 10% chance of sending "faulty data."
- Real-time data from rocket telemetry systems is sent at 100 ms intervals.

### User Stories
- As a user, I should be able to view all rockets in the field with their respective information.
- As a user, I should be able to monitor the telemetry data and status of rockets in real-time.
- As a user, I should be able to view the cargo content carried by each rocket.
- As a user, I should be able to view the connection status of telemetry systems associated with each rocket.
- As a user, I should be able to launch each rocket through the interface.
- As a user, I should be able to monitor the current weather conditions in real time.

## Development
The application communicates with the provided backend application to fulfill the user stories outlined above. The backend exposes a REST API for retrieving rocket information and weather data. Additionally, each rocket has a telemetry service accessible via TCP for real-time data.
The application collects data from these interfaces and presents it to the user through a user-friendly interface.

### Tools and Technologies
The application is developed using the following technologies:
- Redis: Used for caching and queuing telemetry and weather data.
- Express: Node.js framework utilized for backend development.
- Socket.IO: Enables real-time communication between the server and client.
- Docker: Containerization tool used for deployment.
- React: Added for a more structured and reusable user interface.
- Postman: Used to check all the endpoints.

### Additional Features
- **Reset Button**: Added a reset button to reset the application state.
- **Individual Rocket Connections**: Enabled individual connections to each rocket, allowing for separate interactions.
- Used **standard deviation techniques** to clear the invalid data from the data stream.

<!---
## Documentation
- **README.md**: Contains instructions for running the backend application. Before starting development, it's recommended to test the application's functionality using Postman.
- **Launch Site.postman_collection.json**: Postman collection for accessing the REST API endpoints.
- **Rocket Telemetry System Communication Protocol Definition.pdf**: Documentation defining the protocol for communicating with rocket telemetry systems.

## Requirements
To run and test the application, you need:
- Docker: Required for running the backend application.
- Postman: Used for testing REST API endpoints and accessing documentation.

## Evaluation
The submitted source code will be evaluated based on the following criteria:
- Implementation of technical requirements.
- Code readability and organization.
- Reusability of components.
- Overall code structure.
- Unit testing.
- Performance considerations.
- Number of implemented user scenarios
-->

## Rocket Telemetry System Protocol
![image](https://github.com/shtanriverdi/rocket-telemetry-system/assets/36234545/5bfe4586-e37b-47e0-b3f0-d08adfdcfb7f)

