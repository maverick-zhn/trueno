"use strict";


/**
 * Created by: victor on 2/1/15.
 * Source: graph-lab-results.js
 * Author: victor
 * Description:
 *
 */

function GraphLabResults(options) {

  this._scope = options.scope;

}

GraphLabResults.prototype.init = function () {

  /* set empty results */
  this._scope.results = {};

};

GraphLabResults.prototype.addResult = function (r) {

  let item = {
    label: r.label,
    graph: r.graph,
    local: r.local,
    vertices: r.vertices,
    edges: r.edges,
    startTime: moment(r.startTime).format('MMMM Do YY, h:mm:ss a'),
    endTime: moment(r.endTime).format('MMMM Do YY, h:mm:ss a'),
    elapsed: moment.utc(moment(r.endTime).diff(r.startTime)).format('HH:mm:ss'),
    json: r.json,
    isQuery: false,
  };

  /* set empty results */
  this._scope.results[-r.id] = item;

};

GraphLabResults.prototype.addQueryResult = function (q) {

  let item = {
    query: q.getQuery(),
    graph: q.getGraph(),
    startTime: moment(q.getStartTime()).format('MMMM Do YY, h:mm:ss a'),
    endTime: moment(q.getEndTime()).format('MMMM Do YY, h:mm:ss a'),
    elapsed: moment.utc(moment(q.getEndTime()).diff(q.getStartTime())).format('HH:mm:ss'),
    res: q.getResult(),
    isQuery: true,
  };

  /* set empty results */
  this._scope.results[-q.getId()] = item;
};

GraphLabResults.prototype.clearResults = function () {

  /* set empty results */
  this._scope.results = {};

};
