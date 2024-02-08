const headers = new Headers();
headers.append("x-api-key", "API_KEY_1");
headers.append("Connection", "keepalive");
headers.append("Accept-Encoding", "gzip, deflate, br");
headers.append("Accept", "*/*");
headers.append("User-Agent", "PostmanRuntime/7.36.1");
headers.append("Content-Length", "0");
headers.append("Access-Control-Allow-Origin", "*"); // Fix cors error
headers.append("Postman-Token", "<calculated when request is sent>");
headers.append(
  "Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept"
);

export default headers;
