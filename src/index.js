import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Login from './Login';
import GameOver from './GameOver';

import registerServiceWorker from './registerServiceWorker';
import './index.css';

class Main extends React.Component {

  constructor(){
    super();
    this.state = {
      userActive: true,
      gameOver: false,
      userName: 'sudhir'
    }
  }

  setSession = (name)=>{
    this.setState({userName: name, userActive: true})
  };

  clearSession = () =>{
    this.setState({userName: '', userActive: false})
  };

  render() {

    if(!this.state.userActive){
      return <Login setSession={this.setSession}/>
    }
    else if (this.state.gameOver){
      return <GameOver clearSession={this.clearSession} toggleGame={()=> this.setState({gameOver: !this.state.gameOver})}/>
    }
    else {
      return <App userName={this.state.userName}/>
    }
  }
}

ReactDOM.render(<Main/>, document.getElementById('root'));

registerServiceWorker();
