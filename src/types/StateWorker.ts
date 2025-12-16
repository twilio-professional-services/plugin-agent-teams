import { IWorker } from '@twilio/flex-ui';
import { getDuration, getIsAvailable } from '../InsightsHelper';

import { Worker } from "./sync/LiveQuery";

export class StateWorker implements IWorker<Worker> {
  private _source: Worker;

  constructor(source: Worker) {
    this._source = source;
  }

  get source() {
    return this._source;
  }

  get sid() {
    return this.source.worker_sid;
  }

  get name() {
    return this.source.friendly_name;
  }

  get fullName() {
    return this.source.attributes?.full_name || this.name;
  }

  get activityName() {
    return this.source.activity_name;
  }

  get attributes() {
    return this.source.attributes;
  }

  get dateUpdated() {
    return new Date(this.source.date_updated);
  }

  get activityDuration() {
    if (!this.source.date_activity_changed) {
      return "30+d";
    }
    return getDuration(this.source.date_activity_changed);
  }

  get isAvailable() {
    return getIsAvailable(this.source.worker_activity_sid);
  }
}