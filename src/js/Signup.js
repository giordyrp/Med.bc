import React from 'react'
import { Button, Form, Dropdown, Header, Image, Loader, Message } from 'semantic-ui-react'


const options = [
  { key: 'pt', text: 'Patient', value: 'pt' },
  { key: 'dc', text: 'Doctor', value: 'dc' },
  { key: 'lb', text: 'Laboratory', value: 'lb' },
  { key: 'ot', text: 'Other', value: 'ot' },
]

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      uid: "",
      did: "",
      type: "",
      loader: false,
      hidden: true,
      errors: []
    }
  }

  validateName() {
    return new Promise((resolve, reject) => {
      this.setState({ name: this.state.name.trim() }, () => {
        let reg = /^([A-Za-z ]{6,40})$/;
        if (reg.test(this.state.name) === false) {
          this.setState({ errors: [...this.state.errors, "Invalid name"] })
          resolve(false)
        }
        else {
          resolve(true)
        }
      })
    })
  }

  validateUsername() {
    return new Promise((resolve, reject) => {
      this.setState({ uid: this.state.uid.trim() }, () => {
        let reg = /^([A-Za-z0-9]{3,40})$/;
        if (reg.test(this.state.uid) === false) {
          this.setState({ errors: [...this.state.errors, "Invalid username"] })
          resolve(false)
        }
        else {
          resolve(true)
        }
      })
    })
  }
  validateDId() {
    return new Promise((resolve, reject) => {
      this.setState({ did: this.state.did.trim() }, () => {
        let reg = /^([0-9]{7,10})$/;
        if (reg.test(this.state.did) === false) {

          this.setState({ errors: [...this.state.errors, "Invalid ID Number"] })
          resolve(false);
        }
        else {
          resolve(true);
        }
      });
    })
  }

  validate() {
    return new Promise((res, rej) => {
      this.setState({ hidden: true, errors: [] })
      this.validateName().then((bool1) => {
        this.validateUsername().then((bool2) => {
          this.validateDId().then((bool3) => {
            if (this.state.type == "") {
              this.setState({ errors: [...this.state.errors, "Invalid User Type"] })
            }
            if (!bool1 || !bool2 || !bool3 || this.state.type == "") {
              this.setState({ hidden: false })
              console.log("false");
              res(false)
            } else {
              this.setState({ hidden: true })
              console.log("true");
              res(true)
            }

          });

        });

      });
    })
  }



  onChangeType = (e, { value }) => {
    this.setState({ type: value })
  }

  registerAgent = () => {
    this.validate().then((bool) => {
      if (bool) {
        this.setState({ loader: true });
        this.props.platformInstance.registerAgent(this.state.name, this.state.uid, this.state.did, this.state.type, { from: this.props.account })
          .catch(() => {
            this.setState({ loader: false });
          });
      }
    })
  }

  render() {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, backgroundColor: '#42a5f5' }}>
          <div style={{ position: 'absolute', left: 50, top: 50 }}>
            <Image src='../images/logoOnBlue.png' size="small" centered></Image>
            <Header as='h3' textAlign='center' style={{ margin: 0, color: 'white' }}>
              A medical Blockchain for you!
            </Header>
          </div>

          <Image src='../images/signup.png' style={{ position: 'absolute', bottom: 0 }}></Image>
        </div>
        <div style={{ width: 300, padding: 20, paddingTop: 50 }}>
          <Header as='h2' color='blue' textAlign='center'>
            Create account
        </Header>
          <Form >
            <Form.Field>
              <label>Full Name</label>
              <input onChange={(nm) => this.setState({ name: nm.target.value })} />
            </Form.Field>
            <Form.Field>
              <label>Username</label>
              <input onChange={(nm) => this.setState({ uid: nm.target.value })} />
            </Form.Field>
            <Form.Field>
              <label>ID Number</label>
              <input onChange={(cd) => this.setState({ did: cd.target.value })} />
            </Form.Field>
            <Dropdown
              placeholder='User Type'
              fluid
              selection
              options={options}
              onChange={this.onChangeType}
            />
            <Button type='submit' size='large' primary style={{ marginTop: 15, width: "100%" }} onClick={this.registerAgent}>Sign Up</Button>
          </Form>
          <Loader active={this.state.loader} inline />
          <Message
            hidden={this.state.hidden}
            error
            header='Error'
            list={this.state.errors}
          />
        </div>
      </div>
    )
  }

}
export default Signup;