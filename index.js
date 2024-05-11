const player = require("play-sound")((opts = {}));
const axios = require("axios");
const { Telegraf } = require("telegraf");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, Math.ceil(seconds * 1000)));


async function main() {
  const bot = new Telegraf(process.env.BOT_TOKEN);
  bot.start((ctx) => ctx.reply("Welcome!"));
  const statesOfInterest = ["WA", "OR"];
  let attempt = 1;
  while (true) {
    console.log("attempt number", attempt);
    for (const state of statesOfInterest) {
      const response = await axios.get(
        `https://my.uscis.gov/appointmentscheduler-appointment/field-offices/state/${state}`
      );
      const locationsArray = response?.data ?? [];
      console.log(locationsArray);
      for (const location of locationsArray) {
        if (((location?.timeSlots?.length) ?? 0) > 0) {
          bot.telegram.sendMessage(
            process.env.CHAT_ID,
            `Appointment available in ${state} at ${location.name}`
          );
          // player.play("alarm.wav", function (err) {
          //   if (err) throw err;
          // });
        }
      }
      await sleep(10);
    }
    attempt++;
    await sleep(60 * 5);
  }
}

main();
