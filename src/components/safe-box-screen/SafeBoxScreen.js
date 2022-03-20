import React from "react";
import "./SafeBoxScreen.scss";

const SafeBoxScreen = (props) => {
  const { lock, status, password, idle } = props;
  // console.log({ idle });
  return (
    <div className={!idle ? "safebox--screen" : "safebox--screen safebox--screen--idle"} data-testid="screen">
      <p className="safebox--screen--lock" data-testid="top-of-screen">
        {!lock ? "Unlocked" : "Locked"}
      </p>
      <p className="safebox--screen--state" data-testid="bottom-of-screen">
        {!password.length ? status : password}
      </p>
    </div>
  );
};

export default SafeBoxScreen;
