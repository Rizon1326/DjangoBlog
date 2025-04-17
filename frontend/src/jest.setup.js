// // This file contains setup for Jest tests

// // Add any global setup needed for all tests
// import '@testing-library/jest-dom';
// import jest from 'jest-mock';

// // Mock window functions that might not be available in the test environment
// Object.defineProperty(window, 'matchMedia', {
//   writable: true,
//   value: jest.fn().mockImplementation(query => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: jest.fn(), // Deprecated
//     removeListener: jest.fn(), // Deprecated
//     addEventListener: jest.fn(),
//     removeEventListener: jest.fn(),
//     dispatchEvent: jest.fn(),
//   })),
// });