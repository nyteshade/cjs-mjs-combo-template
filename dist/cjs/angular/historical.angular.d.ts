import { Observable } from 'rxjs';
/**
 * Options for configuring the behavior of the Historical class.
 */
export interface HistoricalOptions<T> {
    /**
     * The maximum number of historical values to store.
     */
    howMany?: number;
    /**
     * Flag to enable or disable undo/redo functionality.
     */
    enableUndoRedo?: boolean;
    /**
     * Optional handler for managing complex types during serialization and
     * deserialization. If provided, allows custom processing of the Historical
     * object's state.
     */
    typeHandler?: HistoricalTypeHandler<T>;
}
/**
 * Interface for handling complex types during serialization and deserialization.
 * Allows custom processing of the Historical object's state.
 */
export interface HistoricalTypeHandler<T> {
    /**
     * Custom processing function for serialization.
     *
     * @param state - The current state of the Historical object.
     * @returns The processed state ready for serialization.
     */
    onSerialize(state: any): any;
    /**
     * Custom processing function for deserialization.
     *
     * @param state - The state to be deserialized.
     * @returns The processed state ready to be used for creating a Historical object.
     */
    onDeserialize(state: any): any;
}
/**
 * Defines the signature for callback functions used in the Historical class.
 * These callbacks are triggered whenever the tracked value changes.
 *
 * @param newValue - The new value of type T that has been set.
 * @param oldValue - The previous value of type T before the change.
 * @param timestamp - The timestamp (in milliseconds since UNIX epoch) when the
 * change occurred.
 */
export type HistoricalCallback<T> = (newValue: T, oldValue: T, timestamp: number) => void;
/**
 * The Historical class is a generic class for tracking the history of a value.
 * It provides options to store historical values, implement undo/redo
 * functionality, and register callbacks for value changes.
 *
 * @template T - The type of value being tracked.
 */
export declare class Historical<T> {
    /**
     * The current value of type T.
     */
    private _value;
    /**
     * An array of objects storing the historical values along with their
     * timestamps.
     */
    private _lastValues;
    /**
     * Timestamp of the last value update.
     */
    private _when;
    /**
     * The maximum number of historical values to store.
     */
    private _howMany;
    /**
     * The options provided to this instance when it was created initially. These
     * are consumed once again during serialization.
     */
    options: HistoricalOptions<T>;
    /**
     * An array of callback functions that are triggered whenever the value changes.
     * Each callback function takes the new value, old value, and the timestamp
     * of the change as arguments.
     */
    private _callbacks;
    /**
     * Stack used to store previous values for the undo functionality.
     */
    private _undoStack;
    /**
     * Stack used to store reverted values for the redo functionality.
     */
    private _redoStack;
    /**
     * Flag to indicate whether undo/redo functionality is enabled.
     */
    private _enableUndoRedo;
    /**
     * Optional handler for managing complex types during serialization and
     * deserialization. If provided, allows custom processing of the Historical
     * object's state.
     */
    private _typeHandler?;
    /**
     * A BehaviorSubject that emits the current value of the historical data each time
     * it changes. This is used to provide an observable stream of value changes,
     * which can be subscribed to in an Angular environment.
     */
    private _valueChanges;
    /**
     * A BehaviorSubject that tracks the availability of the undo operation. It emits
     * a boolean value indicating whether an undo action can be performed. This is
     * useful for enabling or disabling UI elements related to undo functionality.
     */
    private _undoAvailable;
    /**
     * A BehaviorSubject similar to _undoAvailable, but for the redo operation. It
     * emits a boolean value indicating whether a redo action can be performed,
     * aiding in the reactive enablement or disablement of redo-related UI elements.
     */
    private _redoAvailable;
    /**
     * Initializes a new instance of the Historical class.
     *
     * @param value - The initial value of type T.
     * @param options - Configuration options for the Historical instance. Includes
     * the number of historical values to store (`howMany`) and a flag to enable or
     * disable undo/redo functionality (`enableUndoRedo`), or a serialization /
     * deserialization type handler for complex types
     */
    constructor(value: T, options?: HistoricalOptions<T>);
    /**
     * Gets the current value.
     */
    get value(): T;
    /**
     * Provides an Observable stream of the value changes. This getter allows
     * subscribers to reactively listen to changes in the historical value. It is
     * particularly useful in frameworks like Angular where components may need to
     * update their state or UI in response to changes in the historical data.
     *
     * @returns An Observable that emits the current value each time it changes.
     */
    get valueChanges(): Observable<T>;
    /**
     * Sets the current value, updates the historical values, and manages undo/redo
     * stacks if enabled. Triggers registered callbacks with the new value.
     *
     * @param newValue - The new value to set.
     */
    set value(newValue: T);
    /**
     * Gets the most recent historical value, or null if no history is present.
     */
    get last(): T | null;
    /**
     * Gets all the previous values along with their timestamps.
     */
    get allPreviousValues(): Array<{
        value: T;
        when: number;
    }>;
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
    setIfChanged(newValue: T): boolean;
    /**
     * Checks if the provided value is different from the current value.
     *
     * @param newValue - The value to compare against the current value.
     * @returns A boolean indicating if the value is different.
     */
    isDifferent(newValue: T): boolean;
    /**
     * Registers a callback to be executed on value change.
     *
     * @param callback - The callback function to register.
     */
    registerCallback(callback: HistoricalCallback<T>): void;
    /**
     * Deregisters a callback.
     *
     * @param callback - The callback function to deregister.
     */
    deregisterCallback(callback: HistoricalCallback<T>): void;
    /**
     * Retrieves historical entries before a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries before the given timestamp.
     */
    filterBefore(timestamp: number): Array<{
        value: T;
        when: number;
    }>;
    /**
     * Retrieves historical entries after a specified timestamp.
     *
     * @param timestamp - The cutoff timestamp.
     * @returns An array of historical entries after the given timestamp.
     */
    filterAfter(timestamp: number): Array<{
        value: T;
        when: number;
    }>;
    /**
     * Searches for historical entries with a specific value.
     *
     * @param value - The value to search for.
     * @returns An array of historical entries matching the given value.
     */
    findByValue(value: T): Array<{
        value: T;
        when: number;
    }>;
    /**
     * Filters historical entries based on a custom predicate function.
     *
     * @param predicate - A function that takes an entry and returns a boolean.
     * @returns An array of historical entries that satisfy the predicate.
     */
    filterByPredicate(predicate: (entry: {
        value: T;
        when: number;
    }) => boolean): Array<{
        value: T;
        when: number;
    }>;
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
    redo(): boolean;
    /**
     * Provides an Observable stream indicating the availability of the undo operation.
     * This getter allows subscribers, such as Angular components, to reactively listen
     * to changes in the undo availability (e.g., for enabling/disabling an undo button
     * in the UI).
     *
     * @returns An Observable that emits a boolean value indicating whether an undo
     *          operation is currently available.
     */
    get undoAvailable(): Observable<boolean>;
    /**
     * Provides an Observable stream indicating the availability of the redo operation.
     * Similar to `undoAvailable`, this getter enables reactive UI updates in response
     * to changes in the redo operation's availability (e.g., updating the state of a
     * redo button in the UI).
     *
     * @returns An Observable that emits a boolean value indicating whether a redo
     *          operation is currently available.
     */
    get redoAvailable(): Observable<boolean>;
    /**
     * Triggers the registered callbacks with the necessary information.
     *
     * @param newValue - The new value after the change.
     * @param oldValue - The value before the change occurred.
     */
    private triggerCallbacks;
    /**
     * Serializes the current state of the Historical object into a JSON string.
     *
     * @returns A JSON string representing the current state of the object.
     */
    serialize(): string;
    /**
     * Deserializes a JSON string into a Historical object.
     *
     * @param json - The JSON string to deserialize.
     * @returns A new instance of Historical initialized with the deserialized data.
     * @throws Will throw an error if the JSON string is invalid.
     */
    static deserialize<T>(json: string, typeHandler?: HistoricalTypeHandler<T>): Historical<T>;
    /**
     * Creates a new Historical instance from a given value.
     *
     * @param value - The initial value for the new Historical instance.
     * @param howMany - The maximum number of historical values to store (default is 5).
     * @returns A new instance of Historical.
     */
    static from<T>(value: T, options?: HistoricalOptions<T>): Historical<T>;
}
