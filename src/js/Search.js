import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';
import { getAgents } from './Util'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import Profile from './Profile';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Message, Segment, Loader,Header, Grid, Image,Button } from 'semantic-ui-react'
import _ from "lodash";

 class Search extends Component {
    constructor(props) {
        super(props) 
        this.state = { source: [], agent: {} , results:[], item:{} }
    
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
                //console.log(agents);
                this.setState({ source: agents});

    
          });
      }

 
    
      componentWillMount() {
        this.resetComponent()
      }
    
      resetComponent = () => this.setState({ isLoading: false, results: [], value: '' })
    
    
      handleSearchChange = (value ) => {
        this.setState({ isLoading: true, value })
    
        setTimeout(() => {
    
          if (value.length < 1) return this.resetComponent()
          //console.log("value : "+this.state.value);
          const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
          const isMatch = result => re.test(result.name)
    
          this.setState({
            isLoading: false,
            results: _.filter(this.state.source, isMatch),
          })
        }, 300)
      }

      handleOpen = (item) => {
        this.setState({ open: true, item: item},()=>{
        });
      };
    
      handleClose = () => {
        this.setState({ open: false });
      };

  render() {
    const { classes } = this.props;
    return (
        <div>
        <Segment className={classes.root} elevation={1} style={{margin:'auto'}}>
        <InputBase className={classes.input} placeholder="Search a patient" onChange={(evt)=>this.handleSearchChange(evt.target.value)} />
        <IconButton className={classes.iconButton} aria-label="Search">
          <SearchIcon />
        </IconButton>
      </Segment>

      {this.state.results.length==0?
        this.state.value!= null && this.state.value!=""?
        <Message style={{width:300, margin:'auto', marginTop:20}}>
          <Message.Header>Patient not found</Message.Header>
          <p>
            No results
          </p>
        </Message>
        
        :
        <Message style={{width:300, margin:'auto', marginTop:20}}>
          <Message.Header>Search a patient</Message.Header>
          <p>
            Write the patient's name on the top bar.
          </p>
        </Message>
        
      :
      
      //<List className={classes.rootList} style={{margin:'auto', marginTop:20}}>

      this.state.results.map((item,index)=>(
        <Button onClick={this.handleOpen.bind(this, item)} style={{margin:'auto', padding:0,marginTop:10, display:'block'}}>
                        <Segment style={{margin:'auto', width:200}}>
                          <Grid columns={2}>
                            <Grid.Row>
                              <Grid.Column width={5}>
                                  <Image src='../images/user.png' size="small"></Image>
                              </Grid.Column>
                              <Grid.Column width={11}>
                              <Header as="h4" style={{marginTop:5}}>{item.name }</Header></Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Segment>
                        </Button>
      ))
        //</List>
      }
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.open}
        >
          {this.state.item == {}?
          <Loader active inline />
          :
          <Profile onClose={this.handleClose} loggedAgent={this.props.loggedAgent} searchedAgent={this.state.item} request={true} web3={this.props.web3} platformInstance={this.props.platformInstance}></Profile>
          }
          
        </Modal>
      </div>
    )
  }
}
const styles = theme => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      width: 400,
      padding:0
    },
    rootList: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
      },
      paper: {
        margin:'auto',
        marginTop:30,
        width: theme.spacing.unit * 50,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        boxShadow: theme.shadows[5],
        padding: 4,
        outline: 'none',
      },
      rootPaperSearch: {
        width: theme.spacing.unit * 50,
        margin:'auto',
        marginTop:10,},
        
      
      inline: {
        display: 'inline',
      },
    input: {
      margin:0,
      marginLeft: 8,
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      width: 1,
      height: 28,
      margin: 4,
    },
    avatar: {
      margin: 10,
    },
    bigAvatar: {
      margin: 10,
      width: 80,
      height: 80,
    },
  });

  Search.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withStyles(styles)(Search);
