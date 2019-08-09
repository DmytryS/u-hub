import Action from './models/action';

import { isActionExists } from './helpers';

export const readOne = async message => isActionExists(message.data.id);

export const readAll = async message => Action.aggregate({
  $match: {
    emitter: message.data.emitter,
  },
})
  .skip(message.metadata.skip || 0)
  .limit(message.metadata.limit || 20);
