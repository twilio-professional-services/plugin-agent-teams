import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IWorker, WorkersDataTable, Supervisor, Manager, FilterConditions, FilterDefinition, useFlexSelector } from '@twilio/flex-ui';
import { FilterData } from '@twilio/flex-ui/src/components/supervisor';
import { SupervisorWorkerState } from '@twilio/flex-ui/src/state/State.definition';
import { AppliedFilter } from '@twilio/flex-ui/src/state/Supervisor/SupervisorState.definitions';
import { Button } from '@twilio-paste/core/button';
import { Flex } from '@twilio-paste/core/flex';
import { Heading } from '@twilio-paste/core/heading';
import { FilterIcon } from "@twilio-paste/icons/esm/FilterIcon";

import { Worker } from "../types/sync/LiveQuery";
import WorkerStateHelper from '../WorkerStateHelper';
import { AppState, reduxNamespace, setAppliedFilters } from "../states/AgentTeamsSlice";

interface OwnProps {
  filters: ((appState: AppState) => FilterDefinition)[];
  workerHelper: WorkerStateHelper;
}

// TODO: Query tr-reservations to get worker tasks. Currently hard-coded as no tasks.

const AgentTeamsView = (props: OwnProps) => {
  const [clock, setClock] = useState(false);
  const [workers, setWorkers] = useState([] as Array<SupervisorWorkerState>);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([] as FilterDefinition[]);
  
  const { activities } = useFlexSelector((state) => state.flex.worker);
  const { workers: workerMap, appliedFilters } = useSelector((state: AppState) => state[reduxNamespace]);
  
  const dispatch = useDispatch();
  
  useEffect(() => {
    // tick every second to trigger workers update
    const interval = setInterval(() => {
      setClock(clock => !clock);
    }, 1000);
    
    // build filters array based on passed prop
    const state = Manager.getInstance().store.getState() as AppState;
    setFilters(props.filters.map(filter => filter(state) as FilterDefinition));
    
    return () => {
      clearInterval(interval);
    }
  }, []);
  
  useEffect(() => {
    // build a worker state array that matches what WorkersDataTable expects
    
    let workerState: Array<SupervisorWorkerState> = [];
      
    for (var workerSid in workerMap) {
      let worker = stateToWorker(workerMap[workerSid]);
        
      workerState.push({
        worker,
        tasks: []
      });
    }
    
    setWorkers(workerState);
  }, [clock, workerMap]);
  
  useEffect(() => {
    // Update live query based on applied filters
    let filterQuery = '';
    
    for (var appliedFilter of appliedFilters) {
      if (filterQuery.length > 0) {
        filterQuery += ' AND '
      }
      
      filterQuery += `${appliedFilter.name} ${appliedFilter.condition} ${JSON.stringify(appliedFilter.values)}`
    }
    
    props.workerHelper.changeQuery(filterQuery);
  }, [appliedFilters]);
  
  const stateToWorker = (workerState: Worker): IWorker => {
    let worker: IWorker = {
      sid: workerState.worker_sid,
      name: workerState.friendly_name,
      fullName: workerState.attributes?.full_name || "",
      activityName: workerState.activity_name,
      attributes: workerState.attributes || {},
      dateUpdated: new Date(workerState.date_updated),
      activityDuration: getDuration(workerState.date_activity_changed),
      source: workerState,
      isAvailable: activities.get(workerState.worker_activity_sid)?.available || false
    }
    
    return worker;
  }
  
  const getDuration = (updatedDateString: string | undefined): string => {
    if (!updatedDateString) return "unknown";
    
    let durStr = "";
    let seconds = Math.trunc(((new Date()).getTime() - Date.parse(updatedDateString)) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    
    if (seconds >= 3600) {
      let hours = Math.trunc(seconds / 3600);
      seconds = seconds % 3600;
      durStr = `${hours}:`;
    }
    
    let minutesStr = Math.trunc(seconds / 60).toString();
    
    if (durStr.length > 0) {
      minutesStr = minutesStr.padStart(2, '0');
    }
    
    let secondsStr = (seconds % 60).toString().padStart(2, '0');
    
    durStr = `${durStr}${minutesStr}:${secondsStr}`
    
    return durStr;
  }
  
  const handleClose = () => {
    setShowFilters(false);
  }
  
  const handleApplyFilters = (data?: FilterData, _legacyFilterQuery?: string) => {
    if (!data) return;
    
    let applied: AppliedFilter[] = [];
    
    for (var attribute in data) {
      if (data[attribute].length < 1) continue;
      
      let filterDefinition = filters.find(filter => filter.id == attribute);
      
      applied.push({
        name: attribute,
        condition: (filterDefinition?.condition as FilterConditions) || FilterConditions.IN,
        values: data[attribute]
      });
    }
    
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