import React from 'react';

const Menu = ({ onSelectPolicy }) => {
  return (
    <div>
      <h2>Select a Scheduling Policy</h2>
      <button onClick={() => onSelectPolicy('FCFS')}>FCFS</button>
      <button onClick={() => onSelectPolicy('SJF')}>SJF</button>
      <button onClick={() => onSelectPolicy('Priority')}>Priority</button>
      <button onClick={() => onSelectPolicy('RR')}>Round Robin</button>
    </div>
  );
};

export default Menu;
