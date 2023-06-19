
import type { PopMenuButton } from "../../components/pop-menu/usePopmenu"
import { AppVersion } from "../../modules/app-version/app-version"
import nid from "../../modules/nid/nid"
import TrackerClass from "../../modules/tracker/TrackerClass"
import type { ITracker } from "../../modules/tracker/TrackerClass"
import type { UniboardType } from "../board/UniboardStore"
import type { DashboardClass } from "../dashboard2/dashboard-class"
import type { GoalClass } from "../goals/goal-class"
import type { PivotClass } from "../analytics/pivot-class"
import type { StorageBackupType } from "../storage/storage-export.helper"
import type { Trackable } from "../trackable/Trackable.class"
import { UOMClass } from "../uom/uom.class"



export type TemplateType = {
  id: string
  name: string
  description?: string
  author?: string
  version?: string
  trackables: Array<Trackable>
  goals: Array<GoalClass>
  pivots: Array<PivotClass>
  boards: Array<UniboardType>
  dashboards: Array<DashboardClass>
}

/* `Template` is a class that represents a template for a user's data */
export class Template { 
  type: string = 'template';
  id: string
  name: string
  description?: string
  author?: string
  version?: string
  trackables: Array<Trackable>
  goals: Array<GoalClass>
  pivots: Array<PivotClass>
  boards: Array<UniboardType>
  dashboards: Array<DashboardClass>
  constructor(starter?:TemplateType) {
    let base:any = starter || {};
    this.id = base.id || nid();
    this.name = base.name || ``;
    this.description = base.description;
    this.author = base.author;
    this.version = base.version || AppVersion;
    this.trackables = base.trackables ? base.trackables : [];
    this.goals = base.goals ? base.goals : [];
    this.pivots = base.pivots ? base.pivots : [];
    this.boards = base.boards ? base.boards : [];
    this.dashboards = base.dashboards ? base.dashboards : [];
  }

  get asObject() {
    return JSON.parse(JSON.stringify(this));
  }
}

export const convertTrackerValue = (tracker:TrackerClass, useMetric:boolean):TrackerClass=>{
    const uom = new UOMClass(tracker.uom)
    const userSystem = useMetric ? 'metric' : 'imperial'
    if (uom.system !== userSystem && uom.system !== 'both') {
      tracker.uom = uom.convertTo(userSystem).id
      tracker.default = uom.convertValueTo(tracker.default || 0, userSystem)
    }
    return new TrackerClass(tracker);
}

export interface TemplateRef extends PopMenuButton {
  url: string
}

export const templateRefs: Array<TemplateRef> = [
  {
    title: '🤔 ADHD',
    url: '/templates/adhd-template.json',
  },
  {
    title: '😵‍💫 Mood',
    url: '/templates/mood-template.json',
  },
  {
    title: '🔴 Period',
    url: '/templates/period-template.json',
  },
  {
    title: '💝 Self Care',
    url: '/templates/care-template.json',
  },
]

