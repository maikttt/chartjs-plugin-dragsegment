import {drag} from 'd3-drag';
import {select} from 'd3-selection';

let datasetSegments = null;
let datasetPoints = null;
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

function eventsQueueHorizontalDir() {
  if (eventsQueue.length < 2) {
    return 0;
  }
  const [lastEvent, prevEvent] = eventsQueue;
  return prevEvent.x - lastEvent.x;
}

function moveElementY(chartInstance, datasetIndex, elementIndex) {
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

function moveElementX(chartInstance, datasetIndex, elementIndex) {
  const element = chartInstance.getDatasetMeta(datasetIndex).data[elementIndex];
  const scaleName = element._xScale.id;
  const chartScale = chartInstance.scales[scaleName];
  const mouseStep = eventsQueueHorizontalDir();
  const chartStep = chartScale.getValueForPixel(
    chartScale.getPixelForValue(0) - mouseStep
  );
  return chartInstance.data.datasets[datasetIndex].data[elementIndex].x + chartStep;
}

function calcData(chartInstance, datasetSegments, datasetPoints) {
  const data = {};

  if (datasetSegments.length) {
    datasetSegments.forEach((segments, dsi) => {
      const d = {};
      segments.forEach(([pi, qi]) => {
        d[pi] = {
          y: moveElementY(chartInstance, dsi, pi)
        };
        d[qi] = {
          y: moveElementY(chartInstance, dsi, qi)
        };
      });
      data[dsi] = d;
    });
  }

  if (datasetPoints) {
    datasetPoints.forEach((points, dsi) => {
      if (!data[dsi]) {
        data[dsi] = {}
      }
      points.map((pi) => {
        const x = moveElementX(chartInstance, dsi, pi);
        if (x !== undefined) {
          if (!data[dsi][pi]) {
            data[dsi][pi] = {};
          }
          data[dsi][pi].x = x;
        }
      })
    });
  }

  return data;
}

function calcSegmentsToMoveVertical(chartInstance, event) {
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

function calcPointsToMoveHorizontal(chartInstance, event) {
  datasetPoints = [];
  chartInstance._getSortedVisibleDatasetMetas()
  .map((dataset) => {
    const points = [];
    for (let i = 0; i < dataset.data.length; i++) {
      if (event.x <= dataset.data[i]._view.x) {
        points.push(i);
      }
    }
    datasetPoints.push(points);
  });
}

function dragSegmentStart(chartInstance, vertical, horizontal) {
  return (event) => {
    eventInQueue(event);
    if (vertical) {
      calcSegmentsToMoveVertical(chartInstance, event);
    }
    if (horizontal) {
      calcPointsToMoveHorizontal(chartInstance, event);
    }
  }
}

function dragSegmentDrag(chartInstance, callback) {
  return (event) => {
    eventInQueue(event);
    if (datasetSegments.length || datasetPoints.length) {
      let toUpdate = true;
      let data = calcData(chartInstance, datasetSegments, datasetPoints);

      if (typeof callback == 'function') {
        toUpdate = callback(chartInstance, data);
        if (toUpdate === undefined) {
          toUpdate = true;
        }
      }

      if (toUpdate) {
        Object.keys(data).forEach((dsi) => {
          const points = data[dsi];
          Object.keys(points).forEach((i) => {
            if (points[i].y !== undefined) {
              chartInstance.data.datasets[dsi].data[i].y = points[i].y;
            }
            if (points[i].x !== undefined) {
              chartInstance.data.datasets[dsi].data[i].x = points[i].x;
            }
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
    datasetPoints = [];
  }
}

const ChartJSdragSegment = {
  id: 'dragSegment',
  afterInit(chartInstance) {
    if (chartInstance.config.type == 'line' && chartInstance.options.dragSegment) {
      const options = Object.assign({
        vertical: true,
        horizontal: false,
      }, chartInstance.options.dragSegment);

      select(chartInstance.chart.canvas).call(
        drag().container(chartInstance.chart.canvas)
          .on('start', dragSegmentStart(chartInstance, options.vertical, options.horizontal))
          .on('drag', dragSegmentDrag(chartInstance, options.onDrag))
          .on('end', dragSegmentEnd(chartInstance))
      );
    }
  }
};

export default ChartJSdragSegment;
