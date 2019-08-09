import { isActionExists } from './helpers';

export default async (message) => {
  const action = await isActionExists(message.data.id);

  return action.remove();
};
