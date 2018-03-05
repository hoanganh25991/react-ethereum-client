import moment from "moment/moment"
import React, { Component, Fragment, PureComponent } from "react"
import LinearProgress from "material-ui/LinearProgress"

export default class FlightTimeLine extends PureComponent {
  constructor() {
    super()
    this.setUpClock()
  }

  setUpClock = () => {
    setInterval(() => {
      const clock = new Date().getTime()
      this.setState({ clock })
    }, 300)
  }

  clearClock = () => {
    const { clock } = this.state
    if (!clock) return
    clearInterval(clock)
    this.setState({ clock: null })
  }

  getPercent = (departureTime, arrivalTime) => {
    const nowTimestamp = +moment().format("X")
    const total = arrivalTime - departureTime
    const progress = nowTimestamp - departureTime
    const percent = progress / total * 100

    if (percent > 100) {
      this.clearClock()
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
