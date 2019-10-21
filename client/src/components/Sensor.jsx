import React from 'react'
import {
  Panel, Row, Col,

  Button, FormGroup, Glyphicon, FormControl, Checkbox, Grid, ControlLabel,
} from 'react-bootstrap'

import moment from 'moment'
import { useQuery } from '@apollo/react-hooks'
import { QUERY_VALUES } from '../lib/fetch'

const Sensor = ({ sensor }) => {
// const { loading, data } = useQuery(
//   QUERY_VALUES,
//   {
//     variables: {
//       value: {
//         sensor: sensor.id,
//         createdAt: {
//           gt: moment().subtract(5, 'minutes').toISOString(),
//           lt: moment().toISOString(),
//         },
//       },
//     },
//   },
// )

  // if (loading) {
  //   console.log('#######', data)
  //   return (<p>loading lifts</p>)
  // }
  const t = 1

  return (
    <Panel>
      <Panel.Heading>
        <Panel.Title toggle>
          {sensor.name}
        </Panel.Title>
      </Panel.Heading>
      <Panel.Collapse>
        <Panel.Body>
          <Row id={sensor.id}>
            <Col xs={6} md={4}>
              <FormGroup
                validationState
              >
                <ControlLabel>Name</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.name}
                  onChange={e => 1}
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup
                validationState
              >
                <ControlLabel>Description</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.description}
                  onChange={e => 1}
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup
                validationState
              >
                <ControlLabel>Type</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.type}
                  onChange={e => 1}
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup
                validationState
              >
                <ControlLabel>Mqtt set topic</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.mqttSetTopic}
                  onChange={e => 1}
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup
                validationState
              >
                <ControlLabel>Mqtt status topic</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.mqttStatusTopic}
                  onChange={e => 1}
                />
              </FormGroup>
            </Col>
          </Row>
        </Panel.Body>
      </Panel.Collapse>
    </Panel>
  )
}

export default Sensor
