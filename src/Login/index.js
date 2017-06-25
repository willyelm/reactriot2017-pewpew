import React from 'react';

//hoc
import controlsHOC from '../common/controlsHOC';

// backand
import axios from 'axios';
import backand from '../common/Backand';

class Login extends React.Component {

  constructor(){
    super();
    this.state = {
      defaultName: 'Player 1'
    }
  }
  handleLogin = async (e)=>{

    e.preventDefault();
    //callApi({
      //name: this.refs.name.value
    //});
    let name = this.state.defaultName;
    if(name=== ""){
      alert("name is empty")
    }
    else{
      await this.connectBackand(name);
      this.setBackandEvents();
      this.props.setSession();
    }
  };

  setBackandEvents = () => {
    backand.on('items_updated', function (data) {
      console.log('items_updated');
      console.log(data);
    });
    setInterval(() => {
      axios.get('https://api.backand.com/1/function/general/game');
    }, 1000)
  };

  handleChange = (e)=>{
    this.setState({defaultName: e.target.value})
  };

  connectBackand = async (name) => {
    const ANONYMOUS_TOKEN = 'fb44c3c7-d0ca-40a6-81d1-5bd6484af3be';
    await backand.signup(`${name}`, "", `user+${new Date().getTime()}@reactriot.com`, "test123", "test123", {})
      .then(res => {
        localStorage.setItem('BACKAND_RESPONSE',JSON.stringify(res.data));
      })
      .catch(err => {
        console.log(err);
      });
    axios.defaults.headers.common['AnonymousToken'] = ANONYMOUS_TOKEN;
  };

  render() {
    return (
      <div className="login-container">
        <h1 className="title">
          Pew Pew
        </h1>
        <form onSubmit={this.handleLogin}>
          <div className="form-row">
          <input autoFocus={true} type="text" placeholder="Name" value={this.state.defaultName} onChange={this.handleChange} /></div>
          <div className="form-row"><button type="submit" className="login-btn">Play</button></div>
          <div className="form-row"><button type="button" onClick={this.props.goToControls} className="controls-btn">Controls</button></div>
        </form>
      </div>)
  }
}

export default controlsHOC(Login);
