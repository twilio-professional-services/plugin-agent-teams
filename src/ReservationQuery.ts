import LiveQueryHelper, { LiveQueryAddedEvent, LiveQueryRemovedEvent, LiveQueryUpdatedEvent } from "./LiveQueryHelper";
import { Reservation } from "./types/sync/LiveQuery";
import { updateReservation, removeReservation, removeWorkerReservations } from "./states/AgentTeamsSlice";

export default class ReservationQuery extends LiveQueryHelper<Reservation> {
  isLoading = true;
  
  constructor(query: string) {
    super('tr-reservation', query);
    this.initQuery();
  }
  
  private initQuery() {
    this.startLiveQuery().then((items) => {
      for (const [sid, reservation] of Object.entries(items)) {
        this.manager.store.dispatch(updateReservation({ key: sid, value: reservation }));
      }
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
  
  cleanUp(workerSid: string) {
    this.closeLiveQuery();
    this.manager.store.dispatch(removeWorkerReservations(workerSid));
  }
  
  protected onItemAdded?(event: LiveQueryAddedEvent<Reservation>): void {
    this.manager.store.dispatch(updateReservation({ key: event.key, value: event.value }));
  }
  
  protected onItemUpdated?(event: LiveQueryUpdatedEvent<Reservation>): void {
    this.manager.store.dispatch(updateReservation({ key: event.key, value: event.value }));
  }
  
  protected onItemRemoved?(event: LiveQueryRemovedEvent): void {
    this.manager.store.dispatch(removeReservation(event.key));
  }
}