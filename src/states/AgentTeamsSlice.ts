import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as Flex from '@twilio/flex-ui';
import { Action as ReduxAction } from 'redux';
import { AppliedFilter } from '@twilio/flex-ui/src/state/Supervisor/SupervisorState.definitions';

import { Reservation, Worker } from "../types/sync/LiveQuery";

// Register your redux store under a unique namespace
export const reduxNamespace = 'agentTeams';

export interface AgentTeamsState {
  appliedFilters: AppliedFilter[],
  reservations: ReservationMapState,
  workers: WorkerMapState
}

export interface ReservationMapState {
  [key: string]: Reservation
}

export interface WorkerMapState {
  [key: string]: Worker
}

const initialState = {
  appliedFilters: [],
  reservations: {},
  workers: {},
} as AgentTeamsState;

const agentTeamsSlice = createSlice({
  name: reduxNamespace,
  initialState,
  reducers: {
    setAppliedFilters(state: AgentTeamsState, action: PayloadAction<AppliedFilter[]>) {
      state.appliedFilters = action.payload;
    },
    updateReservation(state: AgentTeamsState, action: PayloadAction<{key: string, value: Reservation}>) {
      state.reservations[action.payload.key] = action.payload.value;
    },
    removeReservation(state: AgentTeamsState, action: PayloadAction<string>) {
      delete state.reservations[action.payload];
    },
    removeWorkerReservations(state: AgentTeamsState, action: PayloadAction<string>) {
      for (const [sid, reservation] of Object.entries(state.reservations)) {
        if (reservation.worker_sid !== action.payload) continue;
        delete state.reservations[sid];
      }
    },
    initWorkers(state: AgentTeamsState, action: PayloadAction<WorkerMapState>) {
      state.workers = action.payload;
    },
    updateWorker(state: AgentTeamsState, action: PayloadAction<{key: string, value: Worker}>) {
      state.workers[action.payload.key] = action.payload.value;
    },
    removeWorker(state: AgentTeamsState, action: PayloadAction<string>) {
      delete state.workers[action.payload];
    },
  },
});

export const {
  setAppliedFilters,
  updateReservation,
  removeReservation,
  removeWorkerReservations,
  initWorkers,
  updateWorker,
  removeWorker,
} = agentTeamsSlice.actions;

// Extend this payload to be of type that your ReduxAction is
// Normally you'd follow this pattern...https://redux.js.org/recipes/usage-with-typescript#a-practical-example
// But that breaks the typing when adding the reducer to Flex, so no payload intellisense for you!
export interface Action extends ReduxAction {
  payload?: any;
}

// Register all component states under the namespace
export interface AppState {
  flex: Flex.AppState;
  [reduxNamespace]: AgentTeamsState;
}

export default agentTeamsSlice.reducer;
