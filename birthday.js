const fs = require("fs");
const https = require("https");

const token = process.env.SLACK_TOKEN;
const channel = process.env.CHANNEL_ID;

const birthdays = JSON.parse(fs.readFileSync("birthdays.json", "utf8"));

/* ---------------- КАРТИНКИ ---------------- */

const images = [
"https://raw.githubusercontent.com/viktoriyakazunka-hash/slack-birthday-bot/main/photos/users/birthday1.png",
"https://raw.githubusercontent.com/viktoriyakazunka-hash/slack-birthday-bot/main/photos/users/birthday2.png",
"https://raw.githubusercontent.com/viktoriyakazunka-hash/slack-birthday-bot/main/photos/users/birthday3.png"
];

/* ---------------- ТЕКСТЫ (1 человек) ---------------- */

const messages1 = [

`Коллеги, привет! Сегодня день рождения у {USERS} 🥳

Пусть новый год жизни приносит яркие идеи, вдохновение и множество поводов для гордости, каждый рабочий день радует результатами, а вне работы ждёт много приятных моментов и отличного настроения 🎉`,

`Всем привет! Сегодня отличный повод для поздравлений – день рождения у {USERS} 🎁

Пусть впереди будет много интересных задач, успешных проектов и приятных открытий, а энергия, удача и хорошее настроение сопровождают каждый день 🎊`,

`Коллеги, сегодня в команде праздник – день рождения у {USERS} 🥰

Пусть новый год жизни будет наполнен вдохновением, классными идеями и профессиональными победами, а каждый день приносит радость, развитие и приятные сюрпризы 🎉`,

`Привет! Сегодня день рождения отмечает {USERS} 🎊

Пусть впереди будет много возможностей для роста, ярких достижений и интересных проектов, удача сопровождает во всех начинаниях, а настроение всегда остаётся отличным 🤗`,

`Коллеги, сегодня поздравления с днем рождения принимает {USERS} 🥳

Пусть впереди ждёт много вдохновения, сильных идей и красивых результатов, а каждый день приносит радость, новые возможности и поводы для улыбок 🎁`,

`Всем привет! Сегодня день рождения у {USERS} 🎉

Пусть этот год принесёт много ярких событий, интересных задач и приятных побед, рядом всегда будет поддержка, а настроение остаётся праздничным как можно чаще 🎊`,

`Коллеги, сегодня особенный день – день рождения у {USERS} 🎁

Пусть впереди будет много вдохновения, энергии и интересных проектов, а все задуманные планы легко реализуются и приносят удовольствие ❤️`,

`Привет! Сегодня день рождения у {USERS} 🥳

Пусть каждый день открывает новые возможности для роста и достижения целей, работа приносит радость, а жизнь радует яркими событиями 🎉`,

`Коллеги, сегодня день рождения у {USERS} 🎊

Пусть впереди ждёт много интересных идей, вдохновения и успешных проектов, а каждый новый день приносит радость, энергию и отличное настроение 🤗`,

`Всем привет! Сегодня поздравления с днем рождения принимает {USERS} 🎉

Пусть этот год будет наполнен яркими событиями, приятными встречами и новыми достижениями, а каждый день радует возможностями и хорошими новостями 🥰`

];

/* ---------------- ТЕКСТЫ (2 человека) ---------------- */

const messages2 = [

`Коллеги, привет! Сегодня в команде двойной праздник – день рождения у {USERS} 🥳

Пусть впереди будет много вдохновения, интересных задач и ярких проектов, а каждый день приносит отличное настроение, новые возможности и приятные события 🎉`,

`Всем привет! Сегодня поздравления с днем рождения принимают {USERS} 🎁

Пусть новый год жизни будет наполнен достижениями, яркими идеями и успешными проектами, а каждый день радует хорошими новостями и приятными сюрпризами 🎊`,

`Коллеги, сегодня сразу два повода для радости – день рождения у {USERS} 🎉

Пусть впереди будет много вдохновения, энергии и интересных возможностей, а каждый день приносит радость, развитие и отличное настроение 🥰`,

`Привет! Сегодня в команде двойной праздник – день рождения у {USERS} 🎊

Пусть новый год жизни будет наполнен яркими событиями, сильными идеями и успешными результатами, а каждый день радует новыми достижениями и позитивом 🤗`,

`Коллеги, сегодня поздравления с днем рождения принимают {USERS} 🥳

Пусть впереди будет много вдохновения, интересных проектов и ярких побед, а каждый день приносит радость, энергию и хорошие новости 🎁`

];

/* ---------------- ТЕКСТЫ (3+) ---------------- */

const messages3 = [

`Коллеги, привет! Сегодня день рождения у {USERS} 🥳

Пусть этот год принесёт много вдохновения и ярких идей. Желаем отличных проектов, сильных результатов и радостных событий 🎉`,

`Всем привет! Сегодня поздравления с днем рождения принимают {USERS} 🎁

Пусть новый год жизни будет интересным и насыщенным. Крутых достижений, хороших новостей и отличного настроения 🎊`,

`Коллеги, сегодня тройной праздник – день рождения у {USERS} 🎉

Пусть впереди будет много возможностей и смелых идей. Ярких побед, вдохновения и приятных сюрпризов 🥰`,

`Привет! Сегодня поздравления принимают {USERS} 🎊

Пусть этот год станет временем развития и достижений. Интересных задач, сильных результатов и отличного настроения 🤗`,

`Коллеги, сегодня праздник у {USERS} 🥳

Пусть впереди будет много энергии и вдохновения. Больше радостных событий, классных проектов и приятных неожиданностей 🎁`

];

/* ---------------- ДАТА ---------------- */

const today = new Date();
const month = String(today.getMonth()+1).padStart(2,"0");
const day = String(today.getDate()).padStart(2,"0");
const todayMD = `${month}-${day}`;

/* ---------------- ПОИСК ИМЕНИННИКОВ ---------------- */

const birthdayUsers = [];

for (const userId in birthdays) {
 if (birthdays[userId].slice(5) === todayMD) {
  birthdayUsers.push(`<@${userId}>`);
 }
}

if (birthdayUsers.length > 0){

let usersText;

if (birthdayUsers.length === 1){
 usersText = birthdayUsers[0];
}

else if (birthdayUsers.length === 2){
 usersText = birthdayUsers.join(" и ");
}

else{
 usersText =
 birthdayUsers.slice(0,-1).join(", ") +
 " и " +
 birthdayUsers[birthdayUsers.length-1];
}

/* выбираем текст */

let template;

if (birthdayUsers.length === 1){
 template = messages1[Math.floor(Math.random()*messages1.length)];
}

else if (birthdayUsers.length === 2){
 template = messages2[Math.floor(Math.random()*messages2.length)];
}

else{
 template = messages3[Math.floor(Math.random()*messages3.length)];
}

const text = template.replace(/ИМЯ/g, usersText);

/* выбираем картинку */

const imageUrl = images[Math.floor(Math.random()*images.length)];

const payload = JSON.stringify({
channel,
blocks:[
{
type:"section",
text:{type:"mrkdwn",text}
},
{
type:"image",
image_url:imageUrl,
alt_text:"birthday"
}
]
});

const options = {
hostname:"slack.com",
path:"/api/chat.postMessage",
method:"POST",
headers:{
"Authorization":`Bearer ${token}`,
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(payload)
}
};

const req = https.request(options,res=>{

let body="";

res.on("data",chunk=>body+=chunk);

res.on("end",()=>{

const response = JSON.parse(body);

if(response.ok){

["tada","birthday","partying_face"].forEach(emoji=>{

const reactionData = JSON.stringify({
channel,
name:emoji,
timestamp:response.ts
});

const reactionOptions = {
hostname:"slack.com",
path:"/api/reactions.add",
method:"POST",
headers:{
"Authorization":`Bearer ${token}`,
"Content-Type":"application/json",
"Content-Length":Buffer.byteLength(reactionData)
}
};

const reactionReq = https.request(reactionOptions);
reactionReq.write(reactionData);
reactionReq.end();

});

}

});

});

req.write(payload);
req.end();

}
