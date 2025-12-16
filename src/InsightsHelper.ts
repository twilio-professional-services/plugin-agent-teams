import { Manager } from "@twilio/flex-ui";

export const getDuration = (updatedDateString: string | undefined): string => {
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
};

const availabilityCache: { [sid: string]: boolean } = {};

export const getIsAvailable = (activitySid: string): boolean => {
  if (availabilityCache[activitySid]) {
    return availabilityCache[activitySid];
  }
  
  const isAvailable = Manager.getInstance().workerClient?.activities.get(activitySid)?.available;
  
  if (isAvailable === undefined) {
    return false;
  }
  
  availabilityCache[activitySid] = isAvailable;
  return isAvailable;
};