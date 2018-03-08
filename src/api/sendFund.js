import Oaxios from "axios"
const ALLOW_TIMEOUT = 1 * 1000 // 120m = 2h

const axios = Oaxios.create({
  timeout: ALLOW_TIMEOUT,
  validateStatus: status => status !== 500
})

const SEND_FUND = "sendFund"
const FAKE_STATUS = "fakeStatus"
const FLIGHT_STATUS = "status"

const getEndpoint = (_serverUrl, path) => {
  const hasSlash = _serverUrl.endsWith("/")
  const serverUrl = hasSlash ? _serverUrl.substr(0, _serverUrl.length - 1) : _serverUrl
  return `${serverUrl}/${path}`
}

export const callSendFund = async (serverUrl, address, amount) => {
  const endpoint = getEndpoint(serverUrl, SEND_FUND)
  const resData = await axios
    .get(`${endpoint}/${address}/${amount}`)
    .then(res => res.data)
    .catch(err => {
      console.log("[axios call][ERR]", err)
      return null
    })

  return resData
}

export const callFakeStatus = async (serverUrl, carrier, flight, delay) => {
  const endpoint = getEndpoint(serverUrl, FAKE_STATUS)
  const resData = await axios
    .get(`${endpoint}/${carrier}/${flight}/${delay}`)
    .then(res => res.data)
    .catch(err => {
      console.log("[axios call][ERR]", err)
      return null
    })

  return resData
}

export const callFlightStatus = async (serverUrl, carrierFlight) => {
  const endpoint = getEndpoint(serverUrl, FLIGHT_STATUS)
  const resData = await axios
    .get(`${endpoint}/${carrierFlight}`)
    .then(res => res.data)
    .catch(err => {
      console.log("[axios call][ERR]", err)
      return null
    })

  return resData
}
