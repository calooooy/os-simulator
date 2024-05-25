import React, { useState, useEffect } from 'react';

const MemoryManagement = ({ processes, memory, setMemory, jobQueue, setJobQueue }) => {
  const [jobQueueTableData, setJobQueueTableData] = useState([]);
  const maxJobsBeforeScroll = 15; // Maximum number of jobs before adding a scrollbar

  useEffect(() => {
    const updatedJobQueueTableData = [...jobQueueTableData];

    processes.forEach((process) => {
      if (process.status === 'New') {
        allocateMemory(process, updatedJobQueueTableData);
      } else if (process.status === 'Terminated') {
        deallocateMemory(process);
      }
    });

    setJobQueueTableData(updatedJobQueueTableData);
  }, [processes]);

  const allocateMemory = (process, updatedJobQueueTableData) => {
    const freeSpaces = []; // Array to store available spaces
    let currentBlockSize = 0; // Variable to track the size of the current free space
    let bestFitIndex = -1; // Index of the best fit block
    let bestFitSize = Infinity; // Size of the best fit block

    // Iterate through memory to find available spaces
    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        currentBlockSize++; // Increase the size of the current free space
        if (currentBlockSize >= process.memorySize) { // If current free space is large enough
          if (currentBlockSize < bestFitSize) { // Check if it's the best fit so far
            bestFitIndex = i - currentBlockSize + 1; // Update best fit index
            bestFitSize = currentBlockSize; // Update best fit size
          }
        }
      } else {
        currentBlockSize = 0; // Reset the current free space size
      }
    }

    // If a best fit block is found
    if (bestFitIndex !== -1) {
      const newMemory = [...memory];
      for (let i = bestFitIndex; i < bestFitIndex + process.memorySize; i++) {
        newMemory[i] = process.id; // Allocate memory for the process
      }
      setMemory(newMemory);
      process.status = 'Ready';
    } else {
      // Change the process status to 'Waiting' before adding to the job queue
      process.status = 'Waiting';
      updatedJobQueueTableData.push(process);
    }
  };

  const deallocateMemory = (process) => {
    setMemory(memory.map((unit) => (unit === process.id ? null : unit)));
  };

  const getColor = (processId) => {
    const process = processes.find(p => p.id === processId);
    return process ? process.color : 'white';
  };

  return (
    <div>
      <h2>Memory Management</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, marginRight: '20px' }}>
          <h3>PCB</h3>
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
        </div>
        <div style={{ flex: 1 }}>
          <h3>Job Queue</h3>
          <div style={{ maxHeight: jobQueueTableData.length > maxJobsBeforeScroll ? '300px' : 'auto', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Burst Time</th>
                  <th>Memory Size</th>
                  <th>Arrival Time</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobQueueTableData.map((process) => (
                  <tr key={process.id}>
                    <td>{process.id}</td>
                    <td>{process.burstTime}</td>
                    <td>{process.memorySize}</td>
                    <td>{process.arrivalTime}</td>
                    <td>{process.priority}</td>
                    <td>{process.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <h3>Memory Allocation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '5px' }}>
          {memory.map((unit, index) => (
            <div 
              key={index} 
              style={{ 
                width: '30px', 
                height: '30px', 
                border: '1px solid black', 
                backgroundColor: getColor(unit) 
              }}
            >
              {unit}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement;