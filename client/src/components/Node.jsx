

import React from 'react';
import { Table, Panel } from 'react-bootstrap';
import SensorsList from './SensorsList';

class Node extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title toggle>
            {this.props.node.name}
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            {this.props.node.sensors.map(sensor => (
              <SensorsList
                key={sensor._id}
                sensor={Object.assign({ nodeId: this.props.node._id }, sensor)}
              />
            ))}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }
}

module.exports = Node;
