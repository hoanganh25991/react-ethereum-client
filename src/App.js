import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    const MyContract =  window.web3.eth.contract([
      {
        "constant": false,
        "inputs": [],
        "name": "setExperimentInMotion",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getState",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "kill",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "pseudoRandomResult",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getSecret",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newState",
            "type": "string"
          }
        ],
        "name": "setState",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "you_awesome",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "result",
            "type": "bool"
          }
        ],
        "name": "ExperimentComplete",
        "type": "event"
      }
    ]);
    this.state = {
      ContractInstance: MyContract.at("0x30287c240d2fc78e70d6f3884698f9e07e45262f"),
      contractState: ''
    }
  }

  querySecret = () => {
    const {ContractInstance} = this.state
    ContractInstance.getSecret((err, secret) => {
      if(err) console.error('An error occured:::', err)
      console.log("This is our contract's secret:::", secret);
    })
  }

  queryContractState = () => {
    const {ContractInstance} = this.state;
    ContractInstance.getState((err, state) => {
      if(err) console.error('An error occured:::', err)
      console.log("This is our contract's state:::", state)
    })
  }

  handleContractStateSubmit = (event) => {
    event.preventDefault();

    const {ContractInstance, contractState: newState} = this.state;
    ContractInstance.setState(newState, {
        gas: 300000,
        from: window.web3.eth.accounts[0],
        value: window.web3.toWei(0.01, 'ether')
      }, (err, result) => {
        if(err) console.error('[setState][ERR]', err)
        console.log('Smart contract state is changing', result)
      })
  }

  queryConditionalResult = () => {
    const {ContractInstance} = this.state;
    ContractInstance.pseudoRandomResult((err, result) => {
      if(err) console.error("[pseudoRandomResult][ERR]", err)
      console.log("This is our contract's pseudoRandomResult:::", result)
    })
  }

  activateExperiment = () => {
    const {ContractInstance} = this.state
    ContractInstance.setExperimentInMotion({
      gas: 300000,
      from: window.web3.eth.accounts[0],
      value: window.web3.toWei(0.01, 'ether')
    }, (err, result) => {
      if (err) console.error("[setExperimentInMotion][ERR]", err)
      console.log("[activateExperiment]", result)
    })
  }

  render() {
    const {ContractInstance} = this.state
    const experimentEvent = ContractInstance.ExperimentComplete();
    experimentEvent && experimentEvent.watch((err, event) => {
      if(err) console.error("[experimentEvent][ERR]", err)
      console.log("[experimentEvent]", event);
    })

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">React & Ethereum Clients</h1>
        </header>
        <br/>
        <br/>
        <button onClick={this.querySecret}>Query Smart Contract's Secret</button>
        <br/>
        <br/>
        <button onClick={this.queryContractState}>Query Smart Contract's State</button>
        <br/>
        <br/>
        <form onSubmit={this.handleContractStateSubmit}>
          <input
            type={"text"}
            name={"state-change"}
            placeholder={"Enter new state..."}
            value={this.state.contractState}
            onChange={e => this.setState({contractState: e.target.value})}
          />
          <button type={"submit"}>Submit</button>
        </form>
        {/*<br/>*/}
        <br/>
        <button onClick={this.queryConditionalResult}>Query Smart Contract Conditional Result</button>
        <br/>
        <br/>
        <button onClick={this.activateExperiment}>Start Experiment On Smart Contract</button>
      </div>
    );
  }
}

export default App;
