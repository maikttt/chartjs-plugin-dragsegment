import {drag} from 'd3-drag';
import {select} from 'd3-selection';

function dragSegmentStart() {
  console.log("Drag start");
}

function dragSegmentDrag() {
  console.log("Dragging");
}

function dragSegmentEnd() {
  console.log("Drag end");
}

const ChartJSdragSegment = {
  id: 'dragSegment',
  afterInit(chartInstance) {
    if (chartInstance.options.dragSegment) {
      select(chartInstance.chart.canvas).call(
        drag().container(chartInstance.chart.canvas)
          .on('start', dragSegmentStart)
          .on('drag', dragSegmentDrag)
          .on('end', dragSegmentEnd)
      );
    }
  }
};

export default ChartJSdragSegment;
