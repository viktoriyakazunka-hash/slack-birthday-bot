const fs = require("fs");
const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

const birthdays = JSON.parse(fs.readFileSync("birthdays.json", "utf8"));

const messages = [
  "🎉 Ура! Сегодня день рождения у {USERS} — давайте поздравим и пожелаем отличного настроения и большого счастья!",
  "🎂 Сегодня праздник у {USERS}! Желаем радости, улыбок и классного года впереди!",
  ":balloon: У {USERS} сегодня день рождения — отличный повод пожелать что-нибудь теплое и приятное!",
  "🥳 Не забудьте поздравить {USERS} с днём рождения и пожелать всего самого приятного!"
];

const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const todayMD = `${month}-${day}`;

// ---------- вспомогательные функции ----------

function postMessage(text, callback) {
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

  const req = https.request(options, res => {
    let body = "";
    res.on("data", chunk => body += chunk);
    res.on("end", () => callback && callback(JSON.parse(body)));
  });

  req.write(data);
  req.end();
}

function addReaction(name, timestamp) {
  const payload = {
    channel,
    name,
    timestamp
  };

  const data = JSON.stringify(payload);

  const options = {
    hostname: "slack.com",
    path: "/api/reactions.add",
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

// ---------- логика ----------

// 1️⃣ собираем именинников
const birthdayUsers = [];

for (const userId in birthdays) {
  if (birthdays[userId].slice(5) === todayMD) {
    birthdayUsers.push(`<@${userId}>`);
  }
}

// 2️⃣ если есть кого поздравлять
if (birthdayUsers.length > 0) {

  let usersText;

  if (birthdayUsers.length === 1) {
    usersText = birthdayUsers[0];
  } else if (birthdayUsers.length === 2) {
    usersText = birthdayUsers.join(" и ");
  } else {
    usersText =
      birthdayUsers.slice(0, -1).join(", ") +
      " и " +
      birthdayUsers[birthdayUsers.length - 1];
  }

  const template = messages[Math.floor(Math.random() * messages.length)];
  const text = template.replace("{USERS}", usersText);

  // 3️⃣ отправляем сообщение и добавляем реакции
  postMessage(text, response => {
    if (response.ok) {
      const ts = response.ts;
      ["tada", "birthday", "partying_face"].forEach(emoji =>
        addReaction(emoji, ts)
      );
    }
  });
}


