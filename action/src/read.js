import { Action } from './models'

import { isActionExists } from './helpers'

export const read_one = async (message) => {
    return isActionExists(message.data.id)
}

export const read_all = async (message) => {
    return Action.aggregate({
        $match: {
            emitter: message.data.emitter
        }
    })
        .skip(message.metadata.skip || 0)
        .limit(message.metadata.limit || 20);
}
