import axios from 'axios';
import React from 'react';
import {
  // Table,
  Button,
  FormGroup,
  Glyphicon,
  FormControl,
  // Checkbox,
  Grid,
  Row,
  Col,
  ControlLabel,
} from 'react-bootstrap';


class ActionNodesList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      actionNodes: [],
      // newActionNodeType: '',
      newActionNodeValueToChangeOn: '',
      newActionNodeTargetNodeId: '',
      newActionNodeTargetSensorId: '',
      newActionNodeTargetSensorType: '',
      emitter: '',
      nodes: [],
    };
  }

  async componentWillMount() {
    await this.loadNodes();
    await this.loadActionNodes();
  }

  async loadActionNodes() {
    let getUrl;
    const me = this;
    if (this.props.emitter === 'SCHEDULE') {
      getUrl = `/scheduled-actions/${this.props.schedulerId}/nodes`;
    } else {
      getUrl = `/nodes/${this.props.sensor.nodeId}`
        + `/sensors/${this.props.sensor.sensorId}/type/${this.props.sensor.sensorType}`
        + `/actions/${this.props.actionId}/nodes`;
    }
    this.setState({
      actionNodes: await axios.get(getUrl)
        .then(response => response.data.map(actionNode => Object.assign(
          actionNode,
          {
            targetNodeId: this.state.nodes.find(node => node.sensors.find(sensor => sensor._id === actionNode.targetSensorId))._id,
          },
        ))),
    });
  }

  async loadNodes() {
    this.setState({
      nodes: await axios.get('/nodes?onlyActionNodes=true').then((result) => {
        let filteredNodes = [];

        if (this.props.emitter === 'NODE') {
          result.data.forEach((node) => {
            const filteredSensors = [];

            node.sensors.forEach((sensor) => {
              if (sensor._id === this.props.sensor.sensorId) {
                sensor.types = sensor.types.filter(type => type.type !== this.props.sensor.sensorType);
                if (sensor.types.length) {
                  filteredSensors.push(sensor);
                }
              } else {
                filteredSensors.push(sensor);
              }
            });
            node.sensors = filteredSensors;
            if (node.sensors.length) {
              filteredNodes.push(node);
            }
          });
        } else {
          filteredNodes = result.data;
        }

        this.setDefaults(filteredNodes);
        return filteredNodes;
      }),
    });
  }

  setDefaults(nodes) {
    if (nodes && nodes.length) {
      this.setState({
        newActionNodeTargetNodeId: nodes[0]._id,
        newActionNodeTargetSensorId: nodes[0].sensors[0]._id,
        newActionNodeTargetSensorType: nodes[0].sensors[0].types[0].type,
      });
    }
  }

  async createActionNode() {
    if (this.validateActionNodeValue(false) === 'success'
      && this.state.newActionNodeTargetSensorId
      && this.state.newActionNodeTargetSensorType) {
      let createUrl;
      if (this.props.emitter === 'SCHEDULE') {
        createUrl = `/scheduled-actions/${this.props.schedulerId}/nodes`;
      } else {
        createUrl = `/nodes/${this.props.sensor.nodeId}/sensors/${this.props.sensor.sensorId}`
          + `/type/${this.props.sensor.sensorType}/actions/${this.props.actionId}/nodes`;
      }

      await axios.post(createUrl, {
        valueToChangeOn: this.state.newActionNodeValueToChangeOn,
        targetSensorId: this.state.newActionNodeTargetSensorId,
        targetSensorType: this.state.newActionNodeTargetSensorType,
      }).catch(err => alert(err.response.data.message));
      await this.loadActionNodes();
    }
  }

  async updateActionNode(index) {
    if (this.validateActionNodeValue(false) === 'success'
      && this.state.actionNodes[index].newActionNodeTargetSensorId
      && this.state.actionNodes[index].newActionNodeTargetSensorType) {
      const actionToUpdate = this.state.actionNodes[index];
      let updateUrl;

      if (this.props.emitter === 'SCHEDULE') {
        updateUrl = `/scheduled-actions/${this.props.schedulerId}/nodes/${actionToUpdate._id}`;
      } else {
        updateUrl = `/nodes/${this.props.sensor.nodeId}/sensors/${this.props.sensor.sensorId}`
          + `/type/${this.props.sensor.sensorType}/actions/${this.props.actionId}/nodes/${actionToUpdate._id}`;
      }

      await axios.post(updateUrl,
        {
          valueToChangeOn: actionToUpdate.valueToChangeOn,
          targetSensorId: actionToUpdate.targetSensorId,
          targetSensorType: actionToUpdate.targetSensorType,
        });


      await this.loadActionNodes();
    }
  }

  async deleteActionNode(index) {
    const actionNodeToDelete = this.state.actionNodes[index];
    let deleteUrl;
    if (this.props.emitter === 'SCHEDULE') {
      deleteUrl = `/scheduled-actions/${this.props.schedulerId}/nodes/${actionNodeToDelete._id}`;
    } else {
      deleteUrl = `/nodes/${this.props.sensor.nodeId}/sensors/${this.props.sensor.sensorId}`
        + `/type/${this.props.sensor.sensorType}/actions/${this.props.actionId}/nodes/${actionNodeToDelete._id}`;
    }
    await axios.delete(deleteUrl);
    await this.loadActionNodes();
  }

  handleEditNode(index, e) {
    const { actionNodes } = this.state;
    const defaultSensor = this.state.nodes.find(node => node._id === e.target.value).sensors[0];

    actionNodes[index].targetNodeId = e.target.value;
    actionNodes[index].targetSensorId = defaultSensor._id;
    actionNodes[index].targetSensorType = defaultSensor.types[0].type;

    this.setState({ actionNodes });
  }

  handleEditSensor(index, e) {
    const { actionNodes } = this.state;
    const sensor = this.state.nodes.find(node => node._id === actionNodes[index].targetNodeId).sensors
      .find(sensor => sensor._id === e.target.value);

    actionNodes[index].targetSensorId = sensor._id;
    actionNodes[index].targetSensorType = sensor.types[0].type;

    this.setState({ actionNodes });
  }

  handleEditSensorType(index, e) {
    const { actionNodes } = this.state;

    actionNodes[index].targetSensorType = e.target.value;

    this.setState({ actionNodes });
  }

  handleEditValue(index, e) {
    const { actionNodes } = this.state;
    actionNodes[index].valueToChangeOn = e.target.value;
    this.setState({ actionNodes });
  }

  validateActionNodeValue(index) {
    const valueToChangeOn = index !== false ? this.state.actionNodes[index].valueToChangeOn : this.state.newActionNodeValueToChangeOn;
    if (!isNaN(valueToChangeOn) && valueToChangeOn !== '') {
      return 'success';
    }
    return 'error';
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col sm={3} md={3}>
            <FormGroup>
              <ControlLabel>Node</ControlLabel>
              {' '}
              <FormControl
                componentClass="select"
                onChange={e => this.setState({ newActionNodeTargetNodeId: e.target.value })}
              >
                {
                  this.state.nodes.map(node => <option key={node._id} value={node._id}>{node.name}</option>)
                }
              </FormControl>
            </FormGroup>
          </Col>
          <Col sm={3} md={3}>
            <FormGroup>
              <ControlLabel>Sensor</ControlLabel>
              {' '}
              <FormControl
                componentClass="select"
                placeholder="select"
                onChange={e => this.setState({ newActionNodeTargetSensorId: e.target.value })}
              >
                {
                  this.state.nodes.length && this.state.nodes.find(node => node._id === this.state.newActionNodeTargetNodeId)
                    .sensors.map(sensor => <option key={sensor._id} value={sensor._id}>{sensor.name}</option>)
                }
              </FormControl>
            </FormGroup>
          </Col>
          <Col sm={3} md={3}>
            <FormGroup>
              <ControlLabel>Type</ControlLabel>
              {' '}
              <FormControl
                componentClass="select"
                placeholder="select"
                onChange={e => this.setState({ newActionNodeTargetSensorType: e.target.value })}
              >
                {
                  this.state.nodes.length && this.state.nodes.find(node => node._id === this.state.newActionNodeTargetNodeId).sensors
                    .find(sensor => sensor._id === this.state.newActionNodeTargetSensorId).types.map(type => <option key={type.type} value={type.type}>{type.type}</option>)
                }
              </FormControl>
            </FormGroup>
          </Col>
          <Col sm={1} md={1}>
            <FormGroup
              validationState={this.validateActionNodeValue(false)}
            >
              <ControlLabel>Value</ControlLabel>
              {' '}
              <FormControl
                type="text"
                value={this.state.newActionNodeValueToChangeOn}
                placeholder="Value"
                onChange={e => this.setState({ newActionNodeValueToChangeOn: e.target.value })}
              />
            </FormGroup>
          </Col>
          <Col sm={2} md={2}>
            <br />
            <Button bsStyle="success" onClick={this.createActionNode.bind(this)}>
              <Glyphicon glyph="plus" />
            </Button>
          </Col>
        </Row>
        {
          this.state.actionNodes.map((actionNode, index) => (
            <Row key={index}>
              <Col sm={3} md={3}>
                <FormControl
                  componentClass="select"
                  onChange={this.handleEditNode.bind(this, index)}
                  value={this.state.actionNodes[index].targetNodeId}
                >
                  {
                    this.state.nodes.map(node => (
                      <option
                        key={`${node._id}-${index}`}
                        value={node._id}
                      >
                        {node.name}
                      </option>
                    ))
                  }
                </FormControl>
              </Col>
              <Col sm={3} md={3}>
                <FormControl
                  componentClass="select"
                  placeholder="select"
                  value={this.state.actionNodes[index].targetSensorId}
                  onChange={this.handleEditSensor.bind(this, index)}
                >
                  {
                    this.state.nodes.length && this.state.nodes.find(node => node._id === this.state.actionNodes[index].targetNodeId).sensors
                      .map(sensor => (
                        <option
                          key={sensor._id}
                          value={sensor._id}
                        >
                          {sensor.name}
                        </option>
                      ))
                  }
                </FormControl>
              </Col>
              <Col sm={3} md={3}>
                <FormControl
                  componentClass="select"
                  placeholder="select"
                  value={this.state.actionNodes[index].targetSensorType}
                  onChange={this.handleEditSensorType.bind(this, index)}
                >
                  {
                    this.state.nodes.length && this.state.nodes.find(node => node._id === this.state.actionNodes[index].targetNodeId).sensors
                      .find(sensor => sensor._id === this.state.newActionNodeTargetSensorId).types.map(type => <option key={type.type} value={type.type}>{type.type}</option>)
                  }
                </FormControl>
              </Col>
              <Col sm={1} md={1}>
                <FormGroup
                  validationState={this.validateActionNodeValue(index)}
                >
                  <FormControl
                    type="text"
                    value={this.state.actionNodes[index].valueToChangeOn}
                    placeholder="Value"
                    onChange={this.handleEditValue.bind(this, index)}
                  />
                </FormGroup>
              </Col>
              <Col sm={2} md={2}>
                <Button bsStyle="warning" onClick={this.updateActionNode.bind(this, index)}>
                  <Glyphicon glyph="pencil" />
                </Button>
                {'    '}
                <Button bsStyle="danger" onClick={this.deleteActionNode.bind(this, index)}>
                  <Glyphicon glyph="trash" />
                </Button>
              </Col>
            </Row>
          ))
        }
      </Grid>
    );
  }
}

module.exports = ActionNodesList;
