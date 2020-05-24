import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
  useQuery,
  useMutation,
  useSubscription,
} from '@apollo/react-hooks'
import {
  Button,
  Form,
  Row,
  Col,
} from 'react-bootstrap'
import AutomaticAction from './AutomaticAction'
import {
  QUERY_AUTOMATIC_ACTIONS,
  MUTATE_AUTOMATIC_ACTION,
  SUBSCRIBE_AUTOMATIC_ACTIONS,
} from '../lib/fetch'

const conditions = [
  'LESS',
  'MORE',
  'MORE_OR_EQUAL',
  'LESS_OR_EQUAL',
  'NOT_EQUAL',
  'EQUAL',
]

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

const AutomaticActionsList = ({ sensor }) => {
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('default')
  const [valueToCompare, setValueToCompare] = useState('')
  const [enabled, setEnabled] = useState(false)

  const {
    data: subscriptionData,
  } = useSubscription(
    SUBSCRIBE_AUTOMATIC_ACTIONS,
    {
      variables: {
        automaticAction: {
          sensor: sensor.id,
        },
      },
    },
  )

  const [mutateAutomaticAction] = useMutation(MUTATE_AUTOMATIC_ACTION)
  const { loading, data } = useQuery(
    QUERY_AUTOMATIC_ACTIONS,
    {
      variables: {
        automaticAction: {
          sensor: sensor.id,
        },
      },
    },
  )

  if (loading) {
    return (<p>loading automatic actions</p>)
  }

  if (subscriptionData) {
    console.log('actioautomaticAction', subscriptionData)
    data.automaticActions = updateData(data.automaticActions, subscriptionData.automaticAction)
  }

  return (
    <div>
      <h3>Automatic actions</h3>
      <Row>
        <Col xs={6} md={4}>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter value to compare"
              value={name}
              onChange={
                (e) => { setName(e.target.value) }
              }
            />
          </Form.Group>
        </Col>
        <Col xs={6} md={4}>
          <Form.Group>
            <Form.Label>Condition</Form.Label>
            <Form.Control
              as="select"
              placeholder="Enter description for automatic action"
              value={condition}
              onChange={
                (e) => { setCondition(e.target.value) }
              }
            >
              <option value="default" disabled>-</option>
              {
                conditions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              }
            </Form.Control>
          </Form.Group>
        </Col>
        <Col xs={6} md={4}>
          <Form.Group>
            <Form.Label>Value to compare</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter value to compare"
              value={valueToCompare}
              onChange={
                (e) => { setValueToCompare(parseInt(e.target.value, 10)) }
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
                  mutateAutomaticAction({
                    variables: {
                      automaticAction: {
                        name,
                        condition,
                        enabled,
                        valueToCompare,
                        sensor: sensor.id,
                      },
                    },
                  })
                  setName('')
                  setCondition('default')
                  setValueToCompare('')
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
        data.automaticActions.map((automaticAction) => (
          <AutomaticAction key={automaticAction.id} automaticAction={automaticAction} />
        ))
      }
    </div>
  )
}

AutomaticActionsList.propTypes = {
  sensor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    mqttSetTopic: PropTypes.string,
    mqttStatusTopic: PropTypes.string.isRequired,
  }).isRequired,
}

export default AutomaticActionsList
