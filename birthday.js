const fs = require("fs");
const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

const birthdays = JSON.parse(fs.readFileSync("birthdays.json"));

const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const todayMD = `${month}-${day}`;

function postMessage(text) {
  const data = JSON.stringify({
    channel: channel,
    text: text
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

  const req = https.request(options);
  req.write(data);
  req.end();
}

for (const userId in birthdays) {
  if (birthdays[userId].slice(5) === todayMD) {
    postMessage(`🎉 Сегодня день рождения у <@${userId}>! Поздравляем! 🎂`);
  }
}
