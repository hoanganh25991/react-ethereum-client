import moment from "moment"

export const getScheduleByRoute = (date, from, to, cb = null) => {
  const shouldSearch = date && from && to
  if(!shouldSearch) return

  const flights = [
    {
      name: "HNL20",
      code: "HA/20",
    },
    {
      name: "HNL7856",
      code: "HA/7856",
    },
    {
      name: "HNL6545",
      code: "HA/6545",
    },
    {
      name: "HNL8562",
      code: "HA/8562",
    },
    {
      name: "HNL1222",
      code: "HA/1222",
    },
  ]

  if(cb){
    cb(flights)
  }
}


export const getCarrierFlightNumberInfo = carrierFlightNumber => {
  const now = moment();
  const nowInTimestamp = +now.format("X")

  const departureDate = `/dep/${now.format("YYYY/MM/DD")}`
  const departureTime = nowInTimestamp + 100;
  const arrivalTime = departureTime + 90;

  return {
    carrierFlightNumber,
    departureDate,
    departureTime,
    arrivalTime,
  }
}