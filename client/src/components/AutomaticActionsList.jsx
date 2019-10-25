import PropTypes from 'prop-types'
import React, { useState } from 'react'
import {
  useQuery,
  useMutation,
  useSubscription,
} from '@apollo/react-hooks'
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

const AutomaticActionsList = ({ sensor }) => {
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('LESS')
  const [valueToCompare, setValueToCompare] = useState('')
  const [enabled, setEnabled] = useState(false)
  const newAutomaticAction = {
    name,
    condition,
    valueToCompare,
    enabled,
  }

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
    data.automaticActions = updateData(data.automaticActions, subscriptionData.automaticAction)
  }

  return (
    <div>
      <h3>Automatic actions</h3>
      <Row>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type="text"
              placeholder="Enter value to compare"
              value={newAutomaticAction.name}
              onChange={
                (e) => { setName(e.target.value) }
              }
            />
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Condition</ControlLabel>
            <FormControl
              componentClass="select"
              placeholder="Enter description for automatic action"
              value={newAutomaticAction.condition}
              onChange={
                (e) => { setCondition(e.target.value) }
              }
            >
              {
                conditions.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              }
            </FormControl>
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Value to compare</ControlLabel>
            <FormControl
              type="text"
              placeholder="Enter value to compare"
              value={newAutomaticAction.valueToCompare}
              onChange={
                (e) => { setValueToCompare(parseInt(e.target.value, 10)) }
              }
            />
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Enabled</ControlLabel>
            <Checkbox
              checked={newAutomaticAction.enabled}
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
                  mutateAutomaticAction({
                    variables: {
                      automaticAction: {
                        ...newAutomaticAction,
                        sensor: sensor.id,
                      },
                    },
                  })
                  setName('')
                  setCondition('LESS')
                  setValueToCompare('')
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
        data.automaticActions.map(automaticAction => (
          <AutomaticAction key={automaticAction.id} automaticAction={automaticAction} />
        ))
      }
      {/* <h4>{subscriptionData ? subscriptionData.automaticAction.id : 'NULL'}</h4> */}
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
