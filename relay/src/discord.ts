import { EmbedBuilder } from "@discordjs/builders";
import { Client, NonThreadGuildBasedChannel, hyperlink } from "discord.js";

// Create a new client instance
export const client = new Client({ intents: [] });

type ActualChannelType = NonThreadGuildBasedChannel & {
  send: (str: string | { embeds: EmbedBuilder[] }) => Promise<void>;
};

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  console.log("[discord][ready]");
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

export interface MessageData {
  colour: number;
  title: string;
  body: string;
  link: string;
}

export async function sendMessage(
  guildId: string,
  channelId: string,
  message: MessageData
) {
  try {
    console.log("[discord][message][send]", { guildId, channelId, message });
    const guild = await client.guilds.fetch(guildId);
    const channel = (await guild.channels.fetch(
      channelId
    )) as ActualChannelType;
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(message.colour)
          .setTitle(message.title)
          .setURL(message.link)
          .setDescription(message.body.replace("@link", message.link)),
      ],
    });
    console.log("[discord][message][sent]", { guildId, channelId, message });
  } catch (e) {
    console.error(
      "[discord][message][error]",
      { guildId, channelId, message },
      e.message
    );
  }
}
