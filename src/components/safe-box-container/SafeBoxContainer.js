import React, { Component } from "react";
import "./SafeBoxContainer.scss";
import { connect } from "react-redux";
import SafeBoxKey from "../safe-box-key/SafeBoxKey";
import SafeBoxScreen from "../safe-box-screen/SafeBoxScreen";
import { addkey, goToServiceMode, locking, unlocking, validateMasterCode, goToIdleState } from "../../features/deposit-box/depositBoxSlice";
import { keypads, inputDelayTimeout, backlitTimeout } from "../../utils";

class SafeBoxContainer extends Component {
  constructor(props) {
    super(props);
    this.sceenLightOff = null;
    this.inputSubmit = null;
  }

  handleOnKeyboardPress = (event) => {
    const key = event.key.toUpperCase();
    if (keypads.toString().indexOf(key) !== -1) {
      this.addKey(key);
    }
  };

  addKey = (key) => {
    const { addKeyAction, depositBox } = this.props;
    const { serviceMode, loading } = depositBox;
    if (loading) return;

    if (!serviceMode && !isNaN(key)) {
      addKeyAction && addKeyAction(key);
    } else if (serviceMode) {
      addKeyAction && addKeyAction(key);
    }

    clearTimeout(this.inputSubmit);

    if (!serviceMode && key === "L") {
      this.processKey();
      this.onCheckServiceMode();
    } else {
      this.inputSubmit = setTimeout(() => {
        this.onCheckServiceMode();
        this.processKey();
        this.validateMasterCode();
      }, inputDelayTimeout);
    }
  };

  processKey() {
    const { depositBox, locking, unlocking } = this.props;
    const { password, savedPassword, lock, serviceMode } = depositBox;
    if (!serviceMode && password.length === 6) {
      if (!lock) {
        locking && locking(password);
      } else {
        unlocking && unlocking({ savedPassword, password });
      }
    }
  }

  onCheckServiceMode() {
    const { depositBox, goToServiceModeAction } = this.props;
    const { password, serviceMode, lock } = depositBox;

    if (lock && !serviceMode && password.length === 6 && password === "000000") {
      goToServiceModeAction && goToServiceModeAction();
    }
  }

  validateMasterCode() {
    const { depositBox, validateMasterCode } = this.props;
    const { password, serviceMode, lock, sn } = depositBox;

    if (lock && serviceMode && password.length >= 12) {
      const areUnique = [...new Set(password.split(""))];
      if (areUnique.length === 12) {
        validateMasterCode && validateMasterCode({ password, sn });
      }
    }
  }

  checkIsIdleState() {
    const { goIdleAction } = this.props;
    clearTimeout(this.sceenLightOff);
    this.sceenLightOff = setTimeout(() => {
      goIdleAction && goIdleAction();
    }, backlitTimeout);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleOnKeyboardPress);
  }

  render() {
    const { depositBox } = this.props;
    const { lock, status, password, idle, loading, sn } = depositBox;

    if (!idle) {
      this.checkIsIdleState();
    }

    return (
      <div className="safebox--wrapper" data-testid="wrapper">
        <SafeBoxScreen lock={lock} status={status} password={password} idle={idle} />
        <div className="safebox--wrapper--keyboard">
          {keypads.map((item, index) => (
            <SafeBoxKey key={index} padKey={item} disabled={loading} keyAction={this.addKey} />
          ))}
        </div>
        <p className="safebox--wrapper--serial-number">S/N: {sn}</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  depositBox: state.depositBox,
});

const mapDispatchToProps = {
  goToServiceModeAction: goToServiceMode,
  validateMasterCode,
  addKeyAction: addkey,
  locking,
  unlocking,
  goIdleAction: goToIdleState,
};

export default connect(mapStateToProps, mapDispatchToProps)(SafeBoxContainer);
