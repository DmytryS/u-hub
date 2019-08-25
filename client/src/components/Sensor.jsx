import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { Grid, Row, Col } from 'react-bootstrap'

class Sensor extends React.Component {
  constructor(...args) {
    super(...args)

    this.state = {}
  }

  static get propTypes() {
    return {
      sensor: PropTypes.shape({
        nodeId: PropTypes.string.isRequired,
        sensorId: PropTypes.string.isRequired,
        sensorType: PropTypes.string.isRequired,
        timestamp: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      }).isRequired,
    }
  }

  render() {
    return (
      <Grid>
        <Row>
          <Col xs={6} md={4}>{this.props.sensor.sensorType}</Col>
          <Col xs={6} md={4}>
            {moment().diff(moment(parseInt(this.props.sensor.timestamp, 10)), 'minutes') < 5 ? this.props.sensor.value : 'no data'}
          </Col>
          <Col xs={6} md={4}>
            <Link to={`/node/${this.props.sensor.nodeId}/sensors/${this.props.sensor.sensorId}`
              + `/type/${this.props.sensor.sensorType}`}
            >
              Settings
            </Link>
          </Col>
        </Row>
      </Grid>
    )
  }
}

module.exports = Sensor
