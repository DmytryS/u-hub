import React from 'react';
import axios from 'axios';
import { Panel } from 'react-bootstrap';
import Sensor from './Sensor';

class SensorsList extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      sensors: [],
    };
  }

  async componentWillMount() {
    await this.getSensorsValues();
    setInterval(() => {
      this.getSensorsValues();
    }, 10000);
  }

  async getSensorsValues() {
    this.setState({
      sensors: await axios
        .get(
          `/nodes/${this.props.sensor.nodeId}/sensors/${
          this.props.sensor.id
          }/values`,
        )
        .then(result => result.data.values.map(sensorValue => ({
          value: sensorValue.value,
          timestamp: sensorValue.timestamp,
          nodeId: this.props.sensor.nodeId,
          sensorId: this.props.sensor._id,
          sensorName: this.props.sensor.name,
          sensorType: sensorValue.type,
        }))),
    });
  }

  render() {
    return (
      <div>
        <Panel>
          <Panel.Heading>
            <Panel.Title toggle>{this.props.sensor.name}</Panel.Title>
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
    );
  }
}

module.exports = SensorsList;
