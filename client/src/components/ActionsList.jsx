// import PropTypes from 'prop-types'
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

const updateData = (automaticActions, newAutomaticAction) => {
  const existingAutomaticActionIndex = automaticActions
    .findIndex(k => k.id === newAutomaticAction.id)

  if (existingAutomaticActionIndex === -1 && !newAutomaticAction.deleted) {
    automaticActions.push(newAutomaticAction)

    return automaticActions
  }
  if (existingAutomaticActionIndex !== -1 && newAutomaticAction.deleted) {
    automaticActions.splice(existingAutomaticActionIndex, 1)

    return automaticActions
  }
  if (existingAutomaticActionIndex !== -1 && !newAutomaticAction.deleted) {
    // eslint-disable-next-line
    automaticActions[existingAutomaticActionIndex] = newAutomaticAction

    return automaticActions
  }

  return automaticActions
}

const ActionsList = ({ automaticAction, scheduledAction }) => {
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

  const {
    data: subscriptionData,
  } = useSubscription(
    SUBSCRIBE_ACTIONS,
    {
      variables: {
        action: {
          automaticAction: automaticAction.id,
          scheduledAction: scheduledAction.id,
        },
      },
    },
  )

  const [mutateAutomaticAction] = useMutation(MUTATE_AUTOMATIC_ACTION)
  const [mutateScheduledAction] = useMutation(MUTATE_SCHEDULED_ACTION)

  const [sensor, setSensor] = useState(data && data.sensors.length ? data.sensors[0].id : '')
  const [valueToChangeOn, setValueToChangeOn] = useState('')

  if (loading) {
    return <p>Loading actions</p>
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
                        automaticAction: {
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
        // automaticAction
        //   ? automaticAction.actions.map(a => (
        //     <Action
        //       automaticAction={automaticAction}
        //       action={a}
        //     />
        //   ))
        //   : scheduledAction.actions.map(a => (
        //     <Action
        //       scheduledAction={scheduledAction}
        //       action={a}
        //     />
        //   ))
      }
    </div>
  )
}

// const sensorShape = PropTypes.shape({
//   id: PropTypes.string.isRequired,
//   name: PropTypes.string,
//   type: PropTypes.string,
//   description: PropTypes.string,
//   mqttSetTopic: PropTypes.string,
//   mqttStatusTopic: PropTypes.string.isRequired,
// })

// ActionsList.propTypes = {
//   automaticAction: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     condition: PropTypes.string.isRequired,
//     valueToCompare: PropTypes.number.isRequired,
//     enabled: PropTypes.bool.isRequired,
//     actions: PropTypes.arrayOf(PropTypes.shape({
//       id: PropTypes.string.isRequired,
//       sensor: sensorShape,
//       valueToChangeOn: PropTypes.number.isRequired,
//     })),
//     sensor: sensorShape,
//   }),
// }

export default ActionsList