/**
 * Commander
 * Partial port + cleanup from Nomie 2 - currently only supports Notes.  Nomie 2 supported all sorts of wacky shit
 */

// Svelte
import { writable } from "svelte/store";

// utils
import Logger from "../utils/log/log";

// Vendors
import i18next from "i18next";

import langs from "../lang/lang";
// import testLang from '../lang/test';

// Stores

const console = new Logger("🚦 Lang");

// Nomie API Store

const LangInit = () => {
  let base = {
    lang: localStorage.getItem("n4-lang") || "en",
  };
  const { update, subscribe, set } = writable(base);

  i18next.init({
    lng: base.lang,
    fallbackLng: "en",
    resources: {
      en: langs["en"].lang,
      zhcn: langs["zhcn"].lang,
      it: langs["it"].lang,
      de: langs["de"].lang,
      test: langs["test"].lang,
    },
  });

  const methods = {
    t(str: string, payload?: any) {
      return i18next.t(str, payload);
    },
    getLangs() {
      return Object.keys(langs).map((key) => {
        let lang = langs[key];
        lang.key = key;
        return lang;
      });
    },
    setLang(langKey) {
      update((d) => {
        d.lang = langKey;
        return d;
      });
      localStorage.setItem("n4-lang", langKey);
      setTimeout(() => {
        // window.location.reload();
        window.location.href = "/";
      }, 10);
    },
  };

  return {
    update,
    subscribe,
    set,
    ...methods,
  };
};

export const Lang = LangInit();
