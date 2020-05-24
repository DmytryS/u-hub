import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import PropTypes from 'prop-types'
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Accordion,
} from 'react-bootstrap'
import { useMutation } from '@apollo/react-hooks'
import AutomaticActionsList from './AutomaticActionsList'
import { MUTATE_SENSOR } from '../lib/fetch'

const sensorTypes = [
  'AirPurifier',
  'AirQualitySensor',
  'BatteryService',
  'CameraRTSPStreamManagement',
  'CarbonDioxideSensor',
  'CarbonMonoxideSensor',
  'ContactSensor',
  'Door',
  'Doorbell',
  'Fan',
  'Fanv2',
  'Faucet',
  'FilterMaintenance',
  'GarageDoorOpener',
  'HeaterCooler',
  'HumidifierDehumidifier',
  'HumiditySensor',
  'IrrigationSystem',
  'LeakSensor',
  'LightSensor',
  'Lightbulb',
  'LockManagement',
  'LockMechanism',
  'Microphone',
  'MotionSensor',
  'OccupancySensor',
  'Outlet',
  'SecuritySystem',
  'Slat',
  'SmokeSensor',
  'Speaker',
  'StatelessProgrammableSwitch',
  'Switch',
  'TemperatureSensor',
  'Thermostat',
  'Valve',
  'Window',
  'WindowCovering',
]

// const sensorActionTypes = [
//   'AirPurifier',
//   'BatteryService',
//   'Door',
//   'Doorbell',
//   'Fan',
//   'Fanv2',
//   'Faucet',
//   'FilterMaintenance',
//   'GarageDoorOpener',
//   'HeaterCooler',
//   'HumidifierDehumidifier',
//   'IrrigationSystem',
//   'LockManagement',
//   'LockMechanism',
//   'Microphone',
//   'Outlet',
//   'SecuritySystem',
//   'Speaker',
//   'StatelessProgrammableSwitch',
//   'Switch',
//   'Thermostat',
//   'Valve',
//   'Window',
//   'WindowCovering',
// ]

const Sensor = ({ sensor }) => {
  // if (loading) {
  // console.log('LOADING', loading)

  //   return (<p>loading ...</p>)
  // }
  const [mutateSensor] = useMutation(MUTATE_SENSOR)

  // console.log('#######', data)

  return (
    <Accordion defaultActiveKey="0">
      <Card>
        <Card.Header>
          <Card.Title>
            {sensor.name || 'Unknown'}
          </Card.Title>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <Row id={sensor.id}>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter value to compare"
                    value={sensor.name || ''}
                    onChange={
                      (e) => mutateSensor({
                        variables: {
                          sensor: {
                            id: sensor.id,
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
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter sensor description"
                    value={sensor.description || ''}
                    onChange={
                      (e) => mutateSensor({
                        variables: {
                          sensor: {
                            id: sensor.id,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Control
                    // type="select"
                    as="select"
                    placeholder="Select sensor type"
                    value={sensor.type || 'default'}
                    onChange={
                      (e) => mutateSensor({
                        variables: {
                          sensor: {
                            id: sensor.id,
                            type: e.target.value,
                          },
                        },
                      })
                    }
                  >
                    <option value="default" disabled>-</option>
                    {
                      sensorTypes.map((sensorType) => (
                        <option key={`${sensor.id}_${sensorType}`} value={sensorType}>
                          {sensorType}
                        </option>
                      ))
                    }
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Mqtt set topic</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter set topic"
                    value={sensor.mqttSetTopic || ''}
                    onChange={
                      (e) => mutateSensor({
                        variables: {
                          sensor: {
                            id: sensor.id,
                            mqttSetTopic: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                <Form.Group>
                  <Form.Label>Mqtt status topic</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter status topic"
                    value={sensor.mqttStatusTopic || ''}
                    onChange={
                      (e) => mutateSensor({
                        variables: {
                          sensor: {
                            id: sensor.id,
                            mqttStatusTopic: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col xs={6} md={4}>
                {/* {data.value.value} */}
              </Col>
              <Col xs={6} md={4}>
                <Button
                  variant="danger"
                  onClick={
                    () => mutateSensor({
                      variables: {
                        sensor: {
                          id: sensor.id,
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
            <AutomaticActionsList sensor={sensor} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  )
}

Sensor.propTypes = {
  sensor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    mqttSetTopic: PropTypes.string,
    mqttStatusTopic: PropTypes.string.isRequired,
  }).isRequired,
}

export default Sensor
