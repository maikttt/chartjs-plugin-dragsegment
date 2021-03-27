# chartjs-plugin-dragsegment

A plugin for Chart.js

Add ability to drag segments (line chartsjs).

![Drag segments plugin animation](http://188.138.207.175/chartjs/voltage.gif)

**[Demo](http://188.138.207.175/chartjs/)**

## Installation

Use `npm` to install plugin:

```
npm install chartjs-plugin-dragsegment
```

Register plugin in Chartjs:

```js
import Chart from 'chart.js';
import ChartJSdragSegment from 'chartjs-plugin-dragsegment';
// ...
Chart.pluginService.register(ChartJSdragSegment);
// ...
```

Or include it in your html (Chart should be available on window):

```html
<script src="node_modules/chartjs-plugin-dragsegment/dist/chartjs-plugin-dragsegment.min.js"></script>
```

## Usage

Important options in config when you create new chart:

```js
const ctx = getChartContext();
const chartConfig = {
  // ...
  type: 'line',
  // ...
  options: {
    // ...
    dragSegment: true,
    // ...
  }
};

new Chart(ctx, chartConfig);
```
