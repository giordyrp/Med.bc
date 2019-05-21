import React from 'react'
import Signup from './Signup'
import Home from './Home'
import Profile from './Profile'
import Footer from './Footer'
import Search from './Search'
import '../css/styles.css'
import { getAgentByAddress } from './Util';
import { Loader, Grid, Header, Icon, Divider, Image } from 'semantic-ui-react'




class Content extends React.Component {

  constructor(props) {
    super(props)
    this.state = { menu: 'Relationships', selectedIndex: '' }

  }

  componentDidMount() {
    getAgentByAddress(this.props.platformInstance, this.props.web3, this.props.account).then((agent) => {
      this.setState({ agent: agent })
    });
  }

  onSearchClick = (s) => {
    this.setState({ menu: s })
  }

  render() {
    const menus = [
      {
        name: 'Relationships',
        icon: 'file',
      },
      {
        name: 'Search',
        icon: 'search',
      },
      {
        name: 'My profile',
        icon: 'user circle',
      }
    ];

    if (this.state.agent == null) return (<Loader active inline />)
    return (

      <div className="main">
        <div className="left-menus">
          <Image alt="Med.bc logo" src='../images/logoOnBlue.png' size="small" centered style={{ marginTop: 15 }} />
          <Divider />
          <p style={{ fontSize: 18, fontWeight: 'bold', margin: 0, padding: 0, color: 'white', paddingLeft: '10px' }}>{this.state.agent.name}</p>
          <p style={{ fontSize: 15, fontWeight: 'bold', margin: 0, padding: 0, color: 'white', paddingLeft: '10px' }}>{this.state.agent.aType == "pt" ? "Patient" : this.state.agent.aType == "dc" ? "Doctor" : this.state.agent.aType == "lb" ? "Laboratory" : this.state.agent.aType == "oth" ? "Other" : "Admin"}</p>
          <Header menu={this.state.activeMenu} />
          {menus.map(item => {
            return (
              this.state.agent.aType == "pt" && item.name == "Search" ?
                <div></div>
                :
                <div className={this.state.menu === item.name ? 'menu active' : 'menu'} onClick={() => this.setState({ menu: item.name })}>
                  <Icon name={item.icon} size="large" />
                  <span>{item.name}</span>

                </div>
            )
          })}
        </div>
        <div>

          <div className="home">
            <div>
              {!this.props.registered ?
                <Signup registerAgent={this.props.registerAgent} />
                :
                <div className="bg" style={{ height: window.innerHeight - 135, paddingLeft: 25 }}>
                  {this.state.menu == 'Search' ?
                    [<Header as='h1'>Search</Header>,
                    <Search loggedAgent={this.state.agent} web3={this.props.web3} platformInstance={this.props.platformInstance} />]
                    :
                    this.state.menu == 'My profile' ?
                      [<Header as='h1'>My profile</Header>,
                      <Profile loggedAgent={this.state.agent} searchedAgent={this.state.agent} request={false} platformInstance={this.props.platformInstance} account={this.props.account} web3={this.props.web3}></Profile>]
                      :
                      [<Header as='h1'>Relationships</Header>,
                      <Home platformInstance={this.props.platformInstance} web3={this.props.web3} loggedAgent={this.state.agent} />]
                  }
                </div>
              }
            </div>
            <Footer></Footer>
          </div>
        </div>
      </div>
    )
  }
}


export default Content;
