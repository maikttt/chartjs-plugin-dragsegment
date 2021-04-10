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
  // const scaleName = chartInstance.config.type === 'radar' ? '_scale' : '_yScale';
  const scaleName = '_yScale'; // chartInstance is allways type 'line'
  const chartScale = chartInstance.scales[ element[scaleName].id ];
  const mouseStep = eventsQueueVerticalDir();

  // There should be an another (easier) way (using chart instance)
  // to calc. how many units on chart has moved mouse
  const chartStep = chartScale.getValueForPixel(
    chartScale.getPixelForValue(0) - mouseStep
  );

  return chartInstance.data.datasets[datasetIndex].data[elementIndex].y + chartStep;
}

function calcData(chartInstance, datasetSegments) {
  const data = {};
  datasetSegments.forEach((segments, dsi) => {
    const d = {};
    segments.forEach(([pi, qi]) => {
      d[pi] = moveElement(chartInstance, dsi, pi);
      d[qi] = moveElement(chartInstance, dsi, qi);
    });
    data[dsi] = d;
  });
  return data;
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

function dragSegmentDrag(chartInstance, callback) {
  return (event) => {
    eventInQueue(event);
    if (datasetSegments.length) {
      let data = calcData(chartInstance, datasetSegments);
      let update = true;

      if (typeof callback == 'function') {
        update = callback(chartInstance, data);
        if (update === undefined) {
          update = true;
        }
      }

      if (update) {
        Object.keys(data).forEach((dsi) => {
          const segments = data[dsi];
          Object.keys(segments).forEach((i) => {
            chartInstance.data.datasets[dsi].data[i].y = segments[i];
          })
        });
        chartInstance.update(0);
      }
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
    if (chartInstance.config.type == 'line' && chartInstance.options.dragSegment) {
      select(chartInstance.chart.canvas).call(
        drag().container(chartInstance.chart.canvas)
          .on('start', dragSegmentStart(chartInstance))
          .on('drag', dragSegmentDrag(chartInstance, chartInstance.options.dragSegment.onDrag))
          .on('end', dragSegmentEnd(chartInstance))
      );
    }
  }
};

export default ChartJSdragSegment;
