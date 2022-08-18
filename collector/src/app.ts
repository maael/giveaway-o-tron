import express from "express";
import fetch from "isomorphic-fetch";

const app = express();
const port = process.env.PORT || 3001;

app.get("/", (_req, res) => res.json({ hello: "world" }));

app.get("/followers/mukluk", async (_req, res) => {
  getAllFollowers(process.env.MUK_ID!);

  res.json({ started: 1 });
});

app.get("/user/mukluk", async (_req, res) => {
  const data = await fetch(
    `https://api.twitch.tv/helix/users?login=${"mukluk"}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        "Client-ID": `${process.env.TWITCH_CLIENT_ID}`,
      },
    }
  ).then((r) => r.json());

  console.info({ data });

  res.json({ data });
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getAllFollowers(userId: string) {
  let cursor = "";
  let followers: any[] = [];
  do {
    const data = await fetch(
      `https://api.twitch.tv/helix/users/follows?to_id=${userId}&first=100&after=${cursor}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
          "Client-ID": `${process.env.TWITCH_CLIENT_ID}`,
        },
      }
    ).then((r) => r.json());
    followers = followers.concat(data.data);
    cursor = data.pagination.cursor;
    if (cursor) await wait(200);
    console.info(
      `${((followers.length / data.total) * 100).toFixed(2)}%`,
      `~${(((data.total - followers.length) / 100) * 200) / 1000}s remaining`
    );
  } while (cursor);
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
