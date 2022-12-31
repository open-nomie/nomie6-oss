import { AppVersion } from "../modules/app-version/app-version";
import latest from "./whatsNew.json";

export default {
  version: AppVersion,
  features: latest.features,
  fixes: latest.fixes,
  chores: latest.chores,
};
