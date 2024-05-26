import React from 'react';

const ControlButtons = ({ onAutoPlay, onPause, onNext, onReset, onDelete }) => {
  return (
    <div>
      <h2>Control Buttons</h2>
      <div style={{position: 'fixed'}}>
      <button onClick={onAutoPlay}>Auto Play</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onNext}>Next</button>
      <button onClick={onReset}>Reset</button>
      <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default ControlButtons;