import moment from "moment"

export const getScheduleByRoute = (date, from, to, cb = null) => {
  const shouldSearch = date && from && to
  if (!shouldSearch) return

  const flights = [
    {
      name: "HA/20",
      code: "HA/20"
    },
    {
      name: "HA/21",
      code: "HA/21"
    },
    {
      name: "HA/22",
      code: "HA/22"
    },
    {
      name: "HA/23",
      code: "HA/23"
    },
    {
      name: "HA/24",
      code: "HA/24"
    }
  ]

  if (cb) {
    cb(flights)
  }
}

export const getCarrierFlightNumberInfo = carrierFlightNumber => {
  const now = moment()
  const nowInTimestamp = +now.format("X")

  const departureDate = `/dep/${now.format("YYYY/MM/DD")}`
  const departureTime = nowInTimestamp + 100
  const arrivalTime = departureTime + 90

  return {
    carrierFlightNumber,
    departureDate,
    departureTime,
    arrivalTime
  }
}
