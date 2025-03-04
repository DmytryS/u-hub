import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import React, { useState } from 'react'
import {
  Button,
  Form,
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
    .findIndex((k) => k.id === newEl.id)

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
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter schedule name"
              value={name}
              onChange={
                (e) => { setName(e.target.value) }
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
              value={schedule}
              onChange={
                (e) => { setSchedule(e.target.value) }
              }
            />
          </Form.Group>
        </Col>
        <Col xs={6} md={4}>
          <Form.Group>
            <Form.Label>Enabled</Form.Label>
            <Form.Check
              checked={enabled}
              onChange={
                (e) => {
                  setEnabled(e.target.checked)
                }
              }
            />
          </Form.Group>
        </Col>
        <Col xs={6} md={4}>
          <Form.Group>
            <br />
            <Button
              variant="success"
              onClick={
                () => {
                  mutateScheduledAction({
                    variables: {
                      scheduledAction: {
                        name,
                        schedule,
                        enabled,
                      },
                    },
                  })

                  setName('')
                  setSchedule('')
                  setEnabled(false)
                }
              }
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </Form.Group>
        </Col>
      </Row>
      {
        data.scheduledActions.map((scheduledAction) => (
          <ScheduledAction key={scheduledAction.id} scheduledAction={scheduledAction} />
        ))
      }
    </div>
  )
}

export default ScheduledActionsList
