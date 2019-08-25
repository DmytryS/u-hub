import React from 'react'
import PropTypes from 'prop-types'
import { Label } from 'react-bootstrap'
import moment from 'moment'
import axios from 'axios'
import ReactHighcharts from 'react-highcharts'
import DateTimePicker from 'react-datetime-picker'

class Graphic extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      // show: false,
      // sensorData: [],
      fromDate: moment().subtract(3, 'hours'),
      toDate: moment(),
      highchartsConfig: {
        title: {
          text: '',
        },
        time: {
          timezoneOffset: new Date().getTimezoneOffset(),
        },
        xAxis: {
          type: 'datetime',
          labels: {
            format: '{value:%Y-%b-%e %H:%M:%S}',
          },
        },
      },
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
      // show: true,
      fromDate: moment().subtract(6, 'hours'),
      toDate: moment(),
    }, this.loadSensorData)
  }

  async loadSensorData() {
    const { nodeId, sensorId, sensorType } = this.props.sensor
    const fromDate = this.state.fromDate.format('x')
    const toDate = this.state.toDate.format('x')

    let data = []
    try {
      const response = await axios
        .get(`/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/values?fromDate=${fromDate}&toDate=${toDate}`)
      data = response.data.map(point => [Date.parse(point.timestamp), point.value])
    } catch (err) {
      alert(err.response.data.details[0].message)
    }

    this.setState({
      highchartsConfig: Object.assign(this.state.highchartsConfig, {
        series: [{
          data,
          name: sensorType,
        }],
      }),
    })
  }


  handleFromDate(newDate) {
    if (newDate) {
      this.setState({ fromDate: moment(newDate) }, this.loadSensorData)
    } else {
      this.setState({ fromDate: moment() }, this.loadSensorData)
    }
  }

  handleToDate(newDate) {
    if (newDate) {
      this.setState({ toDate: moment(newDate) }, this.loadSensorData)
    } else {
      this.setState({ toDate: moment() }, this.loadSensorData)
    }
  }

  render() {
    return (
      <div>
        <Label>From</Label>
        {' '}
        <DateTimePicker
          onChange={this.handleFromDate.bind(this)}
          value={this.state.fromDate.toDate()}
        />
        {'    '}
        <Label>To</Label>
        {' '}
        <DateTimePicker
          onChange={this.handleToDate.bind(this)}
          value={this.state.toDate.toDate()}
        />
        <ReactHighcharts
          config={this.state.highchartsConfig}
          ref={(ref) => { this.chart = ref }}
        />
      </div>
    )
  }
}

module.exports = Graphic
