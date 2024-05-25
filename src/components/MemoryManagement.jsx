import React, { useState, useEffect } from 'react';

const MemoryManagement = ({ processes, memory, setMemory, jobQueue, setJobQueue }) => {
  const [jobQueueTableData, setJobQueueTableData] = useState([]);
  const maxJobsBeforeScroll = 15;

  useEffect(() => {
    setJobQueueTableData(jobQueue);
  }, [jobQueue]);

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
    const freeSpaces = [];
    let currentBlockSize = 0;
    let bestFitIndex = -1;
    let bestFitSize = Infinity;

    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        currentBlockSize++;
        if (currentBlockSize >= process.memorySize) {
          if (currentBlockSize < bestFitSize) {
            bestFitIndex = i - currentBlockSize + 1;
            bestFitSize = currentBlockSize;
          }
        }
      } else {
        currentBlockSize = 0;
      }
    }

    if (bestFitIndex !== -1) {
      const newMemory = [...memory];
      for (let i = bestFitIndex; i < bestFitIndex + process.memorySize; i++) {
        newMemory[i] = process.id;
      }
      setMemory(newMemory);
      process.status = 'Ready';
    } else {
      process.status = 'Waiting';
      updatedJobQueueTableData.push(process);
    }
  };

  const deallocateMemory = (process) => {
    setMemory((prevMemory) =>
      prevMemory.map((unit) => (unit === process.id ? null : unit))
    );
  };

  const getColor = (processId) => {
    const process = processes.find(p => p.id === processId);
    return process ? process.color : 'white';
  };

  const getRowStyle = (process) => {
    return process.status === 'Running' ? { backgroundColor: getColor(process.id) } : {};
  };

  return (
    <div>
      {/* <h2>Memory Management</h2> */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, marginRight: '20px' }}>
          <h3>PCB</h3>
          <div style={{ overflowY: 'scroll', height: '400px' }}>
            <table style={{ width: '100%', textAlign: 'center' }}>
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
                  <tr key={index} style={getRowStyle(process)}>
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
            <table style={{ width: '100%', textAlign: 'center' }}>
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
                backgroundColor: getColor(unit),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
