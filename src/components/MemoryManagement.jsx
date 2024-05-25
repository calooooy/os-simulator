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
    const freeSpaces = memory.reduce((acc, curr, index) => {
      if (curr === null) acc.push(index);
      return acc;
    }, []);

    if (freeSpaces.length >= process.memorySize) {
      const newMemory = [...memory];
      for (let i = 0; i < process.memorySize; i++) {
        newMemory[freeSpaces[i]] = process.id;
      }
      setMemory(newMemory);
      process.status = 'Ready';
    } else {
      process.status = 'Waiting';
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
