
# Historical Data Management Library

## Overview

This library provides a generic `Historical` class for tracking and managing the history of values in JavaScript and TypeScript applications. It is designed to be versatile, supporting undo/redo operations, callback registration for value changes, and serialization/deserialization functionalities. Additionally, the library offers integration with Angular applications through a dedicated service, `HistoricalService`, and an example Angular component, `MyComponent`, demonstrating its practical use.

## Installation

```js
npm install @nyteshade/ne-historical
```

## Usage

### Non-Angular Variant

#### Historical

The core of this library is the `Historical` class, which is a generic class designed for tracking the history of a value of any type.

##### Basic Usage:

```typescript
import { Historical } from './historical';

const historical = new Historical<number>(0);
historical.value = 1;
historical.value = 2;

console.log(historical.last); // Get the most recent historical value
```

##### Undo/Redo Operations:

```typescript
historical.undo();
console.log(historical.value); // Outputs the previous value

historical.redo();
console.log(historical.value); // Redoes the last undone change
```

##### Serialization/Deserialization:

```typescript
const serialized = historical.serialize();
const deserializedHistorical = Historical.deserialize<number>(serialized);
```

##### Registering Callbacks:

```typescript
historical.registerCallback((newValue, oldValue, timestamp) => {
  console.log('Value changed from', oldValue, 'to', newValue, 'at', timestamp);
});
```

### Angular Variant

#### HistoricalService

An Angular service that manages instances of `Historical`.

##### Usage in Angular Component:

```typescript
import { HistoricalService } from './historical.service';

// In your Angular component
constructor(private historicalService: HistoricalService) {}

ngOnInit() {
  const historical = this.historicalService.getHistorical('myValueKey', 0);
  // ...
}
```

#### MyComponent

An example Angular component demonstrating the usage of `HistoricalService` to manage historical data reactively.

##### Template:

```html
<!-- Component template with data bindings and controls for undo/redo -->
```

##### Component Class:

```typescript
import { Component, OnInit } from '@angular/core';
import { HistoricalService } from './historical.service';

@Component({
  selector: 'app-my-component',
  template: `<!-- Template Here -->`
})
export class MyComponent implements OnInit {
  // ...
}
```

## Contributing

(TODO: Add contribution guidelines)

## License

The code in this project is licensed under the MIT License.

### MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.