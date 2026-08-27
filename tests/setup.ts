import '@testing-library/jest-dom'

class IntersectionObserverMock {
  observe = () => null
  unobserve = () => null
  disconnect = () => null
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock
})
