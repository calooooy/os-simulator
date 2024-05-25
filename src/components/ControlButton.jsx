import React from 'react';

const ControlButtons = ({ onAutoPlay, onPause, onNext, onReset }) => {
  return (
    <div>
      <h2>Control Buttons</h2>
      <button onClick={onAutoPlay}>Auto Play</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onNext}>Next</button>
      <button onClick={onReset}>Reset</button>
    </div>
  );
};

export default ControlButtons;
