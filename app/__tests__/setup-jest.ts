import { EventEmitter } from 'events'

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  log: jest.fn(),
  // debug: jest.fn(),
  info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
}

jest.mock('socket.io-client', () => ({
  __esModule: true,
  io: () => {
    return new EventEmitter()
  },
}))
;(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: [], pagination: { cursor: null } }),
  })
)

const neutralinoData = {}
;(global as any).Neutralino = {
  storage: {
    getData: (key) => {
      return neutralinoData[key]
    },
    setData: (key, data) => {
      neutralinoData[key] = data
      return neutralinoData[key]
    },
  },
}

export {}
