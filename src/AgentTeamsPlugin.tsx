import React from 'react';
import * as Flex from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import { CustomizationProvider, PasteCustomCSS, CustomizationProviderProps } from '@twilio-paste/core/customization';

import AgentTeamsSideLink from './components/AgentTeamsSideLink';
import AgentTeamsView from './components/AgentTeamsView';
import reducers, { reduxNamespace } from './states/AgentTeamsSlice';
import WorkerStateHelper from './WorkerStateHelper';

const PLUGIN_NAME = 'AgentTeamsPlugin';

export default class AgentTeamsPlugin extends FlexPlugin {
  workerHelper: WorkerStateHelper;
  
  constructor() {
    super(PLUGIN_NAME);
    
    this.workerHelper = new WorkerStateHelper('');
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof Flex }
   * @param manager { Flex.Manager }
   */
  async init(flex: typeof Flex, manager: Flex.Manager): Promise<void> {
    // Add any custom teams view filters here
    let teamsViewFilters = [
      Flex.TeamsView.activitiesFilter,
    ];
    
    flex.setProviders({
      CustomProvider: (RootComponent) => (props) => {
        const pasteProviderProps: CustomizationProviderProps & { style: PasteCustomCSS } = {
          baseTheme: props.theme?.isLight ? "default" : "dark",
          theme: props.theme?.tokens,
          style: { minWidth: "100%", height: "100%" },
          elements: { }
        };
        
        return (
          <CustomizationProvider {...pasteProviderProps}>
            <RootComponent {...props} />
          </CustomizationProvider>
        )
      }
    });
    
    if (!this.showAgentViews(manager)) return;
    
    this.registerReducers(manager);
    
    flex.ViewCollection.Content.add(
      <Flex.View name="agent-teams" key="agent-teams">
        <AgentTeamsView workerHelper={this.workerHelper} filters={teamsViewFilters} />
      </Flex.View>
    );
    
    flex.SideNav.Content.add(<AgentTeamsSideLink viewName='agent-teams' key='agent-teams-side-nav' />, { sortOrder: 1 });
  }
  
  showAgentViews(manager: Flex.Manager) {
    const { roles } = manager.user;
    return roles.indexOf("agent") >= 0;
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  private registerReducers(manager: Flex.Manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${Flex.VERSION}`);
      return;
    }

    manager.store.addReducer(reduxNamespace, reducers);
  }
}
