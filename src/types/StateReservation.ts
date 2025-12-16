import { ITask, Manager, TaskReservationStatus } from '@twilio/flex-ui';
import EventEmitter from "events";

import { Reservation } from "./sync/LiveQuery";

const unimplemented = async (): Promise<any> => {
  return;
};

class BaseStateReservation extends EventEmitter {
  complete = unimplemented;

  setAttributes = unimplemented;

  dequeue = unimplemented;

  redirectCall = unimplemented;

  issueCallToWorker = unimplemented;

  updateWorkerParticipant = unimplemented;

  updateCustomerParticipant = unimplemented;

  wrapUp = unimplemented;

  transfer = unimplemented;

  hold = unimplemented;

  unhold = unimplemented;

  addVoiceParticipant = unimplemented;

  holdParticipant = unimplemented;

  unholdParticipant = unimplemented;

  kick = unimplemented;

  cancelTransfer = unimplemented;

  getChannels = unimplemented;

  getParticipants = unimplemented;

  setEndConferenceOnExit = unimplemented;

  endConference = unimplemented;

  joinCall = unimplemented;
  
  updateParticipant = unimplemented;
  
  fetchLatestVersion = unimplemented;
  
  setVirtualStartTime = unimplemented;

  protected _source: Reservation;

  constructor(source: Reservation) {
    super();
    this._source = source;
  }

  get sourceObject() {
    return this._source;
  }

  get addOns(): any {
    return undefined;
  }

  get age() {
    return this._source.task_age;
  }

  get attributes() {
    return this._source.attributes;
  }

  get dateCreated() {
    return new Date(this._source.date_created);
  }

  get dateUpdated() {
    return new Date(this._source.date_updated);
  }

  get priority() {
    return this._source.task_priority;
  }

  get queueName() {
    return this._source.queue_name;
  }

  get queueSid(): any {
    return undefined;
  }

  get reason(): any {
    return undefined;
  }

  get taskSid() {
    return this._source.task_sid;
  }

  get status(): any {
    let result = this._source.status as string;
    if (result === "wrapup") {
      result = "wrapping";
    }
    return result as TaskReservationStatus;
  }

  get taskStatus() {
    if (this._source.task_status === "transferring") {
      return "assigned";
    }
    return this._source.task_status;
  }

  get taskChannelSid(): any {
    return undefined;
  }

  get taskChannelUniqueName() {
    return this._source.task_channel_unique_name;
  }

  get timeout(): any {
    return undefined;
  }

  get workflowName(): any {
    return undefined;
  }

  get workflowSid(): any {
    return undefined;
  }

  get sid() {
    return this._source.reservation_sid;
  }

  get workerSid() {
    return this._source.worker_sid;
  }

  get routingTarget() {
    return "";
  }

  get defaultFrom() {
    const attributes = this.attributes as any;
    let result;
    if (attributes.name) {
      result = attributes.name;
    } else if (!!this.routingTarget && attributes.direction === "outbound" && attributes.channelType !== "email") {
      result = attributes.outbound_to;
    } else if (attributes.channelType === "email") {
      result = attributes.customerName || attributes.customerAddress;
    } else {
      result = attributes.from;
    }
    return result || Manager.getInstance().strings["AnonymousParticipant"];
  }

  get formattedAttributes() {
    return this.attributes;
  }

  get channelType() {
    return (this.attributes as any).channelType || this.taskChannelUniqueName;
  }

  get incomingTransferObject(): any {
    return undefined;
  }

  get outgoingTransferObject(): any {
    return undefined;
  }

  get conference() {
    return undefined;
  }
  
  get transfers(): any {
    return undefined;
  }
  
  get version(): any {
    return undefined;
  }
  
  get virtualStartTime(): any {
    return undefined;
  }
}

export class StateReservation extends BaseStateReservation implements ITask {
  get source() {
    return new BaseStateReservation(this._source);
  }
}