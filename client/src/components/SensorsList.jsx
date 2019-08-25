import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Panel } from 'react-bootstrap'
import Sensor from './Sensor'

const REFRESH_RATE = 10000

class SensorsList extends React.Component {
  constructor(...args) {
    super(...args)

    this.state = {
      sensors: [],
    }
  }

  static get propTypes() {
    return {
      sensor: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        nodeId: PropTypes.string.isRequired,
        sensorId: PropTypes.string.isRequired,
        sensorType: PropTypes.string.isRequired,
        controlType: PropTypes.string.isRequired,
      }).isRequired,
    }
  }

  componentWillMount() {
    // await this.getSensorsValues();
    setInterval(() => {
      this.getSensorsValues()
    }, REFRESH_RATE)
  }

  async getSensorsValues() {
    const { nodeId, id: sensorId, name: sensorName } = this.props.sensor
    this.setState({
      sensors: await axios
        .get(`/nodes/${nodeId}/sensors/${sensorId}/values`)
        .then(result => result.data.values.map(sensorValue => ({
          value: sensorValue.value,
          timestamp: sensorValue.timestamp,
          nodeId,
          sensorId,
          sensorName,
          sensorType: sensorValue.type,
        }))),
    })
  }

  render() {
    const { name: sensorName } = this.props.sensor

    return (
      <div>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>{sensorName}</Panel.Title>
          </Panel.Heading>
          <Panel.Collapse>
            <Panel.Body>
              {this.state.sensors.map(sensor => (
                <Sensor
                  key={`${sensor.sensorId}-${sensor.sensorType}`}
                  sensor={sensor}
                />
              ))}
            </Panel.Body>
          </Panel.Collapse>
        </Panel>
      </div>
    )
  }
}

module.exports = SensorsList
