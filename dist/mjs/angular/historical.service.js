var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
import { Historical } from './historical.angular.js';
/**
 * Service that manages instances of Historical class. This service acts as a centralized
 * store and provides these instances to different components within an Angular application.
 */
let HistoricalService = class HistoricalService {
    /**
     * A map to store Historical instances, keyed by a unique string.
     */
    historicalInstances = new Map();
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
    getHistorical(key, defaultValue, options) {
        if (!this.historicalInstances.has(key)) {
            this.historicalInstances.set(key, new Historical(defaultValue, options));
        }
        return this.historicalInstances.get(key);
    }
};
HistoricalService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], HistoricalService);
export { HistoricalService };
//# sourceMappingURL=historical.service.js.map