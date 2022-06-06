//---   Modules/Imports   ---//
import { Http } from "@capacitor-community/http";
import { StatusBar, Style } from "@capacitor/status-bar";
import { NavigationBar } from "@hugotomazi/capacitor-navigation-bar";
import constants from "./constants";
import { hexToRgb, rgbToHex, parseEmoji } from "./utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import Vue from "vue";
import backHandler from "./classes/backHander";

Vue.directive("emoji", {
  inserted: function (el) {
    const twemojiParse = parseEmoji(el.innerHTML);
    if (twemojiParse) el.innerHTML = twemojiParse;
  },
});

let backActions;

const module = {
  //---   Get GitHub Commits   ---//
  commits: new Promise((resolve, reject) => {
    Http.request({
      method: "GET",
      url: `${constants.URLS.VT_GITHUB}/commits`,
      params: {},
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  }),

  getRuns(item, callback) {
    let url = `${constants.URLS.VT_GITHUB}/commits/${item.sha}/check-runs`;

    Http.request({
      method: "GET",
      url: url,
      params: {},
    })
      .then((res) => {
        callback(res.data);
      })
      .catch((err) => {
        callback(err);
      });
  },

  haptics: {
    async hapticsImpactHeavy(x) {
      await Haptics.impact({ style: ImpactStyle.Heavy, duration: x });
    },
    async hapticsImpactMedium(x) {
      await Haptics.impact({ style: ImpactStyle.Medium, duration: x });
    },
    async hapticsImpactLight(x) {
      await Haptics.impact({ style: ImpactStyle.Light, duration: x });
    },
    async hapticsVibrate(x) {
      await Haptics.vibrate(x);
    },
  },

  statusBar: {
    async hide() {
      return await StatusBar.hide();
    },
    async show() {
      return await StatusBar.show();
    },
    async setLight() {
      return await StatusBar.setStyle({ style: Style.Light });
    },
    async setDark() {
      return await StatusBar.setStyle({ style: Style.Dark });
    },
    async setTransparent() {
      return StatusBar.setOverlaysWebView({ overlay: true });
    },
    async setBackground(color) {
      return await StatusBar.setBackgroundColor({ color });
    },
    async setTheme(color, dark) {
      dark
        ? StatusBar.setStyle({ style: Style.Dark })
        : StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color });
    },
  },

  navigationBar: {
    async hide() {
      return await NavigationBar.hide();
    },
    async show() {
      return await NavigationBar.show();
    },
    async setTheme(color, darkButtons) {
      return await NavigationBar.setColor({ color, darkButtons });
    },
    async setTransparent() {
      return NavigationBar.setTransparency({ isTransparent: true });
    },
  },

  hexToRgb(hex) {
    return hexToRgb(hex);
  },
  rgbToHex(r, g, b) {
    return rgbToHex(r, g, b);
  },

  async launchBackHandling() {
    backActions = new backHandler();
    return true;
  },

  resetBackActions() {
    backActions.reset();
  },

  addBackAction(action) {
    backActions.addAction(action);
  },

  back(listenerFunc) {
    backActions.back(listenerFunc);
  },

  //---   Convert Time To Human Readable String   ---//
  humanTime(seconds = 0) {
    seconds = Math.floor(seconds); // Not doing this seems to break the calculation
    let levels = [
      Math.floor(seconds / 31536000) || null, //Years
      Math.floor((seconds % 31536000) / 86400) || null, //Days
      Math.floor(((seconds % 31536000) % 86400) / 3600) || null, //Hours
      Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), //Minutes
      Math.floor((((seconds % 31536000) % 86400) % 3600) % 60), //Seconds
    ];
    levels = levels.filter((level) => level !== null);

    for (let i = 1; i < levels.length; i++) {
      levels[i] = levels[i].toString().padStart(2, "0");
    }

    // join the array into a string with : as a separator
    let returntext = levels.join(":");

    console.log("Human Time:", returntext);
    while (returntext.startsWith(":00")) {
      returntext = returntext.substring(3);
    } // Remove Prepending 0s (eg. 00:00:00:01:00)
    if (returntext.startsWith(":0")) {
      returntext = returntext.substring(2);
    } else {
      returntext = returntext.substring(1);
    } // Prevent Time Starting With 0 (eg. 01:00)

    if (!returntext.includes(":")) {
      if (returntext.length == 1) {
        returntext = "0" + returntext; // Make tens digit in seconds always visible (eg. 0:09)
      }
      returntext = "0:" + returntext; // Make minutes visible as 0 when sub 60 seconds (eg. 0:51)
    }

    return returntext;
  },
  //---   End Convert Time To Human Readable String   ---//
};

//---   Start   ---//
export default ({ app }, inject) => {
  inject("vuetube", module);
};
