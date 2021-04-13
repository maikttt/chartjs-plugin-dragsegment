# chartjs-plugin-dragsegment

A plugin for Chart.js

Add ability to drag segments (line chartsjs).

![Drag segments plugin animation](https://i.ibb.co/ZXTpkcc/687474703a2f2f3138382e3133382e3230372e3137352f63686172746a732f766f6c746167652e676966.gif)

**[Demo](https://codepen.io/maikttt/pen/jOVvMNY)**

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

If `dragSegment` is `Object` it contain plugin options.

```js
new Chart(ctx, {
  type: 'line',
  options: {
    // ...
    dragSegment: {
      // allow to drag segments verticaly (default: true)
      vertical: true,

      // allow to drag segments horizontaly (default: false)
      horizontal: false,

      // onDrag will be executed before coordinates updating
      // @chart - ChartJS instance
      // @points - Object , of points {x, y} for each dataset, witch will update their coordinates
      //   points = {
      //     datasetIndex: {
      //       elementIndex: {
      //         x // optional, not present if not modified
      //         y // optional, not present if not modified
      //       }
      //     }
      //   }
      //   You can set new values (add, remove, ...) for points
      onDrag(chart, points) {
        if (Math.random() < 0.5) {
          return false;
        }
        return true;
      }
    }
    // ...
  }
);
```
