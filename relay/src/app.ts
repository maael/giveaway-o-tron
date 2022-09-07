import express from "express";
import http from "http";
import { Server } from "socket.io";
import { sendMessage } from "./discord";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET"],
  },
  transports: ["websocket", "polling"],
});

interface WinnerMessage {
  type: "winner";
  channelId: string;
  winner: string;
  login: string;
  alertDuration: number;
  alertTheme: string;
  discordGuildId?: string;
  discordChannelId?: string;
  discordColour?: number;
  discordTitle?: string;
  discordBody?: string;
  discordEnabled?: boolean;
  giveawayName?: string;
}

type Message = WinnerMessage;

io.on("connection", (socket) => {
  const channelRoom = socket.handshake.query?.channel;
  console.log("[connection]", { channel: channelRoom });
  if (channelRoom) {
    socket.join(`${channelRoom}`);
  }
  socket.on("event", async (msg: Message) => {
    console.log("[event][relay]", channelRoom, msg);
    socket.to(`${msg.channelId}`).emit("event", msg);

    if (!msg.discordGuildId || !msg.discordChannelId || !msg.discordEnabled) {
      return;
    }
    const link = `https://twitch.tv/${msg.login}`;
    const colour = msg.discordColour || 0x9333ea;
    if (msg.type === "winner") {
      await sendMessage(msg.discordGuildId, msg.discordChannelId, {
        colour,
        title: msg.discordTitle || "A new giveaway winner!",
        link,
        body:
          msg.discordBody ||
          `:tada: $winner won a giveaway! [Join the stream here]($link)`,
        winner: msg.winner,
        giveawayName: msg.giveawayName,
      });
    } else if (msg.type === "timer-start") {
      /** Timer Event */
      await sendMessage(msg.discordGuildId, msg.discordChannelId, {
        colour,
        title: msg.discordTitle || "A giveaway has opened!",
        link,
        body: msg.discordBody || "[Join the stream now]($link)",
      });
    } else if (msg.type === "timer-end") {
      /** Timer Event */
      await sendMessage(msg.discordGuildId, msg.discordChannelId, {
        colour,
        title: msg.discordTitle || "A giveaway has closed!",
        link,
        body: msg.discordBody || "[Join the stream now]($link)",
      });
    } else if (msg.type === "timer-cancel") {
      /** Timer Event */
      await sendMessage(msg.discordGuildId, msg.discordChannelId, {
        colour,
        title: msg.discordTitle || "A giveaway was cancelled!",
        link,
        body: msg.discordBody || "[Join the stream now]($link)",
      });
    }
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
