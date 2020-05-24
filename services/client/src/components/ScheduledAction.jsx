import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import React from 'react'
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Accordion,
} from 'react-bootstrap'
import {
  useMutation,
} from '@apollo/react-hooks'
import ActionsList from './ActionsList'
import {
  MUTATE_SCHEDULED_ACTION,
} from '../lib/fetch'

const ScheduledAction = ({ scheduledAction }) => {
  const [mutateScheduledAction] = useMutation(MUTATE_SCHEDULED_ACTION)

  return (
    <Accordion defaultActiveKey="0">
      <Card>
        <Card.Header>
          <Card.Title>
            {scheduledAction.name}
          </Card.Title>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <Row>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter value to compare"
                    value={scheduledAction.name || ''}
                    onChange={
                      (e) => {
                        mutateScheduledAction({
                          variables: {
                            scheduledAction: {
                              id: scheduledAction.id,
                              name: e.target.value,
                            },
                          },
                        })
                      }
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Schedule</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter cron string"
                    value={scheduledAction.schedule || ''}
                    onChange={
                      (e) => {
                        mutateScheduledAction({
                          variables: {
                            scheduledAction: {
                              id: scheduledAction.id,
                              schedule: e.target.value,
                            },
                          },
                        })
                      }
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Enabled</Form.Label>
                  <Form.Check
                    checked={scheduledAction.enabled || false}
                    onChange={
                      (e) => mutateScheduledAction({
                        variables: {
                          scheduledAction: {
                            id: scheduledAction.id,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <ActionsList scheduledAction={scheduledAction} />
              </Col>
              <Col xs={6} md={4}>
                <Button
                  variant="danger"
                  onClick={
                    () => mutateScheduledAction({
                      variables: {
                        scheduledAction: {
                          id: scheduledAction.id,
                          deleted: true,
                        },
                      },
                    })
                  }
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
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

ScheduledAction.propTypes = {
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
  }).isRequired,
}

export default ScheduledAction
