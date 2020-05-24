import React from 'react'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import Header from './Header'
import Sensor from './Sensor'
import { QUERY_SENSORS, SUBSCRIBE_SENSORS } from '../lib/fetch'

const updateData = (existingArray, el) => {
  const handle = (array, newEl) => {
    const existingElIndex = array
      .findIndex((k) => k.id === newEl.id)

    if (existingElIndex === -1 && !newEl.deleted) {
      array.push(newEl)

      // return array
    }
    if (existingElIndex !== -1 && newEl.deleted) {
      array.splice(existingElIndex, 1)

      // return array
    }
    if (existingElIndex !== -1 && !newEl.deleted) {
      // eslint-disable-next-line
      array[existingElIndex] = newEl

      // return array
    }
    return array
  }

  if (Array.isArray(el)) {
    el.forEach((k) => {
      // eslint-disable-next-line
      existingArray = handle(existingArray, k)
    })
  } else {
    // eslint-disable-next-line
    existingArray = handle(existingArray, el)
  }

  return existingArray
}

const SensorsList = () => {
  const { loading, data } = useQuery(QUERY_SENSORS)

  const {
    data: subscriptionData,
  } = useSubscription(
    SUBSCRIBE_SENSORS,
  )


  if (loading) {
    return (<p>loading sensors</p>)
  }

  if (subscriptionData) {
    data.sensors = updateData(data.sensors, subscriptionData.sensor)
  }

  return (
    <div>
      <Header />
      {
        data.sensors.map((sensor) => (
          <Sensor key={sensor.id} sensor={sensor} />
        ))
      }
    </div>
  )
}

export default SensorsList
