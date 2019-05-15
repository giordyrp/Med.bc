
import React, { Component } from 'react'
import { Search, Menu, Segment, Container,Dropdown,Image } from 'semantic-ui-react'
import _ from 'lodash'
import { getAgents, getAgentByAddress } from './Util'

export default class Header extends Component {


  constructor(props) {
    super(props)

    this.state = { activeItem: this.props.activeItem, source: [], agent: {} }

  }



  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name })
    name == "home" ?
      this.props.history.push('/')
      :
      this.props.history.push('/profile/' + this.state.agent.uid);
  }

  componentDidMount() {

    var list = []
    getAgentByAddress(this.props.platformInstance, this.props.web3, this.props.account).then((agent) => {
      this.setState({ agent: agent })
      //console.log("Found");
      getAgents(this.props.platformInstance, this.props.web3).then((agents) => {

        for (var i = 1; i <= agents.length; i++) {
          list.push({
            "title": agents[i - 1].name,
            "description": agents[i - 1].aType,
            "uid": agents[i - 1].uid
          })

          if (i == agents.length) {
            this.setState({ source: list });
          }
        }

      });
    });


  }

  componentWillMount() {
    this.resetComponent()
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })

  handleResultSelect = (e, { result }) => this.props.history.push('/profile/' + result.uid);

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {

      if (this.state.value.length < 1) return this.resetComponent()
      //console.log("value : "+this.state.value);
      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.title)

      this.setState({
        isLoading: false,
        results: _.filter(this.state.source, isMatch),
      })
    }, 300)
  }

  render() {
    const { activeItem } = this.state
    const { isLoading, value, results } = this.state



    return (
      <div>
        {this.props.registered ?
          <div>
            <Menu fixed='top' inverted color={'blue'}>
              <Container>
                <Menu.Item as='a' header name='home' onClick={this.handleItemClick}>
                  <Image size='mini' src='../images/logo.png' style={{ marginRight: '1.5em' }} />
                  Med.bc
                </Menu.Item>
                

              <Menu.Menu position='right'>
              <Menu.Item>
                <Search
                  loading={isLoading}
                  onResultSelect={this.handleResultSelect}
                  onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                  results={results}
                  value={value}
                  {...this.props}
                />
              </Menu.Item>
              <Menu.Item as='a' name='profile' onClick={this.handleItemClick}>Profile</Menu.Item>
            </Menu.Menu>
              </Container>
            </Menu>
          </div>
          :
          <div></div>
        }

      </div>

    )
  }
}