import './style.css';
import moment from "moment"
import logo from './logo.svg';
import { style as s } from "./style"
import TextField from "material-ui/TextField"
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from "material-ui/RaisedButton"
import Paper from "material-ui/Paper"
import React, { Component, Fragment, PureComponent } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import FD_NewPolicyJson from "./../../built-contracts/FlightDelayNewPolicy.json"

const _ = console.log
const web3 = window.web3;
const eth = web3.eth;
const acc1TotalEth = 10;

export default class App extends Component {
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

  toUnixTime = () => {
    const acc1 = web3.eth.accounts[0];
    const {FD_NewPolicy} = this.state;
    _("[FD_NewPolicy]", FD_NewPolicy);

    FD_NewPolicy.toUnixtime("/dep/2018/02/22", {
      gas: 600000,
      from: acc1,
      // value: web3.toWei(1, "ether")
      // value option > ERR
      // Why? Bcs this function not payable
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
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">React & Ethereum Clients</h1>
          </header>
          <div style={s.rootDiv}>
            <Paper zDepth={1} style={s.padding}>
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
                <RaisedButton
                  label={"Check Balance"}
                  primary={true}
                  onClick={this.checkBalance} />
              </div>
            </Paper>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}