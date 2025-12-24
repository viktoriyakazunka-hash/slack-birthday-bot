const fs = require("fs");
const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

const birthdays = JSON.parse(fs.readFileSync("birthdays.json", "utf8"));

const messages = [
  "🎉 Ура! Сегодня день рождения у {USERS}!",
  "🎂 Сегодня праздник у {USERS} — поздравляем!",
  "🥳 У {USERS} сегодня день рождения!",
  "🎁 Не забудьте поздравить: {USERS}"
];

const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const todayMD = `${month}-${day}`;

function postMessage(text) {
  const payload = { channel, text };
  const data = JSON.stringify(payload);

  const options = {
    hostname: "slack.com",
    path: "/api/chat.postMessage",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(data)
    }
  };

  const req = https.request(options);
  req.write(data);
  req.end();
}

// 1️⃣ собираем всех именинников
const birthdayUsers = [];

for (const userId in birthdays) {
  if (birthdays[userId].slice(5) === todayMD) {
    birthdayUsers.push(`<@${userId}>`);
  }
}

// 2️⃣ если есть кого поздравлять — шлём одно сообщение
if (birthdayUsers.length > 0) {
  const usersText = birthdayUsers.join(" и ");
  const template = messages[Math.floor(Math.random() * messages.length)];
  const text = template.replace("{USERS}", usersText);
  postMessage(text);
}

