var sizes = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000];
// var sizes = [4000, 8000];
var hwRatio = 500 / 800;

function resize(spec, size, labeler, id) {
  var height = size * hwRatio;
  spec["width"] = size;
  spec["height"] = height;
  spec["padding"] = 5 * size / 1000;
  
  // chart size
  spec["marks"][1]["transform"][0]["size"] = [size, height, {id: id, num_point: 220, chart_width: size, }];
  // spec["marks"][3]["transform"][0]["size"] = [size, height, {id: id}];

  // labeler
  spec["marks"][1]["transform"][0]["method"] = labeler;
  // spec["marks"][3]["transform"][0]["method"] = labeler;
  
  // line width
  // spec["marks"][0]["encode"]["enter"]["strokeWidth"]["value"] = 0.5 * size / 1000;
  // spec["marks"][2]["encode"]["update"]["strokeWidth"]["value"] = 0.5 * size / 1000;

  // point radius
  // spec["marks"][1]["encode"]["update"]["size"]["value"] = Math.pow(1 * size / 1000, 2) * Math.PI;
  // spec["marks"][3]["encode"]["update"]["size"]["value"] = Math.pow(1.5 * size / 1000, 2) * Math.PI;

  // font size
  spec["marks"][1]["encode"]["enter"]["fontSize"]["value"] = 5 * size / 1000;
  // spec["marks"][3]["encode"]["enter"]["fontSize"]["value"] = 5 * size / 1000;

  return spec;
}

export default {
  resize: resize,
  hwRatio: hwRatio,
  sizes: sizes
};