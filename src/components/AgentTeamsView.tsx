import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IWorker, WorkersDataTable, Supervisor, Manager, FilterConditions, FilterDefinition, ITask } from '@twilio/flex-ui';
import { FilterData } from '@twilio/flex-ui/src/components/supervisor';
import { SupervisorWorkerState } from '@twilio/flex-ui/src/state/State.definition';
import { AppliedFilter } from '@twilio/flex-ui/src/state/Supervisor/SupervisorState.definitions';
import { Button } from '@twilio-paste/core/button';
import { Flex } from '@twilio-paste/core/flex';
import { Heading } from '@twilio-paste/core/heading';
import { FilterIcon } from "@twilio-paste/icons/esm/FilterIcon";

import WorkerStateHelper from '../WorkerStateHelper';
import { AppState, reduxNamespace, setAppliedFilters } from "../states/AgentTeamsSlice";
import { StateReservation } from '../types/StateReservation';
import { StateWorker } from '../types/StateWorker';

interface OwnProps {
  filters: ((appState: AppState) => FilterDefinition)[];
  workerHelper: WorkerStateHelper;
}

const AgentTeamsView = (props: OwnProps) => {
  const [workers, setWorkers] = useState([] as Array<SupervisorWorkerState>);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([] as FilterDefinition[]);
  
  const { reservations: reservationMap, workers: workerMap, appliedFilters } = useSelector((state: AppState) => state[reduxNamespace]);
  
  const dispatch = useDispatch();
  
  useEffect(() => {
    // build filters array based on passed prop
    const state = Manager.getInstance().store.getState() as AppState;
    setFilters(props.filters.map(filter => filter(state) as FilterDefinition));
  }, []);
  
  useEffect(() => {
    // build a worker state array that matches what WorkersDataTable expects
    let workerState: Array<SupervisorWorkerState> = [];
    
    for (const workerSid in workerMap) {
      let worker = new StateWorker(workerMap[workerSid]);
      workerState.push({
        worker,
        tasks: reservationsForWorker(worker),
      });
    }
    
    setWorkers(workerState);
  }, [workerMap, reservationMap]);
  
  useEffect(() => {
    // WorkersDataTable displays reservations based on Flex state instead of the workers prop
    Manager.getInstance().store.dispatch({
      type: 'SUPERVISOR_UPDATE',
      payload: {
        workers,
        isLoadingWorkers: false,
        errorLoadingWorkers: 0
      }
    });
  }, [workers]);
  
  useEffect(() => {
    // Update live query based on applied filters
    let filterQuery = '';
    
    for (const appliedFilter of appliedFilters) {
      if (filterQuery.length > 0) {
        filterQuery += ' AND '
      }
      
      filterQuery += `${appliedFilter.name} ${appliedFilter.condition} ${JSON.stringify(appliedFilter.values)}`
    }
    
    props.workerHelper.changeQuery(filterQuery);
  }, [appliedFilters]);
  
  const reservationsForWorker = (worker: IWorker): ITask[] => {
    return Object.values(reservationMap)
      .filter((reservation) => reservation.worker_sid === worker.sid)
      .map((reservation) => new StateReservation(reservation));
  }
  
  const handleClose = () => {
    setShowFilters(false);
  }
  
  const handleApplyFilters = (data?: FilterData, _legacyFilterQuery?: string) => {
    if (!data) return;
    
    let applied: AppliedFilter[] = [];
    
    for (const attribute in data) {
      if (data[attribute].length < 1) continue;
      
      let filterDefinition = filters.find(filter => filter.id == attribute);
      
      applied.push({
        name: attribute,
        condition: (filterDefinition?.condition as FilterConditions) || FilterConditions.IN,
        values: data[attribute]
      });
    }
    
    // Persist applied filters to Redux so they survive view switches
    dispatch(setAppliedFilters(applied));
  }
  
  const toggleFiltersView = () => {
    setShowFilters(!showFilters);
  }
  
  return (
    <>
      <div>
        <Flex padding="space30" vAlignContent="center">
          <Flex>
            <Heading as="h3" variant="heading30" marginBottom='space0'>
              Agent Teams
            </Heading>
          </Flex>
          <Flex grow></Flex>
          <Flex>
            <Button variant='secondary' onClick={toggleFiltersView}>
              Filter <FilterIcon decorative={true} />
            </Button>
          </Flex>
        </Flex>
        <WorkersDataTable
          workers={workers}
          isLoading={props.workerHelper.isLoading}
          onTaskSelected={() => {}}
          onWorkerSelected={() => {}}
          showTeam={false}
          showNewColumns={false}
          />
      </div>
      {showFilters &&
        <Supervisor.TeamFiltersPanel
          appliedLegacyFilterQuery=''
          handleCloseClick={handleClose}
          applyFilters={handleApplyFilters}
          appliedFilters={appliedFilters}
          filters={filters}
          isLoadingWorkers={props.workerHelper.isLoading}
          workers={workers}
          isNewTeamsViewEnabled={false}
          />
      }
    </>
  )
}

export default AgentTeamsView;