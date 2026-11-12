import { AppVersion } from "../../modules/app-version/app-version"
import type { IPeople, ITrackers } from "../../modules/import/import"
import TrackerClass from "../../modules/tracker/TrackerClass"
import type AwardConfig from "../awards/helpers/award.class"
import type { UniboardType } from "../board/UniboardStore"
import type { ContextType } from "../context/context-class"
import type { PointerType } from "../pointers/pointer-class"
import type { DashboardClass } from "../dashboard2/dashboard-class"
import type { GoalType } from "../goals/goal-class"
import type { PivotType } from "../analytics/pivot-class"
import type { ILocation } from "../locations/LocationClass"
import type { PluginType } from "../plugins/plugin-helpers"
import { convertTrackerValue, Template } from "../templates/templates-utils"

export type StorageBackupType = {
  version: string,
  created: string,
  files: {
    "awards.json"?: Array<AwardConfig>,
    "boards.json"?: Array<UniboardType>,
    "dashboards.json"?: Array<DashboardClass>,
    "goals.json"?: Array<GoalType>,
    "pivots.json"?: Array<PivotType>,
    "trackers.json"?: ITrackers,
    "people.json"?: IPeople,
    "context.json"?: Array<ContextType>,
    "pointers.json"?: Array<PointerType>,
    "locations.json"?: Array<ILocation>,
    "plugins.json"?: Array<PluginType>
  }
}

export const TemplateToImport = (template:Template, useMetric:boolean = false):StorageBackupType => {
  let trackers:ITrackers = {};
  let people:IPeople = {};
  template.trackables.filter(t=>t.type=='tracker').forEach((t)=>{
    trackers[t.tracker.tag] = convertTrackerValue(new TrackerClass(t.tracker), useMetric);
  })
  return {
    version:AppVersion,
    created: new Date().toJSON(),
    files: {
      "trackers.json": trackers,
      "people.json": people,
      "context.json": template.trackables.filter(t=>t.type == 'context').map(t=>t.ctx),
      "pointers.json": template.trackables.filter(t=>t.type == 'pointer').map(t=>t.ptr),
      "goals.json": template.goals,
      "pivots.json": template.pivots,
      "dashboards.json": template.dashboards,
      "boards.json": template.boards,
      "locations.json": template.locations,
      "plugins.json": template.plugins
    }
  }
}