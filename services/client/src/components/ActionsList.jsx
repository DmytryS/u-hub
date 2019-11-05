import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
  Button,
  FormGroup,
  Glyphicon,
  FormControl,
  Row,
  Col,
  ControlLabel,
} from 'react-bootstrap'
import {
  useMutation,
  useQuery,
  useSubscription,
} from '@apollo/react-hooks'
import Action from './Action'
import {
  QUERY_SENSORS,
  MUTATE_AUTOMATIC_ACTION,
  MUTATE_SCHEDULED_ACTION,
  SUBSCRIBE_ACTIONS,
} from '../lib/fetch'

const sensorActionTypes = [
  'AirPurifier',
  'BatteryService',
  'Door',
  'Doorbell',
  'Fan',
  'Fanv2',
  'Faucet',
  'FilterMaintenance',
  'GarageDoorOpener',
  'HeaterCooler',
  'HumidifierDehumidifier',
  'IrrigationSystem',
  'LockManagement',
  'LockMechanism',
  'Microphone',
  'Outlet',
  'SecuritySystem',
  'Speaker',
  'StatelessProgrammableSwitch',
  'Switch',
  'Thermostat',
  'Valve',
  'Window',
  'WindowCovering',
]

const updateData = (array, newEl) => {
  const existingElIndex = array
    .findIndex(k => k.id === newEl.id)

  if (existingElIndex === -1 && !newEl.deleted) {
    array.push(newEl)

    return array
  }
  if (existingElIndex !== -1 && newEl.deleted) {
    array.splice(existingElIndex, 1)

    return array
  }
  if (existingElIndex !== -1 && !newEl.deleted) {
    // eslint-disable-next-line
    array[existingElIndex] = newEl

    return array
  }

  return array
}

const ActionsList = ({ automaticAction, scheduledAction }) => {
  const [mutateAutomaticAction] = useMutation(MUTATE_AUTOMATIC_ACTION)
  const [mutateScheduledAction] = useMutation(MUTATE_SCHEDULED_ACTION)

  const { loading, data } = useQuery(
    QUERY_SENSORS,
    {
      variables: {
        sensor: {
          type: {
            in: sensorActionTypes,
          },
        },
      },
    },
  )

  const [sensor, setSensor] = useState(data && data.sensors.length ? data.sensors[0].id : '')
  const [valueToChangeOn, setValueToChangeOn] = useState('')

  const {
    data: subscriptionData,
  } = useSubscription(
    SUBSCRIBE_ACTIONS,
    {
      variables: {
        action: {
          [automaticAction ? 'automaticAction' : 'scheduledAction']: automaticAction ? automaticAction.id : scheduledAction.id,
        },
      },
    },
  )

  if (loading) {
    return <p>Loading actions</p>
  }

  if (subscriptionData) {
    if (automaticAction) {
      // eslint-disable-next-line
      automaticAction.actions = updateData(automaticAction.actions, subscriptionData.action)
    } else {
      // eslint-disable-next-line
      scheduledAction.actions = updateData(scheduledAction.actions, subscriptionData.action)
    }
  }

  return (
    <div>
      <h3>Actions</h3>
      <Row>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Sensor</ControlLabel>
            <FormControl
              componentClass="select"
              placeholder="Select sensor for action"
              value={sensor}
              onChange={
                (e) => { setSensor(e.target.value) }
              }
            >
              {
                data.sensors.map(s => (
                  <option key={`${s.id}_${s.id}`} value={s.id}>
                    {`${s.name} ${s.type}`}
                  </option>
                ))
              }
            </FormControl>
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Value to change on</ControlLabel>
            <FormControl
              type="text"
              placeholder="Enter value to compare"
              value={valueToChangeOn}
              onChange={
                (e) => { setValueToChangeOn(parseInt(e.target.value, 10)) }
              }
            />
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <br />
            <Button
              bsStyle="success"
              onClick={
                () => {
                  if (automaticAction) {
                    mutateAutomaticAction({
                      variables: {
                        automaticAction: {
                          id: automaticAction.id,
                          actions: [{
                            sensor,
                            valueToChangeOn,
                          }],
                        },
                      },
                    })
                  } else {
                    mutateScheduledAction({
                      variables: {
                        scheduledAction: {
                          id: scheduledAction.id,
                          actions: [{
                            sensor,
                            valueToChangeOn,
                          }],
                        },
                      },
                    })
                  }

                  setSensor(data.sensors.length ? data.sensors[0].id : '')
                  setValueToChangeOn('')
                }
              }
            >
              <Glyphicon glyph="plus" />
            </Button>
          </FormGroup>
        </Col>
      </Row>
      {
        automaticAction
          ? automaticAction.actions.map(a => (
            <Action
              key={a.id}
              automaticAction={automaticAction}
              action={a}
            />
          ))
          : scheduledAction.actions.map(a => (
            <Action
              key={a.id}
              scheduledAction={scheduledAction}
              action={a}
            />
          ))
      }
    </div>
  )
}

const sensorShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  type: PropTypes.string,
  description: PropTypes.string,
  mqttSetTopic: PropTypes.string,
  mqttStatusTopic: PropTypes.string.isRequired,
})

ActionsList.propTypes = {
  automaticAction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
    valueToCompare: PropTypes.number.isRequired,
    enabled: PropTypes.bool.isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      sensor: sensorShape,
      valueToChangeOn: PropTypes.number.isRequired,
    })),
    sensor: sensorShape,
  }),
  scheduledAction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    schedule: PropTypes.string.isRequired,
    enabled: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      sensor: sensorShape,
      valueToChangeOn: PropTypes.number.isRequired,
    })),
  }),
}

ActionsList.defaultProps = {
  automaticAction: false,
  scheduledAction: false,
}

export default ActionsList
