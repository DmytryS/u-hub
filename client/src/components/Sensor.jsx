import React from 'react'
import PropTypes from 'prop-types'
import {
  Panel,
  Row,
  Col,
  Button,
  FormGroup,
  Glyphicon,
  FormControl,
  ControlLabel,
} from 'react-bootstrap'

// import moment from 'moment'
import {
  // useQuery,
  useMutation,
} from '@apollo/react-hooks'
import AutomaticActionsList from './AutomaticActionsList'
import {
  // QUERY_VALUES,
  MUTATE_SENSOR,
} from '../lib/fetch'

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
  //   return (<p>loading ...</p>)
  // }
  const [mutateSensor] = useMutation(MUTATE_SENSOR)

  // const t = sensor

  return (
    <Panel>
      <Panel.Heading>
        <Panel.Title toggle>
          {sensor.name || 'Unknown'}
        </Panel.Title>
      </Panel.Heading>
      <Panel.Collapse>
        <Panel.Body>
          <Row id={sensor.id}>
            <Col xs={6} md={4}>
              <FormGroup>
                <ControlLabel>Name</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.name || ''}
                  onChange={
                    e => mutateSensor({
                      variables: {
                        sensor: {
                          id: sensor.id,
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
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.description || ''}
                  onChange={
                    e => mutateSensor({
                      variables: {
                        sensor: {
                          id: sensor.id,
                          description: e.target.value,
                        },
                      },
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup>
                <ControlLabel>Type</ControlLabel>
                <FormControl
                  componentClass="select"
                  placeholder="Enter value to compare"
                  value={sensor.type || ''}
                  onChange={
                    e => mutateSensor({
                      variables: {
                        sensor: {
                          id: sensor.id,
                          type: e.target.value,
                        },
                      },
                    })
                  }
                >
                  {
                    sensorTypes.map(sensorType => (
                      <option key={`${sensor.id}_${sensorType}`} value={sensorType}>
                        {sensorType}
                      </option>
                    ))
                  }
                </FormControl>
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup>
                <ControlLabel>Mqtt set topic</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.mqttSetTopic || ''}
                  onChange={
                    e => mutateSensor({
                      variables: {
                        sensor: {
                          id: sensor.id,
                          mqttSetTopic: e.target.type,
                        },
                      },
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              <FormGroup>
                <ControlLabel>Mqtt status topic</ControlLabel>
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={sensor.mqttStatusTopic || ''}
                  onChange={
                    e => mutateSensor({
                      variables: {
                        sensor: {
                          id: sensor.id,
                          mqttStatusTopic: e.target.type,
                        },
                      },
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col xs={6} md={4}>
              {/* {data.value.value} */}
            </Col>
            <Col xs={6} md={4}>
              <Button
                bsStyle="danger"
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
                <Glyphicon glyph="trash" />
              </Button>
            </Col>
          </Row>
          <AutomaticActionsList sensor={sensor} />
        </Panel.Body>
      </Panel.Collapse>
    </Panel>
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
