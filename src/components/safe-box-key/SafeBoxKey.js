import React from "react";
import "./SafeBoxKey.scss";

const SafeBoxKey = (props) => {
  const { padKey, keyAction, disabled } = props;

  return (
    <div
      data-testid="keypad-main"
      className={disabled ? "safebox--button safebox--button--disabled" : "safebox--button"}
      aria-disabled={disabled}
      onClick={() => keyAction(padKey)}
    >
      <p className="safebox--button--paragraph" data-testid={`padKey-${padKey}`}>
        {padKey}
      </p>
    </div>
  );
};

export default SafeBoxKey;
