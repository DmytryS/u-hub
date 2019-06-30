

import React from 'react';
import axios from 'axios';
import Navbar from './Header';
import AutomaticActionsList from './AutomaticActionsList';
import Graphic from './Graphic';
import SensorControlType from './SensorControlType';

class SensorSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  async getSensorInfo() {
    this.setState({
      sensorInfo: await axios.get(`/nodes/${this.props.match.params.nodeId}`
        + `/sensors/${this.props.match.params.sensorId}/type/${this.props.match.params.type}`)
        .then(response => response.data),
    });
  }

  async componentWillMount() {
    await this.getSensorInfo();
  }

  render() {
    return (
      <div>
        {
          this.state.sensorInfo
            ? (
              <div>
                <Navbar />
                <h3>{this.state.sensorInfo.sensorName}</h3>
                <h4>{this.state.sensorInfo.sensorType}</h4>
                <Graphic sensor={this.state.sensorInfo} />
                <SensorControlType sensor={this.state.sensorInfo} />
                <AutomaticActionsList sensor={this.state.sensorInfo} />
              </div>
            )
            : (
              <div>
                <Navbar />
              </div>
            )
        }
      </div>
    );
  }
}

module.exports = SensorSettings;
