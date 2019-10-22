// import PropTypes from 'prop-types'
import React from 'react'
import {
  Button,
  FormGroup,
  Glyphicon,
  FormControl,
  Row,
  Col,
  ControlLabel,
} from 'react-bootstrap'
import {
  useMutation,
} from '@apollo/react-hooks'

import {
  MUTATE_AUTOMATIC_ACTION,
  MUTATE_SCHEDULED_ACTION,
  // QUERY_SENSORS,
} from '../lib/fetch'

const Action = ({ automaticAction, scheduledAction, action }) => {
  const [mutateAutomaticAction] = useMutation(MUTATE_AUTOMATIC_ACTION)
  const [mutateScheduledAction] = useMutation(MUTATE_SCHEDULED_ACTION)

  return (
    <div>
      <Row>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Sensor</ControlLabel>
            <FormControl
              componentClass="text"
              value={action.sensor.name}
              disabled
            />
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <ControlLabel>Value to change on</ControlLabel>
            <FormControl
              type="text"
              placeholder="Enter value to compare"
              value={action.valueToChangeOn}
              onChange={
                e => mutateAutomaticAction({
                  variables: {
                    automaticAction: {
                      id: automaticAction.id,
                      actions: [{
                        id: action.id,
                        valueToChangeOn: parseInt(e.target.value, 10),
                      }],
                    },
                  },
                })
              }
            />
          </FormGroup>
        </Col>
        <Col xs={6} md={4}>
          <FormGroup>
            <br />
            <Button
              bsStyle="danger"
              onClick={
                () => {
                  mutateAutomaticAction({
                    variables: {
                      automaticAction: {
                        id: automaticAction.id,
                        actions: [{
                          id: action.id,
                          deleted: true,
                        }],
                      },
                    },
                  })
                }
              }
            >
              <Glyphicon glyph="trash" />
            </Button>
          </FormGroup>
        </Col>
      </Row>
    </div>
  )
}

export default Action
