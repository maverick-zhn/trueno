"use strict";

/*
 ________                                                 _______   _______
 /        |                                               /       \ /       \
 $$$$$$$$/______   __    __   ______   _______    ______  $$$$$$$  |$$$$$$$  |
 $$ | /      \ /  |  /  | /      \ /       \  /      \ $$ |  $$ |$$ |__$$ |
 $$ |/$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$  |/$$$$$$  |$$ |  $$ |$$    $$<
 $$ |$$ |  $$/ $$ |  $$ |$$    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$$$$$$  |
 $$ |$$ |      $$ \__$$ |$$$$$$$$/ $$ |  $$ |$$ \__$$ |$$ |__$$ |$$ |__$$ |
 $$ |$$ |      $$    $$/ $$       |$$ |  $$ |$$    $$/ $$    $$/ $$    $$/
 $$/ $$/        $$$$$$/   $$$$$$$/ $$/   $$/  $$$$$$/  $$$$$$$/  $$$$$$$/
 */

/** In God we trust
 * @author Victor Santos, Servio Palacios
 * @date_creation 2016.08.19.
 * @module lib/search/search-manager.js
 * @description Elastic Search Super Class
 *
 */

const Search = require('./search-client');

//Local Libraries
var Enums = require("./enum/enums");

/** The search indexing super class */
class SearchManager {

  /**
   * Create a search object.
   * @param {object} [param={}] - Parameter with default value of object {}.
   */
  constructor(param = {}) {

    /** New instance of Elastic Search Indexing Class */
    this._search = null;

    this._host = param.host || 'http://localhost';

    this._port = param.port || 8004;

  }//constructor

  /**
   * Create a elasticSearch connector and init the search manager
   * @return {promise} The promise with the initialization results.
   */
  init() {

    /* This instance object reference */
    let self = this;
    /* instantiate the search client */
    this._search = new Search({host: this._host, port: this._port});
    /* Initializing and returning promise */
    return this._search.init();
  }

  /**
   * Insert the component, update will be done if id is provided and only for existing fields
   * @return {promise} The promise with the results.
   */

  //TODO
  //helpers, graphExists, use _

  // persist(obj, idx, type) {
  //
  //   let self = this;
  //
  //   return new Promise((resolve, reject) => {
  //
  //     if (obj.id)
  //     {
  //       //update()
  //       //vertex or edge y no existe error
  //       //
  //       console.log("if id");
  //     }
  //     else {
  //
  //       console.log(obj);
  //       if (type === 'g') {
  //
  //         console.log("before exists");
  //         self._search.indexExists(idx).then((exist)=> {//move this before if
  //
  //           console.log("later exists", exist);
  //           if(exist) {
  //             reject("graph already exists " + idx);
  //           }
  //           else {
  //
  //             self._search.initIndex(idx).then((result)=> {
  //
  //               console.log('Graph Index for '+idx+' created:',result);
  //               return self._search.insert(obj,idx,type);
  //
  //             }).then((result)=>{
  //
  //
  //               console.log('Graph Index for '+idx+' body created:',result);
  //               resolve();
  //             },(error)=>{
  //               console.log(error);
  //             })
  //             .catch((error) => {
  //               reject("Error creating graph index " + idx);
  //             });
  //           }
  //         });
  //
  //       }
  //     }
  //
  //   });//promise
  // }


  persist(obj, idx, type) {

    let self = this;

    return new Promise((resolve, reject) => {

      /* If id does not exist and it is a graph object, create graph and insert graph body */
      if (!obj.id && type === 'g') {

        self._search.indexExists(idx).then((exist)=> {
          if (exist) {
            console.log('Graph Already Exists!');
            reject('Graph Already Exists', idx);
          } else {
            self._search.initIndex(idx).then((result)=> {
              console.log('Graph Index for ' + idx + ' created:', result);
              return self._search.insert(obj, idx, type);
            }, (error)=> {
              reject(error);
            }).then((result)=> {
              console.log('Graph Index for ' + idx + ' body created:', result);
              resolve();
            }, (error)=> {
              reject(error);
            });
          }
        })
      }


    });
  }

  insert(idx, type, obj) {

    return this._search.insert(obj, idx, type);

  }

  /**
   * Update the component. id is required.
   * @return {promise} The promise with the results.
   */
  update() {

    let self = this;

  }

  /**
   * Delete a document with the provided id.
   * @return {promise} The promise with the results.
   */
  delete() {
    //TODO
    //crear metodo para verificar si existe el index

    let self = this;

  }//delete

  /**
   * Build filter from parameters received in external-api.js
   * @param {Array} filters - Array of filter rules to be build.
   * @return {Bodybuilder} - The filter object.
   */
  buildFilter(filters) {

    /* The bodybuilder filter instance */
    let oFilter = this._search.filterFactory();

    filters.forEach((filterRule) => {

      /* The filter function(not, and or) */
      let filterFnc;
      /* determining the filter function */
      switch (filterRule.ftr) {
        case 'AND':
          filterFnc = 'filter';
          break;
        case 'OR':
          filterFnc = 'orFilter';
          break;
        case 'NOT':
          filterFnc = 'notFilter';
          break;
      }

      switch (filterRule.type) {
        /* Three parameter filters */
        case Enums.filterType.TERM:
        case Enums.filterType.PREFIX:
        case Enums.filterType.REGEXP:
        case Enums.filterType.WILDCARD:
          /* executing the and|or|not filter(filterFnc) with the term, prefix, regexp, or wildcard filters */
          oFilter = oFilter[filterFnc](filterRule.type, filterRule.prop, filterRule.val);
          break;
        case Enums.filterType.EXISTS:
          /* executing the and|or|not filter(filterFnc) with the exists or missing filters */
          oFilter = oFilter[filterFnc](filterRule.type, 'field', filterRule.prop);
          break;
        case Enums.filterType.SIZE:
          /* executing the size limit filter */
          oFilter = oFilter.size(filterRule.val);
          break;
        case Enums.filterType.RANGE:
          let range = {};
          range[filterRule.op] = filterRule.val;
          oFilter = oFilter[filterFnc](filterRule.type, filterRule.prop, range);
      }
    });

    return oFilter;

  }//buildFilter


  /**
   * Fetch requested components to client.
   */
  fetch(type) {

    let self = this;

    var componentType = new Map();

    //return self._search.search(self._builtFilter, self._index, componentType[type]);

  }//fetch

}//class

/* Exporting the module */
module.exports = SearchManager;