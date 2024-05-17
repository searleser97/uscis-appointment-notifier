const player = require("play-sound")((opts = {}));
const axios = require("axios");
const { Telegraf } = require("telegraf");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, Math.ceil(seconds * 1000)));


async function main() {
  const bot = new Telegraf(process.env.BOT_TOKEN);
  bot.start((ctx) => ctx.reply("Welcome!"));
  bot.launch();
  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
  const statesOfInterest = ["WA", "OR"];
  const enableServiceCenterFilter = true;
  const serviceCentersOfInterest = [
    { state: "WA", serviceCenterId: "XSE" }, // Seattle
    { state: "OR", serviceCenterId: "XPL" }, // Portland
    { state: "WA", serviceCenterId: "XSH" }, // Yakima
  ];
  const enableDateFilter = true;
  const furthestAllowedDate = new Date(2024, 5, 5);
  let attempt = 1;
  let isAlreadyFound = false;
  while (true) {
    console.log("attempt number", attempt, "on", new Date());
    for (const state of statesOfInterest) {
      const response = await axios.get(
        `https://my.uscis.gov/appointmentscheduler-appointment/field-offices/state/${state}`
      );
      const locationsArray = response?.data ?? [];
      for (const location of locationsArray) {
        if (((location?.timeSlots?.length) ?? 0) > 0) {
          if (!enableServiceCenterFilter || serviceCentersOfInterest.some((sc) => sc.state === state && sc.serviceCenterId === location.assignedServiceCenter)) {
            for (const timeSlot of location.timeSlots) {
              const slotDate = new Date(timeSlot.date);
              if (!enableDateFilter || slotDate < furthestAllowedDate) {
                const msg = `Appointment available in ${state} at ${location.description} on ${timeSlot.date}`;
                console.info(msg);
                bot.telegram.sendMessage(
                  process.env.CHAT_ID,
                  msg
                );
                if (!isAlreadyFound) {
                  player.play("alarm.wav", function (err) {
                    if (err) throw err;
                  });
                }
                isAlreadyFound = true;
              }
            }
          }
        }
      }
      await sleep(3);
    }
    attempt++;
    await sleep(60 * 5);
  }
}

main();
