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
const jsonPrimitives = [
    String.name, Number.name, Array.name, Object.name, Boolean.name, "Null",
];
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
    #value;
    /**
     * An array of objects storing the historical values along with their
     * timestamps.
     */
    #lastValues = [];
    /**
     * Timestamp of the last value update.
     */
    #when = Date.now();
    /**
     * The maximum number of historical values to store.
     */
    #howMany;
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
    #callbacks = [];
    /**
     * Stack used to store previous values for the undo functionality.
     */
    #undoStack = [];
    /**
     * Stack used to store reverted values for the redo functionality.
     */
    #redoStack = [];
    /**
     * Flag to indicate whether undo/redo functionality is enabled.
     */
    #enableUndoRedo;
    /**
     * Optional handler for managing complex types during serialization and
     * deserialization. If provided, allows custom processing of the Historical
     * object's state.
     */
    #typeHandler;
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
        enableUndoRedo: true,
        typeHandler: undefined,
    }) {
        this.#howMany = options?.howMany || 5;
        this.#enableUndoRedo = options?.enableUndoRedo || false;
        this.#typeHandler = options?.typeHandler;
        this.options = Historical.HistoricalOptions({
            howMany: this.#howMany,
            enableUndoRedo: this.#enableUndoRedo,
            typeHandler: this.#typeHandler,
        });
        this.#value = value;
        this.#when = Date.now();
    }
    /**
     * Gets the current value.
     */
    get value() {
        return this.#value;
    }
    /**
     * Sets the current value, updates the historical values, and manages undo/redo
     * stacks if enabled. Triggers registered callbacks with the new value.
     *
     * @param newValue - The new value to set.
     */
    set value(newValue) {
        const oldValue = this.#value;
        const entry = Historical.ValueEntry(oldValue, this.#when ?? Date.now());
        this.#lastValues.push(entry);
        if (this.#enableUndoRedo) {
            this.#undoStack.push(this.#value);
            this.#redoStack = []; // Clear the redo stack on new change
        }
        this.#value = newValue;
        this.#when = Date.now();
        while (this.#lastValues.length > this.#howMany) {
            this.#lastValues.shift();
        }
        // Trigger callbacks
        this.#triggerCallbacks(newValue, oldValue);
    }
    /**
     * Gets the most recent historical value, or null if no history is present.
     */
    get last() {
        return this.#lastValues.length
            ? this.#lastValues[this.#lastValues.length - 1].value
            : null;
    }
    /**
     * Gets all the previous values along with their timestamps.
     */
    get allPreviousValues() {
        return this.#lastValues;
    }
    /**
     * Retrieve all values with the most recent last.
     */
    get allValues() {
        return this.allPreviousValues.push([]);
    }
    /**
     * Gets the timestamp of the last value update.
     */
    get when() {
        return this.#when;
    }
    /**
     * Sets the value if it's different from the current value.
     *
     * @param newValue - The new value to consider.
     * @returns A boolean indicating if the value was changed.
     */
    setIfChanged(newValue) {
        if (newValue !== this.#value) {
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
        return newValue !== this.#value;
    }
    // MARK: - Event Listeners
    /**
     * Registers a callback to be executed on value change.
     *
     * @param callback - The callback function to register.
     */
    registerCallback(callback) {
        this.#callbacks.push(callback);
    }
    /**
     * Deregisters a callback.
     *
     * @param callback - The callback function to deregister.
     */
    deregisterCallback(callback) {
        this.#callbacks = this.#callbacks.filter((cb) => cb !== callback);
    }
    /**
     * Retrieves historical entries before a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries before the given timestamp.
     */
    filterBefore(timestamp) {
        return this.#lastValues.filter((entry) => entry.when < timestamp);
    }
    /**
     * Retrieves historical entries after a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries after the given timestamp.
     */
    filterAfter(timestamp) {
        return this.#lastValues.filter((entry) => entry.when > timestamp);
    }
    // MARK: - Filtering and searching methods
    /**
     * Searches for historical entries with a specific value.
     *
     * @param value - The value to search for.
     * @returns An array of historical entries matching the given value.
     */
    findByValue(value) {
        return this.#lastValues.filter((entry) => entry.value === value);
    }
    /**
     * Filters historical entries based on a custom predicate function.
     *
     * @param predicate - A function that takes an entry and returns a boolean.
     * @returns An array of historical entries that satisfy the predicate.
     */
    filterByPredicate(predicate) {
        return this.#lastValues.filter(predicate);
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
        if (!this.#enableUndoRedo || this.#undoStack.length === 0) {
            return false;
        }
        const oldValue = this.#value;
        const previousValue = this.#undoStack.pop();
        this.#redoStack.push(oldValue);
        this.#value = previousValue;
        this.#when = Date.now();
        this.#triggerCallbacks(this.#value, oldValue);
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
        if (!this.#enableUndoRedo || this.#redoStack.length === 0) {
            return false;
        }
        const oldValue = this.#value;
        const nextValue = this.#redoStack.pop();
        this.#undoStack.push(oldValue);
        this.#value = nextValue;
        this.#when = Date.now();
        this.#triggerCallbacks(this.#value, oldValue);
    }
    // MARK: - Private functions
    /**
    * Triggers the registered callbacks with the necessary information.
    *
    * @param newValue - The new value after the change.
    * @param oldValue - The value before the change occurred.
    */
    #triggerCallbacks(newValue, oldValue) {
        this.#callbacks.forEach((callback) => {
            try {
                callback(newValue, oldValue, this.#when);
            }
            catch (error) {
                console.error("Error executing callback:", error);
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
            currentValue: this.#value,
            history: this.#lastValues,
            options: this.options,
        };
        // Check if the type of _value is a JSON serializable primitive
        if (this.#typeHandler) {
            state = this.#typeHandler.onSerialize(state);
        }
        else if (!jsonPrimitives.includes(typeOf(this.#value))) {
            console.warn("Non-serializable type detected. Defaulting to null.");
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
            throw new Error("Invalid JSON format for deserialization.");
        }
        const historical = new Historical(data.currentValue, data.options);
        if (typeHandler) {
            const processedData = typeHandler.onDeserialize(data);
            historical.#lastValues = processedData.history;
            historical.#value = processedData.currentValue;
        }
        else {
            historical.#lastValues = data.history;
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
    /**
     * An object wrapper for the value and the date it was created. The array
     * of these values can be accessed via the property `allPreviousValues`
     *
     * @param {any} value the value this wrapper object equates to
     * @param {number} when a date time in milliseconds ala `Data.now()`
     * @returns an object wrapping the two properties `value` and `when`
     */
    static ValueEntry(value, when) {
        return this.#applyStringTag({
            /** The value this instance had before it was set to something new */
            value,
            /** A date stamp in milliseconds, as generated by `Date.now' */
            when: when ?? Date.now(),
        }, this.ValueEntry.name);
    }
    /**
     * Options for configuring the behavior of the Historical class.
     */
    static HistoricalOptions({ howMany, enableUndoRedo, typeHandler }) {
        return this.#applyStringTag({
            /**
             * The maximum number of historical values to store.
             */
            howMany,
            /**
             * Flag to enable or disable undo/redo functionality.
             */
            enableUndoRedo,
            /**
             * Optional handler for managing complex types during serialization and
             * deserialization. If provided, allows custom processing of the Historical
             * object's state.
             */
            typeHandler,
        }, this.HistoricalOptions.name);
    }
    /**
     * Interface for handling complex types during serialization and deserialization.
     * Allows custom processing of the Historical object's state. The state of the
     * value to be serialized or deserialized will be passed to each function when
     * registered to the class.
     */
    static HistoricalTypeHandler({ onSerialize, onDeserialize }) {
        return this.#applyStringTag({
            /**
             * Custom processing function for serialization.
             *
             * @param state - The current state of the Historical object.
             * @returns The processed state ready for serialization.
             */
            onSerialize,
            /**
             * Custom processing function for deserialization.
             *
             * @param state - The state to be deserialized.
             * @returns The processed state ready to be used for creating a Historical object.
             */
            onDeserialize,
        }, this.HistoricalTypeHandler.name);
    }
    /**
     * Applies a custom tag to the string representation of an object.
     *
     * This method modifies the passed object by defining a custom tag that
     * will be returned when calling `Object.prototype.toString` on the object.
     * This is achieved by defining a getter for `Symbol.toStringTag` which returns
     * the specified tag name. The property is set as non-enumerable and configurable.
     *
     * @example
     * // Creating an object
     * let myObject = {};
     *
     * // Applying a custom string tag
     * ClassName.#applyStringTag(myObject, 'CustomTag');
     *
     * // Calling toString on the object
     * console.log(Object.prototype.toString.call(myObject));
     *
     * // Output: [object CustomTag]
     *
     * @static
     * @param {Object} object - The object to which the string tag will be applied.
     * @param {string} tagName - The tag name to be set for the object.
     * @returns {Object} The object with the applied string tag.
     */
    static #applyStringTag(object, tagName) {
        Object.defineProperty(object, Symbol.toStringTag, {
            get() { return tagName; },
            enumerable: false,
            configurable: true,
        });
        return object;
    }
}
//# sourceMappingURL=historical.js.map