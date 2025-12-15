import React from 'react';
import { SideLink, Actions } from '@twilio/flex-ui';

interface OwnProps {
  activeView?: string;
  viewName: string;
}

const AgentTeamSideLink = (props: OwnProps) => {
  function navigate() {
    Actions.invokeAction('NavigateToView', { viewName: props.viewName });
  }

  return (
    <SideLink
      showLabel={true}
      key="agent-teams-side-link"
      icon="Agents"
      iconActive="AgentsBold"
      isActive={props.activeView === props.viewName}
      onClick={navigate}
    >
      Agent Teams
    </SideLink>
  );
};

export default AgentTeamSideLink;
