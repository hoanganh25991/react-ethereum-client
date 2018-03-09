import "./style.css"
import moment from "moment"
import logo from "./logo.svg"
import { style as s } from "./style"
import Paper from "material-ui/Paper"
import MenuItem from "material-ui/MenuItem"
import TextField from "material-ui/TextField"
import DatePicker from "material-ui/DatePicker"
import SelectField from "material-ui/SelectField"
import RaisedButton from "material-ui/RaisedButton"
import React, { Component, Fragment, PureComponent } from "react"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import FD_NewPolicyJson from "./../../built-contracts/FlightDelayNewPolicy.json"
import { demoAirports, getScheduleByRoute, getCarrierFlightNumberInfo } from "./../../flightstats"
import { List, ListItem } from "material-ui/List"
import AssignMent from "material-ui/svg-icons/action/assignment"
import HashIds from "hashids"
import CircularProgress from "material-ui/CircularProgress"
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table"
import FD_LedgerJson from "./../../built-contracts/FlightDelayLedger.json"
import { Tabs, Tab } from "material-ui/Tabs"
import FlightTimeLine from "../FlightTimeLine"
import { callFakeStatus, callFlightStatus, callSendFund } from "../../api/sendFund"
import Dialog from "material-ui/Dialog"
import FlatButton from "material-ui/FlatButton"
import FD_DatabaseJson from "../../built-contracts/FlightDelayDatabase.json"

const _ = console.log
const web3 = window.web3
const eth = web3.eth
const acc1TotalEth = 10
const MOCK_PORT = 3456

let custom_alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const fdHash = new HashIds("", 7, custom_alphabet)

export default class App extends Component {
  constructor(props) {
    super(props)

    const l = window.location
    const mockServerUrl = `${l.protocol}//${l.hostname}:${MOCK_PORT}`

    this.state = {
      // New Policy
      transactionHash: "",
      address: "",
      block: "",
      pending: false,
      readlistPending: false,
      clock: null,
      flight: "",

      // Fund
      fundedAddress: "",
      fundedAmount: "",

      // Config
      mockServerUrl,
      newPolicyAddress: "0x09046d89cd80ef8dae2f9e6fe5702443c766020d",
      ledgerAddress: "0x7ebe9c2c498e88668f9419ec020d2107122009a6",
      dbAddress: "0x6dd43be3c9774d0efeb4fc27f84a4479b94ec665",

      // Debug
      openDebugMoreTools: false,

      // Dialog
      openCertificate: false,
      dialogData: null,

      // Fake Status
      fakeCarrier: "",
      fakeFlight: "",
      fakeDelayInMinutes: "",

      // Account Balance
      ledgerBalance: null,
      customerAddress: null,
      customerBalance: null,

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
      policies: []
    }
  }

  componentDidMount() {
    // Update Contract Instance
    const cb = this.getPoliciesFromDb
    this.updateContractInstance(cb)
    this.wait(this.getBalance)
  }

  handleOpen = () => {
    this.setState({ openCertificate: true })
  }

  handleClose = () => {
    this.setState({ openCertificate: false })
  }

  actions = [<FlatButton label="Ok" primary={true} onClick={this.handleClose} />]

  wait = cb => {
    // First run
    /* TODO Listen to web3.eth, when MetaMask inject accounst > run */
    setTimeout(cb, 1000)
  }

  updateContractInstance = (cb = null) => {
    const { newPolicyAddress, ledgerAddress, dbAddress } = this.state

    const { abi: newPolicyAbi } = FD_NewPolicyJson
    const { abi: ledgerAbi } = FD_LedgerJson
    const { abi: dbAbi } = FD_DatabaseJson

    // NewPolicy Contract
    const FD_NewPolicyAbi = web3.eth.contract(newPolicyAbi)
    const FD_NewPolicy = FD_NewPolicyAbi.at(newPolicyAddress)

    // Ledger Contract
    const FD_LedgerAbi = web3.eth.contract(ledgerAbi)
    const FD_Ledger = FD_LedgerAbi.at(ledgerAddress)

    // Database Contract
    const FD_DbAbi = web3.eth.contract(dbAbi)
    const FD_Db = FD_DbAbi.at(dbAddress)

    this.setState({ FD_NewPolicy, FD_Ledger, FD_Db }, () => {
      this.watchBalance()
      if (cb) cb()
    })
  }

  getBalance = () => {
    const acc1 = web3.eth.accounts[0]
    const customerAddress = acc1

    this.setState({ customerAddress }, () => {
      const { ledgerAddress, customerAddress } = this.state

      ledgerAddress &&
        eth.getBalance(ledgerAddress, (err, result) => {
          if (err) return
          const ledgerBalance = web3.fromWei(result, "ether").toString()
          this.setState({ ledgerBalance })
        })

      customerAddress &&
        eth.getBalance(customerAddress, (err, result) => {
          if (err) return
          const customerBalance = web3.fromWei(result, "ether").toString()
          this.setState({ customerBalance })
        })
    })
  }

  watchBalance = () => {
    const { FD_Ledger } = this.state

    FD_Ledger.LogReceiveFunds({ fromBlock: 0, toBlock: "latest" }).watch((err, result) => {
      if (err) return
      _("[watchBalance][LogReceiveFunds]", result)
      this.getBalance()
    })

    FD_Ledger.LogSendFunds({ fromBlock: 0, toBlock: "latest" }).watch((err, result) => {
      if (err) return
      _("[watchBalance][LogReceiveFunds]", result)
      this.getBalance()
    })
  }

  watchNewPolicyEvent = contract => {
    // const newPolicyEvent = FD_NewPolicy.LogPolicyDeclined({fromBlock: 0, toBlock: 'latest'});
    // newPolicyEvent.watch((err, result) => {
    //   if(err) return _("[LogPolicyDeclined][ERR]", err)
    //   _("[LogPolicyDeclined]", result)
    // });

    const events = contract.allEvents({ fromBlock: 0, toBlock: "latest" })
    events.watch((err, result) => {
      if (err) return _("[LogEvent][ERR]", err)
      _("[LogEvent]", result)
    })
  }

  watchPolicyEvent = contract => {
    const events = contract.LogPolicyApplied({ fromBlock: 0, toBlock: "latest" })
    events.watch((err, result) => {
      if (err) return _("[LogPolicyApplied][ERR]", err)
      _("[LogPolicyApplied]", result)
    })
  }

  toUnixTime = () => {
    const acc1 = web3.eth.accounts[0]
    const { FD_NewPolicy } = this.state
    _("[FD_NewPolicy]", FD_NewPolicy)

    FD_NewPolicy.toUnixtime(
      "/dep/2018/02/22",
      {
        gas: 600000,
        from: acc1
        // value: web3.toWei(1, "ether")
        // value option > ERR
        // Why? Bcs this function not payable
      },
      (err, result) => {
        if (err) return _(`${err}`)
        return _(`[i.toUnixtime][result][rawStr]`, result, result.toString())
      }
    )
  }

  createDefaultPolicy = () => {
    const { FD_NewPolicy, customerAddress } = this.state
    _("[FD_NewPolicy]", FD_NewPolicy)

    const now = moment()
    const nowInTimestamp = +now.format("X")

    const carrierFlightNumber = "HA/22"
    const departureDate = `/dep/${now.format("YYYY/MM/DD")}`
    const departureTime = nowInTimestamp + 100
    const arrivalTime = departureTime + 90

    const currencyETH = 0
    const customerId = "react-client"
    const premium = 0.8

    _(
      "[createDefaultPolicy][carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId]",
      carrierFlightNumber,
      departureDate,
      departureTime,
      arrivalTime,
      currencyETH,
      customerId
    )

    FD_NewPolicy.newPolicy(
      carrierFlightNumber,
      departureDate,
      departureTime,
      arrivalTime,
      currencyETH,
      customerId,
      {
        gas: 4476768,
        from: customerAddress,
        value: web3.toWei(premium, "ether")
      },
      (err, result) => {
        if (err) return _(`${err}`)
        return _(result)
      }
    )
  }

  storeTransactionHash = e => {
    const transactionHash = e.target.value
    this.setState({ transactionHash })
  }

  storeAddress = e => {
    const address = e.target.value
    this.setState({ address })
  }

  storeBlock = e => {
    const block = e.target.value
    this.setState({ block })
  }

  checkHash = () => {
    const { transactionHash } = this.state

    eth.getTransactionReceipt(transactionHash, (err, result) => {
      if (err) return _("[getTransactionReceipt][ERR]", err)
      return _("[getTransactionReceipt][result]", result)
    })

    eth.getTransaction(transactionHash, (err, result) => {
      if (err) return _("[getTransaction][ERR]", err)
      return _("[getTransaction][result]", result)
    })
  }

  checkBalance = () => {
    const { address } = this.state

    eth.getBalance(address, (err, result) => {
      if (err) return _("[getBalance][ERR]", result)
      const ether = web3.fromWei(result, "ether").toString()
      _("[getBalance][result][ether]", result, ether)

      const spend = acc1TotalEth - +ether
      return _("[getBalance][spend]", spend)
    })
  }

  // Select Box
  storeDepartureAirport = (e, index, value) => {
    const departureAirport = value
    this.setState({ departureAirport }, () => {
      this.getAvailableFlights()
    })
  }

  storeArrivalAirport = (e, index, value) => {
    const arrivalAirport = value
    this.setState({ arrivalAirport }, () => {
      this.getAvailableFlights()
    })
  }

  storeCarrierFlightNumber = (e, index, value) => {
    const carrierFlightNumber = value
    this.setState({ carrierFlightNumber })
  }

  // Text Field
  storeDepartureDate = (e, value) => {
    const departureDate = value
    this.setState({ departureDate }, () => {
      this.getAvailableFlights()
    })
  }

  storeFlight = (e, value) => {
    const flight = value
    this.setState({ flight })
  }

  storeFullName = (e, value) => {
    const fullName = value
    this.setState({ fullName })
  }

  storeEmail = (e, value) => {
    const email = value
    this.setState({ email })
  }

  storePremium = (e, value) => {
    const premium = value
    this.setState({ premium })
  }

  storeTextField = stateKey => (e, value) => {
    this.setState({ [stateKey]: value })
  }

  getAvailableFlights = () => {
    const { departureAirport, arrivalAirport, departureDate } = this.state
    const getCb = flights => this.setState({ availableFlights: flights })
    getScheduleByRoute(departureDate, departureAirport, arrivalAirport, getCb)
  }

  createNewPolicy = async () => {
    const { carrierFlightNumber, premium, customerAddress } = this.state

    // Ok pending load
    this.setState({ pending: true })

    const { FD_NewPolicy } = this.state
    _("[FD_NewPolicy]", FD_NewPolicy)

    const currencyETH = 0
    const customerId = "react-client"
    const { departureDate, departureTime, arrivalTime } = getCarrierFlightNumberInfo(carrierFlightNumber)
    const value = web3.toWei(premium, "ether")

    _(
      "[createNewPolicy][carrierFlightNumber, departureDate, departureTime, arrivalTime, currencyETH, customerId]",
      carrierFlightNumber,
      departureDate,
      departureTime,
      arrivalTime,
      currencyETH,
      customerId
    )

    const txHash = await new Promise((resolve, reject) => {
      FD_NewPolicy.newPolicy(
        carrierFlightNumber,
        departureDate,
        departureTime,
        arrivalTime,
        currencyETH,
        customerId,
        {
          value,
          gas: 4476768,
          from: customerAddress
        },
        (e, result) => (e ? resolve(null) : resolve(result))
      )
    })

    if (!txHash) return window.alert("Fail to send transaction")
    _("[createNewPolicy][txHash]", txHash)

    // Turn off pending
    this.setState({ pending: false })
    const { policies: curr, fullName, email } = this.state

    const draft = {
      policyId: +moment().format("X"),
      carrierFlightNumber,
      departureDate,
      departureTime,
      arrivalTime,
      fullName,
      email,
      premium
    }

    this.setState({ policies: [...curr, draft] })

    // Ok watch envent on txHash
    const event = await this.checkPolicyAppliedOrDeclineByEvent(txHash)
    if (!event) return

    const e1 = event
    const { args } = e1
    const { _policyId } = args

    const SHOULD_RETURN = true
    const policyInDB = await this.readPolicyIdFromDB(_policyId.toString(), [], SHOULD_RETURN)

    const certificate = {
      ...draft,
      policyId: _policyId.toString(),
      actualPayout: policyInDB.actualPayout
    }

    this.setState({ policies: [...curr, certificate] })

    // const event = await this.checkPolicyAppliedOrDeclineByEvent(txHash)
    // _("[]")
    // if (!event) return _("No LogPolicyApplied")
    //
    // const e1 = event
    // const { args } = e1
    // const { _policyId } = args
    // const { fullName, email } = this.state
    //
    // const certificate = {
    //   policyId: fdHash.encode(_policyId),
    //   carrierFlightNumber,
    //   departureDate,
    //   departureTime,
    //   arrivalTime,
    //   fullName,
    //   email
    // }
    //
    // _("[createNewPolicy][certificate]", certificate)
    //
    // // Update Policies
    // const { policies: curr } = this.state
    // const policies = [...curr, certificate]
    // this.setState({ policies })
  }

  checkPolicyAppliedOrDeclineByEvent = txHash => {
    return new Promise((resolve, reject) => {
      eth.getTransactionReceipt(txHash, (err, result) => {
        if (err) {
          _(err.message)
          return resolve(null)
        }

        const { blockNumber } = result
        _("[checkPolicyAppliedOrDeclineByEvent][blockNumber]", blockNumber)

        const { FD_NewPolicy } = this.state
        const events = FD_NewPolicy.LogPolicyApplied({ fromBlock: blockNumber, toBlock: blockNumber })

        events.watch((err, result) => {
          if (err) {
            _(err.message)
            return resolve(null)
          }
          _("[checkPolicyAppliedOrDeclineByEvent][LogPolicyApplied][event]", result)
          resolve(result)
        })
      })
    })
  }

  readNewPolicyAllEvents = () => {
    const { FD_NewPolicy } = this.state

    const events = FD_NewPolicy.allEvents({ fromBlock: 0, toBlock: "latest" })
    events.get((err, result) => {
      if (err) return _("[allEvents]", err)
      _("[allEvents]", result)
    })
  }

  checkFlight = () => {
    const { flight } = this.state
  }

  readNewPolicyEventAt = () => {
    const { FD_NewPolicy, block } = this.state

    const events = FD_NewPolicy.LogPolicyApplied({ fromBlock: block, toBlock: block })
    events.get((err, result) => {
      if (err) return _("[LogPolicyApplied]", err)
      _("[LogPolicyApplied]", result)
    })
  }

  sendFund = async () => {
    const { mockServerUrl, fundedAddress, fundedAmount } = this.state
    const resData = await callSendFund(mockServerUrl, fundedAddress, fundedAmount)
    if (!resData || !resData.txHash) return window.alert("Send fail")

    const { txHash } = resData
    window.alert(`Transaction Hash: ${txHash}`)

    this.getBalance()
  }

  updateContact = () => {
    const cb = () => {
      window.alert("Update success")
      this.getBalance()
    }
    this.updateContractInstance(cb)
  }

  readAccountBalance = () => {
    this.getBalance()
  }

  fakeStatus = async () => {
    const { mockServerUrl, fakeCarrier, fakeFlight, fakeDelayInMinutes } = this.state
    const resData = await callFakeStatus(mockServerUrl, fakeCarrier, fakeFlight, fakeDelayInMinutes)
    if (!resData || !resData.flightStatuses) return window.alert("Fake fail")

    window.alert(`Update success`)
  }

  showPolicyDelayColor = policyId => async () => {
    _("[showPolicyDelayColor]")
    const { policies } = this.state
    const policy = policies.filter(p => p.policyId === policyId)[0]
    if (!policy) return window.alert(`Can find back policy: ${policyId}`)

    const { carrierFlightNumber } = policy
    const { mockServerUrl } = this.state
    const resData = await callFlightStatus(mockServerUrl, carrierFlightNumber)

    if (!resData || !resData.flightStatuses) return

    const { flightStatuses } = resData

    try {
      const actualDelayInMinutes = flightStatuses[0]["delays"]["arrivalGateDelayMinutes"]
      const newPolicy = { ...policy, actualDelayInMinutes }
      const newPolicies = policies.reduce((carry, policy) => {
        const isSame = policy.policyId === newPolicy.policyId
        const pushed = isSame ? newPolicy : policy
        carry.push(pushed)
        return carry
      }, [])

      console.log("[newPolicies]", newPolicies)

      this.setState({ policies: newPolicies })
    } catch (err) {}
  }

  openPolicyDetailDialog = policy => () => {
    this.setState({ dialogData: { policy } }, this.handleOpen)
  }

  computeCompensate = (delayInMinutes, premium) => {
    if (!delayInMinutes) return 0

    const level = Math.floor(+delayInMinutes / 15)
    const WEIGHT_PATTERN = {
      0: 0,
      1: 10,
      2: 20,
      3: 30,
      4: 50,
      5: 50
    }
    const compensate = (premium * WEIGHT_PATTERN[level] * 10000 / 22560).toFixed(2)
    return Math.min(compensate, 1.1).toFixed(2)
  }

  renderDialogContent = () => {
    const { dialogData } = this.state
    const policy = dialogData && dialogData.policy
    _("[renderDialogContent][policy]", policy)
    if (!policy) return null

    const {
      policyId,
      fullName,
      carrierFlightNumber,
      departureDate,
      departureTime,
      arrivalTime,
      actualDelayInMinutes = "",
      premium,
      actualPayout = ""
    } = policy

    const departureTimeTitle = isNaN(departureTime) ? departureTime : moment(departureTime, "X").format("HH:mm")
    const compensate = this.computeCompensate(actualDelayInMinutes, premium)

    return (
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>Key</TableHeaderColumn>
              <TableHeaderColumn>Value</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableRowColumn>Policy Id</TableRowColumn>
              <TableRowColumn>{policyId}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Full Name</TableRowColumn>
              <TableRowColumn>{fullName || ""}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Carrier Flight Number</TableRowColumn>
              <TableRowColumn>{carrierFlightNumber}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Departure Date</TableRowColumn>
              <TableRowColumn>{departureDate}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Departure Time</TableRowColumn>
              <TableRowColumn>{departureTimeTitle}</TableRowColumn>
            </TableRow>
            {/*<TableRow>*/}
            {/*<TableRowColumn>Departure Time</TableRowColumn>*/}
            {/*<TableRowColumn>{moment(departureTime, "X").format("HH:mm:ss")}</TableRowColumn>*/}
            {/*</TableRow>*/}
            {/*<TableRow>*/}
            {/*<TableRowColumn>Arrival Time</TableRowColumn>*/}
            {/*<TableRowColumn>{moment(arrivalTime, "X").format("HH:mm:ss")}</TableRowColumn>*/}
            {/*</TableRow>*/}
            <TableRow>
              <TableRowColumn>Delay In Minutes</TableRowColumn>
              <TableRowColumn>{actualDelayInMinutes} minutes</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Premium</TableRowColumn>
              <TableRowColumn>{premium}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Compensation</TableRowColumn>
              <TableRowColumn>{compensate}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>Actual Payout</TableRowColumn>
              <TableRowColumn>{actualPayout}</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  policyFormatterLong = (_policyId, _policy, _risk) => {
    const statusToString = status => {
      const sts = {
        0: "Applied",
        1: "Accepted",
        2: "Revoked",
        3: "Paid Out",
        4: "Expired",
        5: "Declined"
      }
      return sts[status]
    }

    const currencyToString = currency => {
      const cur = {
        0: "ETH",
        1: "EUR",
        2: "USD",
        3: "GBP"
      }
      return cur[currency]
    }

    const frontendP = {
      policyId: _policyId.toString(),
      customer: _policy[0],
      state: statusToString(_policy[6].toNumber()),
      premium: web3.fromWei(_policy[1]).toFixed(2),
      riskId: _policy[2],
      weight: _policy[3].toFixed(0),
      calculatedPayout: web3.fromWei(_policy[4]).toFixed(2),
      actualPayout: web3.fromWei(_policy[5]).toFixed(2),
      departureTime: new Date(_policy[7].toNumber() * 1000).toLocaleString("de"),
      stateMessage: Buffer.from(_policy[8].slice(2), "hex")
        .toString()
        .replace(/\0/g, ""),
      currency: currencyToString(_policy[10]),
      customerExternalId: Buffer.from(_policy[11].slice(2), "hex")
        .toString()
        .replace(/\0/g, ""),
      carrierFlightNumber: Buffer(_risk[0].slice(2), "hex")
        .toString()
        .replace(/\0/g, ""),
      departureDate: Buffer(_risk[1].slice(2), "hex")
        .toString()
        .replace(/\0/g, ""),
      arrivalTime: new Date(_risk[2].toNumber() * 1000).toLocaleString(),
      actualDelayInMinutes: _risk[3].toNumber(),
      delay: _risk[4].toNumber(),
      cumulatedWeightedPremium: web3.fromWei(_risk[5]).toFixed(2),
      premiumMultiplier: _risk[6].toFixed(2)
    }

    _("[policyFormatterLong]", frontendP)
    return frontendP
  }

  readPolicyIdFromDB = async (id, policies, shouldReturn) => {
    _("[policies]", policies)
    _("[readPolicyIdFromDB] Try at id:", id)

    const { FD_Db } = this.state

    const policy = await new Promise((resolve, reject) =>
      FD_Db.policies(id, (e, p) => (e || !p ? resolve(null) : resolve(p)))
    )
    if (!policy) return

    const riskId = policy[2]
    const risk = await new Promise((resolve, reject) =>
      FD_Db.risks(riskId, (e, r) => (e || !r ? resolve(null) : resolve(r)))
    )
    if (!risk) return

    const fP = this.policyFormatterLong(id, policy, risk)
    if (shouldReturn) return fP

    policies.push(fP)

    const nexId = id + 1
    return this.readPolicyIdFromDB(nexId, policies)
  }

  getPoliciesFromDb = async () => {
    const policies = []
    this.setState({ readlistPending: true })
    try {
      const { FD_Db } = this.state
      _("[FD_Db]", FD_Db)

      const startId = 0
      await this.readPolicyIdFromDB(startId, policies)
      _("[getPoliciesFromDb] Loop finished")
    } catch (err) {
      _("[getPoliciesFromDb] Setup loop fail")
    } finally {
      this.setState({ policies, readlistPending: false })
    }
  }

  handleDebugMoreTools = () => {
    const { openDebugMoreTools: cur } = this.state
    const openDebugMoreTools = !cur
    this.setState({ openDebugMoreTools })
  }

  render() {
    const {
      departureAirport,
      arrivalAirport,
      carrierFlightNumber,
      availableFlights,
      policies,
      pending,
      ledgerAddress,
      ledgerBalance,
      customerAddress,
      customerBalance,
      fundedAddress,
      fundedAmount,
      mockServerUrl,
      newPolicyAddress,
      fakeCarrier,
      fakeFlight,
      fakeDelayInMinutes,
      openCertificate,
      openDebugMoreTools,
      dbAddress,
      readlistPending
    } = this.state

    const selectAirports = demoAirports.map(airport => {
      const { name, code } = airport
      return <MenuItem value={code} key={code} primaryText={name} />
    })

    return (
      <MuiThemeProvider>
        <div>
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">React & Ethereum Clients</h1>
            </header>
          </div>

          {/*<div style={{backgroundColor: "red"}}>{clock}</div>*/}

          <Tabs>
            <Tab label="Dashboard">
              <div style={s.rootDiv}>
                {/* New Policy */}
                <Paper zDepth={1} style={s.newPolicyRoot}>
                  {pending && (
                    <div style={s.newPolicyPending}>
                      <CircularProgress size={60} thickness={7} />
                    </div>
                  )}
                  <div style={s.newPolicyTitle}>Create New Policy</div>
                  <div style={s.policyParamsDiv}>
                    <TextField floatingLabelText={"Full Name"} value={this.fullName} onChange={this.storeFullName} />
                    <TextField floatingLabelText={"Email"} value={this.email} onChange={this.storeEmail} />
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
                    <DatePicker floatingLabelText="Departure Date" onChange={this.storeDepartureDate} />
                    <SelectField
                      value={carrierFlightNumber}
                      onChange={this.storeCarrierFlightNumber}
                      floatingLabelText={"Carrier Flight Number"}
                      maxHeight={s.selectDiv.height}
                    >
                      {availableFlights.map(flight => {
                        const { name, code } = flight
                        return <MenuItem value={code} key={code} primaryText={name} />
                      })}
                    </SelectField>
                    <TextField floatingLabelText={"Premium"} value={this.premium} onChange={this.storePremium} />
                  </div>
                  <div style={s.applyBtnDiv}>
                    <div style={s.applySpaceDiv} />
                    <RaisedButton label={"Apply"} primary={true} onClick={this.createNewPolicy} />
                  </div>
                </Paper>
                {/* List Policy */}
                <Paper zDepth={1} style={s.listPolicyRoot}>
                  {readlistPending && (
                    <div style={s.newPolicyPending}>
                      <CircularProgress size={60} thickness={7} />
                    </div>
                  )}
                  <div style={s.listPolicyTitle}>Policy List</div>
                  <List>
                    {policies.map(policy => {
                      const {
                        policyId,
                        fullName,
                        carrierFlightNumber,
                        departureDate,
                        departureTime,
                        arrivalTime,
                        actualDelayInMinutes = ""
                      } = policy

                      const policyBrief = `${fullName ||
                        ""}-${carrierFlightNumber}-${departureDate}-delay: ${actualDelayInMinutes} min`
                      const cb = this.showPolicyDelayColor(policyId)
                      const flightTlObj = { departureTime, arrivalTime, cb }

                      const itemStyle = s.getItemStyle(actualDelayInMinutes, policyId)
                      // _("[itemStyle]", itemStyle)
                      const policyIdTitle = policyId > 15000 ? "Draft" : fdHash.encode(policyId)

                      return (
                        <ListItem
                          key={policyId}
                          primaryText={policyIdTitle}
                          secondaryText={policyBrief}
                          leftIcon={<AssignMent />}
                          style={itemStyle}
                          onClick={this.openPolicyDetailDialog(policy)}
                        >
                          <div style={s.flightProgressDiv}>
                            <FlightTimeLine {...flightTlObj} />
                          </div>
                        </ListItem>
                      )
                    })}
                  </List>
                </Paper>
                {/* Account Balance */}
                <Paper zDepth={1} style={s.accountBalanceRoot}>
                  <div style={s.accountBalanceTitle}>Account Balance</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderColumn>Name</TableHeaderColumn>
                        <TableHeaderColumn>Balance</TableHeaderColumn>
                        <TableHeaderColumn>Address</TableHeaderColumn>
                      </TableRow>
                    </TableHeader>
                    <TableBody stripedRows={true}>
                      <TableRow>
                        <TableRowColumn>FD.Ledger</TableRowColumn>
                        <TableRowColumn>{ledgerBalance}</TableRowColumn>
                        <TableRowColumn>{ledgerAddress}</TableRowColumn>
                      </TableRow>
                      <TableRow>
                        <TableRowColumn>Current User</TableRowColumn>
                        <TableRowColumn>{customerBalance}</TableRowColumn>
                        <TableRowColumn>{customerAddress}</TableRowColumn>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </div>
            </Tab>
            <Tab label="Debug">
              <div style={s.debugRootOfRoot}>
                {/* Funding */}
                <Paper zDepth={1} style={s.fundingRoot}>
                  <div>
                    <div style={s.fundTitle}>Funding</div>
                    <div>
                      <TextField
                        floatingLabelText={"Mock Server URL"}
                        value={mockServerUrl}
                        onChange={this.storeTextField("mockServerUrl")}
                      />
                    </div>
                    <div>
                      <TextField
                        floatingLabelText={"Account Address"}
                        value={fundedAddress}
                        onChange={this.storeTextField("fundedAddress")}
                      />
                    </div>

                    <div>
                      <TextField
                        floatingLabelText={"Fund Amount in ETH"}
                        value={fundedAmount}
                        onChange={this.storeTextField("fundedAmount")}
                      />
                    </div>

                    <div style={s.applyBtnDiv}>
                      <div style={s.applySpaceDiv} />
                      <RaisedButton label={"Apply"} primary={true} onClick={this.sendFund} />
                    </div>
                  </div>
                </Paper>

                {/* Fake Flight Status */}
                <Paper zDepth={1} style={s.fakeStatusRoot}>
                  <div style={s.fundTitle}>Fake status</div>
                  <div>
                    <TextField
                      floatingLabelText={"Mock Server URL"}
                      value={mockServerUrl}
                      onChange={this.storeTextField("mockServerUrl")}
                    />
                  </div>
                  <div>
                    <TextField
                      floatingLabelText={"Carrier"}
                      value={fakeCarrier}
                      onChange={this.storeTextField("fakeCarrier")}
                    />
                  </div>
                  <div>
                    <TextField
                      floatingLabelText={"Flight"}
                      value={fakeFlight}
                      onChange={this.storeTextField("fakeFlight")}
                    />
                  </div>
                  <div>
                    <TextField
                      floatingLabelText={"Delay in Minutes"}
                      value={fakeDelayInMinutes}
                      onChange={this.storeTextField("fakeDelayInMinutes")}
                    />
                  </div>
                  <div>
                    <RaisedButton label={"Apply"} primary={true} onClick={this.fakeStatus} />
                  </div>
                </Paper>

                {/* Config*/}
                <Paper zDepth={1} style={s.contractRoot}>
                  <div style={s.fundTitle}>Contract</div>
                  <div>
                    <TextField
                      floatingLabelText={"Contract NewPolicy Address"}
                      value={newPolicyAddress}
                      onChange={this.storeTextField("newPolicyAddress")}
                    />
                  </div>
                  <div>
                    <TextField
                      floatingLabelText={"Contract Ledger Address"}
                      value={ledgerAddress}
                      onChange={this.storeTextField("ledgerAddress")}
                    />
                  </div>
                  <div>
                    <TextField
                      floatingLabelText={"Contract Database Address"}
                      value={dbAddress}
                      onChange={this.storeTextField("dbAddress")}
                    />
                  </div>
                  <div style={s.applyBtnDiv}>
                    <div style={s.applySpaceDiv} />
                    <RaisedButton label={"Update contract"} primary={true} onClick={this.updateContact} />
                  </div>
                </Paper>

                {/* Debug */}
                <Paper zDepth={1} style={s.debugRoot}>
                  <div style={s.fundTitle}>Debug</div>
                  <div>
                    <RaisedButton label={"Read Account Balance"} primary={true} onClick={this.readAccountBalance} />
                  </div>
                  <div>
                    <RaisedButton label={"More Tools..."} primary={true} onClick={this.handleDebugMoreTools} />
                  </div>

                  {openDebugMoreTools && (
                    <div>
                      <div>
                        <button onClick={this.getPoliciesFromDb}>Get Policies</button>
                      </div>
                      <div>
                        <TextField floatingLabelText={"Flight"} value={this.flight} onChange={this.storeFlight} />
                        <RaisedButton label={"Check Flight"} primary={true} onClick={this.checkFlight} />
                      </div>
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
                  )}
                </Paper>
              </div>
            </Tab>
          </Tabs>
          <Dialog
            title={"Policy Certificate"}
            actions={this.actions}
            modal={false}
            open={openCertificate}
            onRequestClose={this.handleClose}
          >
            {this.renderDialogContent()}
          </Dialog>
        </div>
      </MuiThemeProvider>
    )
  }
}
