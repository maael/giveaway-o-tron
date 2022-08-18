const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (_req, res) => res.json({ hello: "world" }));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
