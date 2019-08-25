import React from 'react'
import PropTypes from 'prop-types'

class Schedule extends React.Component {
  constructor(...args) {
    super(...args)

    this.state = {}
  }

  static get propTypes() {
    return {
      node: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
    }
  }

  render() {
    return (
      <div>
        <span>{this.props.node.name}</span>
      </div>
    )
  }
}

export default Schedule
