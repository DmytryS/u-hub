import Action from './models/action';

import { isAutomaticActionExists, isScheduledActionExists, isSensorExists } from './helpers';

export default async (message) => {
  const emitterType = message.data.emitterType === 'AUTOMATIC' ? 'AutomaticAction' : 'ScheduledAction';

  if (emitterType === 'AutomaticAction') {
    await isAutomaticActionExists(message.data.emitter);
  } else {
    await isScheduledActionExists(message.data.emitter);
  }

  await isSensorExists(message.data.target);

  return new Action({
    ...message.data,
    emitterType,
  }).save();
};
