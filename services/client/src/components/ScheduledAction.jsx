import PropTypes from 'prop-types'
import React from 'react'
import {
  Panel,
  Button,
  FormGroup,
  Glyphicon,
  FormControl,
  Checkbox,
  Row,
  Col,
  ControlLabel,
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
    <Panel>
      <Panel.Heading>
        <Panel.Title toggle>
          {scheduledAction.name}
        </Panel.Title>
      </Panel.Heading>
      <Panel.Collapse>
        <Panel.Body>
          <Row>
            <Col xs={6} md={4}>
              <FormGroup>
                <ControlLabel>Name</ControlLabel>
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
                <ControlLabel>Schedule</ControlLabel>
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
                <ControlLabel>Enabled</ControlLabel>
                <Checkbox
                  checked={scheduledAction.enabled || false}
                  onChange={
                    e => mutateScheduledAction({
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
                <Glyphicon glyph="trash" />
              </Button>
            </Col>
          </Row>
        </Panel.Body>
      </Panel.Collapse>
    </Panel>
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
