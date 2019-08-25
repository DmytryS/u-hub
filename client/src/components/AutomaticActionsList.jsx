import React from 'react'
import PropTypes from 'prop-types'
import {
  Button, FormGroup, Glyphicon, FormControl, Checkbox, Panel, Row, Col, Grid, ControlLabel,
} from 'react-bootstrap'
import axios from 'axios'
import ActionNodesList from './ActionNodesList'

class AutomaticActionsList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      automaticActions: [],
      newActionValueToCompare: '0',
      newActionCondition: '<',
      newActionEnabled: false,
    }
  }

  static get propTypes() {
    return {
      sensor: PropTypes.shape({
        nodeId: PropTypes.string.isRequired,
        nodeName: PropTypes.string.isRequired,
        sensorId: PropTypes.string.isRequired,
        sensorType: PropTypes.string.isRequired,
        // controlType: PropTypes.string.isRequired,
      }).isRequired,
      // schedulerId: PropTypes.string.isRequired,
      // actionId: PropTypes.string.isRequired,
      // emitter: PropTypes.string,
    }
  }

  componentWillMount() {
    this.loadAutomaticActions()
  }

  async loadAutomaticActions() {
    const { nodeId, sensorId, sensorType } = this.props.sensor

    const response = await axios.get(`/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/actions`)

    this.setState({
      automaticActions: response.data,
    })
  }

  async addAutomaticAction() {
    const { nodeId, sensorId, sensorType } = this.props.sensor

    await axios
      .post(`/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/actions`,
        {
          valueToCompare: this.state.newActionValueToCompare,
          condition: this.state.newActionCondition,
          enabled: this.state.newActionEnabled,
        })

    await this.loadAutomaticActions()
  }

  async updateAutomaticAction(index) {
    return async () => {
      const { nodeId, sensorId, sensorType } = this.props.sensor
      const actionToEdit = this.state.automaticActions[index]

      await axios
        .post(`/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/actions/${actionToEdit._id}`,
          {
            valueToCompare: actionToEdit.valueToCompare,
            condition: actionToEdit.condition,
            enabled: actionToEdit.enabled,
          })

      await this.loadAutomaticActions()
    }
  }

  deleteAutomaticAction(index) {
    return async () => {
      const { nodeId, sensorId, sensorType } = this.props.sensor
      const actionToDelete = this.state.automaticActions[index]

      await axios
        .delete(`/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/actions/${actionToDelete._id}`)
      await this.loadAutomaticActions()
    }
  }

  handleEditValue(index, e) {
    return () => {
      const { automaticActions } = this.state
      automaticActions[index].valueToCompare = e.target.value
      this.setState({ automaticActions })
    }
  }

  handleEditCondition(index, e) {
    return () => {
      const { automaticActions } = this.state
      automaticActions[index].condition = e.target.value
      this.setState({ automaticActions })
    }
  }

  handleEditEnabled(index, e) {
    return () => {
      const { automaticActions } = this.state
      automaticActions[index].enabled = e.target.checked
      this.setState({ automaticActions })
    }
  }

  hanleShowActionNodes(index) {
    return () => {
      const { automaticActions } = this.state
      automaticActions[index].showActionNodes = !automaticActions[index].showActionNodes
      this.setState({ automaticActions })
    }
  }

  validateValueToCompare(index) {
    return () => {
      let valueToCompare = this.state.newActionValueToCompare
      if (index !== false) {
        // eslint-disable-next-line
        valueToCompare = this.state.automaticActions[index].valueToCompare
      }

      if (!Number.isNaN(valueToCompare) && valueToCompare !== '') {
        return 'success'
      }
      return 'error'
    }
  }

  render() {
    return (
      <div>
        <Grid>
          <Row>
            <Col sm={3} md={3}>
              <FormGroup>
                <ControlLabel>Condition</ControlLabel>
                {' '}
                <FormControl
                  componentClass="select"
                  placeholder="select"
                  onChange={e => this.setState({ newActionCondition: e.target.value })}
                >
                  <option value="<">&lt;</option>
                  <option value=">">&gt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="!=">!=</option>
                  <option value="==">==</option>
                </FormControl>
              </FormGroup>
            </Col>
            <Col sm={3} md={3}>
              <FormGroup
                validationState={this.validateValueToCompare(false)}
              >
                <ControlLabel>Value</ControlLabel>
                {' '}
                <FormControl
                  type="text"
                  placeholder="Enter value to compare"
                  value={this.state.newActionValueToCompare}
                  onChange={e => this.setState({ newActionValueToCompare: e.target.value })}
                />
              </FormGroup>
              {' '}
            </Col>
            <Col sm={3} md={3}>
              <FormGroup>
                <ControlLabel>Enabled</ControlLabel>
                {' '}
                <Checkbox onChange={e => this.setState({ newActionEnabled: e.target.checked })} />
              </FormGroup>
            </Col>
            <Col sm={3} md={3}>
              <FormGroup>
                <br />
                <Button bsStyle="success" onClick={this.addAutomaticAction}>
                  <Glyphicon glyph="plus" />
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </Grid>
        {
          this.state.automaticActions.map((automaticAction, index) => (
            <Grid>
              <Row>
                <Col sm={3} md={3}>
                  <FormControl
                    componentClass="select"
                    placeholder="select"
                    value={automaticAction.condition}
                    onChange={this.handleEditCondition(index)}
                  >
                    <option value="<">&lt;</option>
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                    <option value="!=">!=</option>
                    <option value="==">==</option>
                  </FormControl>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup
                    validationState={this.validateValueToCompare(index)}
                  >
                    <FormControl
                      type="text"
                      value={automaticAction.valueToCompare}
                      placeholder="Enter value"
                      onChange={this.handleEditValue(index)}
                    />
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <FormGroup>
                    <Checkbox
                      inline
                      checked={automaticAction.enabled}
                      onChange={this.handleEditEnabled(index)}
                    />
                  </FormGroup>
                </Col>
                <Col sm={3} md={3}>
                  <Button bsStyle="warning" onClick={this.updateAutomaticAction(index)}>
                    <Glyphicon glyph="pencil" />
                  </Button>
                  {'    '}
                  <Button bsStyle="danger" onClick={this.deleteAutomaticAction(index)}>
                    <Glyphicon glyph="trash" />
                  </Button>
                  {'    '}
                  <Button bsStyle="primary" onClick={this.hanleShowActionNodes(index)}>
                    <Glyphicon glyph="tasks" />
                  </Button>
                </Col>
              </Row>
              <Panel
                expanded={this.state.automaticActions[index].showActionNodes}
                onToggle={() => { }}
              >
                <Panel.Collapse>
                  <Panel.Body>
                    <ActionNodesList
                      sensor={this.props.sensor}
                      emitter="NODE"
                      actionId={automaticAction._id}
                      nodeName={this.props.sensor.nodeName}
                    />
                  </Panel.Body>
                </Panel.Collapse>
              </Panel>
            </Grid>
          ))
        }
      </div>
    )
  }
}

module.exports = AutomaticActionsList
