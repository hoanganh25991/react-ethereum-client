import moment from "moment"
let x = "/from/ABQ/to/DFW/departing/2018/03/01?appId=&appKey="
const ENDPOINT = "https://api.flightstats.com/flex/schedules/rest/v1/json"
const APP_ID = "2933d954"
const APP_KEY = "cddee3dd22f28f7d917411ed54f01a6c"

export const getScheduleByRoute = (date, from, to) => {
  const dateMobj = moment(date)
  // const
  const getUrl = `${ENDPOINT}/from/${from}/to/${to}/departing/${}`
  // fetch()

}