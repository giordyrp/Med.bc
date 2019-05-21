import React, { Component } from 'react'
import { getAgents } from './Util'
import SearchIcon from '@material-ui/icons/Search';
import { Modal, InputBase, IconButton } from '@material-ui/core';
import Profile from './Profile';
import { Message, Segment, Loader, Header, Grid, Image, Button } from 'semantic-ui-react'
import _ from "lodash";
import '../css/styles.css'

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = { source: [], agent: {}, results: [], item: {} }

  }

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name })
    name == "home" ?
      this.props.history.push('/')
      :
      this.props.history.push('/profile/' + this.props.loggedAgent.uid);
  }

  componentDidMount() {
    getAgents(this.props.platformInstance, this.props.web3).then((agents) => {
      this.setState({ source: agents });
    });
  }



  componentWillMount() {
    this.resetComponent()
  }

  resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })


  handleSearchChange = (value) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {

      if (value.length < 1) return this.resetComponent()
      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = result => re.test(result.name)

      this.setState({
        isLoading: false,
        results: _.filter(this.state.source, isMatch),
      })
    }, 300)
  }

  handleOpen = (item) => {
    this.setState({ open: true, item: item }, () => {
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {

    return (
      <div>
        <Segment className="root" elevation={1} style={{ margin: 'auto' }}>
          <InputBase className="input" placeholder="Search a patient" onChange={(evt) => this.handleSearchChange(evt.target.value)} />
          <IconButton className="iconButton" aria-label="Search">
            <SearchIcon />
          </IconButton>
        </Segment>

        {this.state.results.length == 0 ?
          this.state.value != null && this.state.value != "" ?
            <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
              <Message.Header>Patient not found</Message.Header>
              <p>
                No results
          </p>
            </Message>

            :
            <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
              <Message.Header>Search a patient</Message.Header>
              <p>
                Write the patient's name on the top bar.
          </p>
            </Message>

          :

          this.state.results.map((item, index) => (
            <Button onClick={this.handleOpen.bind(this, item)} style={{ margin: 'auto', padding: 0, marginTop: 10, display: 'block' }}>
              <Segment style={{ margin: 'auto', width: 200 }}>
                <Grid columns={2}>
                  <Grid.Row>
                    <Grid.Column width={5}>
                      <Image src='../images/user.png' size="small"></Image>
                    </Grid.Column>
                    <Grid.Column width={11}>
                      <Header as="h4" style={{ marginTop: 5 }}>{item.name}</Header></Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
            </Button>
          ))

        }
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
        >
          {this.state.item == {} ?
            <Loader active inline />
            :
            <Profile onClose={this.handleClose} loggedAgent={this.props.loggedAgent} searchedAgent={this.state.item} request={true} web3={this.props.web3} platformInstance={this.props.platformInstance}></Profile>
          }

        </Modal>
      </div>
    )
  }
}


export default Search;
