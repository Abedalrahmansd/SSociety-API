// Centralized Socket.io instance export
// This allows controllers to emit events without circular dependencies
let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io instance not initialized. Call setIO() first.');
  }
  return ioInstance;
};

