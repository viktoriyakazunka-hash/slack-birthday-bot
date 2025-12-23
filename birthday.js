const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

console.log("TOKEN EXISTS:", !!token);
console.log("CHANNEL:", channel);

const data = JSON.stringify({
  channel: channel,
  text: "🧪 Тестовое сообщение от birthday-bot"
});

const options = {
  hostname: "slack.com",
  path: "/api/chat.postMessage",
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Content-Length": data.length
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
