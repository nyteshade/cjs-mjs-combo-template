// Assuming Historical.ts contains the Historical class and related types/interfaces
const { Historical } = require('..')

// A complex type for testing
class ComplexType {
  constructor(id, name) {
    this.id = id
    this.name = name
  }
}

// Custom handler for ComplexType

const complexTypeHandler = {
  onSerialize: (state) => {
    return Object.assign({}, state, {
      currentValue: state.currentValue
      ? `${state.currentValue.id}-${state.currentValue.name}`
      : null
    }
    )
  },

  onDeserialize: (state) => {
    if (state.currentValue) {
      const [id, name] = state.currentValue.split('-')
      return Object.assign({}, state, {
        currentValue: new ComplexType(parseInt(id), name)
      })
    }

    return state
  },
}

describe('Historical', () => {
  describe('Basic Functionality', () => {

    test('should initialize with a given value', () => {
      const historical = new Historical(0)
      expect(historical.value).toBe(0)
    })


    test('should store and retrieve historical values', () => {
      const historical = new Historical(0)
      historical.value = 1
      historical.value = 2
      expect(historical.allPreviousValues
        .map(entry => entry.value))
        .toEqual([0, 1, 2])
    })


    test('should not store more history than specified', () => {
      const historical = new Historical(0, { howMany: 2 })
      historical.value = 1
      historical.value = 2
      historical.value = 3
      expect(
        historical.allPreviousValues.map(entry => entry.value).length
      ).toBe(2)
    })


    test('should correctly identify value changes', () => {
      const historical = new Historical(0)
      expect(historical.isDifferent(1)).toBeTruthy()
      expect(historical.isDifferent(0)).toBeFalsy()
    })
  })

  describe('Undo/Redo Functionality', () => {
    let historical
    beforeEach(() => {
      historical = new Historical(0, { enableUndoRedo: true })
    })

    test('should undo and redo changes', () => {
      historical.value = 1
      historical.value = 2
      expect(historical.undo()).toBeTruthy()
      expect(historical.value).toBe(1)
      expect(historical.redo()).toBeTruthy()
      expect(historical.value).toBe(2)
    })

    test('should handle undo and redo with empty stack', () => {
      expect(historical.undo()).toBeFalsy()
      expect(historical.redo()).toBeFalsy()
    })
  })

  describe('Callback Functionality', () => {

    test('should trigger callback on value change', () => {
      const historical = new Historical(0)
      const mockCallback = jest.fn()
      historical.registerCallback(mockCallback)
      historical.value = 1
      expect(mockCallback).toHaveBeenCalledWith(1, 0, expect.any(Number))
    })
  })

  describe('Serialization/Deserialization', () => {

    test('should serialize and deserialize primitive type', () => {
      const historical = new Historical(1)
      historical.value = 2
      const serialized = historical.serialize()
      const deserialized = Historical.deserialize(serialized)
      expect(deserialized.value).toBe(2)
    })

    test('should handle complex types with custom type handler', () => {

      const complexValue = new ComplexType(1, 'test')
      const historical = new Historical(complexValue, {
        typeHandler: complexTypeHandler,
      })
      historical.value = new ComplexType(2, 'test2')
      const serialized = historical.serialize()
      const deserialized = Historical.deserialize(serialized, complexTypeHandler)
      expect(deserialized.value).toEqual(new ComplexType(2, 'test2'))
    })

    test('should warn when serializing non-primitive without handler', () => {

      const historical = new Historical(new ComplexType(1, 'test'))
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const serialized = historical.serialize()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('Filtering and Searching', () => {
    let historical

    beforeEach(() => {
      historical = new Historical(0)
      historical.value = 1
      historical.value = 2
      historical.value = 3
    })

    test('should filter values before a timestamp', () => {
      const entries = historical.filterBefore(Date.now())
      expect(entries.length).toBeGreaterThanOrEqual(3)
      expect(entries.map(entry => entry.value)).toEqual([0, 1, 2])
    })

    test('should filter values after a timestamp', () => {
      const pastTimestamp = Date.now() - 1000 // 1 second in the past
      const entries = historical.filterAfter(pastTimestamp)
      expect(entries.length).toBeGreaterThanOrEqual(3)
      expect(entries.map(entry => entry.value)).toEqual([0, 1, 2])
    })

    test('should find values by specific value', () => {
      const entries = historical.findByValue(1)
      expect(entries.length).toBeGreaterThanOrEqual(1)
      expect(entries[0].value).toBe(1)
    })

    test('should filter by custom predicate', () => {
      const entries = historical.filterByPredicate(entry => entry.value > 1)

      expect(entries.length).toBeGreaterThanOrEqual(2)
      expect(entries.map(entry => entry.value)).toEqual([2, 3])
    })
  })

  describe('Additional Functionality', () => {

    test('should create Historical from static method', () => {
      const historical = Historical.from(0)
      expect(historical.value).toBe(0)
    })

    test('should correctly indicate if value has changed', () => {
      const historical = new Historical(0)
      const changed = historical.setIfChanged(1)
      const unchanged = historical.setIfChanged(1)
      expect(changed).toBeTruthy()
      expect(unchanged).toBeFalsy()
    })
  })
})
