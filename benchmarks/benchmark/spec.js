var spec ={
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "A searchable, stacked area chart of U.S. occupations from 1850 to 2000.",
  "width": 800,
  "height": 500,
  "padding": 5,


  "data": [
    {
      "name": "jobs",
      "url": "data/jobs.json",
      "transform": [
        {
          "type": "stack",
          "field": "perc",
          "groupby": ["year"],
          "sort": {
            "field": ["job", "sex"],
            "order": ["descending", "descending"]
          }
        }
      ]
    },
    {
      "name": "series",
      "source": "jobs",
      "transform": [
        {
          "type": "aggregate",
          "groupby": ["job", "sex"],
          "fields": ["perc", "perc"],
          "ops": ["sum", "argmax"],
          "as": ["sum", "argmax"]
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "x",
      "type": "linear",
      "range": "width",
      "zero": false, "round": true,
      "domain": {"data": "jobs", "field": "year"}
    },
    {
      "name": "y",
      "type": "linear",
      "range": "height", "round": true, "zero": true,
      "domain": {"data": "jobs", "field": "y1"}
    },
    {
      "name": "color",
      "type": "ordinal",
      "domain": ["men", "women"],
      "range": ["#33f", "#f33"]
    },
    {
      "name": "alpha",
      "type": "linear", "zero": true,
      "domain": {"data": "series", "field": "sum"},
      "range": [0.4, 0.8]
    },
    {
      "name": "font",
      "type": "sqrt",
      "range": [0, 20], "round": true, "zero": true,
      "domain": {"data": "series", "field": "argmax.perc"}
    },
    {
      "name": "opacity",
      "type": "quantile",
      "range": [0, 0, 0, 0, 0, 0.1, 0.2, 0.4, 0.7, 1.0],
      "domain": {"data": "series", "field": "argmax.perc"}
    },
    {
      "name": "align",
      "type": "quantize",
      "range": ["left", "center", "right"], "zero": false,
      "domain": [1730, 2130]
    },
    {
      "name": "offset",
      "type": "quantize",
      "range": [6, 0, -6], "zero": false,
      "domain": [1730, 2130]
    }
  ],

  "axes": [
    {
      "orient": "bottom", "scale": "x", "format": "d", "tickCount": 15
    },
    {
      "orient": "right", "scale": "y", "format": "%",
      "grid": true, "domain": false, "tickSize": 12,
      "encode": {
        "grid": {"enter": {"stroke": {"value": "#ccc"}}},
        "ticks": {"enter": {"stroke": {"value": "#ccc"}}}
      }
    }
  ],

  "marks": [
    {
      "type": "group",
      "name": "hi",
      "from": {
        "data": "series",
        "facet": {
          "name": "facet",
          "data": "jobs",
          "groupby": ["job", "sex"]
        }
      },

      "marks": [
        {
          "type": "area",
          "from": {"data": "facet"},
          "encode": {
            "enter": {
              "x": {"scale": "x", "field": "year"},
              "y": {"scale": "y", "field": "y0"},
              "y2": {"scale": "y", "field": "y1"},
              "fill": {"scale": "color", "field": "sex"},
              "fillOpacity": {"scale": "alpha", "field": {"parent": "sum"}}
            }
          }
        }
      ]
    },
    {
      "type": "text",
      "from": {"data": "hi"},
      "interactive": false,
      "encode": {
        "enter": {
          "fontSize": {value: 10},
          "text": {"field": "datum.job"}
        }
      },
      "transform": [
        {"type": "label", "size": {"signal": "[width, height]"}, "avoidBaseMark": true, "method": "floodfill"}
      ]
    }
  ]
}

 
;

module.exports = { spec: spec };