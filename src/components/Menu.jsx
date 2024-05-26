import React, { useState } from 'react';

const Menu = ({ onSelectPolicy, onPlayPause, onNext, onReset, isPlaying, onDelete }) => {
  const handlePlayPause = () => {
    onPlayPause(!isPlaying);
  };

  return (
    <div>
      <h2>Select Scheduling Policy</h2>
      <button onClick={() => onSelectPolicy('FCFS')}>FCFS</button>
      <button onClick={() => onSelectPolicy('SJF')}>SJF</button>
      <button onClick={() => onSelectPolicy('Priority')}>Priority</button>
      <button onClick={() => onSelectPolicy('RR')}>Round Robin</button>
      {isPlaying ? (
        <button onClick={handlePlayPause}>Pause</button>
      ) : (
        <button onClick={handlePlayPause}>Play</button>
      )}
      <button onClick={onNext}>Next</button>
      <button onClick={onDelete}>Delete</button> {/* Call the onReset function when the Reset button is clicked */}
      <button onClick={onReset}>Reset</button> {/* Call the onReset function when the Reset button is clicked */}
    </div>
  );
};

export default Menu;