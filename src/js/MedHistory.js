import React, { Component } from 'react'
import { getAgentByUID, getAgentByAddress, getRelationshipByAddresses,getDataByPrivacy, SetMHistoryAll, getMHistoryData, addHaemoglobinRecord } from './Util'
import { Button, Form, Label, Input ,Dropdown, Header, Loader, Grid,Icon, Segment, Message} from 'semantic-ui-react'
//import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries, Hint} from 'react-vis';
import PropTypes from 'prop-types';
import { withStyles, Card, CardContent, CircularProgress} from '@material-ui/core';
import medHistoryJSON from '../../build/contracts/MedicalHistory.json'
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'G', uv: 3490, pv: 4300, amt: 2100 }
];

const options = [
  [{key: 'fal', text: 'Full Altered List', value: 'fal' },{key: 'pl', text: 'Partial List', value: 'pl' }],
  [{ key: 'rg', text: 'Range', value: 'rg' },{ key: 'tr', text: 'Trend', value: 'tr' }]
]



class MedHistory extends Component {

  constructor(pros) {
    super(pros)
    this.state = {hidden:true, errors:[],hiddenInfo:true, errorsInfo:[], data:[],searchedAgent: {}, loggedAgent: {}, relationship: {}, name: "", address: "", phone: "", haemoglobinRecords : [], isLoading: true, date:"", hLevel:"", setAllLoader:false, addHaemoglobinRecordLoader:false}
  }

  componentDidMount() {
    this.start();
    this.watchEvents();

  }
  start(){
    //console.log("rlts de medh");
    //console.log(this.props.relationship);
    var agent = this.props.searchedAgent
      //console.log("----------------->recibo sadata")
      console.log(agent)
      getMHistoryData(this.props.web3,agent.mHistory).then((mHistoryData) => {
        //console.log("----------------->recibo mhdata")
        //console.log(mHistoryData)
        
        this.setState({ searchedAgent: agent, name: mHistoryData.name, address: mHistoryData.homeAddress, phone: mHistoryData.phoneNumber, haemoglobinRecords:mHistoryData.haemoglobinRecords }, () => {
          
          //console.log(this.state.haemoglobinRecords)
        });
        
        var agent2 = this.props.loggedAgent
          //console.log("----------------->recibo ladata")
          //console.log(agent2)
          var relationship = this.props.relationship;
          
          this.setState({ loggedAgent: agent2 }, () => {
            if(agent.uid!=agent2.uid){
              //console.log("entro al if");
            
              this.setState({ relationship: relationship },()=>{
                if(this.state.relationship.access=="fa"){
                  console.log("es fa")
                  console.log(this.state.haemoglobinRecords)
                  this.setState({data:this.state.haemoglobinRecords,isLoading: false });
                }else{
                  //console.log("no es fa")
                  getDataByPrivacy(this.state.relationship.access,this.state.haemoglobinRecords).then((data)=>{
                    console.log("DATA")
                    console.log(data)
                    this.setState({data:data,isLoading: false });
                  })

              }
              });
              
            
          }else{
            this.setState({isLoading: false });
          }
          });

        

    })
  }

  /*onDDChange=(value)=>{
    getDataByPrivacy(value,this.state.haemoglobinRecords).then((data)=>{
      ////console.log("DATA")
      ////console.log(data)
      this.setState({data:data},()=>{
        //console.log(value);
        this.setState({selected:value},()=>{
         // //console.log(this.state.selected);
        });
      })})
}*/

watchEvents() {
  let mh = web3.eth.contract(medHistoryJSON.abi).at(this.state.searchedAgent.mHistory);
  mh.allEvent({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  }).watch((error, event) => {
    
    if( event.args.ot==this.props.loggedAgent.address){
      //console.log("seat all event");
      this.setState({setAllLoader:false})
    this.start();
  }
  })
  mh.haemoglobinEvent({}, {
    fromBlock: 'latest',
    toBlock: 'latest'
  }).watch((error, event) => {
    if(event.args.ot==this.props.loggedAgent.address){
      this.setState({addHaemoglobinRecordLoader:false})
    this.start();
  }
  })
}

validateName () {
  return new Promise  ((resolve, reject)=>{
    this.setState({name:this.state.name.trim()},()=>{
      let reg = /^([A-Za-z]{6,40})$/ ;
      if(reg.test(this.state.name) === false)
      {     
      this.setState({errorsInfo:[...this.state.errorsInfo,"Invalid Name"]})
      resolve(false)
        }
      else {
        resolve(true)
    } 
  })
})
  }

  validateAddress () {
      return new Promise  ((resolve, reject)=>{
        this.setState({address:this.state.address.trim()},()=>{
          let reg = /^([A-Za-z\- #0-9]{6,40})$/ ;
          if(reg.test(this.state.address) === false)
          {     
          this.setState({errorsInfo:[...this.state.errorsInfo,"Invalid Address"]})
          resolve(false)
            }
          else {
            resolve(true)
        } 
      })
    })
      }
      validatePhone (){
          return new Promise  ((resolve, reject)=>{  
          this.setState({phone:this.state.phone.trim()},()=>{
            let reg = /^([0-9]{10,10})$/ ;
            if(reg.test(this.state.phone) === false)
            {
          
              this.setState({errorsInfo:[...this.state.errorsInfo,"Invalid Phone"]})
            resolve(false);
              }
            else {
              resolve(true);
            }
          }); 
        })        
          }

validateInfo(){
  return new Promise  ((res, rej)=>{ 
      this.setState({hiddenInfo:true,errorsInfo:[]})

      this.validateName().then((bool1)=>{
          this.validateAddress().then((bool2)=>{
              this.validatePhone().then((bool3)=>{
                  if(!bool1 || !bool2 || !bool3 || this.state.type==""){
                      this.setState({hiddenInfo:false})
                      console.log("false");
                      res(false)
                  }else{
                    this.setState({hiddenInfo:true})
                    console.log("true");
                      res(true)
                  }
                  
              });
          
          });
          
      });
})
}

validateLevel () {
  return new Promise  ((resolve, reject)=>{
    this.setState({hLevel:this.state.hLevel.trim()},()=>{
      let reg = /^(([0-9]+[.])?[0-9]+)$/ ;
      if(reg.test(this.state.hLevel) === false)
      {     
      this.setState({errors:[...this.state.errors,"Invalid haemogoblin level.\n If the number is a decimal, use dot"]})
      resolve(false)
        }
      else {
        console.log("el level es tru")
        resolve(true)
    } 
  })
})
  }


validateRecord(){
return new Promise  ((res, rej)=>{ 
  this.setState({hidden:true,errors:[]})

  this.validateLevel().then((bool1)=>{

              if(this.state.date==""){
                  this.setState({errors:[...this.state.errors,"Date is empty"]})
              }
              if(!bool1 || this.state.date==""){
                console.log("Lo pongo en false")
                  this.setState({hidden:false})
                  res(false)
              }else{
                  res(true)
              }
      
  });
})
}


setAll=()=>{
  this.validateInfo().then((bool)=>{
    if(bool){
  this.setState({setAllLoader:true})
  SetMHistoryAll(this.props.web3, this.props.searchedAgent.mHistory, this.state.name, this.state.address, this.state.phone, this.props.loggedAgent.address,this.props.searchedAgent.address)
  .then((bool)=>{
    if(!bool){
      if(!bool){
        this.setState({setAllLoader:false})
      }else{
        this.watchEvents();
    
      }
    }
  })
}
  })
}


onAddHaemoglobinRecord=()=>{
  this.validateRecord().then((bool)=>{
    if(bool){
      var date = this.state.date+"";
      var dateSplit = date.split(" ");
      var finalDate = dateSplit[2]+"/"+dateSplit[1]+"/"+dateSplit[3]
      console.log(finalDate)
  this.setState({addHaemoglobinRecordLoader:true})
  addHaemoglobinRecord(this.props.web3, this.props.searchedAgent.mHistory, this.state.hLevel,finalDate,this.props.loggedAgent.address,this.props.searchedAgent.address)
  /*.then((val)=>{
    if(val){
      this.setState({data:[...this.state.data,{x:this.state.date,y:this.state.hLevel}]},()=>{
      })
    }
  })*/
  .then((bool)=>{    
    if(!bool){
      this.setState({addHaemoglobinRecordLoader:false})
    }else{
      this.watchEvents();
    } 
  })
}
  })

}

  render() {

    const { classes } = this.props;

    return (

        <div className={classes.paper} >
        <Segment>
          {
            this.state.isLoading ?

            <Loader active inline />

        :

        <Grid style={{overflow: 'auto', maxHeight: window.innerHeight-50 }}>
    <Grid.Row>
      <Grid.Column width={15}>
            {
this.props.searchedAgent.uid == this.props.loggedAgent.uid ?
  this.props.loggedAgent.aType == "pt" ?
  <div>
  

   
    <Form style={{ margin: 20 }}>
      <Form.Field>
        <label>Full Name</label>
        <input disabled={true} value={this.state.name} onChange={(nm) => this.setState({ name: nm.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>Home Address</label>
        <input disabled={true} value={this.state.address} onChange={(ad) => this.setState({ address: ad.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>Phone Number</label>
        <input disabled={true} value={this.state.phone} onChange={(ph) => this.setState({ phone: ph.target.value })} />
      </Form.Field>
    </Form>
    {this.state.haemoglobinRecords.length>0?
    <div>
    <Header as="h4">Haemoglobin</Header>
    <Segment style={{height:400}}>          
    <ResponsiveContainer>
        <LineChart
          data={this.state.haemoglobinRecords}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis dataKey="x" name="Date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="y"
            name="Level"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
            </Segment>
      </div>
      :
      <div></div>
    }
      </div>
    :
    <div> You must be a patient</div>


  :
  this.state.relationship.active && this.state.relationship.access != "na"?
  <div>
    <Form style={{ margin: 20 }}>
      <Form.Field>
        <label>Full Name</label>
        <input disabled={this.props.loggedAgent.aType == "dc" && this.state.relationship.access=="fa"? false : true} value={this.state.name} onChange={(nm) => this.setState({ name: nm.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>Home Address</label>
        <input disabled={this.props.loggedAgent.aType == "dc" && this.state.relationship.access=="fa"? false : true} value={this.state.address} onChange={(ad) => this.setState({ address: ad.target.value })} />
      </Form.Field>
      <Form.Field>
        <label>Phone Number</label>
        <input disabled={this.props.loggedAgent.aType == "dc" && this.state.relationship.access=="fa"? false : true} value={this.state.phone} onChange={(ph) => this.setState({ phone: ph.target.value })} />
      </Form.Field>
      {this.props.loggedAgent.aType == "dc"  && this.state.relationship.access=="fa"?
      [<Button type='submit' primary onClick={this.setAll}>Save</Button>
      ,<Loader active={this.state.setAllLoader} inline />
      ]
      :
      <div></div>
      }
    </Form>
    <Message
                hidden={this.state.hiddenInfo}
                error
                header='Error'
                list={this.state.errorsInfo}
            />
   <div>
   {this.props.loggedAgent.aType == "lb"  && this.state.relationship.access=="fa"?
    [<Form style={{ margin: 20 }}>
    <Form.Field>
    <label>Haemoglobin Level</label>
    <Input placeholder="Haemoglobin Level" onChange={(hl)=>this.setState({ hLevel: hl.target.value })}></Input>
    <label>Date</label>
    <DatePicker selected={this.state.date} onChange={(dt)=>this.setState({ date: dt })}/>
    </Form.Field>
    <Button type='submit' primary onClick={this.onAddHaemoglobinRecord}>Add</Button>
    </Form>,
    <Loader active={this.state.addHaemoglobinRecordLoader} inline />,
    <Message
                hidden={this.state.hidden}
                error
                header='Error'
                list={this.state.errors}
            />]

    :
    <div></div>
   }               
      { this.state.data.length>0?
      <div>
      <Header as="h4">Haemoglobin</Header>
      <Segment style={{height:400,overflow: 'auto', maxWidth: 800 }} >          
        <ResponsiveContainer>
        <LineChart
          data={this.state.data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          
        >
          <XAxis dataKey="x" name="Date"/>
          <YAxis type={this.state.relationship.access == "rg"?"category":"number"} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="y"
            name="Level"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
        </ResponsiveContainer>
            </Segment>
      </div>

      :
      <div>No Data</div>
      }

    
    
    </div>

    </div>
    :
<p style={{textAlign:"center"}}> {!this.state.relationship.active?"Waiting Patient's confirmation":this.state.relationship.access=="na"?"No access to this medical history":""}</p>




}
        
</Grid.Column>
  {this.props.onClose!=null?
                <Grid.Column width={1} textAlign="right">
                <Icon onClick={this.props.onClose} style={{right:2, margin:0}}  name="close"></Icon>
              </Grid.Column>
              :
              <div></div>
              }
  </Grid.Row>
  </Grid>
          }
            
          </Segment>
        </div>

    )
  }
}

const styles = theme => ({
  paper: {
    margin: 'auto',
    marginTop: 30,
    width: theme.spacing.unit * 80,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    boxShadow: theme.shadows[5],
    outline: 'none',
  }
});

MedHistory.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedHistory);
