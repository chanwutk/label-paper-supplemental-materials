/*eslint no-console: "warn"*/
import {Transform} from 'vega-dataflow';
import {inherits, isFunction} from 'vega-util';
import layout from './LabelLayout';

var Output = [
  'x',
  'y',
  'opacity',
  'align',
  'baseline'
];
var Anchors = [
  'top-left',
  'left',
  'bottom-left',
  'top',
  'bottom',
  'top-right',
  'right',
  'bottom-right'
];
// 
var Params = [];

export default function Label(params) {
  Transform.call(this, null, params);
}

Label.Definition = {
  "type": "Label",
  "metadata": {"modifies": true},
  "params": [
    { "name": "size", "type": "number", "array": true },
    { "name": "padding", "type": "number", "default": 2},
    { "name": "avoidMarks", "type": "data", "array": true },
    { "name": "method", "type": "string", "default": "pixel"},
    { "name": "as", "type": "string", "array": true, "length": Output.length, "default": Output }
  ]
};

var prototype = inherits(Label, Transform);

prototype.transform = function(_, pulse) {
  function modp(param) {
    var p = _[param];
    return isFunction(p) && pulse.modified(p.fields);
  }

  var mod = _.modified();
  if (!(mod || pulse.changed(pulse.ADD_REM) || Params.some(modp))) return;

    var as = _.as || Output;

    // run label layout
    layout(
      pulse.materialize(pulse.SOURCE).source || [],
      _.size,
      _.sort,
      _.offset == null ? [1] : _.offset,
      _.anchor || Anchors,
      _.avoidMarks || [],
      _.avoidBaseMark !== false,
      _.lineAnchor || 'end',
      _.markIndex || 0,
      _.padding || 0,
      _.method || 'naive',
      _.size[2]
    ).forEach(l => {
      // write layout results to data stream
      var t = l.datum;
      t[as[0]] = l.x;
      t[as[1]] = l.y;
      t[as[2]] = l.opacity;
      t[as[3]] = l.align;
      t[as[4]] = l.baseline;
    });

  return pulse.reflow(mod).modifies(as);
};
