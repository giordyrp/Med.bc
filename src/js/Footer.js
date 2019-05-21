import React, { Component } from 'react'
import PropTypes from "prop-types";
// @material-ui/core components
import { Grid, Header, Divider, Image } from 'semantic-ui-react'

class Footer extends Component {
  render() {
    return (
      <div>
        <Divider style={{ margin: 0, padding: '10px 0px 0px 20px' }}></Divider>
        <footer style={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}>
          <Grid columns={3}>
            <Grid.Row>
              <Grid.Column width={11}>
                <div style={{ paddingLeft: 20 }}>
                  <Header as='h3'>Med.bc</Header>
                  <p>A medical Blockchain for you!</p>
                </div>

              </Grid.Column>
              <Grid.Column width={2}>
                <p style={{ justifyContent: 'right' }}> Developed by</p>
              </Grid.Column>
              <Grid.Column width={3}>
                <Image src='../images/baqchain3.png' size='small' centered />
                <Divider style={{ margin: 0, padding: 0, marginTop: 3 }}></Divider>
                <p style={{ margin: 0, padding: 0, marginLeft: 5, textAlign: 'center' }}>Giordy Romero - Luís Pérez </p>
                <p style={{ margin: 0, padding: 0, marginLeft: 5, textAlign: 'center' }}>BaqChain © 2019</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </footer>
      </div>)
  }
}

export default Footer;
