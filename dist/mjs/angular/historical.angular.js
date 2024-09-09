// Import RxJS dependencies
import { BehaviorSubject } from 'rxjs';
/**
 * Determine the underlying type of the passed in value. This will often, but not
 * always, have a 1:1 relationship with the value's constructor. `Undefined` and
 * `Null` are obvious exceptions.
 *
 * @param value any value including null and undefined are acceptable here
 * @returns the internal JSVM underlying type of the value. Note that in most cases
 * this will refer to the supplied value's constructor. In cases of Null and
 * Undefined, these types exist but are not exposed for use by the programmer in
 * JavaScript.
 */
const typeOf = (value) => /(\w+)]/.exec(Object.prototype.toString.call(value))[1];
/**
 * An array of constructor names, including 'Null', that are serializable via JSON
 * without any additional code. This array allows the engineer to perform operations
 * such as:
 *
 * ```
 * if (jsonPrimitives.includes(typeOf(value))) {
 *   ...
 * }
 * ```
 *
 * @type String[]
 */
const jsonPrimitives = [String.name, Number.name, Array.name, Object.name, Boolean.name, 'Null'];
/**
 * The Historical class is a generic class for tracking the history of a value.
 * It provides options to store historical values, implement undo/redo
 * functionality, and register callbacks for value changes.
 *
 * @template T - The type of value being tracked.
 */
export class Historical {
    /**
     * The current value of type T.
     */
    _value;
    /**
     * An array of objects storing the historical values along with their
     * timestamps.
     */
    _lastValues = [];
    /**
     * Timestamp of the last value update.
     */
    _when = Date.now();
    /**
     * The maximum number of historical values to store.
     */
    _howMany;
    /**
     * The options provided to this instance when it was created initially. These
     * are consumed once again during serialization.
     */
    options;
    /**
     * An array of callback functions that are triggered whenever the value changes.
     * Each callback function takes the new value, old value, and the timestamp
     * of the change as arguments.
     */
    _callbacks = [];
    /**
     * Stack used to store previous values for the undo functionality.
     */
    _undoStack = [];
    /**
     * Stack used to store reverted values for the redo functionality.
     */
    _redoStack = [];
    /**
     * Flag to indicate whether undo/redo functionality is enabled.
     */
    _enableUndoRedo;
    /**
     * Optional handler for managing complex types during serialization and
     * deserialization. If provided, allows custom processing of the Historical
     * object's state.
     */
    _typeHandler;
    /**
     * A BehaviorSubject that emits the current value of the historical data each time
     * it changes. This is used to provide an observable stream of value changes,
     * which can be subscribed to in an Angular environment.
     */
    _valueChanges;
    /**
     * A BehaviorSubject that tracks the availability of the undo operation. It emits
     * a boolean value indicating whether an undo action can be performed. This is
     * useful for enabling or disabling UI elements related to undo functionality.
     */
    _undoAvailable;
    /**
     * A BehaviorSubject similar to _undoAvailable, but for the redo operation. It
     * emits a boolean value indicating whether a redo action can be performed,
     * aiding in the reactive enablement or disablement of redo-related UI elements.
     */
    _redoAvailable;
    /**
     * Initializes a new instance of the Historical class.
     *
     * @param value - The initial value of type T.
     * @param options - Configuration options for the Historical instance. Includes
     * the number of historical values to store (`howMany`) and a flag to enable or
     * disable undo/redo functionality (`enableUndoRedo`), or a serialization /
     * deserialization type handler for complex types
     */
    constructor(value, options = {
        howMany: 5,
        enableUndoRedo: false,
        typeHandler: undefined,
    }) {
        this._value = value;
        this._howMany = options.howMany || 5;
        this._enableUndoRedo = options.enableUndoRedo || false;
        this.options = options;
        // Initialize RxJS BehaviorSubjects
        this._valueChanges = new BehaviorSubject(value);
        this._undoAvailable = new BehaviorSubject(false);
        this._redoAvailable = new BehaviorSubject(false);
    }
    /**
     * Gets the current value.
     */
    get value() {
        return this._value;
    }
    /**
     * Provides an Observable stream of the value changes. This getter allows
     * subscribers to reactively listen to changes in the historical value. It is
     * particularly useful in frameworks like Angular where components may need to
     * update their state or UI in response to changes in the historical data.
     *
     * @returns An Observable that emits the current value each time it changes.
     */
    get valueChanges() {
        return this._valueChanges.asObservable();
    }
    /**
     * Sets the current value, updates the historical values, and manages undo/redo
     * stacks if enabled. Triggers registered callbacks with the new value.
     *
     * @param newValue - The new value to set.
     */
    set value(newValue) {
        if (this._enableUndoRedo) {
            this._undoStack.push(this._value);
            this._redoStack = []; // Clear the redo stack on new change
        }
        const oldValue = this._value;
        this._value = newValue;
        this._when = Date.now();
        this._lastValues.push({ value: oldValue, when: this._when });
        if (this._lastValues.length > this._howMany) {
            this._lastValues.shift();
        }
        // Trigger callbacks
        this.triggerCallbacks(newValue, oldValue);
        // Notify subscribers about the value change
        this._valueChanges.next(this._value);
    }
    /**
     * Gets the most recent historical value, or null if no history is present.
     */
    get last() {
        return this._lastValues.length ? this._lastValues[this._lastValues.length - 1].value : null;
    }
    /**
     * Gets all the previous values along with their timestamps.
     */
    get allPreviousValues() {
        return this._lastValues;
    }
    /**
     * Gets the timestamp of the last value update.
     */
    get when() {
        return this._when;
    }
    /**
     * Sets the value if it's different from the current value.
     *
     * @param newValue - The new value to consider.
     * @returns A boolean indicating if the value was changed.
     */
    setIfChanged(newValue) {
        if (newValue !== this._value) {
            this.value = newValue;
            return true;
        }
        return false;
    }
    /**
     * Checks if the provided value is different from the current value.
     *
     * @param newValue - The value to compare against the current value.
     * @returns A boolean indicating if the value is different.
     */
    isDifferent(newValue) {
        return newValue !== this._value;
    }
    // MARK: - Event Listeners
    /**
     * Registers a callback to be executed on value change.
     *
     * @param callback - The callback function to register.
     */
    registerCallback(callback) {
        this._callbacks.push(callback);
    }
    /**
     * Deregisters a callback.
     *
     * @param callback - The callback function to deregister.
     */
    deregisterCallback(callback) {
        this._callbacks = this._callbacks.filter(cb => cb !== callback);
    }
    /**
     * Retrieves historical entries before a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries before the given timestamp.
     */
    filterBefore(timestamp) {
        return this._lastValues.filter(entry => entry.when < timestamp);
    }
    /**
     * Retrieves historical entries after a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries after the given timestamp.
     */
    filterAfter(timestamp) {
        return this._lastValues.filter(entry => entry.when > timestamp);
    }
    // MARK: - Filtering and searching methods
    /**
     * Searches for historical entries with a specific value.
     *
     * @param value - The value to search for.
     * @returns An array of historical entries matching the given value.
     */
    findByValue(value) {
        return this._lastValues.filter(entry => entry.value === value);
    }
    /**
     * Filters historical entries based on a custom predicate function.
     *
     * @param predicate - A function that takes an entry and returns a boolean.
     * @returns An array of historical entries that satisfy the predicate.
     */
    filterByPredicate(predicate) {
        return this._lastValues.filter(predicate);
    }
    // MARK: - Undo/Redo functionality
    /**
     * Undoes the last change if undo/redo functionality is enabled. Reverts to the
     * previous value and updates the redo stack. Triggers any necessary updates or
     * callbacks related to the change.
     *
     * @returns A boolean indicating whether the undo operation was successful.
     */
    undo() {
        if (!this._enableUndoRedo || this._undoStack.length === 0) {
            return false;
        }
        const oldValue = this._value;
        const previousValue = this._undoStack.pop();
        this._redoStack.push(oldValue);
        this._value = previousValue;
        this._when = Date.now();
        this.triggerCallbacks(this._value, oldValue);
        // Update observables
        this._undoAvailable.next(this._undoStack.length > 0);
        this._redoAvailable.next(this._redoStack.length > 0);
        return true;
    }
    /**
     * Redoes the last undone change if undo/redo functionality is enabled. Applies
     * the next value in the redo stack and updates the undo stack. Triggers any
     * necessary updates or callbacks related to the change.
     *
     * @returns A boolean indicating whether the redo operation was successful.
     */
    redo() {
        if (!this._enableUndoRedo || this._redoStack.length === 0) {
            return false;
        }
        const oldValue = this._value;
        const nextValue = this._redoStack.pop();
        this._undoStack.push(oldValue);
        this._value = nextValue;
        this._when = Date.now();
        this.triggerCallbacks(this._value, oldValue);
        // Update observables
        this._undoAvailable.next(this._undoStack.length > 0);
        this._redoAvailable.next(this._redoStack.length > 0);
        return true;
    }
    /**
     * Provides an Observable stream indicating the availability of the undo operation.
     * This getter allows subscribers, such as Angular components, to reactively listen
     * to changes in the undo availability (e.g., for enabling/disabling an undo button
     * in the UI).
     *
     * @returns An Observable that emits a boolean value indicating whether an undo
     *          operation is currently available.
     */
    get undoAvailable() {
        return this._undoAvailable.asObservable();
    }
    /**
     * Provides an Observable stream indicating the availability of the redo operation.
     * Similar to `undoAvailable`, this getter enables reactive UI updates in response
     * to changes in the redo operation's availability (e.g., updating the state of a
     * redo button in the UI).
     *
     * @returns An Observable that emits a boolean value indicating whether a redo
     *          operation is currently available.
     */
    get redoAvailable() {
        return this._redoAvailable.asObservable();
    }
    // MARK: - Private functions
    /**
     * Triggers the registered callbacks with the necessary information.
     *
     * @param newValue - The new value after the change.
     * @param oldValue - The value before the change occurred.
     */
    triggerCallbacks(newValue, oldValue) {
        this._callbacks.forEach(callback => {
            try {
                callback(newValue, oldValue, this._when);
            }
            catch (error) {
                console.error('Error executing callback:', error);
            }
        });
    }
    // MARK: - Serialization
    /**
     * Serializes the current state of the Historical object into a JSON string.
     *
     * @returns A JSON string representing the current state of the object.
     */
    serialize() {
        let state = {
            currentValue: this._value,
            history: this._lastValues,
            options: this.options,
        };
        // Check if the type of _value is a JSON serializable primitive
        if (this._typeHandler) {
            state = this._typeHandler.onSerialize(state);
        }
        else if (!jsonPrimitives.includes(typeOf(this._value))) {
            console.warn('Non-serializable type detected. Defaulting to null.');
            state.currentValue = null;
        }
        return JSON.stringify(state);
    }
    // MARK: - Static values
    /**
     * Deserializes a JSON string into a Historical object.
     *
     * @param json - The JSON string to deserialize.
     * @returns A new instance of Historical initialized with the deserialized data.
     * @throws Will throw an error if the JSON string is invalid.
     */
    static deserialize(json, typeHandler) {
        let data;
        try {
            data = JSON.parse(json);
        }
        catch (error) {
            throw new Error('Invalid JSON format for deserialization.');
        }
        const historical = new Historical(data.currentValue, data.options);
        if (typeHandler) {
            const processedData = typeHandler.onDeserialize(data);
            historical._lastValues = processedData.history;
            historical._value = processedData.currentValue;
        }
        else {
            historical._lastValues = data.history;
        }
        return historical;
    }
    /**
     * Creates a new Historical instance from a given value.
     *
     * @param value - The initial value for the new Historical instance.
     * @param howMany - The maximum number of historical values to store (default is 5).
     * @returns A new instance of Historical.
     */
    static from(value, options = {
        howMany: 5,
        enableUndoRedo: false,
        typeHandler: undefined,
    }) {
        return new Historical(value, options);
    }
}
//# sourceMappingURL=historical.angular.js.map