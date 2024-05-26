import React, { useState, useEffect } from 'react';

const MemoryManagement = ({ processes, setMemory, jobQueue, setJobQueue }) => {
  const [memory, setMemoryState] = useState(Array(1024).fill(null));
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

  // Function to allocate memory to the process with the minimum Process ID from the job queue
  const allocateMinIdProcessFromJobQueue = () => {
    if (updatedJobQueueTableData.length === 0) return false;

    // Find the process with the minimum Process ID
    let minIdProcessIndex = -1;
    let minProcessId = Infinity;
    for (let i = 0; i < updatedJobQueueTableData.length; i++) {
      if (updatedJobQueueTableData[i].status === 'Waiting' && updatedJobQueueTableData[i].id < minProcessId) {
        minProcessId = updatedJobQueueTableData[i].id;
        minIdProcessIndex = i;
      }
    }

    if (minIdProcessIndex === -1) return false;

    const minIdProcess = updatedJobQueueTableData[minIdProcessIndex];

    currentBlockSize = 0;
    bestFitIndex = -1;
    for (let j = 0; j < memory.length; j++) {
      if (memory[j] === null) {
        currentBlockSize++;
        if (currentBlockSize >= minIdProcess.memorySize) {
          bestFitIndex = j - currentBlockSize + 1;
          break;
        }
      } else {
        currentBlockSize = 0;
      }
    }
    if (bestFitIndex !== -1) {
      const newMemory = [...memory];
      for (let k = bestFitIndex; k < bestFitIndex + minIdProcess.memorySize; k++) {
        newMemory[k] = minIdProcess.id;
      }
      setMemoryState(newMemory);
      setMemory(newMemory); // Update parent component's memory state
      minIdProcess.status = 'Ready';

      // Update the process status in the processes array
      const pcbProcess = processes.find(p => p.id === minIdProcess.id);
      if (pcbProcess) {
        pcbProcess.status = 'Ready';
      }

      // Remove from job queue since it's allocated memory
      updatedJobQueueTableData.splice(minIdProcessIndex, 1);
      setJobQueueTableData([...updatedJobQueueTableData]); // Update job queue state
      return true; // Indicate that a waiting process has been allocated
    }

    return false; // No waiting process could be allocated
  };

  // Try to allocate memory for the process with the minimum Process ID from the job queue first
  if (allocateMinIdProcessFromJobQueue()) return;

  // If there's enough memory, allocate to the new process if possible
  if (memory.some(unit => unit === null)) {
    currentBlockSize = 0;
    bestFitIndex = -1;
    for (let i = 0; i < memory.length; i++) {
      if (memory[i] === null) {
        currentBlockSize++;
        if (currentBlockSize >= process.memorySize) {
          bestFitIndex = i - currentBlockSize + 1;
          break;
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
      // If the new process cannot be allocated, add it to the job queue
      updatedJobQueueTableData.push(process);
      process.status = 'Waiting';
      setJobQueueTableData([...updatedJobQueueTableData]); // Update job queue state
    }
  }
};

const deallocateMemory = (process) => {
  // Deallocate memory allocated to the terminated process
  setMemoryState(prevMemory => {
    const newMemory = prevMemory.map(unit => (unit === process.id ? null : unit));
    setMemory(newMemory); // Update parent component's memory state
    return newMemory;
  });

  // Find the process with the minimum Process ID in the job queue
  if (jobQueueTableData.length > 0) {
    const minIdProcess = jobQueueTableData.reduce((minProcess, currentProcess) => {
      return currentProcess.id < minProcess.id ? currentProcess : minProcess;
    });

    // If no waiting processes, return
    if (!minIdProcess) return;

    // Try to allocate memory for the process with the minimum Process ID from the job queue
    let currentBlockSize = 0;
    let bestFitIndex = -1;

    for (let j = 0; j < memory.length; j++) {
      if (memory[j] === null) {
        currentBlockSize++;
        if (currentBlockSize >= minIdProcess.memorySize) {
          bestFitIndex = j - currentBlockSize + 1;
          break;
        }
      } else {
        currentBlockSize = 0;
      }
    }

    if (bestFitIndex !== -1) {
      const newMemory = [...memory];
      for (let k = bestFitIndex; k < bestFitIndex + minIdProcess.memorySize; k++) {
        newMemory[k] = minIdProcess.id;
      }
      setMemoryState(newMemory);
      setMemory(newMemory); // Update parent component's memory state
      minIdProcess.status = 'Ready';

      // Update the process status in the processes array
      const pcbProcess = processes.find(p => p.id === minIdProcess.id);
      if (pcbProcess) {
        pcbProcess.status = 'Ready';
      }

      // Remove the allocated process from the job queue
      const updatedJobQueueTableData = jobQueueTableData.filter(p => p.id !== minIdProcess.id);
      setJobQueueTableData([...updatedJobQueueTableData]); // Update job queue state
    }
  }
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
          height: `${block.size * 0.56}px`,
          backgroundColor: getColor(block.processId),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {block.processId !== null ? `${block.processId}` : ''}
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'  }}>
        <div>
          <h3>PCB</h3>
          <div style={{ overflowY: 'scroll', height: '250px', width: '1000px' }}>
            <table style={{ width: '100%', textAlign: 'center', paddingBottom: '20px', color: 'black', border: '1px solid #000', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead style={{ position: 'sticky', top: '0', backgroundColor: '#fff089', height: '50px', zIndex: '1' }}>
                <tr>
                  <th style={{ border: '1px solid #000' }}>Process ID</th>
                  <th style={{ border: '1px solid #000' }}>Burst Time</th>
                  <th style={{ border: '1px solid #000' }}>Memory Size</th>
                  <th style={{ border: '1px solid #000' }}>Arrival Time</th>
                  {processes.some(p => p.priority !== undefined) && <th style={{ border: '1px solid #000' }}>Priority</th>}
                  <th style={{ border: '1px solid #000' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process, index) => (
                  <tr key={index} style={{ ...getRowStyle(process), height: '30px' }}>
                    <td style={{ border: '1px solid #000' }}>{process.id}</td>
                    <td style={{ border: '1px solid #000' }}>{process.burstTime}</td>
                    <td style={{ border: '1px solid #000' }}>{process.memorySize}</td>
                    <td style={{ border: '1px solid #000' }}>{process.arrivalTime}</td>
                    {process.priority !== undefined && <td style={{ border: '1px solid #000' }}>{process.priority}</td>}
                    <td style={{ border: '1px solid #000' }}>{process.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3>Job Queue</h3>
          <div style={{ maxHeight: jobQueueTableData.length > maxJobsBeforeScroll ? '300px' : 'auto', overflowY: 'scroll', width: '1000px', height: '250px' }}>
            <table style={{ width: '100%', textAlign: 'center', border: '1px solid #000', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff089', height: '50px' }}>
                <tr>
                  <th style={{ border: '1px solid #000' }}>Process ID</th>
                  <th style={{ border: '1px solid #000' }}>Burst Time</th>
                  <th style={{ border: '1px solid #000' }}>Memory Size</th>
                  <th style={{ border: '1px solid #000' }}>Arrival Time</th>
                  <th style={{ border: '1px solid #000' }}>Priority</th>
                  <th style={{ border: '1px solid #000' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobQueueTableData.map((process) => (
                  <tr key={process.id} style={{ height: '30px' }}>
                    <td style={{ border: '1px solid #000' }}>{process.id}</td>
                    <td style={{ border: '1px solid #000' }}>{process.burstTime}</td>
                    <td style={{ border: '1px solid #000' }}>{process.memorySize}</td>
                    <td style={{ border: '1px solid #000' }}>{process.arrivalTime}</td>
                    <td style={{ border: '1px solid #000' }}>{process.priority}</td>
                    <td style={{ border: '1px solid #000' }}>{process.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ width: '20%', marginLeft: '0px', marginRight: '40px' }}>
        <div style={{ backgroundColor: '#fff089', border: '1px solid black', borderRadius:'10px', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h3 style={{ margin: '10px' }}>Memory Allocation</h3>
          <div style={{ border: '1px solid black', height: '100%', width: '80%', marginBottom: '20px' }}>
            {renderMemory()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryManagement;
