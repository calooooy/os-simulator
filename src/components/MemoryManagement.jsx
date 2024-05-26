import React, { useState, useEffect } from 'react';

const MemoryManagement = ({ processes, setMemory, jobQueue, setJobQueue }) => {
  const [memory, setMemoryState] = useState(Array(30).fill(null)); // Initialize memory with 50 slots
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
      setMemoryState(newMemory);
      setMemory(newMemory); // Update parent component's memory state
      process.status = 'Ready';
    } else {
      process.status = 'Waiting';
      updatedJobQueueTableData.push(process);
    }
  };

  const deallocateMemory = (process) => {
    setMemoryState((prevMemory) => {
      const newMemory = prevMemory.map((unit) => (unit === process.id ? null : unit));
      setMemory(newMemory); // Update parent component's memory state
      return newMemory;
    });
  };

  const getColor = (processId) => {
    const process = processes.find(p => p.id === processId);
    return process ? process.color : 'white';
  };

  const getRowStyle = (process) => {
    return process.status === 'Running' ? { backgroundColor: getColor(process.id) } : {};
  };

  const renderMemory = () => {
    const memoryBlocks = [];
    let currentBlock = null;

    memory.forEach((unit, index) => {
      if (unit !== null) {
        if (currentBlock && currentBlock.processId === unit) {
          currentBlock.size++;
        } else {
          if (currentBlock) {
            memoryBlocks.push(currentBlock);
          }
          currentBlock = { processId: unit, size: 1 };
        }
      } else {
        if (currentBlock) {
          memoryBlocks.push(currentBlock);
          currentBlock = null;
        }
        memoryBlocks.push({ processId: null, size: 1 });
      }
    });

    if (currentBlock) {
      memoryBlocks.push(currentBlock);
    }

    return memoryBlocks.map((block, index) => (
      <div
        key={index}
        style={{
          width: '100%',
          height: `${block.size * 30}px`,
          backgroundColor: getColor(block.processId),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px',
          marginBottom: '0px',
        }}
      >
        {block.processId !== null ? `${block.processId}` : ''}
      </div>
    ));
  };

  return (
    <div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <h3>PCB</h3>
          <div style={{ overflowY: 'scroll', height: '400px', width: '80%' }}>
            <table style={{ width: '100%', textAlign: 'center', paddingBottom: '20px' }}>
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

          <h3>Job Queue</h3>
          <div style={{ maxHeight: jobQueueTableData.length > maxJobsBeforeScroll ? '300px' : 'auto', overflowY: 'scroll', width: '80%' }}>
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

        <div style={{ width: '20%', height: '100%' }}>
          <h3>Memory Allocation</h3>
          <div style={{ border: '1px solid black', height: '100%' }}>
            {renderMemory()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement;
