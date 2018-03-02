import './style.css';
import moment from "moment"
import logo from './logo.svg';
import { style as s } from "./style"
import Paper from "material-ui/Paper"
import MenuItem from 'material-ui/MenuItem';
import TextField from "material-ui/TextField"
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import RaisedButton from "material-ui/RaisedButton"
import React, { Component, Fragment, PureComponent } from 'react';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import FD_NewPolicyJson from "./../../built-contracts/FlightDelayNewPolicy.json"
import {getScheduleByRoute, getCarrierFlightNumberInfo} from "./../../flightstats"
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import AssignMent from "material-ui/svg-icons/action/assignment"

const _ = console.log
const web3 = window.web3;
const eth = web3.eth;
const acc1TotalEth = 10;
const acc1 = web3.eth.accounts[0];

const demoAirports = [
  {
    name: "AKL - Auckland, New Zealand Auckland International Airport",
    code: "AKL",
  },
  {
    name: "AMS - Amsterdam, Netherlands Schiphol",
    code: "AMS",
  },
  {
    name: "ATH - Athens, Greece - Venizelos",
    code: "ATH",
  },
  {
    name: "SIN - Singapore, Singapore Changi International Airport",
    code: "SIN",
  },
  {
    name: "HEL - Helsinki, Finland Helsinki",
    code: "HEL",
  },
]

const selectAirports = demoAirports.map(airport => {
  const {name, code} = airport;
  return <MenuItem value={code} key={code} primaryText={name} />
})

export default class App extends Component {
  constructor(props){
    super(props);
    const {abi} = FD_NewPolicyJson;
    const FD_NewPolicyAbi = window.web3.eth.contract(abi);
    const FD_NewPolicy = FD_NewPolicyAbi.at("0x29f70a7278dc2dfdce8767cf8302f22fea4191dc");

    // this.watchNewPolicyEvent(FD_NewPolicy);
    // this.watchPolicyEvent(FD_NewPolicy);

    this.state = {
      // New Policy
      FD_NewPolicy,
      transactionHash: "",
      address: "",
      block: "",

      // Policy Params
      fullName: "",
      email: "",
      departureAirport: "",
      arrivalAirport: "",
      departureDate: "",
      carrierFlightNumber: "",
      availableFlights: [],
      premium: "",

      // Policies
      policies: [],
    }
  }

  watchNewPolicyEvent = contract => {
    // const newPolicyEvent = FD_NewPolicy.LogPolicyDeclined({fromBlock: 0, toBlock: 'latest'});
    // newPolicyEvent.watch((err, result) => {
    //   if(err) return _("[LogPolicyDeclined][ERR]", err)
    //   _("[LogPolicyDeclined]", result)
    // });

    const events = contract.allEvents({fromBlock: 0, toBlock: 'latest'});
    events.watch((err, result) => {
      if(err) return _("[LogEvent][ERR]", err)
      _("[LogEvent]", result)
    })
  }

  watchPolicyEvent = contract => {
    const events = contract.LogPolicyApplied({fromBlock: 0, toBlock: 'latest'});
    events.watch((err, result) => {
      if(err) return _("[LogPolicyApplied][ERR]", err)
      _("[LogPolicyApplied]", result)
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

  createDefaultPolicy = () => {
    const {FD_NewPolicy} = this.state;
    _("[FD_NewPolicy]", FD_NewPolicy);

    const now = moment();
    const nowInTimestamp = +now.format("X")

    const carrierFlightNumber = "HA/22"
    const departureDate = `/dep/${now.format("YYYY/MM/DD")}`
    const departureTime = nowInTimestamp + 100;
    const arrivalTime = departureTime + 90;

    const currencyETH = 0
    const customerId = "react-client"
    const premium = 0.8

    _("[createDefaultPolicy][carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId]", carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId);

    FD_NewPolicy.newPolicy(carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId, {
      gas: 4476768,
      from: acc1,
      value: web3.toWei(premium, 'ether')
    }, (err, result) => {
      if(err) return _(`${err}`)
      return _(result)
    })
  }

  storeTransactionHash = e => {
    const transactionHash = e.target.value;
    this.setState({transactionHash})
  }

  storeBlock = e => {
    const block = e.target.value;
    this.setState({block})
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

  storeDepartureDate = (e, value) => {
    const departureDate = value;
    this.setState({departureDate}, () => {
      this.getAvailableFlights()
    })

  }

  storeDepartureAirport = (e, index, value) => {
    const departureAirport = value;
    this.setState({departureAirport}, () => {
      this.getAvailableFlights()
    });
  }

  storeArrivalAirport = (e, index, value) => {
    const arrivalAirport = value;
    this.setState({arrivalAirport}, () => {
      this.getAvailableFlights()
    })
  }

  storeCarrierFlightNumber = (e, index, value) => {
    const carrierFlightNumber = value;
    this.setState({carrierFlightNumber})
  }

  getAvailableFlights = () => {
    const {departureAirport, arrivalAirport, departureDate} = this.state;
    getScheduleByRoute(departureDate, departureAirport, arrivalAirport, this.updateAvailableFlights)
  }

  updateAvailableFlights = flights => {
    this.setState({availableFlights: flights})
  }

  createNewPolicy = () => {
    const { carrierFlightNumber, premium } = this.state

    const {FD_NewPolicy} = this.state;
    _("[FD_NewPolicy]", FD_NewPolicy);

    const currencyETH = 0;
    const customerId = "react-client"
    const {departureDate, departureTime, arrivalTime} = getCarrierFlightNumberInfo(carrierFlightNumber)

    _("[createDefaultPolicy][carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId]", carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId);

    FD_NewPolicy.newPolicy(carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId, {
      gas: 4476768,
      from: acc1,
      value: web3.toWei(premium, 'ether')
    }, (err, result) => {
      if(err) return _(`${err}`)
      return _(result)
    })
  }

  storeFullName = (e, value) => {
    const fullName = value
    this.setState({fullName})
  }

  storeEmail = (e, value) => {
    const email = value
   this.setState({email})
  }

  storePremium = (e, value) => {
    const premium = value
    this.setState({premium})
  }
  
  readNewPolicyAllEvents = () => {
    const {FD_NewPolicy} = this.state;

    const events = FD_NewPolicy.allEvents({fromBlock: 0, toBlock: "latest"})
    events.get((err, result) => {
      if(err) return _("[allEvents]", err)
      _("[allEvents]", result)
    })
  }

  readNewPolicyEventAt = () => {
    const {FD_NewPolicy, block} = this.state;

    const events = FD_NewPolicy.LogPolicyApplied({fromBlock: block, toBlock: block})
    events.get((err, result) => {
      if(err) return _("[LogPolicyApplied]", err)
      _("[LogPolicyApplied]", result)
    })
  }


  render() {
    const {departureAirport, arrivalAirport, carrierFlightNumber, availableFlights, policies} = this.state;

    return (
      <MuiThemeProvider>
        <div>
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">React & Ethereum Clients</h1>
            </header>
          </div>
          <div style={s.rootDiv}>
            {/* New Policy */}
            <Paper zDepth={1} style={s.newPolicyRoot}>
              <div style={s.newPolicyTitle}>Create New Policy</div>
              <div style={s.policyParamsDiv}>
                <TextField
                  floatingLabelText={"Full Name"}
                  value={this.fullName}
                  onChange={this.storeFullName}
                />
                <TextField
                  floatingLabelText={"Email"}
                  value={this.email}
                  onChange={this.storeEmail}
                />
                <SelectField
                  value={departureAirport}
                  onChange={this.storeDepartureAirport}
                  floatingLabelText={"From"}
                  maxHeight={s.selectDiv.height}
                >
                  {selectAirports}
                </SelectField>
                <SelectField
                  value={arrivalAirport}
                  onChange={this.storeArrivalAirport}
                  floatingLabelText={"To"}
                  maxHeight={s.selectDiv.height}
                >
                  {selectAirports}
                </SelectField>
                <DatePicker
                  floatingLabelText="Departure Date"
                  onChange={this.storeDepartureDate}
                />
                <SelectField
                  value={carrierFlightNumber}
                  onChange={this.storeCarrierFlightNumber}
                  floatingLabelText={"Carrier Flight Number"}
                  maxHeight={s.selectDiv.height}
                >
                  {availableFlights.map(flight => {
                    const {name, code} = flight;
                    return <MenuItem value={code} key={code} primaryText={name} />
                  })}
                </SelectField>
                <TextField
                  floatingLabelText={"Premium"}
                  value={this.premium}
                  onChange={this.storePremium}
                />
              </div>
              <div style={s.applyBtnDiv}>
                <div style={s.applySpaceDiv}/>
                <RaisedButton
                  label={"Apply"}
                  primary={true}
                  onClick={this.createNewPolicy} />
              </div>
            </Paper>
            {/* List Policy */}
            <Paper zDepth={1} style={s.listPolicyRoot}>
              <div style={s.listPolicyTitle}>Policy List</div>
              <List>
                {policies.map(policy => {

                  const policyInfo = `Id: ${policy.id}`
                  return <ListItem primaryText={"Sent mail"} leftIcon={<AssignMent />} />
                })}
              </List>
            </Paper>
          </div>

          {/* OLD CODE */}
          <div>
            <div style={s.oldDiv}>
              <button onClick={this.toUnixTime}>To Unix Time</button>
            </div>
            <div style={s.oldDiv}>
              <button onClick={this.createDefaultPolicy}>Create Default Policy</button>
            </div>
            <div style={s.oldDiv}>
              <input
                type={"text"}
                placeholder={"Transaction Hash"}
                value={this.state.transactionHash}
                onChange={this.storeTransactionHash}
              />
              <button onClick={this.checkHash}>Check Hash</button>
            </div>
            <div style={s.oldDiv}>
              <input
                type={"text"}
                placeholder={"Address"}
                value={this.state.address}
                onChange={this.storeAddress}
              />
              <button onClick={this.checkBalance}>Check Balance</button>
            </div>
            <div style={s.oldDiv}>
              <input
                type={"text"}
                placeholder={"Block Number"}
                value={this.state.block}
                onChange={this.storeBlock}
              />
              <button onClick={this.readNewPolicyEventAt}>Read NewPolicy Event</button>
            </div>
            <div style={s.oldDiv}>
              <button onClick={this.readNewPolicyAllEvents}>Read NewPolicy All Events</button>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}