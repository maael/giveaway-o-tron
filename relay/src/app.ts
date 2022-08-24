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
  const channelRoom = socket.handshake.query?.channel;
  console.log("[connection]", { channel: channelRoom });
  if (channelRoom) {
    socket.join(`${channelRoom}`);
  }
  socket.on("event", (msg) => {
    console.log("[event][relay]", channelRoom, msg);
    socket.to(`${msg.channel}`).emit("event", msg);
  });
  socket.on("disconnect", () => {
    console.log("[disconnect]");
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
