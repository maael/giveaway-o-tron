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
  winner?: string;
  giveawayName?: string;
}

export async function sendMessage(
  guildId: string,
  channelId: string,
  message: MessageData
) {
  try {
    console.log("[discord][message][send]", { guildId, channelId, message });
    if (!guildId || !channelId) {
      console.log("[discord][message][skip]", { guildId, channelId, message });
      return;
    }
    const guild = await client.guilds.fetch(guildId);
    const channel = (await guild.channels.fetch(
      channelId
    )) as ActualChannelType;
    const roles = await guild.roles.fetch();
    let title = message.title
      .replace("$winner", message.winner || "Someone")
      .replace("$prize", message.giveawayName || "something");
    let body = message.body
      .replace("$winner", message.winner || "Someone")
      .replace("$prize", message.giveawayName || "something")
      .replace("$link", message.link);
    roles.forEach((r: any) => {
      if (r.name === "@everyone") return;
      title = title.replace(`@${r.name}`, `<@&${r.id}>`);
      body = body.replace(`@${r.name}`, `<@&${r.id}>`);
    });
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(message.colour)
          .setTitle(title)
          .setURL(message.link)
          .setDescription(body),
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
