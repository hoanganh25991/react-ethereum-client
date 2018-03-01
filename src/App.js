import './App.css';
import moment from "moment"
import logo from './logo.svg';
import React, { Component } from 'react';
import FD_NewPolicyJson from "./built-contracts/FlightDelayNewPolicy.json"

const _ = console.log
const web3 = window.web3;
const eth = web3.eth;
const acc1TotalEth = 10;

class App extends Component {
  constructor(props){
    super(props);
    const {abi} = FD_NewPolicyJson;
    const FD_NewPolicyAbi = window.web3.eth.contract(abi);
    const FD_NewPolicy = FD_NewPolicyAbi.at("0x29f70a7278dc2dfdce8767cf8302f22fea4191dc");

    this.watchNewPolicyEvent(FD_NewPolicy);

    this.state = {
      FD_NewPolicy,
      transactionHash: "",
      address: "",
    }
    // this.state.event = this.state.FD_NewPolicy.ExperimentComplete();
  }

  watchNewPolicyEvent = FD_NewPolicy => {
    // const newPolicyEvent = FD_NewPolicy.LogPolicyDeclined({fromBlock: 0, toBlock: 'latest'});
    // newPolicyEvent.watch((err, result) => {
    //   if(err) return _("[LogPolicyDeclined][ERR]", err)
    //   _("[LogPolicyDeclined]", result)
    // });

    const events = FD_NewPolicy.allEvents({fromBlock: 0, toBlock: 'latest'});
    events.watch((err, result) => {
      if(err) return _("[LogEvent][ERR]", err)
      _("[LogEvent]", result)
    })
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
    const {FD_NewPolicy} = this.state;
    _("[FD_NewPolicy]", FD_NewPolicy);

    const now = moment();
    const nowInTimestamp = +now.format("X")
    const departureTime = nowInTimestamp + 100;
    const arrivalTime = departureTime + 90;

    _("[createNewPolicy][departureTime, arrivalTime]", departureTime, arrivalTime);

    FD_NewPolicy.newPolicy(
      "HA/22",
      "/dep/2018/03/01",
      departureTime,
      arrivalTime,
      0,
      "12345",
      {
        gas: 4476768,
        from: web3.eth.accounts[0],
        value: web3.toWei(0.06, 'ether')
      }
    , (err, result) => {
      if(err) return _(`${err}`)
      return _(result)
    })
  }

  storeTransactionHash = e => {
    const transactionHash = e.target.value;
    this.setState({transactionHash})
  }

  checkHash = () => {
    const {transactionHash} = this.state;

    eth.getTransactionReceipt(transactionHash, (err, result) => {
      if(err) return _("[getTransactionReceipt][ERR]", err)
      return _("[getTransactionReceipt][result]", result)
    })

    eth.getTransaction(transactionHash, (err, result) => {
      if(err) return _("[getTransaction][ERR]", err)
      return _("[getTransaction][result]", result)
    })
  }

  storeAddress = e => {
    const address = e.target.value;
    this.setState({address})
  }

  checkBalance = () => {
    const {address} = this.state;

    eth.getBalance(address, (err, result) => {
      if(err) return _("[getBalance][ERR]", result)
      const ether = web3.fromWei(result, "ether").toString();
      _("[getBalance][result][ether]", result, ether)

      const spend = acc1TotalEth - (+ether);
      return _("[getBalance][spend]", spend)
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
        <div>
          <button onClick={this.toUnixTime}>To Unix Time</button>
        </div>
        <div>
          <button onClick={this.createNewPolicy}>Create New Policy</button>
        </div>
        <div>
          <input
            type={"text"}
            placeholder={"Transaction Hash"}
            value={this.state.transactionHash}
            onChange={this.storeTransactionHash}
          />
          <button onClick={this.checkHash}>Check Hash</button>
        </div>
        <div>
          <input
            type={"text"}
            placeholder={"Address"}
            value={this.state.address}
            onChange={this.storeAddress}
          />
          <button onClick={this.checkBalance}>Check Balance</button>
        </div>
      </div>
    );
  }
}

export default App;