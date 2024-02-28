const OneSignal = require("@onesignal/node-onesignal");
const fetch = require("node-fetch");
const cron = require("node-cron");
var https = require("https");
const { DateTime } = require("luxon");


const configuration = OneSignal.createConfiguration({
  userKey: "NjdlODlhZTQtODJjMC00YTNjLWE3MmQtZjU3MDU4YzNlOTZj",
  appKey: "MjI0YmRiZDAtMzFlOC00ZDdjLWI4MDctZmU1OGI4OWEwYmE5",
});

const client = new OneSignal.DefaultApi(configuration);

const notification = new OneSignal.Notification();
notification.app_id = "1a466f9c-d32b-4820-80c6-7e362344123c";


cron.schedule("0-59 6-21/4 * * *", () => {
  // Every 4 hours between 6 am and 10 pm
  getUserData();
});



function getUserData() {
  const deviceUrl =
    "https://onesignal.com/api/v1/players?app_id=1a466f9c-d32b-4820-80c6-7e362344123c";

  const options = {
    method: "GET",
    headers: {
      accept: "text/plain",
      Authorization: "Basic MjI0YmRiZDAtMzFlOC00ZDdjLWI4MDctZmU1OGI4OWEwYmE5",
    },
  };

  fetch(deviceUrl, options)
    .then((res) => res.json())
    .then((json) => {
      getLocation(json.players);
    //  console.log(json.players)
    })
    .catch((err) => console.error("error:" + err));
}

function getLocation(users) {
  let length = users.length;
  for (let i = 0; i < length; i++) {
    let ip = users[i].ip;
    let id = users[i].id;
    passInfo(id, ip);
  }
}

function passInfo(id, ip) {
  //using https
  const options = {
    path: `/${ip}/timezone/`,
    host: "ipapi.co",
    port: 443,
    headers: { "User-Agent": "nodejs-ipapi-v1.02" },
  };
  https.get(options, function (resp) {
    var body = "";
    resp.on("data", function (data) {
      body += data;
    });

    resp.on("end", function () {
      sendPushNotification(id, body);
    });
  });
}

// OneSignal functions below

// Function to send push notification
function sendPushNotification(deviceId, userTimezone) {
  const currentTime = DateTime.now().setZone(userTimezone);
  const hour = currentTime.hour;
  let randomHour = 6;  
  
  // Random minute
  let randomMinute = Math.floor(Math.random() * 60); 
  // Random date
  let year = currentTime.year;
  let month = currentTime.month;
  let day = currentTime.day;

  //Random hour
  if(hour >= 6 && hour <= 9) {
      randomHour = Math.floor(Math.random() * (9 - hour) + hour);
      let timeStamp = DateTime.fromObject({year: year, month: month,day: day, hour: hour, minute: randomMinute }, { zone: userTimezone, numberingSystem: 'beng'}).toISO();
      sendNotification (deviceId, timeStamp);
  } else if(hour >= 10 && hour <= 13) {
    randomHour = Math.floor(Math.random() * (13 - hour) + hour);
    let timeStamp = DateTime.fromObject({year: year, month: month,day: day, hour: hour, minute: randomMinute }, { zone: userTimezone, numberingSystem: 'beng'}).toISO();
    sendNotification (deviceId, timeStamp);
  } else if(hour >= 14 && hour <= 17) {
    randomHour = Math.floor(Math.random() * (17 - hour) + hour);
    let timeStamp = DateTime.fromObject({year: year, month: month,day: day, hour: hour, minute: randomMinute }, { zone: userTimezone, numberingSystem: 'beng'}).toISO();
    sendNotification (deviceId, timeStamp);
  } else if(hour >= 18 && hour <= 21) {
    randomHour = Math.floor(Math.random() * (21 - hour) + hour);
    let timeStamp = DateTime.fromObject({year: year, month: month,day: day, hour: hour, minute: randomMinute }, { zone: userTimezone, numberingSystem: 'beng'}).toISO();
    sendNotification (deviceId, timeStamp);
  }
}

function sendNotification (deviceId, timeStamp) {
  console.log("timeStamp: ", timeStamp, " deviceId: ", deviceId);
  notification.name = "Caregiver Wellbeing from API";
  notification.contents = {
    en: "Hello! It’s time for you to take another quick survey and sync your Garmin watch. You rock!",
  };
  notification.headings = {
    en: "Caregiver Wellbeing from API",
  };
  
  // this function uses for trigger notification at a specific time
  notification.send_after = timeStamp;

  // This example target individual users, but you can also use filters or segments
  // https://documentation.onesignal.com/reference/create-notification
  notification.include_player_ids = [deviceId]
  client.createNotification(notification).then((res) => {
    console.log(res);
  })
}
