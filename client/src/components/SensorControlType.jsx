import React from "react";
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  FieldGroup
} from "react-bootstrap";
import axios from "axios";

class SensorControlType extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      controlType: "MANUAL",
      valueToSet: 0
    };
  }

  componentWillMount() {
    this.setState({
      controlType: this.props.sensor.controlType
    });
  }

  async handleChangeControlType(e) {
    if (confirm("Action nodes will be deleted. Continue ?")) {
      const control = e.target.value;
      await axios
        .post(
          `/nodes/${this.props.sensor.nodeId}` +
            `/sensors/${this.props.sensor.sensorId}/type/${
              this.props.sensor.sensorType
            }/change-control-type`,
          { control }
        )
        .then(response => this.setState({ controlType: control }));
    }
  }

  async handleSetNodeValue() {
    await axios.post(
      `/nodes/${this.props.sensor.nodeId}` +
        `/sensors/${this.props.sensor.sensorId}/type/${
          this.props.sensor.sensorType
        }/values`,
      { value: this.state.valueToSet }
    );
  }

  handleValueToSet(e) {
    this.setState({ valueToSet: e.target.value });
  }

  render() {
    return (
      <div>
        {this.state.controlType !== "CAN_NOT_BE_CONTROLLED" && (
          <FormGroup controlId="formControlsSelect">
            <ControlLabel>Contol type</ControlLabel>
            <FormControl
              componentClass="select"
              placeholder="select"
              value={this.state.controlType}
              onChange={this.handleChangeControlType.bind(this)}
            >
              <option value="MANUAL">Manual</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="AUTOMATIC">Automatic</option>
            </FormControl>
          </FormGroup>
        )}
        {this.state.controlType === "MANUAL" && (
          <FormGroup controlId="formBasicText">
            <ControlLabel>Set value</ControlLabel>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Enter text"
              onChange={this.handleValueToSet.bind(this)}
            />
            <br />
            <Button onClick={this.handleSetNodeValue.bind(this)} block>
              Set value
            </Button>
          </FormGroup>
        )}
      </div>
    );
  }
}

module.exports = SensorControlType;
