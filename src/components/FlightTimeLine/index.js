import moment from "moment/moment"
import React, { Component, Fragment, PureComponent } from "react"
import LinearProgress from "material-ui/LinearProgress"

export default class FlightTimeLine extends PureComponent {
  constructor() {
    super()
  }

  componentDidMount() {
    this.setUpClock()
  }

  setUpClock = () => {
    const intervalId = setInterval(() => {
      const clock = new Date().getTime()
      this.setState({ clock })
    }, 300)

    this.setState({ intervalId })
  }

  clearInterval = () => {
    const { intervalId } = this.state
    const { cb } = this.props
    if (!intervalId) return

    clearInterval(intervalId)
    this.setState({ intervalId: null }, cb)
  }

  getPercent = (departureTime, arrivalTime) => {
    const wrongFormat = isNaN(departureTime) || isNaN(arrivalTime)
    if (wrongFormat) return 100

    const nowTimestamp = +moment().format("X")
    const total = arrivalTime - departureTime
    const progress = nowTimestamp - departureTime
    const percent = progress / total * 100

    if (percent > 100) {
      this.clearInterval()
      return 100
    }

    return percent
  }

  render() {
    const { departureTime, arrivalTime } = this.props
    const percent = this.getPercent(departureTime, arrivalTime)
    return <LinearProgress mode="determinate" value={percent} />
  }
}
