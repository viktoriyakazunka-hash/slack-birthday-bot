const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

const message = {
  channel: channel,
  text: "Тестовое сообщение от birthday-bot"
};

const data = JSON.stringify(message);
const dataLength = Buffer.byteLength(data);

const options = {
  hostname: "slack.com",
  path: "/api/chat.postMessage",
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": dataLength
  }
};

const req = https.request(options, res => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    console.log("Slack response:", body);
  });
});

req.on("error", err => console.error(err));
req.write(data);
req.end();
