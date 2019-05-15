import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { getRelationships, getAgentByAddress, getPatientsDoctors, getFamilyDoctorRelationship, getRelationshipByAddressesNFD } from './Util'
import { Message, Loader, Grid, Header ,Icon, Segment, Image, Button} from 'semantic-ui-react'
import Admin from './Admin'
import Profile from './Profile'
import { Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Modal, CircularProgress, Paper, } from '@material-ui/core'
import Footer from './Footer';


const options = [
  { key: 'fa', text: 'Full Access', value: 'fa' },
  { key: 'fal', text: 'Full Altered List', value: 'fal' },
  { key: 'pl', text: 'Patial List', value: 'pl' },
  { key: 'rg', text: 'Range', value: 'rg' },
  { key: 'tr', text: 'Trend', value: 'tr' },
  { key: 'na', text: 'No Access', value: 'na' },
]


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { agent: {}, ready: false }
  }


  componentDidMount() {
    console.log("entro al home")
    console.log(this.props.loggedAgent);
    this.watchEvents();
    this.start();
    //this.watchEvents();
  }

  buildRelationship(platformInstance, web3, add, rs, i) {
    return new Promise((res, rej) => {
      getAgentByAddress(platformInstance, web3, add).then((agent) => {
        res({
          id: rs.id,
          idR: i,
          name: agent.name,
          uid: agent.uid,
          aType: agent.aType,
          access: rs.access,
          type: rs.type,
          active: rs.active,
          agent: agent

        })
      });
    })
  }

  relationshipBool(id){
    for(var i=0;i<this.state.relationships.length;i++){
      //console.log(this.state.relationships[i].id);
      if(this.state.relationships[i].id==id){
        //console.log(this.state.relationships[i].id);
        return true;
      }
    }
    return false;
    
  }

  start() {
    var agent = this.props.loggedAgent;
    ////console.log(agent)
    this.setState({ agent: agent }, () => {
      if (agent.uid != "admin") {
        ////console.log(agent);

        var list = [];

        getRelationships(this.props.platformInstance, agent.aType, agent.address).then(async (relationships) => {
          ////console.log("length : " + relationships.length);
          ////console.log(relationships)
          var id = 0;
          var address = []
          var address2 = []
          var iR = 0;
          if (relationships.length == 0) this.setState({ relationships: list, ready: true });
          for (var i = 1; i <= relationships.length; i++) {

            this.buildRelationship(this.props.platformInstance, this.props.web3, agent.aType == "pt" ? relationships[i - 1].other : relationships[i - 1].patient, relationships[i - 1], i).then((l) => {
              id++;
              list = [...list, l];
              if (relationships.length == id) {
                /*//console.log("antes de ordenar");
                //console.log(list);*/
                list = list.sort((a, b) => a.idR - b.idR);
                /*//console.log("ddo");
                //console.log(list);*/
                this.setState({ relationships: list, ready: true },()=>{
                  //console.log(this.state.relationships);
                });
                
              }

            })

          }



        });
      }
    })


  };


  watchEvents() {
    this.props.platformInstance.accessEvent({}, {
      fromBlock: 'latest' ,
      toBlock: 'latest'
    }).watch((error, event) => {
      if(this.relationshipBool(event.args.i)){
        //console.log("se ha cambiado el access");
        //console.log(event.args)
        this.start();
      }
    })
    this.props.platformInstance.activeEvent({}, {
      fromBlock: 'latest',
      toBlock: 'latest'
    }).watch((error, event) => {
      //console.log("i"+event.args.i);
      if(this.relationshipBool(event.args.i)){
        //console.log("se ha cambiado el active");
        //console.log(event.args)
        this.start();
      }
      
    })
    this.props.platformInstance.relationshipEvent({}, {
      fromBlock: 'latest' ,
      toBlock: 'latest'
    }).watch((error, event) => {
      if(event.args.ow==this.props.loggedAgent.address){
        this.start();
      }
    })
  }

  handleOpen = (item) => {
    this.setState({ open: true, item: item }, () => {
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  filter = (tp) => {
    var filtered = this.state.relationships.filter(function (item) {
      
      return item.aType == tp;
    });

    return filtered;
  }

  filterDoctorMP = () => {
    var filtered = this.state.relationships.filter(function (item) {
      return item.type == "fd";
    });

    return filtered;
  }

  filterDoctorOP = () => {
    var filtered = this.state.relationships.filter(function (item) {
      return item.type != "fd";
    });

    return filtered;
  }



  render() {
    const { classes } = this.props;

    if (this.state.agent.aType == "admin") {
      return (<Admin platformInstance={this.props.platformInstance} loggedAgent={this.props.loggedAgent} web3={this.props.web3}></Admin>)
    } else if (this.state.relationships == null) {
      return (<Loader active inline />)
    } else {
      return (



        //         <Grid container spacing={10} style={{minHeight: '100%'}}>
        <div style={{paddingLeft:25}}>
          {this.props.loggedAgent.aType == 'pt' ?
            
              <Grid columns={4}>
                <Grid.Row>
                  <Grid.Column width={5}>
                    <Header as='h3'>Doctors</Header>

                    {this.filter("dc") == 0 ?
                      <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
                        <Message.Header>No doctors</Message.Header>
                        <p>
                          You've not shared your medical history with doctors yet.
                        </p>
                      </Message>
                      :
                      <div></div>
                    }





                    {this.state.relationships.map((item, index) => (
                      item.aType == 'dc' ?
                        <Button onClick={this.handleOpen.bind(this, item)}  style={{margin:0, padding:0,marginBottom:5}}>
                        <Segment className={classes.rootPaperSearch} elevation={1} >
                          <Grid columns={2}>
                            <Grid.Row>
                              <Grid.Column width={5}>
                                  <Image src='../images/user.png' size="small"></Image>
                              </Grid.Column>
                              <Grid.Column width={11} textAlign="left">
                              <Header as="h4">{item.type == "fd" ? item.name + " (FD)" : item.name}</Header>
                              <p>{item.access == "fa" ? "Full Access" : item.access == "fal" ? "Ful Altered List" : item.access == "pl" ? "Partial List" : item.access == "rg" ? "Range" : item.access == "tr" ? "Trend" : "No Access"}{item.active == true ? " - Active" : " - No active"}</p>
                                  
                              </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Segment>
                        </Button>
                        
                        :
                        <div></div>

                    ))}

                  </Grid.Column>
                <Grid.Column width={5}>
                  <Header as='h3'>Laboratories</Header>

                    {this.filter("lb") == 0 ?
                      <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
                        <Message.Header>No laboratories</Message.Header>
                        <p>
                          You've not shared your medical history with laboratories yet.
                        </p>
                      </Message>
                      :
                      <div></div>
                    }

                    {this.state.relationships.map((item, index) => (
                      item.aType == 'lb' ?
                      <Button onClick={this.handleOpen.bind(this, item)} style={{margin:0, padding:0,marginBottom:5}}>
                        <Segment className={classes.rootPaperSearch} elevation={1} >
                          <Grid columns={2}>
                            <Grid.Row>
                              <Grid.Column width={5}>
                                  <Image src='../images/user.png' size="small"></Image>
                              </Grid.Column>
                              <Grid.Column width={11}>
                              <Header as="h4">{item.type == "fd" ? item.name + " (FD)" : item.name}</Header>
                              <p>{item.access == "fa" ? "Full Access" : item.access == "fal" ? "Ful Altered List" : item.access == "pl" ? "Partial List" : item.access == "rg" ? "Range" : item.access == "tr" ? "Trend" : "No Access"}{item.active == true ? " - Active" : " - No active"}</p>
                                  
                              </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Segment>
                        </Button>
                        :
                        <div></div>

                    ))}


                  </Grid.Column>
                <Grid.Column width={5}>
                  <Header as='h3'>Others</Header>

                    {this.filter("ot") == 0 ?
                      <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
                        <Message.Header>No others</Message.Header>
                        <p>
                          You've not shared your medical history with other health care providers yet.
                        </p>
                      </Message>
                      :
                      <div></div>
                    }

                    {this.state.relationships.map((item, index) => (
                      item.aType == 'ot' ?
                      <Button onClick={this.handleOpen.bind(this, item)} style={{margin:0, padding:0,marginBottom:5}}>
                        <Segment className={classes.rootPaperSearch} elevation={1} >
                          <Grid columns={3}>
                            <Grid.Row>
                              <Grid.Column width={5}>
                                  <Image src='../images/user.png' size="small"></Image>
                              </Grid.Column>
                              <Grid.Column width={11}>
                              <Header as="h4">{item.type == "fd" ? item.name + " (FD)" : item.name}</Header>
                              <p>{item.access == "fa" ? "Full Access" : item.access == "fal" ? "Ful Altered List" : item.access == "pl" ? "Partial List" : item.access == "rg" ? "Range" : item.access == "tr" ? "Trend" : "No Access"}{item.active == true ? " - Active" : " - No active"}</p>
                                  
                              </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Segment>
                        </Button>
                        :
                        <div></div>

                    ))}

                  </Grid.Column>
                {this.props.onClose != null ?
                    <Grid.Column width={1} textAlign="right">
                      <Icon onClick={this.props.onClose} style={{ right: 0, margin: 0 }} name="close"></Icon>
                    </Grid.Column>
                    :
                    <div></div>}

                </Grid.Row>
              </Grid>

            


            :

            this.props.loggedAgent.aType == 'dc' ?

              <Grid columns={3}>
                <Grid.Row>
                  <Grid.Column  centered width={5}>
                <Header as='h3'>My patients</Header>

                {this.filterDoctorMP() == 0 ?
                  <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
                    <Message.Header>No patients</Message.Header>
                    <p>
                      You don't have patients.
                        </p>
                  </Message>
                  :
                  <div></div>
                }

                {this.state.relationships.map((item, index) => (
                  item.type == 'fd' ?
                  <Button onClick={this.handleOpen.bind(this, item)} style={{margin:0, marginBottom:5, padding:0}}>
                        <Segment className={classes.rootPaperSearch} elevation={1} >
                          <Grid columns={2}>
                            <Grid.Row>
                              <Grid.Column width={5}>
                                  <Image src='../images/user.png' size="small"></Image>
                              </Grid.Column>
                              <Grid.Column width={11}>
                              <Header as="h4">{item.type == "fd" ? item.name + " (FD)" : item.name}</Header>
                              <p>{item.access == "fa" ? "Full Access" : item.access == "fal" ? "Ful Altered List" : item.access == "pl" ? "Partial List" : item.access == "rg" ? "Range" : item.access == "tr" ? "Trend" : "No Access"}{item.active == true ? " - Active" : " - No active"}</p>
                                  
                              </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Segment>
                        </Button>
                    :
                    <div></div>

                ))}

              </Grid.Column>
              <Grid.Column width={7}>
              <Header as='h3'>Other patients</Header>


                {this.filterDoctorOP() == 0 ?
                  <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
                    <Message.Header>No other patients</Message.Header>
                    <p>
                      You've not requested a medical history yet.
                        </p>
                  </Message>
                  :
                  <div></div>
                }

                {this.state.relationships.map((item, index) => (
                  item.type != 'fd' ?
                  <Button onClick={this.handleOpen.bind(this, item)}  style={{margin:0, padding:0,marginBottom:5}}>
                        <Segment className={classes.rootPaperSearch} elevation={1} >
                          <Grid columns={3}>
                            <Grid.Row>
                              <Grid.Column width={5}>
                                  <Image src='../images/user.png' size="small"></Image>
                              </Grid.Column>
                              <Grid.Column width={11}>
                              <Header as="h4">{item.type == "fd" ? item.name + " (FD)" : item.name}</Header>
                              <p>{item.access == "fa" ? "Full Access" : item.access == "fal" ? "Ful Altered List" : item.access == "pl" ? "Partial List" : item.access == "rg" ? "Range" : item.access == "tr" ? "Trend" : "No Access"}{item.active == true ? " - Active" : " - No active"}</p>
                                  
                              </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Segment>
                        </Button>
                    :
                    <div></div>

                ))}

              </Grid.Column>
              {this.props.onClose != null ?
                <Grid.Column width={1} textAlign="right">
                  <Icon onClick={this.props.onClose} style={{ right: 2, margin: 0 }} name="close"></Icon>
                </Grid.Column>
                :
                <div></div>}
                </Grid.Row>
              </Grid>
              

              :


              <Grid columns={2}>
                <Grid.Row>
                  <Grid.Column width={15}>
                <Header as='h3'>Patients</Header>

                {this.state.relationships.length == 0 ?
                  <Message style={{ width: 300, margin: 'auto', marginTop: 20 }}>
                    <Message.Header>No patients</Message.Header>
                    <p>
                      You've not requested a medical history yet.
                        </p>
                  </Message>
                  :
                  <div></div>
                }
                <div>
                  {this.state.relationships.map((item, index) => (
                    
                    <Button onClick={this.handleOpen.bind(this, item)}  style={{margin:0, padding:0,marginBottom:5}}>
                        <Segment className={classes.rootPaperSearch} elevation={1} >
                          <Grid columns={3}>
                            <Grid.Row>
                              <Grid.Column width={5}>
                                  <Image src='../images/user.png' size="small"></Image>
                              </Grid.Column>
                              <Grid.Column width={11}>
                              <Header as="h4">{item.type == "fd" ? item.name + " (FD)" : item.name}</Header>
                              <p>{item.access == "fa" ? "Full Access" : item.access == "fal" ? "Ful Altered List" : item.access == "pl" ? "Partial List" : item.access == "rg" ? "Range" : item.access == "tr" ? "Trend" : "No Access"}{item.active == true ? " - Active" : " - No active"}</p>
                                  
                              </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Segment>
                        </Button>
                  ))}
                </div>
              </Grid.Column>,
              {this.props.onClose != null ?
                <Grid.Column width={1} textAlign="right">
                  <Icon onClick={this.props.onClose} style={{ right: 2, margin: 0 }} name="close"></Icon>
                </Grid.Column>
                :
                <div></div>}

                </Grid.Row>
              </Grid>






          }
          <Modal
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.open}
          >
            {this.state.item == null ?
              <Loader active inline />
              :


              <Profile onClose={this.handleClose} loggedAgent={this.props.loggedAgent} searchedAgent={this.state.item == null ? {} : this.state.item.agent} request={true} relationship={this.state.item} web3={this.props.web3} platformInstance={this.props.platformInstance} doctor={this.props.doctor}></Profile>

            }

          </Modal>


        </div>
        //  </Grid>



      )
    }
  }

}

const styles = theme => ({

  rootList: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  rootPaperSearch: {
    width: theme.spacing.unit * 30,
    margin: 'auto',
    marginTop: 10,
  },
  inline: {
    display: 'inline',
  }
});
Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);