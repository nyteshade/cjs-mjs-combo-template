/**
 * The Historical class is a generic class for tracking the history of a value.
 * It provides options to store historical values, implement undo/redo
 * functionality, and register callbacks for value changes.
 *
 * @template T - The type of value being tracked.
 */
export class Historical<T> {
    /**
     * Deserializes a JSON string into a Historical object.
     *
     * @param json - The JSON string to deserialize.
     * @returns A new instance of Historical initialized with the deserialized data.
     * @throws Will throw an error if the JSON string is invalid.
     */
    static deserialize(json: any, typeHandler: any): Historical<any>;
    /**
     * Creates a new Historical instance from a given value.
     *
     * @param value - The initial value for the new Historical instance.
     * @param howMany - The maximum number of historical values to store (default is 5).
     * @returns A new instance of Historical.
     */
    static from(value: any, options?: {
        howMany: number;
        enableUndoRedo: boolean;
        typeHandler: undefined;
    }): Historical<any>;
    /**
     * An object wrapper for the value and the date it was created. The array
     * of these values can be accessed via the property `allPreviousValues`
     *
     * @param {any} value the value this wrapper object equates to
     * @param {number} when a date time in milliseconds ala `Data.now()`
     * @returns an object wrapping the two properties `value` and `when`
     */
    static ValueEntry(value: any, when: number): Object;
    /**
     * Options for configuring the behavior of the Historical class.
     */
    static HistoricalOptions({ howMany, enableUndoRedo, typeHandler }: {
        howMany: any;
        enableUndoRedo: any;
        typeHandler: any;
    }): Object;
    /**
     * Interface for handling complex types during serialization and deserialization.
     * Allows custom processing of the Historical object's state. The state of the
     * value to be serialized or deserialized will be passed to each function when
     * registered to the class.
     */
    static HistoricalTypeHandler({ onSerialize, onDeserialize }: {
        onSerialize: any;
        onDeserialize: any;
    }): Object;
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
    static "__#1@#applyStringTag"(object: Object, tagName: string): Object;
    /**
     * Initializes a new instance of the Historical class.
     *
     * @param value - The initial value of type T.
     * @param options - Configuration options for the Historical instance. Includes
     * the number of historical values to store (`howMany`) and a flag to enable or
     * disable undo/redo functionality (`enableUndoRedo`), or a serialization /
     * deserialization type handler for complex types
     */
    constructor(value: any, options?: {
        howMany: number;
        enableUndoRedo: boolean;
        typeHandler: undefined;
    });
    /**
     * The options provided to this instance when it was created initially. These
     * are consumed once again during serialization.
     */
    options: Object;
    /**
     * Sets the current value, updates the historical values, and manages undo/redo
     * stacks if enabled. Triggers registered callbacks with the new value.
     *
     * @param newValue - The new value to set.
     */
    set value(newValue: any);
    /**
     * Gets the current value.
     */
    get value(): any;
    /**
     * Gets the most recent historical value, or null if no history is present.
     */
    get last(): any;
    /**
     * Gets all the previous values along with their timestamps.
     */
    get allPreviousValues(): any[];
    /**
     * Retrieve all values with the most recent last.
     */
    get allValues(): number;
    /**
     * Gets the timestamp of the last value update.
     */
    get when(): number;
    /**
     * Sets the value if it's different from the current value.
     *
     * @param newValue - The new value to consider.
     * @returns A boolean indicating if the value was changed.
     */
    setIfChanged(newValue: any): boolean;
    /**
     * Checks if the provided value is different from the current value.
     *
     * @param newValue - The value to compare against the current value.
     * @returns A boolean indicating if the value is different.
     */
    isDifferent(newValue: any): boolean;
    /**
     * Registers a callback to be executed on value change.
     *
     * @param callback - The callback function to register.
     */
    registerCallback(callback: any): void;
    /**
     * Deregisters a callback.
     *
     * @param callback - The callback function to deregister.
     */
    deregisterCallback(callback: any): void;
    /**
     * Retrieves historical entries before a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries before the given timestamp.
     */
    filterBefore(timestamp: any): any[];
    /**
     * Retrieves historical entries after a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries after the given timestamp.
     */
    filterAfter(timestamp: any): any[];
    /**
     * Searches for historical entries with a specific value.
     *
     * @param value - The value to search for.
     * @returns An array of historical entries matching the given value.
     */
    findByValue(value: any): any[];
    /**
     * Filters historical entries based on a custom predicate function.
     *
     * @param predicate - A function that takes an entry and returns a boolean.
     * @returns An array of historical entries that satisfy the predicate.
     */
    filterByPredicate(predicate: any): any[];
    /**
     * Undoes the last change if undo/redo functionality is enabled. Reverts to the
     * previous value and updates the redo stack. Triggers any necessary updates or
     * callbacks related to the change.
     *
     * @returns A boolean indicating whether the undo operation was successful.
     */
    undo(): boolean;
    /**
     * Redoes the last undone change if undo/redo functionality is enabled. Applies
     * the next value in the redo stack and updates the undo stack. Triggers any
     * necessary updates or callbacks related to the change.
     *
     * @returns A boolean indicating whether the redo operation was successful.
     */
    redo(): false | undefined;
    /**
     * Serializes the current state of the Historical object into a JSON string.
     *
     * @returns A JSON string representing the current state of the object.
     */
    serialize(): string;
    #private;
}
