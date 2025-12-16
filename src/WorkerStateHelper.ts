import LiveQueryHelper, { LiveQueryAddedEvent, LiveQueryRemovedEvent, LiveQueryUpdatedEvent } from "./LiveQueryHelper";
import { Worker } from "./types/sync/LiveQuery";
import ReservationQuery from "./ReservationQuery";
import { initWorkers, updateWorker, removeWorker } from "./states/AgentTeamsSlice";

export default class WorkerStateHelper extends LiveQueryHelper<Worker> {
  isLoading = true;
  
  reservationQueries: { [workerSid: string]: ReservationQuery } = {};
  
  constructor(query: string) {
    super('tr-worker', query);
    this.initQuery();
  }
  
  private initQuery() {
    this.startLiveQuery().then((items) => {
      this.manager.store.dispatch(initWorkers(items));
      for (const worker of Object.values(items)) {
        this.initReservationQuery(worker);
      }
      this.isLoading = false;
    });
  }
  
  private initReservationQuery(worker: Worker) {
    this.reservationQueries[worker.worker_sid] = new ReservationQuery(
      `data.worker_sid == "${worker.worker_sid}" && (data.status not_in ["completed", "canceled", "rescinded", "rejected", "timeout"])`
    );
  }
  
  changeQuery(query: string) {
    if (query == this.queryExpression) return;
    
    this.isLoading = true;
    this.closeLiveQuery();
    
    for (const sid of Object.keys(this.reservationQueries)) {
      // Clean up all reservation queries, as the item removed handler won't run
      this.reservationQueries[sid].cleanUp(sid);
      delete this.reservationQueries[sid];
    }
    
    this.queryExpression = query;
    this.initQuery();
  }
  
  protected onItemAdded?(event: LiveQueryAddedEvent<Worker>): void {
    this.manager.store.dispatch(updateWorker({ key: event.key, value: event.value }));
    this.initReservationQuery(event.value);
  }
  
  protected onItemUpdated?(event: LiveQueryUpdatedEvent<Worker>): void {
    this.manager.store.dispatch(updateWorker({ key: event.key, value: event.value }));
  }
  
  protected onItemRemoved?(event: LiveQueryRemovedEvent): void {
    this.manager.store.dispatch(removeWorker(event.key));
    
    if (this.reservationQueries[event.key]) {
      // Clean up reservation query for this worker
      this.reservationQueries[event.key].cleanUp(event.key);
      delete this.reservationQueries[event.key];
    }
  }
}