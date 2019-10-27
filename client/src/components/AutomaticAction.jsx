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
  MUTATE_AUTOMATIC_ACTION,
} from '../lib/fetch'

const conditions = [
  'LESS',
  'MORE',
  'MORE_OR_EQUAL',
  'LESS_OR_EQUAL',
  'NOT_EQUAL',
  'EQUAL',
]

const AutomaticAction = ({ automaticAction }) => {
  const [mutateAutomaticAction] = useMutation(MUTATE_AUTOMATIC_ACTION)

  return (
    <Panel>
      <Panel.Heading>
        <Panel.Title toggle>
          {automaticAction.name}
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
                  value={automaticAction.name || ''}
                  onChange={
                    e => mutateAutomaticAction({
                      variables: {
                        automaticAction: {
                          id: automaticAction.id,
                          name: e.target.value,
                        },
                      },
                    })
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
                  value={automaticAction.condition || ''}
                  onChange={
                    e => mutateAutomaticAction({
                      variables: {
                        automaticAction: {
                          id: automaticAction.id,
                          condition: e.target.value,
                        },
                      },
                    })
                  }
                >
                  {
                    conditions.map(condition => (
                      <option key={`${automaticAction.id}_${condition}`} value={condition}>
                        {condition}
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
                  value={automaticAction.valueToCompare || ''}
                  onChange={
                    e => mutateAutomaticAction({
                      variables: {
                        automaticAction: {
                          id: automaticAction.id,
                          valueToCompare: parseInt(e.target.value, 10),
                        },
                      },
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup>
                <ControlLabel>Enabled</ControlLabel>
                <Checkbox
                  checked={automaticAction.enabled || false}
                  onChange={
                    e => mutateAutomaticAction({
                      variables: {
                        automaticAction: {
                          id: automaticAction.id,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <ActionsList automaticAction={automaticAction} />
            </Col>
            <Col xs={6} md={4}>
              <Button
                bsStyle="danger"
                onClick={
                  () => mutateAutomaticAction({
                    variables: {
                      automaticAction: {
                        id: automaticAction.id,
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

AutomaticAction.propTypes = {
  automaticAction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
    valueToCompare: PropTypes.number.isRequired,
    enabled: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      sensor: sensorShape,
      valueToChangeOn: PropTypes.number.isRequired,
    })),
    sensor: sensorShape,
  }).isRequired,
}

export default AutomaticAction
