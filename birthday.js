const fs = require("fs");
const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

const birthdays = JSON.parse(fs.readFileSync("birthdays.json", "utf8"));
const images = JSON.parse(fs.readFileSync("birthday-images.json", "utf8"));

const messages = [
  "🎉 Сегодня день рождения у {USERS}, давайте поздравим их!",
  "🎂 Праздник сегодня у {USERS}!",
  "🥳 У {USERS} сегодня день рождения!"
];

// ---- дата ----
const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const todayMD = `${month}-${day}`;

// ---- helpers ----
function postMessage(text, imageUrl, callback) {
  const payload = imageUrl
    ? {
        channel,
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text }
          },
          {
            type: "image",
            image_url: imageUrl,
            alt_text: "birthday image"
          }
        ]
      }
    : { channel, text };

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

function addReaction(name, ts) {
  const data = JSON.stringify({
    channel,
    name,
    timestamp: ts
  });

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

// ---- основная логика ----
const birthdayUsers = [];

for (const userId in birthdays) {
  if (birthdays[userId].slice(5) === todayMD) {
    birthdayUsers.push(`<@${userId}>`);
  }
}

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

  const imageUrl = images[todayMD] || null;

  postMessage(text, imageUrl, response => {
    if (response.ok) {
      ["tada", "birthday", "partying_face"].forEach(emoji =>
        addReaction(emoji, response.ts)
      );
    }
  });
}
