import React, { useState, useEffect, useRef } from 'react';
import Menu from './components/Menu';
import MemoryManagement from './components/MemoryManagement';

const colors = [
  '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
];

const generateProcess = (id, currentTime) => {
  return {
    id,
    burstTime: Math.min(Math.floor(Math.random() * 20) + 1, 20),
    memorySize: Math.floor(Math.random() * 20) + 1,
    arrivalTime: currentTime + Math.floor(Math.random() * 5) + 1, // Relative to current time
    priority: Math.floor(Math.random() * 10) + 1,
    status: 'New',
    color: colors[id % colors.length],
    quantumLeft: 0
  };
};

const App = () => {
  const [policy, setPolicy] = useState('');
  const [processes, setProcesses] = useState([]);
  const [memory, setMemory] = useState(new Array(100).fill(null));
  const [jobQueue, setJobQueue] = useState([]);
  const processIdRef = useRef(1);
  const currentTimeRef = useRef(0); // Reference to keep track of current time
  const nextArrivalTimeRef = useRef(0); // Reference to the next arrival time

  useEffect(() => {
    if (policy) {
      const interval = setInterval(() => {
        const newProcess = generateProcess(processIdRef.current, currentTimeRef.current);
        processIdRef.current += 1;
        setProcesses((prevProcesses) => [...prevProcesses, newProcess]);
  
        // Update the next arrival time
        nextArrivalTimeRef.current = newProcess.arrivalTime;
      }, 500); // Generate new process every 5 seconds instead of every second
  
      const executionInterval = setInterval(() => {
        runProcess();
        // Increment the current time
        currentTimeRef.current += 1;
      }, 1000); // Run the scheduler every second
  
      return () => {
        clearInterval(interval);
        clearInterval(executionInterval);
      };
    }
  }, [policy]);
  

  const handleSelectPolicy = (selectedPolicy) => {
    setPolicy(selectedPolicy);
    setProcesses([]);
    setMemory(new Array(100).fill(null));
    setJobQueue([]);
    processIdRef.current = 1;
    currentTimeRef.current = 0; // Reset current time when a new policy is selected
    nextArrivalTimeRef.current = 0; // Reset next arrival time when a new policy is selected
  };


  const runProcess = () => {
    setProcesses((prevProcesses) => {
      let updatedProcesses = [...prevProcesses];

      if (policy === 'FCFS') {
        // FCFS policy
        const runningProcess = updatedProcesses.find(p => p.status === 'Running');
        if (runningProcess) {
          runningProcess.burstTime -= 1;
          if (runningProcess.burstTime <= 0) {
            runningProcess.status = 'Terminated';
            deallocateMemory(runningProcess);
          }
        } else {
          const nextProcess = updatedProcesses.find(p => p.status === 'Ready');
          if (nextProcess) {
            nextProcess.status = 'Running';
          }
        }
      } else if (policy === 'SJF') {
        // SJF policy
        const runningProcess = updatedProcesses.find(p => p.status === 'Running');
        if (runningProcess) {
          runningProcess.burstTime -= 1;
          if (runningProcess.burstTime <= 0) {
            runningProcess.status = 'Terminated';
            deallocateMemory(runningProcess);
          }
        } else {
          const readyProcesses = updatedProcesses.filter(p => p.status === 'Ready');
          if (readyProcesses.length > 0) {
            readyProcesses.sort((a, b) => a.burstTime - b.burstTime);
            const nextProcess = readyProcesses[0];
            nextProcess.status = 'Running';
          }
        }
      } else if (policy === 'Priority') {
        // Priority policy
        const runningProcess = updatedProcesses.find(p => p.status === 'Running');
        if (runningProcess) {
          runningProcess.burstTime -= 1;
          if (runningProcess.burstTime <= 0) {
            runningProcess.status = 'Terminated';
            deallocateMemory(runningProcess);
          }
        } else {
          const readyProcesses = updatedProcesses.filter(p => p.status === 'Ready');
          if (readyProcesses.length > 0) {
            readyProcesses.sort((a, b) => a.priority - b.priority);
            const nextProcess = readyProcesses[0];
            nextProcess.status = 'Running';
          }
        }
      } else if (policy === 'RR') {
        // Round Robin policy
        const quantum = 2; // Example: Quantum size
        const runningProcess = updatedProcesses.find(p => p.status === 'Running');
        if (runningProcess) {
          runningProcess.burstTime -= 1;
          runningProcess.quantumLeft -= 1;
          if (runningProcess.burstTime <= 0) {
            runningProcess.status = 'Terminated';
            deallocateMemory(runningProcess);
          } else if (runningProcess.quantumLeft <= 0) {
            runningProcess.status = 'Ready';
            updatedProcesses.push(updatedProcesses.shift()); // Move the process to the end of the queue
            const nextProcess = updatedProcesses.find(p => p.status === 'Ready');
            if (nextProcess) {
              nextProcess.status = 'Running';
              nextProcess.quantumLeft = quantum;
            }
          }
        } else {
          const nextProcess = updatedProcesses.find(p => p.status === 'Ready');
          if (nextProcess) {
            nextProcess.status = 'Running';
            nextProcess.quantumLeft = quantum;
          }
        }
      }

      // Check if there are processes in the job queue that can be allocated memory
      const updatedJobQueue = [];
      for (const process of jobQueue) {
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
          process.status = 'Ready'; // Update the process status to 'Ready'
          updatedProcesses.push(process);
        } else {
          // If no suitable block is found, keep the process in the job queue
          updatedJobQueue.push(process);
        }
      }
      setJobQueue(updatedJobQueue);

      return updatedProcesses;
    });
  };

  const deallocateMemory = (process) => {
    setMemory((prevMemory) =>
      prevMemory.map((unit) => (unit === process.id ? null : unit))
    );
  };

  return (
    <div>
      <Menu onSelectPolicy={handleSelectPolicy} />
      {policy && <h3>Current Policy: {policy}</h3>}
      <MemoryManagement
        processes={processes}
        memory={memory}
        setMemory={setMemory}
        jobQueue={jobQueue}
        setJobQueue={setJobQueue}
      />
    </div>
  );
};

export default App;
