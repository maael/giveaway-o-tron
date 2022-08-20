import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("event", (msg) => {
    console.log("broadcast");
    socket.broadcast.emit("event", msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/", (_req, res) => {
  res.send(
    `<h1>${io.engine.clientsCount} client${
      io.engine.clientsCount === 1 ? "" : "s"
    }</h1>`
  );
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
