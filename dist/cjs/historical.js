"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Historical_instances, _a, _Historical_value, _Historical_lastValues, _Historical_when, _Historical_howMany, _Historical_callbacks, _Historical_undoStack, _Historical_redoStack, _Historical_enableUndoRedo, _Historical_typeHandler, _Historical_triggerCallbacks, _Historical_applyStringTag;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Historical = void 0;
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
class Historical {
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
        _Historical_instances.add(this);
        /**
         * The current value of type T.
         */
        _Historical_value.set(this, void 0);
        /**
         * An array of objects storing the historical values along with their
         * timestamps.
         */
        _Historical_lastValues.set(this, []);
        /**
         * Timestamp of the last value update.
         */
        _Historical_when.set(this, Date.now());
        /**
         * The maximum number of historical values to store.
         */
        _Historical_howMany.set(this, void 0);
        /**
         * An array of callback functions that are triggered whenever the value changes.
         * Each callback function takes the new value, old value, and the timestamp
         * of the change as arguments.
         */
        _Historical_callbacks.set(this, []);
        /**
         * Stack used to store previous values for the undo functionality.
         */
        _Historical_undoStack.set(this, []);
        /**
         * Stack used to store reverted values for the redo functionality.
         */
        _Historical_redoStack.set(this, []);
        /**
         * Flag to indicate whether undo/redo functionality is enabled.
         */
        _Historical_enableUndoRedo.set(this, void 0);
        /**
         * Optional handler for managing complex types during serialization and
         * deserialization. If provided, allows custom processing of the Historical
         * object's state.
         */
        _Historical_typeHandler.set(this, void 0);
        __classPrivateFieldSet(this, _Historical_howMany, options?.howMany || 5, "f");
        __classPrivateFieldSet(this, _Historical_enableUndoRedo, options?.enableUndoRedo || false, "f");
        __classPrivateFieldSet(this, _Historical_typeHandler, options?.typeHandler, "f");
        this.options = _a.HistoricalOptions({
            howMany: __classPrivateFieldGet(this, _Historical_howMany, "f"),
            enableUndoRedo: __classPrivateFieldGet(this, _Historical_enableUndoRedo, "f"),
            typeHandler: __classPrivateFieldGet(this, _Historical_typeHandler, "f"),
        });
        __classPrivateFieldSet(this, _Historical_value, value, "f");
        __classPrivateFieldSet(this, _Historical_when, Date.now(), "f");
    }
    /**
     * Gets the current value.
     */
    get value() {
        return __classPrivateFieldGet(this, _Historical_value, "f");
    }
    /**
     * Sets the current value, updates the historical values, and manages undo/redo
     * stacks if enabled. Triggers registered callbacks with the new value.
     *
     * @param newValue - The new value to set.
     */
    set value(newValue) {
        const oldValue = __classPrivateFieldGet(this, _Historical_value, "f");
        const entry = _a.ValueEntry(oldValue, __classPrivateFieldGet(this, _Historical_when, "f") ?? Date.now());
        __classPrivateFieldGet(this, _Historical_lastValues, "f").push(entry);
        if (__classPrivateFieldGet(this, _Historical_enableUndoRedo, "f")) {
            __classPrivateFieldGet(this, _Historical_undoStack, "f").push(__classPrivateFieldGet(this, _Historical_value, "f"));
            __classPrivateFieldSet(this, _Historical_redoStack, [], "f"); // Clear the redo stack on new change
        }
        __classPrivateFieldSet(this, _Historical_value, newValue, "f");
        __classPrivateFieldSet(this, _Historical_when, Date.now(), "f");
        while (__classPrivateFieldGet(this, _Historical_lastValues, "f").length > __classPrivateFieldGet(this, _Historical_howMany, "f")) {
            __classPrivateFieldGet(this, _Historical_lastValues, "f").shift();
        }
        // Trigger callbacks
        __classPrivateFieldGet(this, _Historical_instances, "m", _Historical_triggerCallbacks).call(this, newValue, oldValue);
    }
    /**
     * Gets the most recent historical value, or null if no history is present.
     */
    get last() {
        return __classPrivateFieldGet(this, _Historical_lastValues, "f").length
            ? __classPrivateFieldGet(this, _Historical_lastValues, "f")[__classPrivateFieldGet(this, _Historical_lastValues, "f").length - 1].value
            : null;
    }
    /**
     * Gets all the previous values along with their timestamps.
     */
    get allPreviousValues() {
        return __classPrivateFieldGet(this, _Historical_lastValues, "f");
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
        return __classPrivateFieldGet(this, _Historical_when, "f");
    }
    /**
     * Sets the value if it's different from the current value.
     *
     * @param newValue - The new value to consider.
     * @returns A boolean indicating if the value was changed.
     */
    setIfChanged(newValue) {
        if (newValue !== __classPrivateFieldGet(this, _Historical_value, "f")) {
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
        return newValue !== __classPrivateFieldGet(this, _Historical_value, "f");
    }
    // MARK: - Event Listeners
    /**
     * Registers a callback to be executed on value change.
     *
     * @param callback - The callback function to register.
     */
    registerCallback(callback) {
        __classPrivateFieldGet(this, _Historical_callbacks, "f").push(callback);
    }
    /**
     * Deregisters a callback.
     *
     * @param callback - The callback function to deregister.
     */
    deregisterCallback(callback) {
        __classPrivateFieldSet(this, _Historical_callbacks, __classPrivateFieldGet(this, _Historical_callbacks, "f").filter((cb) => cb !== callback), "f");
    }
    /**
     * Retrieves historical entries before a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries before the given timestamp.
     */
    filterBefore(timestamp) {
        return __classPrivateFieldGet(this, _Historical_lastValues, "f").filter((entry) => entry.when < timestamp);
    }
    /**
     * Retrieves historical entries after a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries after the given timestamp.
     */
    filterAfter(timestamp) {
        return __classPrivateFieldGet(this, _Historical_lastValues, "f").filter((entry) => entry.when > timestamp);
    }
    // MARK: - Filtering and searching methods
    /**
     * Searches for historical entries with a specific value.
     *
     * @param value - The value to search for.
     * @returns An array of historical entries matching the given value.
     */
    findByValue(value) {
        return __classPrivateFieldGet(this, _Historical_lastValues, "f").filter((entry) => entry.value === value);
    }
    /**
     * Filters historical entries based on a custom predicate function.
     *
     * @param predicate - A function that takes an entry and returns a boolean.
     * @returns An array of historical entries that satisfy the predicate.
     */
    filterByPredicate(predicate) {
        return __classPrivateFieldGet(this, _Historical_lastValues, "f").filter(predicate);
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
        if (!__classPrivateFieldGet(this, _Historical_enableUndoRedo, "f") || __classPrivateFieldGet(this, _Historical_undoStack, "f").length === 0) {
            return false;
        }
        const oldValue = __classPrivateFieldGet(this, _Historical_value, "f");
        const previousValue = __classPrivateFieldGet(this, _Historical_undoStack, "f").pop();
        __classPrivateFieldGet(this, _Historical_redoStack, "f").push(oldValue);
        __classPrivateFieldSet(this, _Historical_value, previousValue, "f");
        __classPrivateFieldSet(this, _Historical_when, Date.now(), "f");
        __classPrivateFieldGet(this, _Historical_instances, "m", _Historical_triggerCallbacks).call(this, __classPrivateFieldGet(this, _Historical_value, "f"), oldValue);
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
        if (!__classPrivateFieldGet(this, _Historical_enableUndoRedo, "f") || __classPrivateFieldGet(this, _Historical_redoStack, "f").length === 0) {
            return false;
        }
        const oldValue = __classPrivateFieldGet(this, _Historical_value, "f");
        const nextValue = __classPrivateFieldGet(this, _Historical_redoStack, "f").pop();
        __classPrivateFieldGet(this, _Historical_undoStack, "f").push(oldValue);
        __classPrivateFieldSet(this, _Historical_value, nextValue, "f");
        __classPrivateFieldSet(this, _Historical_when, Date.now(), "f");
        __classPrivateFieldGet(this, _Historical_instances, "m", _Historical_triggerCallbacks).call(this, __classPrivateFieldGet(this, _Historical_value, "f"), oldValue);
    }
    // MARK: - Serialization
    /**
     * Serializes the current state of the Historical object into a JSON string.
     *
     * @returns A JSON string representing the current state of the object.
     */
    serialize() {
        let state = {
            currentValue: __classPrivateFieldGet(this, _Historical_value, "f"),
            history: __classPrivateFieldGet(this, _Historical_lastValues, "f"),
            options: this.options,
        };
        // Check if the type of _value is a JSON serializable primitive
        if (__classPrivateFieldGet(this, _Historical_typeHandler, "f")) {
            state = __classPrivateFieldGet(this, _Historical_typeHandler, "f").onSerialize(state);
        }
        else if (!jsonPrimitives.includes(typeOf(__classPrivateFieldGet(this, _Historical_value, "f")))) {
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
        const historical = new _a(data.currentValue, data.options);
        if (typeHandler) {
            const processedData = typeHandler.onDeserialize(data);
            __classPrivateFieldSet(historical, _Historical_lastValues, processedData.history, "f");
            __classPrivateFieldSet(historical, _Historical_value, processedData.currentValue, "f");
        }
        else {
            __classPrivateFieldSet(historical, _Historical_lastValues, data.history, "f");
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
        return new _a(value, options);
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
        return __classPrivateFieldGet(this, _a, "m", _Historical_applyStringTag).call(this, {
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
        return __classPrivateFieldGet(this, _a, "m", _Historical_applyStringTag).call(this, {
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
        return __classPrivateFieldGet(this, _a, "m", _Historical_applyStringTag).call(this, {
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
}
exports.Historical = Historical;
_a = Historical, _Historical_value = new WeakMap(), _Historical_lastValues = new WeakMap(), _Historical_when = new WeakMap(), _Historical_howMany = new WeakMap(), _Historical_callbacks = new WeakMap(), _Historical_undoStack = new WeakMap(), _Historical_redoStack = new WeakMap(), _Historical_enableUndoRedo = new WeakMap(), _Historical_typeHandler = new WeakMap(), _Historical_instances = new WeakSet(), _Historical_triggerCallbacks = function _Historical_triggerCallbacks(newValue, oldValue) {
    __classPrivateFieldGet(this, _Historical_callbacks, "f").forEach((callback) => {
        try {
            callback(newValue, oldValue, __classPrivateFieldGet(this, _Historical_when, "f"));
        }
        catch (error) {
            console.error("Error executing callback:", error);
        }
    });
}, _Historical_applyStringTag = function _Historical_applyStringTag(object, tagName) {
    Object.defineProperty(object, Symbol.toStringTag, {
        get() { return tagName; },
        enumerable: false,
        configurable: true,
    });
    return object;
};
//# sourceMappingURL=historical.js.map