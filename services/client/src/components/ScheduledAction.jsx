import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import React from 'react'
import {
  Card,
  Button,
  FormGroup,
  FormControl,
  FormCheck,
  Row,
  Col,
  FormLabel,
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
    <Card>
      <Card.Heading>
        <Card.Title toggle>
          {scheduledAction.name}
        </Card.Title>
      </Card.Heading>
      <Card.Collapse>
        <Card.Body>
          <Row>
            <Col xs={6} md={4}>
              <FormGroup>
                <FormLabel>Name</FormLabel>
                <FormControl
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
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup>
                <FormLabel>Schedule</FormLabel>
                <FormControl
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
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup>
                <FormLabel>Enabled</FormLabel>
                <FormCheck
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
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <ActionsList scheduledAction={scheduledAction} />
            </Col>
            <Col xs={6} md={4}>
              <Button
                bsStyle="danger"
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
      </Card.Collapse>
    </Card>
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
