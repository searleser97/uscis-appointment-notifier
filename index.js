const player = require("play-sound")((opts = {}));
const axios = require("axios");

const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, Math.ceil(seconds * 1000)));


async function main() {
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
          player.play("alarm.wav", function (err) {
            if (err) throw err;
          });
        }
      }
      await sleep(10);
    }
    attempt++;
    await sleep(60 * 5);
  }
}

main();
