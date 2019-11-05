import React, { useState } from 'react'
import {
  Button,
  FormGroup,
  ControlLabel,
  Glyphicon,
  FormControl,
  Checkbox,
  Row,
  Col,
} from 'react-bootstrap'
import {
  useQuery,
  useMutation,
  useSubscription,
} from '@apollo/react-hooks'
import Header from './Header'
import ScheduledAction from './ScheduledAction'
import {
  QUERY_SCHEDULED_ACTIONS,
  MUTATE_SCHEDULED_ACTION,
  SUBSCRIBE_SCHEDULED_ACTIONS,
} from '../lib/fetch'

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

const ScheduledActionsList = () => {
  const [name, setName] = useState('')
  const [schedule, setSchedule] = useState('')
  const [enabled, setEnabled] = useState(false)
  const newScheduledAction = {
    name,
    schedule,
    enabled,
  }

  const {
    data: subscriptionData,
  } = useSubscription(SUBSCRIBE_SCHEDULED_ACTIONS)

  const [mutateScheduledAction] = useMutation(MUTATE_SCHEDULED_ACTION)
  const { loading, data } = useQuery(QUERY_SCHEDULED_ACTIONS)

  if (loading) {
    return (<p>loading scheduled actions</p>)
  }

  if (subscriptionData) {
    data.scheduledActions = updateData(data.scheduledActions, subscriptionData.scheduledAction)
  }

  return (
    <div>
      <Header />
      <h3>Scheduled actions</h3>
      <Row>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type="text"
              placeholder="Enter schedule name"
              value={newScheduledAction.name}
              onChange={
                (e) => { setName(e.target.value) }
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
              value={newScheduledAction.schedule}
              onChange={
                (e) => { setSchedule(e.target.value) }
              }
            />
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Enabled</ControlLabel>
            <Checkbox
              checked={newScheduledAction.enabled}
              onChange={
                (e) => {
                  setEnabled(e.target.checked)
                }
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
                  mutateScheduledAction({
                    variables: {
                      scheduledAction: {
                        ...newScheduledAction,
                      },
                    },
                  })

                  setName('')
                  setSchedule('')
                  setEnabled(false)
                }
              }
            >
              <Glyphicon glyph="plus" />
            </Button>
          </FormGroup>
        </Col>
      </Row>
      {
        data.scheduledActions.map(scheduledAction => (
          <ScheduledAction key={scheduledAction.id} scheduledAction={scheduledAction} />
        ))
      }
    </div>
  )
}

export default ScheduledActionsList
