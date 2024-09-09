import { Injectable } from '@angular/core';
import { Historical, HistoricalOptions } from './historical.angular.js';

/**
 * Service that manages instances of Historical class. This service acts as a centralized
 * store and provides these instances to different components within an Angular application.
 */
@Injectable({
  providedIn: 'root'
})
export class HistoricalService {
  /**
   * A map to store Historical instances, keyed by a unique string.
   */
  private historicalInstances = new Map<string, Historical<any>>();

  /**
   * Retrieves an instance of Historical associated with the given key. If an instance
   * does not already exist for the key, a new one is created with the provided default
   * value and options.
   *
   * @param key - A unique string key to identify the Historical instance.
   * @param defaultValue - The initial value for the Historical instance.
   * @param options - Optional configuration options for the Historical instance.
   * @returns An instance of Historical associated with the specified key.
   */
  getHistorical<T>(key: string, defaultValue: T, options?: HistoricalOptions<T>): Historical<T> {
    if (!this.historicalInstances.has(key)) {
      this.historicalInstances.set(key, new Historical<T>(defaultValue, options));
    }

    return this.historicalInstances.get(key) as Historical<T>;
  }
}