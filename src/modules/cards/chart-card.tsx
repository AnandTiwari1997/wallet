import * as React from "react";
import CSS from "csstype";

const accountCardDivStyle: CSS.Properties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "27vw",
  height: "30vh",
  borderRadius: "10px",
  margin: "2vh 1vw",
  background: "rgb(221, 225, 231)",
  boxShadow:
    "rgba(255, 255, 255, 0.45) -3px -3px 7px, rgba(128, 135, 148, 0.56) 2px 2px 5px",
};

const ChartCard = ({ name } : { [key: string]: any}) => {
  return <div style={accountCardDivStyle}>{name}</div>;
};

export default ChartCard;