import React, { Component } from 'react'
import MedicalHistory from './MedHistory'
import Home from './Home'
import {getRelationshipByAddresses} from './Util'
import {Modal} from '@material-ui/core'
import '../css/styles.css'
import { Loader, Grid, Header, Icon, Segment, Image, Dropdown, Checkbox, Button } from 'semantic-ui-react'

const options = [
  { key: 'fa', text: 'Full Access', value: 'fa' },
  { key: 'fal', text: 'Full Altered List', value: 'fal' },
  { key: 'pl', text: 'Partial List', value: 'pl' },
  { key: 'rg', text: 'Range', value: 'rg' },
  { key: 'tr', text: 'Trend', value: 'tr' },
  { key: 'na', text: 'No Access', value: 'na' }
]


class Profile extends Component {

  constructor(props) {
    super(props)
    this.state = { searchedAgent: {}, loggedAgent: {}, sentLoader: false, activeLoader: false, accessLoader: false }
  }

  componentDidMount() {
    this.watchEvents();
    if (this.props.loggedAgent.aType != "pt" && this.props.request) {
      getRelationshipByAddresses(this.props.platformInstance, this.props.searchedAgent.address, this.props.loggedAgent.address).then((rs) => {
        var value = rs == null ? false : true
        this.setState({ sent: value });
      });
    }
  }

  sendRequest() {
    this.watchEvents();
    this.setState({ sentLoader: true })
    this.props.platformInstance.addRelationship(this.props.searchedAgent.address, this.props.loggedAgent.address, "na", "nm", false, { from: this.props.doctor == null ? this.props.loggedAgent.address : this.props.doctor.address })
      .catch(() => this.setState({ sentLoader: false }));
  }


  handleOpen = () => {
    this.setState({ open: true }, () => {
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleOpen2 = () => {
    this.setState({ open2: true }, () => {
    });
  };

  handleClose2 = () => {
    this.setState({ open2: false });
  };


  onAccessChange = (e, { value }) => {
    this.setState({ accessLoader: true })
    this.props.platformInstance.setAccess(this.props.relationship.id, value, { from: this.props.doctor == null ? this.props.loggedAgent.address : this.props.doctor.address })
      .catch(() => this.setState({ accessLoader: false }));
  };

  onActiveChange = (e, { checked }) => {
    this.setState({ activeLoader: true })
    this.props.platformInstance.setActive(this.props.relationship.id, checked, { from: this.props.doctor == null ? this.props.loggedAgent.address : this.props.doctor.address })
    .catch(() => this.setState({ activeLoader: false }));
  };

  watchEvents() {
    this.props.platformInstance.accessEvent({}, {
      fromBlock: 'latest',
      toBlock: 'latest'
    }).watch((error, event) => {
      if (this.props.relationship != null && event.args.i == this.props.relationship.id) {
        this.setState({ access: event.args.access, accessLoader: false });
      }
    })
    this.props.platformInstance.activeEvent({}, {
      fromBlock: 'latest',
      toBlock: 'latest'
    }).watch((error, event) => {
      if (this.props.relationship != null && event.args.i == this.props.relationship.id) {
        this.setState({ active: event.args.active, activeLoader: false });
      }
    })
    this.props.platformInstance.relationshipEvent({}, {
      fromBlock: 'latest',
      toBlock: 'latest'
    }).watch((error, event) => {
      if (event.args.ot == this.props.loggedAgent.address) {
        this.setState({ sent: true, sentLoader: false });
      }
    })
  }

  render() {

    return (
      <div className="paper">
        <Segment>
          <Grid columns={3} centered>
            <Grid.Row>
              <Grid.Column width={5}>
                <Image src='../images/user.png' size="medium" avatar centered />
              </Grid.Column>
              <Grid.Column width={9}>
                <Header as='h3' style={{ margin: 0, padding: 0, marginTop: 14 }}>{this.props.searchedAgent.name}</Header>
                <p style={{ margin: 0, padding: 0 }}>{this.props.searchedAgent.aType == "pt" ? "Patient" : this.props.searchedAgent.aType == "dc" ? "Doctor" : this.props.searchedAgent.aType == "lb" ? "Laboratory" : this.props.searchedAgent.aType == "ot" ? "Other" : "Admin"}</p>
                <Header as='h5' style={{ margin: 0, padding: 0 }}>{this.props.searchedAgent.uid}</Header>
              </Grid.Column>
              {this.props.onClose != null ?
                <Grid.Column width={1} textAlign="right">
                  <Icon onClick={this.props.onClose} style={{ right: 2, margin: 0 }} name="close"></Icon>
                </Grid.Column>
                :
                <div></div>
              }
            </Grid.Row>
            <Grid.Row>
              {this.props.searchedAgent.uid == this.props.loggedAgent.uid ?
                this.props.loggedAgent.aType == "pt" ?
                  <Grid.Column width={16} textAlign="center">
                    <Button style={{ margin: 'auto' }} primary onClick={this.handleOpen}>My Medical History</Button>
                  </Grid.Column>
                  :
                  <div></div>
                :
                this.props.searchedAgent.aType == "pt" && this.props.loggedAgent.aType != "pt" ?
                  this.state.sent == null ?
                    <Loader active inline />
                    :
                    !this.state.sent ?
                      <Grid.Column width={16} textAlign="center">
                        <Button onClick={() => this.sendRequest()}>
                          <Icon name="send" />  Request Medical History</Button>
                        <Loader active={this.state.sentLoader} inline />
                      </Grid.Column>
                      :
                      this.props.relationship == null ?
                        <p style={{ textAlign: "center" }}>Medical History Requested</p>
                        :
                        this.props.relationship.active ?
                          this.props.relationship.type == "fd" && this.props.loggedAgent.aType == "dc" ?
                            <Grid.Column width={16} textAlign="center">
                              <Button onClick={this.handleOpen2} style={{ marginBottom: 5 }}> Manage Patient's Medical History</Button>
                              <Button onClick={this.handleOpen}> View Medical History</Button></Grid.Column>
                            :
                            <Grid.Column width={16} textAlign="center">
                              <Button onClick={this.handleOpen}> View Medical History</Button></Grid.Column>
                          :
                          <p style={{ textAlign: "center" }}>Waiting patient's confirmation</p>
                  :
                  this.props.relationship == null ?
                    <div></div>
                    :
                    [<Grid.Column width={8} textAlign="center">
                      <p>Access Level</p>
                      <Dropdown
                        value={this.state.access == null ? this.props.relationship.access : this.state.access}
                        disabled={this.props.relationship.type == "fd" ? true : false}
                        placeholder='User Type'
                        fluid
                        selection
                        options={options}
                        onChange={this.onAccessChange}
                      />
                      <Loader active={this.state.accessLoader} inline />
                    </Grid.Column>,
                    <Grid.Column width={8} textAlign="center">
                      <p>Status</p>
                      <Checkbox toggle
                        disabled={this.props.relationship.type == "fd" ? true : false}
                        checked={this.state.active == null ? this.props.relationship.active : this.state.active}
                        onChange={this.onActiveChange}
                      />
                      <Loader active={this.state.activeLoader} inline />
                    </Grid.Column>]
              }
            </Grid.Row>
          </Grid>
        </Segment>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}>
          <MedicalHistory onClose={this.handleClose} loggedAgent={this.props.loggedAgent} searchedAgent={this.props.searchedAgent} relationship={this.props.relationship} web3={this.props.web3} platformInstance={this.props.platformInstance}></MedicalHistory>
        </Modal>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open2}>
          <div className={"paper2"} >
            <Segment>
              <Home onClose={this.handleClose2} platformInstance={this.props.platformInstance} web3={this.props.web3} loggedAgent={this.props.searchedAgent} doctor={this.props.loggedAgent} />
            </Segment>
          </div>
        </Modal>
      </div>
    )
  }
}

/*const styles = theme => ({
  paper: {
    margin: 'auto',
    marginTop: 30,
    width: theme.spacing.unit * 50,
    boxShadow: theme.shadows[5],
    outline: 'none',
  },
  paper2: {
    margin: 'auto',
    marginTop: 30,
    width: theme.spacing.unit * 50,
    outline: 'none',
  },
  paper3: {
    margin: 'auto',
    marginTop: 30,
    width: theme.spacing.unit * 160,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    boxShadow: theme.shadows[5],
    outline: 'none',
  },
  bigAvatar: {
    margin: 10,
    width: 80,
    height: 80,
  }
});

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};*/

export default Profile;
