const _0px = 0
const _5px = 5
const _10px = 10
const _20px = 20
const _30px = 30
const _550px = 550
const _500px = 500
const _770px = 770
const _200px = 200
const _1d4em = "1.4em"
const _0d8opacity = 0.8

export const style = {
  rootDiv: {
    display: "flex",
    // justifyContent: "space-between",
    flexWrap: "wrap"
  },
  newPolicyTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _0d8opacity
  },
  newPolicyRoot: {
    padding: _20px,
    margin: _20px,
    position: "relative"
  },
  padding: {
    padding: _20px
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
    width: _500px,
    padding: _20px,
    margin: _20px
  },
  listPolicyTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _0d8opacity
  },
  oldDiv: {
    padding: _10px
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
    padding: _20px,
    margin: _20px,
    position: "relative",
    width: _500px
  },
  accountBalanceTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _0d8opacity
  },
  flightProgressDiv: {
    padding: `${_5px}px ${_0px}`
  },
  mockServerRoot: {
    padding: _20px,
    margin: _20px,
    position: "relative",
    width: _500px
  },
  fundTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _0d8opacity
  }
}
