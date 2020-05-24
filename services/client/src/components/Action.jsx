import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import React from 'react'
import {
  Button,
  Form,
  Row,
  Col,
} from 'react-bootstrap'
import {
  useMutation,
} from '@apollo/react-hooks'

import {
  MUTATE_AUTOMATIC_ACTION,
  MUTATE_SCHEDULED_ACTION,
} from '../lib/fetch'

const Action = ({ automaticAction, scheduledAction, action }) => {
  const [mutateAutomaticAction] = useMutation(MUTATE_AUTOMATIC_ACTION)
  const [mutateScheduledAction] = useMutation(MUTATE_SCHEDULED_ACTION)

  return (
    <div>
      <Row>
        <Col xs={6} md={4}>
          <Form.Group>
            <Form.Label>Sensor</Form.Label>
            <Form.Control
              type="text"
              value={action.sensor.name}
              disabled
            />
          </Form.Group>
        </Col>
        <Col xs={6} md={4}>
          <Form.Group>
            <Form.Label>Value to change on</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter value to change on"
              value={action.valueToChangeOn}
              onChange={
                (e) => {
                  if (automaticAction) {
                    mutateAutomaticAction({
                      variables: {
                        automaticAction: {
                          id: automaticAction.id,
                          actions: [{
                            id: action.id,
                            valueToChangeOn: parseInt(e.target.value, 10),
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
                            id: action.id,
                            valueToChangeOn: parseInt(e.target.value, 10),
                          }],
                        },
                      },
                    })
                  }
                }
              }
            />
          </Form.Group>
        </Col>
        <Col xs={6} md={4}>
          <Form.Group>
            <br />
            <Button
              variant="danger"
              onClick={
                () => {
                  if (automaticAction) {
                    mutateAutomaticAction({
                      variables: {
                        automaticAction: {
                          id: automaticAction.id,
                          actions: [{
                            id: action.id,
                            deleted: true,
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
                            id: action.id,
                            deleted: true,
                          }],
                        },
                      },
                    })
                  }
                }
              }
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </Form.Group>
        </Col>
      </Row>
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

Action.propTypes = {
  automaticAction: PropTypes.oneOfType([
    PropTypes.shape({
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
    PropTypes.bool,
  ]),
  scheduledAction: PropTypes.oneOfType([
    PropTypes.shape({
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
    PropTypes.bool,
  ]),
  action: PropTypes.shape({
    id: PropTypes.string.isRequired,
    sensor: sensorShape,
    valueToChangeOn: PropTypes.number.isRequired,
  }).isRequired,
}

Action.defaultProps = {
  automaticAction: false,
  scheduledAction: false,
}

export default Action
