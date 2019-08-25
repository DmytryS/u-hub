import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Navbar from './Header'
import AutomaticActionsList from './AutomaticActionsList'
import Graphic from './Graphic'
import SensorControlType from './SensorControlType'

class SensorSettings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  static get propTypes() {
    return {
      match: PropTypes.shape({
        nodeId: PropTypes.string.isRequired,
        sensorId: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
      }).isRequired,
    }
  }

  componentWillMount() {
    this.getSensorInfo()
  }

  async getSensorInfo() {
    const { nodeId, sensorId, type } = this.props.match
    this.setState({
      sensorInfo: await axios
        .get(`/nodes/${nodeId}/sensors/${sensorId}/type/${type}`)
        .then(response => response.data),
    })
  }

  render() {
    const { sensorName, sensorType } = this.state.sensorInfo

    return (
      <div>
        {
          this.state.sensorInfo
            ? (
              <div>
                <Navbar />
                <h3>{sensorName}</h3>
                <h4>{sensorType}</h4>
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
    )
  }
}

module.exports = SensorSettings
