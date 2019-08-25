import React from 'react'
import { fetch } from '../lib'
import Navbar from './Header'
import Node from './Node'

class NodesList extends React.Component {
  constructor(...args) {
    super(...args)

    this.state = {
      nodesList: [],
    }
  }

  async getAllNodes() {
    this.setState({
      nodesList: await fetch.get('/nodes').then(result => result.data),
    })
  }

  async componentDidMount() {
    await this.getAllNodes()
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.state.nodesList.map(node => (
          <Node key={node._id} node={node} />
        ))}
      </div>
    )
  }
}

module.exports = NodesList
