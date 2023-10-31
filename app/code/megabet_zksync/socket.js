import { createServer } from "http";
import { Server } from "socket.io";
import { delay } from "../megabet_core/helper";
import dotenv from "dotenv";
dotenv.config();
import config from "./config.js";

const initShowResultSocket = async (gModeResults , sModeResult) => {
    const DEPLOY_MODE = process.env.DEPLOY_MODE || "";
    if (!DEPLOY_MODE) throw "Deploy mode not detected! Add it to the .env file!";
    const port = config[DEPLOY_MODE].sockets.show_results.port;
    const showResultsPath = config[DEPLOY_MODE].sockets.show_results.path;
    const httpServer = createServer();
    const io = new Server(httpServer, {
        path: showResultsPath
    });
    
    io.on("connection", (socket) => {
        for (const gModeResult of gModeResults) {
            socket.emit("gModeResult", gModeResult);
            delay(30000);
        }
        socket.emit("sModeResult", sModeResult);
    });
    
    httpServer.listen(port);
}

export {initShowResultSocket}