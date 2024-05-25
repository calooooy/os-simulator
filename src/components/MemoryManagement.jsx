import React, { useEffect } from 'react';

const MemoryManagement = ({ processes, memory, setMemory }) => {

  useEffect(() => {
    processes.forEach((process) => {
      if (process.status === 'New') {
        allocateMemory(process);
      } else if (process.status === 'Terminated') {
        deallocateMemory(process);
      }
    });
  }, [processes]);

  const allocateMemory = (process) => {
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
      process.status = 'Waiting'; // If no suitable block is found, set process status to 'Waiting'
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
  );
};

export default MemoryManagement;
