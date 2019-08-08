import { Action } from './models'

import {
    isActionExists,
    isScheduledActionExists,
    isAutomaticActionExists
} from './helpers'

export default async (message) => {
    const action = await isActionExists(message.data.id)

    const emitterType = message.data.emitterType === "AUTOMATIC" ? "AutomaticAction" : "ScheduledAction";

    if (emitterType === "AutomaticAction") {
        await isAutomaticActionExists(message.data.emitter)
    } else {
        await isScheduledActionExists(message.data.emitter)
    }

    await isSensorExists(message.data.target)

    action.emitter = message.data.emitter
    action.emitterType = message.data.emitterType
    action.target = message.data.target
    action.valueToChangeOn = message.data.valueToChangeOn

    return action.save()
}
