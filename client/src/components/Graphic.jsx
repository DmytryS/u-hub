import React from 'react'
import PropTypes from 'prop-types'
import { Label } from 'react-bootstrap'
import moment from 'moment'
import axios from 'axios'
import ReactHighcharts from 'react-highcharts'
import DateTimePicker from 'react-datetime-picker'

const highchartsConfig = {
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
}

const handleFromDate = (newDate) => {
  if (newDate) {
    this.setState({ fromDate: moment(newDate) }, this.loadSensorData)
  } else {
    this.setState({ fromDate: moment() }, this.loadSensorData)
  }
}

const handleToDate = (newDate) => {
  if (newDate) {
    this.setState({ toDate: moment(newDate) }, this.loadSensorData)
  } else {
    this.setState({ toDate: moment() }, this.loadSensorData)
  }
}

const loadSensorData = () => {
  const { nodeId, sensorId, sensorType } = this.props.sensor
  const fromDate = this.state.fromDate.format('x')
  const toDate = this.state.toDate.format('x')

  let data = []
  try {
    const response = await axios
      .get(`/nodes/${nodeId}/sensors/${sensorId}/type/${sensorType}/values?fromDate=${fromDate}&toDate=${toDate}`)
    data = response.data.map(point => [Date.parse(point.timestamp), point.value])
  } catch (err) {
    // eslint-disable-next-line
    alert(err.response.data.details[0].message)
  }
}

const Graphic = () => {
  const fromDate = moment().subtract(6, 'hours'),
  const toDate = moment()

  return (
    <div>
    <Label>From</Label>
    <DateTimePicker
      onChange={this.handleFromDate}
      value={fromDate.toDate()}
    />
    <Label>To</Label>
    <DateTimePicker
      onChange={this.handleToDate}
      value={toDate.toDate()}
    />
    <ReactHighcharts
      config={highchartsConfig}
      ref={(ref) => { this.chart = ref }}
    />
  </div>
  )
}

export default Graphic
