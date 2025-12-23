const fs = require("fs");
const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

const birthdays = JSON.parse(fs.readFileSync("birthdays.json", "utf8"));

const messages = [
  "🎉 Сегодня день рождения у <@USER>! Поздравляем!",
  "🎂 Ура! У <@USER> сегодня день рождения!",
  "🥳 Поздравляем <@USER> с днём рождения! Пусть всё будет круто!",
  "🎁 Сегодня праздник у <@USER>! С днём рождения!"
];

function slackApi(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "slack.com",
      path,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    };

    const req = https.request(options, res => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve(JSON.parse(body)));
    });

    req.on("error", reject);
    req.end();
  });
}

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

function getUserLocalMonthDay(tzOffsetSeconds) {
  const now = new Date();
  const local = new Date(now.getTime() + tzOffsetSeconds * 1000);
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${m}-${d}`;
}

(async () => {
  for (const userId in birthdays) {
    const userInfo = await slackApi(`/api/users.info?user=${userId}`);

    if (!userInfo.ok) continue;

    const tzOffset = userInfo.user.tz_offset;
    const userToday = getUserLocalMonthDay(tzOffset);
    const birthdayMD = birthdays[userId].slice(5);

    if (userToday === birthdayMD) {
      const template = messages[Math.floor(Math.random() * messages.length)];
      const text = template.replace("<@USER>", `<@${userId}>`);
      postMessage(text);
    }
  }
})();

