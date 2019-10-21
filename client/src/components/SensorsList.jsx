import React from 'react'
// import axios from 'axios'
// import { Panel } from 'react-bootstrap'
import { useQuery } from '@apollo/react-hooks'
import Navbar from './Header'
import Sensor from './Sensor'
import { QUERY_SENSORS } from '../lib/fetch'

// const REFRESH_RATE = 10000

const SensorsList = () => {
  const { loading, data } = useQuery(QUERY_SENSORS)

  if (loading) {
    return (<p>loading lifts</p>)
  }

  return (
    <div>
      <Navbar />
      {data.sensors.map(sensor => (
        <Sensor key={sensor.id} sensor={sensor} />
      ))}
    </div>
  )
}

export default SensorsList
