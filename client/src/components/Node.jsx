import React from 'react'
import PropTypes from 'prop-types'
import { Panel } from 'react-bootstrap'
import SensorsList from './SensorsList'

class Node extends React.Component {
  constructor(...args) {
    super(...args)

    this.state = {}
  }

  static get propTypes() {
    return {
      node: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        sensors: PropTypes.shape({
          _id: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    }
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
            {
              // eslint-disable-next-line
              this.props.node.sensors.map(sensor => (
                <SensorsList
                  key={sensor._id}
                  sensor={Object.assign({ nodeId: this.props.node._id }, sensor)}
                />
              ))
            }
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    )
  }
}

module.exports = Node
