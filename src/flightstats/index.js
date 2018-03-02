import moment from "moment"

export const getScheduleByRoute = (date, from, to, cb = null) => {
  const shouldSearch = date && from && to
  if(!shouldSearch) return

  const flights = [
    {
      name: "HNL1568",
      code: "1568",
    },
    {
      name: "HNL7856",
      code: "7856",
    },
    {
      name: "HNL7845",
      code: "7845",
    },
    {
      name: "HNL8562",
      code: "8562",
    },
    {
      name: "HNL1222",
      code: "1222",
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