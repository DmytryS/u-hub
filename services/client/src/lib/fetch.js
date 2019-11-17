import { ApolloClient } from 'apollo-client'
import fetch from 'unfetch'
import gql from 'graphql-tag'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import {
  InMemoryCache,
  // IntrospectionFragmentMatcher,
} from 'apollo-cache-inmemory'
// import { useQuery, useMutation } from '@apollo/react-hooks'

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

const httpLink = new HttpLink({
  uri: `http://${API_URL}/api/v1`,
  fetch,
})
const wsLink = new WebSocketLink({
  uri: `ws://${API_URL}/graphql`,
  options: {
    reconnect: true,
  },
})

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    )
  },
  wsLink,
  httpLink,
)

const link = ApolloLink.from([terminatingLink])
const cache = new InMemoryCache()

export const client = new ApolloClient({
  link,
  fetch,
  cache,
  defaultOptions,
})

export const QUERY_APPLE_HOME_KIT = gql`
  query QueryAppleHomeKit {
    appleHomeKit {
      uri
    }
  }
`

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

export const SUBSCRIBE_SENSORS = gql`
  subscription {
    sensor {
      id
      name
      description
      type
      mqttSetTopic
      mqttStatusTopic
      deleted
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
        mqttSetTopic
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
          name
          description
          type
          mqttSetTopic
          mqttStatusTopic
        }
      }
    }
  }
`

export const SUBSCRIBE_AUTOMATIC_ACTIONS = gql`
  subscription SubscribeAutomaticActions($automaticAction: AutomaticActionInput) {
    automaticAction(filter: $automaticAction) {
      id
      name
      sensor {
        id
        name
        type
        description
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
      deleted
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
          description
          type
          mqttSetTopic
          mqttStatusTopic
        }
        valueToChangeOn
      }
    }
  }
`

export const MUTATE_SCHEDULED_ACTION = gql`
  mutation MutateScheduledAction($scheduledAction: ScheduledActionInput!){
    scheduledAction(input: $scheduledAction) {
      id
      name
      schedule
      enabled
      actions {
        id
        sensor {
          id
          name
          description
          type
          mqttSetTopic
          mqttStatusTopic
        }
        valueToChangeOn
      }
    }
  }
`

export const SUBSCRIBE_SCHEDULED_ACTIONS = gql`
  subscription SubscribeScheduledActions {
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
          description
          type
          mqttSetTopic
          mqttStatusTopic
        }
        valueToChangeOn
      }
      deleted
    }
  }
`

export const SUBSCRIBE_ACTIONS = gql`
  subscription SubscribeActions($action: ActionFilterInput) {
    action(filter: $action) {
      id
      sensor {
        id
        name
        description
        type
        mqttSetTopic
        mqttStatusTopic
      }
      automaticAction{
        id
      }
      scheduledAction{
        id
      }
      valueToChangeOn
      deleted
    }
  }
`

export const QUERY_VALUES = gql`
  query GetValues($value: ValueFilterInput) {
    values(filter: $value) {
      sensor{
        id
        name
        description
        type
        mqttSetTopic
        mqttStatusTopic
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
        name
        description
        type
        mqttSetTopic
        mqttStatusTopic
      }
      value
    }
  }
`

export const SUBSCRIBE_VALUES = gql`
  subscription SubscribeValue($value: ValueInput) {
    value(filter: $value) {
      sensor {
        id
        name
        description
        type
        mqttSetTopic
        mqttStatusTopic
      }
      value
      deleted
    }
  }
`
