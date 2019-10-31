import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import Header from './Header'
import Sensor from './Sensor'
import { QUERY_SENSORS } from '../lib/fetch'

const SensorsList = () => {
  const { loading, data } = useQuery(QUERY_SENSORS)


  // const { loading: loadingValues, data: { values } } = useQuery(
  //   QUERY_VALUES,
  //   {
  //     variables: {
  //       value: {
  //         sensor: sensor.id,
  //         createdAt: {
  //           gt: moment().subtract(5, 'minutes').toISOString(),
  //           lt: moment().toISOString(),
  //         },
  //       },
  //     },
  //   },
  // )


  if (loading) {
    return (<p>loading lifts</p>)
  }

  return (
    <div>
      <Header />
      {data.sensors.map(sensor => (
        <Sensor key={sensor.id} sensor={sensor} />
      ))}
    </div>
  )
}

export default SensorsList
