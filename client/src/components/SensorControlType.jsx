import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap'
import axios from 'axios'

class SensorControlType extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      controlType: 'MANUAL',
      valueToSet: 0,
    }
  }

  static get propTypes() {
    return {
      sensor: PropTypes.shape({
        nodeId: PropTypes.string.isRequired,
        sensorId: PropTypes.string.isRequired,
        sensorType: PropTypes.string.isRequired,
        controlType: PropTypes.string.isRequired,
      }).isRequired,
    }
  }

  componentWillMount() {
    this.setState({
      controlType: this.props.sensor.controlType,
    })
  }

  async handleChangeControlType(e) {
    if (confirm('Action nodes will be deleted. Continue ?')) {
      const control = e.target.value

      await axios
        .post(
          `/nodes/${this.props.sensor.nodeId}`
          + `/sensors/${this.props.sensor.sensorId}/type/${
            this.props.sensor.sensorType
          }/change-control-type`,
          { control },
        )

      this.setState({ controlType: control })
    }
  }

  async handleSetNodeValue() {
    const { nodeId, sensorId, sensorType } = this.props.sensor

    await axios.post(
      `/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/values`,
      { value: this.state.valueToSet },
    )
  }

  handleValueToSet(e) {
    this.setState({ valueToSet: e.target.value })
  }

  render() {
    return (
      <div>
        {this.state.controlType !== 'CAN_NOT_BE_CONTROLLED' && (
          <FormGroup controlId="formControlsSelect">
            <ControlLabel>Contol type</ControlLabel>
            <FormControl
              componentClass="select"
              placeholder="select"
              value={this.state.controlType}
              onChange={this.handleChangeControlType}
            >
              <option value="MANUAL">Manual</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="AUTOMATIC">Automatic</option>
            </FormControl>
          </FormGroup>
        )}
        {this.state.controlType === 'MANUAL' && (
          <FormGroup controlId="formBasicText">
            <ControlLabel>Set value</ControlLabel>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Enter text"
              onChange={this.handleValueToSet}
            />
            <br />
            <Button onClick={this.handleSetNodeValue} block>
              Set value
            </Button>
          </FormGroup>
        )}
      </div>
    )
  }
}

module.exports = SensorControlType
