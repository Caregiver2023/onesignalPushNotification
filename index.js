const OneSignal = require("@onesignal/node-onesignal");
const fetch = require("node-fetch");
var ipapi = require("ipapi.co");
const cron = require("node-cron");
const moment = require("moment-timezone");
var https = require("https");

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
  const currentTime = moment().tz(userTimezone);
  const randomHour = Math.floor(Math.random() * (22 - 6) + 6); // Random hour between 6 am and 10 pm
  const randomMinute = Math.floor(Math.random() * 60); // Random minute

  let year = moment().tz(userTimezone).year();
  let month = moment().tz(userTimezone).month();
  let day = moment().tz(userTimezone).date();
  //let dates = date + " " +randomHour + ":" + randomMinute + ":00";
  let timeStamp = moment({
    year: year,
    month: month,
    day: day,
    hour: randomHour,
    minute: randomMinute,
  })
    .tz(userTimezone)
    .format();

  // console.log("dates: " + timeStamp);
  
  //console.log("time", timeStamp);
 

  // Send push notification if the current time is before 10 pm
  if (currentTime.hour() < 22) {
    // Name property may be required in some case, for instance when sending an SMS.
    notification.name = "test_notification_name";
    notification.contents = {
      en: "Hello! It’s time for you to take another quick survey and sync your Garmin watch. You rock!",
    };

    // required for Huawei
    notification.headings = {
      en: "Caregiver Wellbeing",
    };
    // this function uses for trigger notification at a specific time
    notification.send_after = timeStamp;
    
    // This example target individual users, but you can also use filters or segments
    // https://documentation.onesignal.com/reference/create-notification
    notification.include_player_ids = [deviceId]
    client.createNotification(notification).then((res) => {
      console.log(res);
    });
  }
}

