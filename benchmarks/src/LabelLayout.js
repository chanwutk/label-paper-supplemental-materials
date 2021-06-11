import {baseBitmaps, markBitmaps} from './util/markBitmaps';
import scaler from './util/scaler';
import placeAreaLabelNaive from './util/placeAreaLabel/placeNaive';
import placeAreaLabelReducedSearch from './util/placeAreaLabel/placeReducedSearch';
import placeAreaLabelFloodFill from './util/placeAreaLabel/placeFloodFill';
import placeMarkLabel from './util/placeMarkLabel';

// 8-bit representation of anchors
var TOP    = 0x0,
      MIDDLE = 0x4,
      BOTTOM = 0x8,
      LEFT   = 0x0,
      CENTER = 0x1,
      RIGHT  = 0x2;

// Mapping from text anchor to number representation
var anchorCode = {
  'top-left':     TOP + LEFT,
  'top':          TOP + CENTER,
  'top-right':    TOP + RIGHT,
  'left':         MIDDLE + LEFT,
  'middle':       MIDDLE + CENTER,
  'right':        MIDDLE + RIGHT,
  'bottom-left':  BOTTOM + LEFT,
  'bottom':       BOTTOM + CENTER,
  'bottom-right': BOTTOM + RIGHT
};

var placeAreaLabel = {
  'naive': placeAreaLabelNaive,
  'reduced-search': placeAreaLabelReducedSearch,
  'floodfill': placeAreaLabelFloodFill
};

export default function(texts, size, compare, offset, anchor,
  avoidMarks, avoidBaseMark, lineAnchor, markIndex, padding, method, config)
{
  
  // early exit for empty data
  if (!texts.length) return texts;

  var result = config;

  var before = performance.now();
  var positions = Math.max(offset.length, anchor.length),
        offsets = getOffsets(offset, positions),
        anchors = getAnchors(anchor, positions),
        marktype = markType(texts[0].datum),
        grouptype = marktype === 'group' && texts[0].datum.items[markIndex].marktype,
        isGroupArea = grouptype === 'area',
        boundary = markBoundary(marktype, grouptype, lineAnchor, markIndex),
        $ = scaler(size[0], size[1], padding),
        isNaiveGroupArea = isGroupArea && method === 'naive';

  // prepare text mark data for placing
  var data = texts.map(d => ({
    datum: d,
    opacity: 0,
    x: undefined,
    y: undefined,
    align: undefined,
    baseline: undefined,
    boundary: boundary(d)
  }));

  var bitmaps;
  if (!isNaiveGroupArea) {
    // sort labels in priority order, if comparator is provided
    if (compare) {
      data.sort((a, b) => compare(a.datum, b.datum));
    }

    // flag indicating if label can be placed inside its base mark
    var labelInside = false;
    for (var i=0; i < anchors.length && !labelInside; ++i) {
      // label inside if anchor is at center
      // label inside if offset to be inside the mark bound
      labelInside = anchors[i] === 0x5 || offsets[i] < 0;
    }

    // extract data information from base mark when base mark is to be avoided
    // base mark is implicitly avoided if it is a group area
    if (marktype && (avoidBaseMark || isGroupArea)) {
      avoidMarks = [texts.map(d => d.datum)].concat(avoidMarks);
    }

    // generate bitmaps for layout calculation
    bitmaps = avoidMarks.length
      ? markBitmaps($, avoidMarks, labelInside, isGroupArea)
      : baseBitmaps($, avoidBaseMark && data);
  }

  // generate label placement function
  var place = isGroupArea
    ? placeAreaLabel[method]($, bitmaps, avoidBaseMark, markIndex)
    : placeMarkLabel($, bitmaps, anchors, offsets);

  // place all labels
  data.forEach(d => d.opacity = +place(d));
  result.runtime = performance.now() - before;
  if (!config.noTest) {
    result.memory = 0
    result.labeler = method;
    result.placed = data.reduce(function(total, d) {
      return total + (d.opacity);
    }, 0);
    result.id = config["id"];
    result.markRenderRuntime = 0

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result) + ",");
  }

  return data;
}

function getOffsets(_, count) {
  var offsets = new Float64Array(count),
        n = _.length;
  for (var i=0; i<n; ++i) offsets[i] = _[i] || 0;
  for (i=n; i<count; ++i) offsets[i] = offsets[n - 1];
  return offsets;
}

function getAnchors(_, count) {
  var anchors = new Int8Array(count),
        n = _.length;
  for (var i=0; i<n; ++i) anchors[i] |= anchorCode[_[i]];
  for (i=n; i<count; ++i) anchors[i] = anchors[n - 1];
  return anchors;
}

function markType(item) {
  return item && item.mark && item.mark.marktype;
}

/**
 * Factory function for function for getting base mark boundary, depending
 * on mark and group type. When mark type is undefined, line or area: boundary
 * is the coordinate of each data point. When base mark is grouped line,
 * boundary is either at the beginning or end of the line depending on the
 * value of lineAnchor. Otherwise, use bounds of base mark.
 */
function markBoundary(marktype, grouptype, lineAnchor, markIndex) {
  var xy = d => [d.x, d.x, d.x, d.y, d.y, d.y];

  if (!marktype) {
    return xy; // no reactive geometry
  }

  else if (marktype === 'line' || marktype === 'area') {
    return d => xy(d.datum);
  }

  else if (grouptype === 'line') {
    return d => {
      var items = d.datum.items[markIndex].items;
      return xy(items.length
        ? items[lineAnchor === 'start' ? 0 : items.length - 1]
        : {x: NaN, y: NaN});
    };
  }

  else {
    return d => {
      var b = d.datum.bounds;
      return [b.x1, (b.x1 + b.x2) / 2, b.x2, b.y1, (b.y1 + b.y2) / 2, b.y2];
    };
  }
}
