import {drag} from 'd3-drag';
import {select} from 'd3-selection';

let datasetSegments = null;
let eventsQueue = [];

function isXBetween(x, a, b, strict = false) {
  const d = (a - x) * (b - x);
  return strict ? d < 0 : d <= 0;
}

function eventInQueue(e) {
  eventsQueue.unshift(e);
  if (eventInQueue.length > 2) {
    eventsQueue.pop();
  }
}

function eventsQueueVerticalDir() {
  if (eventsQueue.length < 2) {
    return 0;
  }
  const [lastEvent, prevEvent] = eventsQueue;
  return prevEvent.y - lastEvent.y;
}

function moveElement(chartInstance, datasetIndex, elementIndex) {
  const element = chartInstance.getDatasetMeta(datasetIndex).data[elementIndex];
  const scaleName = chartInstance.config.type === 'radar' ? '_scale' : '_yScale';
  const chartScale = chartInstance.scales[ element[scaleName].id ];
  const mouseStep = eventsQueueVerticalDir();

  // There should be an another (easier) way (using chart instance)
  // to calc. how many units on chart has moved mouse
  const chartStep = chartScale.getValueForPixel(
    chartScale.getPixelForValue(0) - mouseStep
  );

  // throw new Error("Stop herer")
  // WARNING:
  // const d = chartInstance.data.datasets[datasetIndex];
  // ... modify d ...
  // chartInstance.data.datasets[datasetIndex] = d;
  // doesn't work. Should check why
  chartInstance.data.datasets[datasetIndex].data[elementIndex].y += chartStep;
}

function dragSegmentStart(chartInstance) {
  return (event) => {
    eventInQueue(event);
    datasetSegments = [];
    chartInstance._getSortedVisibleDatasetMetas()
    .map(dataset => {
      const diSegments = [];
      for (let i = 1; i < dataset.data.length; i++) {
        const prev = dataset.data[i - 1]._view;
        const curr = dataset.data[i]._view;
        if (isXBetween(event.x, prev.x, curr.x)) {
          diSegments.push([i - 1, i]);
        }
      }
      datasetSegments.push(diSegments);
    });
  }
}

function dragSegmentDrag(chartInstance) {
  return (event) => {
    eventInQueue(event);
    if (datasetSegments.length) {
      datasetSegments.map((segments, dsi) => {
        segments.map(([pi, qi]) => {
          moveElement(chartInstance, dsi, pi);
          moveElement(chartInstance, dsi, qi);
        });
      });
      chartInstance.update(0);
    }
  }
}

function dragSegmentEnd(chartInstance) {
  return () => {
    datasetSegments = null;
    eventsQueue = [];
  }
}

const ChartJSdragSegment = {
  id: 'dragSegment',
  afterInit(chartInstance) {
    if (chartInstance.options.dragSegment) {
      select(chartInstance.chart.canvas).call(
        drag().container(chartInstance.chart.canvas)
          .on('start', dragSegmentStart(chartInstance))
          .on('drag', dragSegmentDrag(chartInstance))
          .on('end', dragSegmentEnd(chartInstance))
      );
    }
  }
};

export default ChartJSdragSegment;
