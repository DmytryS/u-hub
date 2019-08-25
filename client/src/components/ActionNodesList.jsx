import axios from 'axios'
import PropTypes from 'prop-types'
import React from 'react'
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
} from 'react-bootstrap'


class ActionNodesList extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      actionNodes: [],
      // newActionNodeType: '',
      newActionNodeValueToChangeOn: '',
      newActionNodeTargetNodeId: '',
      newActionNodeTargetSensorId: '',
      newActionNodeTargetSensorType: '',
      // emitter: '',
      nodes: [],
    }
  }

  static get propTypes() {
    return {
      sensor: PropTypes.shape({
        nodeId: PropTypes.string.isRequired,
        sensorId: PropTypes.string.isRequired,
        sensorType: PropTypes.string.isRequired,
        // controlType: PropTypes.string.isRequired,
      }).isRequired,
      schedulerId: PropTypes.string.isRequired,
      actionId: PropTypes.string.isRequired,
      emitter: PropTypes.string.isRequired,
    }
  }

  async componentWillMount() {
    await this.loadNodes()
    await this.loadActionNodes()
  }

  setDefaults(nodes) {
    if (nodes && nodes.length) {
      this.setState({
        newActionNodeTargetNodeId: nodes[0]._id,
        newActionNodeTargetSensorId: nodes[0].sensors[0]._id,
        newActionNodeTargetSensorType: nodes[0].sensors[0].types[0].type,
      })
    }
  }

  async loadActionNodes() {
    const {
      actionId,
      schedulerId,
      emitter,
      sensor: {
        nodeId,
        sensorId,
        sensorType,
      },
    } = this.props
    let getUrl

    if (emitter === 'SCHEDULE') {
      getUrl = `/scheduled-actions/${schedulerId}/nodes`
    } else {
      getUrl = `/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/actions/${actionId}/nodes`
    }

    const response = await axios.get(getUrl)
    const actionNodes = response.data.map(actionNode => Object.assign(
      actionNode,
      {
        targetNodeId: this.state.nodes
          // eslint-disable-next-line
          .find(node => node.sensors.find(sensor => sensor._id === actionNode.targetSensorId))._id,
      },
    ))


    this.setState({
      actionNodes,
    })
  }

  async loadNodes() {
    const response = await axios.get('/nodes?onlyActionNodes=true')

    let nodes = []

    if (this.props.emitter === 'NODE') {
      response.data.forEach((node) => {
        const filteredSensors = []

        node.sensors.forEach((sensor) => {
          if (sensor._id === this.props.sensor.sensorId) {
            // eslint-disable-next-line
            sensor.types = sensor.types.filter(type => type.type !== this.props.sensor.sensorType)
            if (sensor.types.length) {
              filteredSensors.push(sensor)
            }
          } else {
            filteredSensors.push(sensor)
          }
        })

        // eslint-disable-next-line
        node.sensors = filteredSensors
        if (node.sensors.length) {
          nodes.push(node)
        }
      })
    } else {
      nodes = response.data
    }

    this.setDefaults(nodes)


    this.setState({
      nodes,
    })
  }

  async createActionNode() {
    if (this.validateActionNodeValue(false) === 'success'
      && this.state.newActionNodeTargetSensorId
      && this.state.newActionNodeTargetSensorType) {
      const {
        actionId,
        schedulerId,
        emitter,
        sensor: {
          nodeId,
          sensorId,
          sensorType,
        },
      } = this.props

      let createUrl
      if (emitter === 'SCHEDULE') {
        createUrl = `/scheduled-actions/${schedulerId}/nodes`
      } else {
        createUrl = `/nodes/${nodeId}/sensors/${sensorId}`
          + `/type/${sensorType}/actions/${actionId}/nodes`
      }

      try {
        await axios.post(
          createUrl,
          {
            valueToChangeOn: this.state.newActionNodeValueToChangeOn,
            targetSensorId: this.state.newActionNodeTargetSensorId,
            targetSensorType: this.state.newActionNodeTargetSensorType,
          },
        )
        await this.loadActionNodes()
      } catch (err) {
        // eslint-disable-next-line
        alert(err.response.data.message)
      }
    }
  }

  updateActionNode(index) {
    return async () => {
      if (this.validateActionNodeValue(false) === 'success'
        && this.state.actionNodes[index].newActionNodeTargetSensorId
        && this.state.actionNodes[index].newActionNodeTargetSensorType) {
        const {
          actionId,
          schedulerId,
          emitter,
          sensor: {
            nodeId,
            sensorId,
            sensorType,
          },
        } = this.props

        const actionToUpdate = this.state.actionNodes[index]
        let updateUrl

        if (emitter === 'SCHEDULE') {
          updateUrl = `/scheduled-actions/${schedulerId}/nodes/${actionToUpdate._id}`
        } else {
          updateUrl = `/nodes/${nodeId}/sensors/${sensorId}`
            + `/type/${sensorType}/actions/${actionId}/nodes/${actionToUpdate._id}`
        }

        await axios.post(updateUrl,
          {
            valueToChangeOn: actionToUpdate.valueToChangeOn,
            targetSensorId: actionToUpdate.targetSensorId,
            targetSensorType: actionToUpdate.targetSensorType,
          })


        await this.loadActionNodes()
      }
    }
  }

  deleteActionNode(index) {
    return async () => {
      const {
        actionId,
        schedulerId,
        emitter,
        sensor: {
          nodeId,
          sensorId,
          sensorType,
        },
      } = this.props
      const actionNodeToDelete = this.state.actionNodes[index]
      let deleteUrl
      if (emitter === 'SCHEDULE') {
        deleteUrl = `/scheduled-actions/${schedulerId}/nodes/${actionNodeToDelete._id}`
      } else {
        deleteUrl = `/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/actions/${actionId}/nodes/${actionNodeToDelete._id}`
      }
      await axios.delete(deleteUrl)
      await this.loadActionNodes()
    }
  }

  handleEditNode(index, e) {
    return () => {
      const { actionNodes } = this.state
      const defaultSensor = this.state.nodes.find(node => node._id === e.target.value).sensors[0]

      actionNodes[index].targetNodeId = e.target.value
      actionNodes[index].targetSensorId = defaultSensor._id
      actionNodes[index].targetSensorType = defaultSensor.types[0].type

      this.setState({ actionNodes })
    }
  }

  handleEditSensor(index, e) {
    return () => {
      const { actionNodes, nodes } = this.state
      const targetSensor = nodes
        .find(node => node._id === actionNodes[index].targetNodeId).sensors
        .find(sensor => sensor._id === e.target.value)

      actionNodes[index].targetSensorId = targetSensor._id
      actionNodes[index].targetSensorType = targetSensor.types[0].type

      this.setState({ actionNodes })
    }
  }

  handleEditSensorType(index, e) {
    return () => {
      const { actionNodes } = this.state

      actionNodes[index].targetSensorType = e.target.value

      this.setState({ actionNodes })
    }
  }

  handleEditValue(index, e) {
    return () => {
      const { actionNodes } = this.state
      actionNodes[index].valueToChangeOn = e.target.value
      this.setState({ actionNodes })
    }
  }

  validateActionNodeValue(index) {
    return () => {
      let valueToChangeOn = this.state.newActionNodeValueToChangeOn
      if (index !== false) {
        ({ valueToChangeOn } = this.state.actionNodes[index])
      }

      if (!Number.isNaN(valueToChangeOn) && valueToChangeOn !== '') {
        return 'success'
      }
      return 'error'
    }
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
                  this.state.nodes
                    .map(node => <option key={node._id} value={node._id}>{node.name}</option>)
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
                  this.state.nodes.length
                  && this.state.nodes
                    .find(node => node._id === this.state.newActionNodeTargetNodeId).sensors
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
                  this.state.nodes.length
                  && this.state.nodes
                    .find(node => node._id === this.state.newActionNodeTargetNodeId).sensors
                    .find(sensor => sensor._id === this.state.newActionNodeTargetSensorId).types
                    .map(type => <option key={type.type} value={type.type}>{type.type}</option>)
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
            <Button bsStyle="success" onClick={this.createActionNode}>
              <Glyphicon glyph="plus" />
            </Button>
          </Col>
        </Row>
        {
          this.state.actionNodes.map((actionNode, index) => (
            <Row>
              <Col sm={3} md={3}>
                <FormControl
                  componentClass="select"
                  onChange={this.handleEditNode(index)}
                  value={this.state.actionNodes[index].targetNodeId}
                >
                  {
                    this.state.nodes.map(node => (
                      <option
                        key={node._id}
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
                  onChange={this.handleEditSensor(index)}
                >
                  {
                    this.state.nodes.length
                    && this.state.nodes
                      .find(node => node._id === this.state.actionNodes[index].targetNodeId).sensors
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
                  onChange={this.handleEditSensorType(index)}
                >
                  {
                    this.state.nodes.length
                    && this.state.nodes
                      .find(node => node._id === this.state.actionNodes[index].targetNodeId).sensors
                      .find(sensor => sensor._id === this.state.newActionNodeTargetSensorId).types
                      .map(type => <option key={type.type} value={type.type}>{type.type}</option>)
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
                    onChange={this.handleEditValue(index)}
                  />
                </FormGroup>
              </Col>
              <Col sm={2} md={2}>
                <Button bsStyle="warning" onClick={this.updateActionNode(index)}>
                  <Glyphicon glyph="pencil" />
                </Button>
                {'    '}
                <Button bsStyle="danger" onClick={this.deleteActionNode(index)}>
                  <Glyphicon glyph="trash" />
                </Button>
              </Col>
            </Row>
          ))
        }
      </Grid>
    )
  }
}

module.exports = ActionNodesList
