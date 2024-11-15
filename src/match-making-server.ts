import { MatchmakingServerPort } from "./constants/ports";
import * as ws from "ws";

export class MatchmakingServer{
    private server: ws.WebSocketServer;
    constructor(){
        this.server = new ws.WebSocketServer({ port: MatchmakingServerPort }, () => {
            console.log(`Matchmaking server started on port ${MatchmakingServerPort}`);
        });
        this.server.on("connection", function (wsConnection, _incomingMessage) {
            wsConnection.send("Connected to server");
            wsConnection.on("message", function (message) {
                console.log(message);
            })
        });
    }
}