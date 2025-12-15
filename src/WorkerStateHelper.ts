import LiveQueryHelper, { LiveQueryAddedEvent, LiveQueryRemovedEvent, LiveQueryUpdatedEvent } from "./LiveQueryHelper";
import { Worker } from "./types/sync/LiveQuery";
import { initWorkers, updateWorker, removeWorker } from "./states/AgentTeamsSlice";

export default class WorkerStateHelper extends LiveQueryHelper<Worker> {
  isLoading = true;
  
  constructor(query: string) {
    super('tr-worker', query);
    this.initQuery();
  }
  
  private initQuery() {
    this.startLiveQuery().then((items) => {
      console.log('Initial worker state', items);
      this.manager.store.dispatch(initWorkers(items));
      this.isLoading = false;
    });
  }
  
  changeQuery(query: string) {
    if (query == this.queryExpression) return;
    
    this.isLoading = true;
    this.closeLiveQuery();
    this.queryExpression = query;
    this.initQuery();
  }
  
  protected onItemAdded?(event: LiveQueryAddedEvent<Worker>): void {
    console.log('Worker added',event);
    this.manager.store.dispatch(updateWorker({ key: event.key, value: event.value }));
  }
  
  protected onItemUpdated?(event: LiveQueryUpdatedEvent<Worker>): void {
    console.log('Worker updated',event);
    this.manager.store.dispatch(updateWorker({ key: event.key, value: event.value }));
  }
  
  protected onItemRemoved?(event: LiveQueryRemovedEvent): void {
    console.log('Worker removed',event);
    this.manager.store.dispatch(removeWorker(event.key));
  }
}