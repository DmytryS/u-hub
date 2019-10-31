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
                  value={scheduledAction.condition || ''}
                  onChange={
                    (e) => {
                      mutateScheduledAction({
                        variables: {
                          scheduledAction: {
                            id: automaticAction.id,
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
                    e => mutateAutomaticAction({
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
                  () => mutateAutomaticAction({
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

export default ScheduledAction
