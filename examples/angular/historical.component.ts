import { Component, OnInit } from '@angular/core';
import { HistoricalService } from './historical.service';

/**
 * Angular component that demonstrates the usage of HistoricalService to manage
 * historical data. It subscribes to value changes and undo/redo availability to
 * update the component's state and UI reactively.
 */
@Component({
  selector: 'app-my-component',
  template: `<!-- Component Template Here -->`
})
export class MyComponent implements OnInit {
  /**
   * The current value being managed by this component, which reflects the latest
   * value from the Historical instance.
   */
  myValue: number;

  /**
   * Injects the HistoricalService to access and manage historical data.
   *
   * @param historicalService - The service providing access to Historical instances.
   */
  constructor(private historicalService: HistoricalService) { }

  /**
   * On initialization, the component subscribes to the Historical instance corresponding
   * to 'myValue' for value changes and undo/redo availability. This allows the component
   * to reactively update its state and UI in response to these changes.
   */
  ngOnInit() {
    const historical = this.historicalService.getHistorical('myValue', 0);

    historical.valueChanges.subscribe(newValue => {
      this.myValue = newValue;
      // React to new value changes
    });

    // Example: setting a new value
    historical.value = 123;

    // Subscribing to undo/redo availability
    historical.undoAvailable.subscribe(isUndoAvailable => {
      // Enable or disable undo button based on isUndoAvailable
    });
  }
}