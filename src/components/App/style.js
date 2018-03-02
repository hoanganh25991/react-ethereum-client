const _20px = 20;
const _550px = 550;
const _200px = 200;
const _1d4em = "1.4em"
const _0d8opacity = 0.8

export const style = {
  rootDiv: {
    display: "flex",
    padding: _20px,
    minWidth: _550px,
  },
  newPolicyTitle: {
    fontWeight: "bold",
    fontSize: _1d4em,
    textAlign: "center",
    opacity: _0d8opacity,
  },
  padding: {
    padding: _20px,
  },
  policyParamsDiv: {
    display: "flex",
    flexDirection: "row",
    width: _550px,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  selectDiv: {
    height: _200px,
  },
  applyBtnDiv: {
    display: "flex",
    flexDirection: "row",
  },
  applySpaceDiv: {
    flex: "1"
  }
}