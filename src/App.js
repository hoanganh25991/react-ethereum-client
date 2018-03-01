import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FD_NewPolicyJson from "./built-contracts/FlightDelayNewPolicy.json"

const _ = console.log

class App extends Component {
  constructor(props){
    super(props);
    const {abi} = FD_NewPolicyJson;
    const FD_NewPolicy =  window.web3.eth.contract(abi);

    this.state = {
      FD_NewPolicy: FD_NewPolicy.at("0x29f70a7278dc2dfdce8767cf8302f22fea4191dc"),
    }
    // this.state.event = this.state.FD_NewPolicy.ExperimentComplete();
  }

  // querySecret = () => {
  //   const {FD_NewPolicy} = this.state
  //   FD_NewPolicy.getSecret((err, secret) => {
  //     if(err) console.error('An error occured:::', err)
  //     console.log("This is our contract's secret:::", secret);
  //   })
  // }
  //
  // queryContractState = () => {
  //   const {FD_NewPolicy} = this.state;
  //   FD_NewPolicy.getState((err, state) => {
  //     if(err) console.error('An error occured:::', err)
  //     console.log("This is our contract's state:::", state)
  //   })
  // }
  //
  // handleContractStateSubmit = (event) => {
  //   event.preventDefault();
  //
  //   const {FD_NewPolicy, contractState: newState} = this.state;
  //   FD_NewPolicy.setState(newState, {
  //       gas: 300000,
  //       from: window.web3.eth.accounts[0],
  //       value: window.web3.toWei(0.01, 'ether')
  //     }, (err, result) => {
  //       if(err) console.error('[setState][ERR]', err)
  //       console.log('Smart contract state is changing', result)
  //     })
  // }
  //
  // queryConditionalResult = () => {
  //   const {FD_NewPolicy} = this.state;
  //   FD_NewPolicy.pseudoRandomResult((err, result) => {
  //     if(err) console.error("[pseudoRandomResult][ERR]", err)
  //     console.log("This is our contract's pseudoRandomResult:::", result)
  //   })
  // }
  //
  // activateExperiment = () => {
  //   const {FD_NewPolicy} = this.state
  //   FD_NewPolicy.setExperimentInMotion({
  //     gas: 300000,
  //     from: window.web3.eth.accounts[0],
  //     value: window.web3.toWei(0.01, 'ether')
  //   }, (err, result) => {
  //     if (err) console.error("[setExperimentInMotion][ERR]", err)
  //     console.log("[activateExperiment]", result)
  //   })
  // }

  toUnixTime = () => {
    const web3 = window.web3;
    const acc1 = web3.eth.accounts[0];
    const {FD_NewPolicy} = this.state;
    _("[FD_NewPolicy]", FD_NewPolicy);

    FD_NewPolicy.toUnixtime("/dep/2018/02/22", {
      gas: 600000,
      from: acc1,
      // value: web3.toWei(1, "ether")
    }, (err, result) => {
      if(err) return _(`${err}`)
      return _(`[i.toUnixtime][result][rawStr]`, result, result.toString());
    })
  }

  createNewPolicy = () => {
    const web3 = window.web3;

    const {FD_NewPolicy} = this.state;

    _("[FD_NewPolicy]", FD_NewPolicy);

    FD_NewPolicy.newPolicy(
      "HA/20",
      "/dep/2018/03/01",
      1519872471,
      1519872971,
      0,
      "react-client",
      {
        gas: 600000,
        from: web3.eth.accounts[0],
        value: web3.toWei(0.01, 'ether')
      }
    , (err, result) => {
      if(err) return _(`${err}`)
      return _(result)
    })
  }

  render() {
    // const {event} = this.state
    //
    // event.watch((err, result) => {
    //   if(err) console.error("[experimentEvent][ERR]", err)
    //   console.log("[experimentEvent]", result);
    // })

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">React & Ethereum Clients</h1>
        </header>
        <br/>
        <br/>
        {/*<button onClick={this.querySecret}>Query Smart Contract's Secret</button>*/}
        {/*<br/>*/}
        {/*<br/>*/}
        {/*<button onClick={this.queryContractState}>Query Smart Contract's State</button>*/}
        {/*<br/>*/}
        {/*<br/>*/}
        {/*<form onSubmit={this.handleContractStateSubmit}>*/}
          {/*<input*/}
            {/*type={"text"}*/}
            {/*name={"state-change"}*/}
            {/*placeholder={"Enter new state..."}*/}
            {/*value={this.state.contractState}*/}
            {/*onChange={e => this.setState({contractState: e.target.value})}*/}
          {/*/>*/}
          {/*<button type={"submit"}>Submit</button>*/}
        {/*</form>*/}
        {/*<br/>*/}
        {/*<button onClick={this.queryConditionalResult}>Query Smart Contract Conditional Result</button>*/}
        {/*<br/>*/}
        {/*<br/>*/}
        {/*<button onClick={this.activateExperiment}>Start Experiment On Smart Contract</button>*/}
        <button onClick={this.toUnixTime}>To Unix Time</button>
        <button onClick={this.createNewPolicy}>Create New Policy</button>
      </div>
    );
  }
}

export default App;