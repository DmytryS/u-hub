import { ApolloClient } from 'apollo-client'
import fetch from 'unfetch'
import gql from 'graphql-tag'
import { HttpLink } from 'apollo-link-http'
import {
  InMemoryCache,
  // IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory'
import { useQuery, useMutation } from '@apollo/react-hooks'

const { API_URL } = process.env

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'network-only',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
}
const cache = new InMemoryCache()
const link = new HttpLink({
  uri: API_URL,
  fetch,
})

export const client = new ApolloClient({
  link,
  fetch,
  cache,
  defaultOptions,
})

export const QUERY_SENSORS = gql`
  query QuerySensors($sensor: SensorFilterInput) {
    sensors(filter: $sensor) {
      id
      name
      description
      type
      mqttSetTopic
      mqttStatusTopic
    }
  }
`

export const MUTATE_SENSOR = gql`
  mutation MutateSensor($sensor: SensorInput!) {
    sensor(input: $sensor) {
      id
      name
      description
      type
      mqttSetTopic
      mqttStatusTopic
    }
  }
`

export const QUERY_AUTOMATIC_ACTIONS = gql`
  query QueryAutomaticActions($automaticAction: AutomaticActionInput){
    automaticActions(input: $automaticAction){
      id
      name
      sensor {
        id
        name
        description
        type
        mqttStatusTopic
        mqttSetTopic
      }
      valueToCompare
      condition
      enabled
      actions {
        id
        valueToChangeOn
        sensor {
          id
          name
          type
          description
          mqttStatusTopic
          mqttSetTopic
        }
      }
    }
  }
`

export const MUTATE_AUTOMATIC_ACTION = gql`
  mutation MutateAutomaticAction($automaticAction: AutomaticActionInput!) {
    automaticAction(input: $automaticAction) {
      id
      name
      sensor {
        id
        name
        description
        type
        mqttStatusTopic
      }
      valueToCompare
      condition
      enabled
      actions {
        id
        valueToChangeOn
        sensor {
          id
          type
          description
          mqttSetTopic
        }
      }
    }
  }
`

export const QUERY_SCHEDULED_ACTIONS = gql`
  query QueryScheduledActions {
    scheduledActions {
      id
      name
      schedule
      enabled
      actions {
        id
        sensor {
          id
          name
        }
        valueToChangeOn
      }
    }
  }
`

export const MUTATE_SCHEDULED_ACTION = gql`
  mutation MutateScheduledAction($scheduledAction: ScheduledActionInput!){
    scheduledAction {
      id
      name
      schedule
      enabled
      actions {
        id
        sensor {
          id
          name
        }
        valueToChangeOn
      }
    }
  }
`

export const QUERY_VALUES = gql`
  query GetValues($value: ValueFilterInput) {
    values(filter: $value) {
      sensor{
        id
        type
      }
      value
      createdAt
    }
  }
`

export const MUTATE_VALUE = gql`
  query MutateValue($value: ValueInput) {
    value(input: $value) {
      sensor {
        id
        type
      }
      value
    }
  }
`
