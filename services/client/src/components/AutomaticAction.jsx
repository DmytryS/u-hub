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
    <Accordion defaultActiveKey="0">
      <Card>
        <Card.Header>
          <Card.Title>
            {automaticAction.name}
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
                    value={automaticAction.name || ''}
                    onChange={
                      (e) => mutateAutomaticAction({
                        variables: {
                          automaticAction: {
                            id: automaticAction.id,
                            name: e.target.value,
                          },
                        },
                      })
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
                    value={automaticAction.condition || ''}
                    onChange={
                      (e) => mutateAutomaticAction({
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
                      conditions.map((condition) => (
                        <option key={`${automaticAction.id}_${condition}`} value={condition}>
                          {condition}
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
                    value={automaticAction.valueToCompare || ''}
                    onChange={
                      (e) => mutateAutomaticAction({
                        variables: {
                          automaticAction: {
                            id: automaticAction.id,
                            valueToCompare: parseInt(e.target.value, 10),
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Enabled</Form.Label>
                  <Form.Check
                    checked={automaticAction.enabled || false}
                    onChange={
                      (e) => mutateAutomaticAction({
                        variables: {
                          automaticAction: {
                            id: automaticAction.id,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <ActionsList automaticAction={automaticAction} />
              </Col>
              <Col xs={6} md={4}>
                <Button
                  variant="danger"
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
