// src/components/PCB.js
import React from 'react';

const PCB = ({ processes }) => {
  return (
    <div style={{ overflowY: 'scroll', height: '400px' }}>
      <table>
        <thead>
          <tr>
            <th>Process ID</th>
            <th>Burst Time</th>
            <th>Memory Size</th>
            <th>Arrival Time</th>
            {processes.some(p => p.priority !== undefined) && <th>Priority</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process, index) => (
            <tr key={index}>
              <td>{process.id}</td>
              <td>{process.burstTime}</td>
              <td>{process.memorySize}</td>
              <td>{process.arrivalTime}</td>
              {process.priority !== undefined && <td>{process.priority}</td>}
              <td>{process.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PCB;
