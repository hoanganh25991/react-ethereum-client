import { cyan50 as late15C, cyan100 as late30C, cyan200 as late45C, grey200 as draftC } from "material-ui/styles/colors"

const _0px = 0
const _5px = 5
const _10px = 10
const _15px = 15
const _30px = 30
const _350px = 500
const _500px = 500
const _550px = 550
const _200px = 200
const _1d4em = "1.4em"
const _opacity8 = 0.8

export const style = {
  rootDiv: {
    display: "flex",
    alignItems: "self-start",
    flexWrap: "wrap"
  },
  newPolicyTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _opacity8
  },
  newPolicyRoot: {
    padding: _15px,
    margin: _15px,
    position: "relative"
  },
  padding: {
    padding: _15px
  },
  policyParamsDiv: {
    display: "flex",
    flexDirection: "row",
    width: _550px,
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  selectDiv: {
    height: _200px
  },
  applyBtnDiv: {
    display: "flex",
    flexDirection: "row"
  },
  applySpaceDiv: {
    flex: "1"
  },
  listPolicyRoot: {
    width: _350px,
    padding: _15px,
    margin: _15px
  },
  listPolicyTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _opacity8
  },
  oldDiv: {
    padding: _10px
  },
  debugRootOfRoot: {
    display: "flex",
    alignItems: "self-start",
    flexWrap: "wrap"
  },
  pendingRoot: {
    position: "relative"
  },
  newPolicyPending: {
    position: "absolute",
    top: `calc(50% - ${_30px}px)`,
    left: `calc(50% - ${_30px}px)`
  },
  accountBalanceRoot: {
    padding: _15px,
    margin: _15px,
    position: "relative",
    width: _500px
  },
  accountBalanceTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _opacity8
  },
  flightProgressDiv: {
    padding: `${_5px}px ${_0px}`
  },
  fundingRoot: {
    padding: _15px,
    margin: _15px,
    position: "relative",
    display: "inline-block"
  },
  fundTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _opacity8
  },
  contractRoot: {
    padding: _15px,
    margin: _15px,
    position: "relative",
    display: "inline-block"
  },
  debugRoot: {
    padding: _15px,
    margin: _15px,
    position: "relative",
    display: "inline-block"
  },
  fakeStatusRoot: {
    padding: _15px,
    margin: _15px,
    position: "relative",
    display: "inline-block"
  },
  getItemStyle: (delayMinute, policyId) => {
    const defaultS = {
      margin: `${_10px} 0`,
      backgroundColor: policyId > 15000 ? draftC : null
    }

    if (!delayMinute) return { ...{}, ...defaultS }

    const late15 = delayMinute >= 15 && delayMinute < 30
    const late30 = delayMinute >= 30 && delayMinute < 45
    const late45 = delayMinute >= 45

    switch (true) {
      case late15: {
        return {
          ...defaultS,
          backgroundColor: late15C
        }
      }
      case late30: {
        return {
          ...defaultS,
          backgroundColor: late30C
        }
      }
      case late45: {
        return {
          ...defaultS,
          backgroundColor: late45C
        }
      }
    }
  },
  normalText: {
    opacity: _opacity8
  }
}
