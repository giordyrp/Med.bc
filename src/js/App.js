import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import TruffleContract from 'truffle-contract'
import Platform from '../../build/contracts/Platform.json'
import Content from './Content'
import Signup from './Signup'
import 'semantic-ui-css/semantic.min.css'
import 'react-vis/dist/style.css'
import {CircularProgress} from '@material-ui/core';
import { Loader } from 'semantic-ui-react'





class App extends React.Component {


  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      registered: false,
      loading: true,
      registering: false,
      name : ""
    }

    if (typeof web3 != 'undefined') {
      this.web3Provider = web3.currentProvider
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
    }

    this.web3 = new Web3(this.web3Provider)
    this.platform = TruffleContract(Platform)
    this.platform.setProvider(this.web3Provider)
  }

  componentDidMount() {
    
    this.web3.eth.getCoinbase((err, account) => {
      this.setState({ account })
      console.log(account)
      web3.currentProvider.publicConfigStore.on('update', function() {
        if (web3.eth.accounts[0] !== account) {
          account = web3.eth.accounts[0];
          window.location.reload(false);
        }
      });
      this.platform.at('0xdc03a73d1c9989ccc3beecaaf64ccb1022910070').then((platformInstance) => {
        this.platformInstance = platformInstance 
        this.watchEvents()
        return this.platformInstance.getAgentIndex({from:this.state.account})})
        .then((index) => {
        var rgd = index == 0 ? false : true;
        this.setState({ registered:rgd, loading: false })   
        }) 
      })  
  }

  watchEvents() {
    this.platformInstance.registerEvent({}, {
      fromBlock: 'latest',
      toBlock: 'latest'
    }).watch((error, event) => {
      if(event.args.agentAddress==this.state.account){
        this.setState({ registered: true })
      }
      
    })
  }

  render() {
    return (
      <div >
        <div >       
          { this.state.loading ?
            <Loader active inline />
            : 
            !this.state.registered? 
            <Signup account={this.state.account} web3={this.web3} platformInstance={this.platformInstance} ></Signup>
            :
            <div style={{minHeight: '100vh'}}><Content registered={this.state.registered} account={this.state.account} web3={this.web3} platformInstance={this.platformInstance}/></div>               
          }
        </div>
      </div> 
    )
  }
}

ReactDOM.render(
    <App/>,
   document.querySelector('#root')
)
