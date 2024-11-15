import * as ws from "ws";
const PORT = 8080;

const server = new ws.WebSocketServer({ port: PORT }, () => {
    console.log(`Server started on port ${PORT}`);
});

server.on("connection", function (wsConnection, _incomingMessage) {
    wsConnection.send("Connected to server");
});