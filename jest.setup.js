global.__DEV__ = true;
global.__TEST__ = true;
// Lightweight mock for expo-linear-gradient using ESM style
import React from 'react';
jest.mock('expo-linear-gradient', () => ({
	LinearGradient: ({ children }) => React.createElement('View', null, children)
}));

// Silence noisy console logs in tests (optional)
const origLog = console.log;
console.log = (...args) => { if(String(args[0]).includes('perf')) return; origLog(...args); };
