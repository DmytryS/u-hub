import Errors from 'restify-errors'
import { Action, Device, AutomaticAction, ScheduledAction } from '../models/index.js'

export const isActionExists = async (actionId) => {
  const action = await Action.findById(actionId)
  if (!action) {
    throw new Errors.NotFoundError(`Action with id ${actionId} not found`)
  }
  return action
}

export const isDeviceExists = async (deviceId) => {
  const device = await Device.findById(deviceId)
  if (!device) {
    throw new Errors.NotFoundError(`Device with id ${deviceId} not found`)
  }
  return device
}

export const isSensorExists = async (sensorId) => {
  const sensor = await Device.findById(sensorId)
  if (!sensor) {
    throw new Errors.NotFoundError(`Sensor with id ${sensorId} not found`)
  }
  return sensor
}

export const isAutomaticActionExists = async (automaticActionId) => {
  const automaticAction = AutomaticAction.findById(
    automaticActionId,
  )

  if (!automaticAction) {
    throw new Errors.NotFoundError(
      `Automatic action with id ${automaticActionId} not found`,
    )
  }

  return automaticAction
}

export const isScheduledActionExists = async (scheduledActionId) => {
  const scheduledAction = ScheduledAction.findById(
    scheduledActionId,
  )

  if (!scheduledAction) {
    throw new Errors.NotFoundError(
      `Scheduled action with id ${scheduledActionId} not found`,
    )
  }

  return scheduledAction
}
