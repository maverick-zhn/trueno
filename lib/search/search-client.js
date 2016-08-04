"use strict";


/** Import modules */
const elasticsearch = require('elasticsearch');

/** The search indexing class */
class Search {

  /**
   * Create a search object.
   * @param {object} [param= {}] - Parameter with default value of object {}.
   */
  constructor(param = {}) {
    /* Exposing host and port */
    this._host = param.host || 'http://localhost';
    this._port = param.port || 8004;
    this._client = null;
  }

  /**
   * Initialize the search module, this will connect to the indexing search engine.
   * @return {promise} The promise with the connection result.
   */
  init() {

    /* This instance object reference */
    let self = this;

    return new Promise((resolve, reject)=> {
      self._client = new elasticsearch.Client({
        host: self._host + ':' + self._port,
        //log: 'trace'
      });
      /* trying ping the search engine */
      self._client.ping({
        requestTimeout: 10000
      }, (error)=> {
        if (error) {
          //logger.error('Elasticsearch cluster is down!', error);
          reject(error);
        } else {
          //logger.info('Elasticsearch ping successful');
          /* Resolve sync promise */
          resolve(self._host + ':' + self._port);
        }
      });
    });
  }

  /**
   * Create index with the provided name and add mapping.
   * @param {string} idx - The index name to be created.
   * @return {promise} The promise with the true/false result.
   */
  initIndex(idx) {
    /* This instance object reference */
    let self = this;

    return this._client.indices.create({
      index: idx
    });
  }

  /**
   * Check if index exist.
   * @param {string} idx - The index name to be created.
   * @return {promise} The promise with the true/false result.
   */
  indexExists(idx) {
    return this._client.indices.exists({
      index: idx
    });
  }

  /**
   * Deletes provided index.
   * @param {string} idx - The index name to be created.
   * @return {promise} The promise with the true/false result.
   */
  deleteIndex(idx) {
    return this._client.indices.delete({
      index: idx
    });
  }

  /**
   * List all indexes in the engine.
   * @return {promise} The promise with the indexes list.
   */
  listIndexes() {
    return this._client.indices.getAliases();
  }


  /**
   * Insert the component, update will be done if id is provided and only for existing fields, new fields need to use
   * the update function.
   * @param {component} c - The graph component, can be a graph, edge, or vertex.
   * @return {promise} The promise with the results.
   */
  insert(c, index, type) {

    /* This instance object reference */
    let self = this;

    /* Promise for the search results */
    return new Promise((resolve, reject)=> {

      /* Building the query */
      let obj = self._buildObject(c, index, type);

      /* execute search */
      self._client.index(obj).then((response)=> {

        resolve(response);

      }, (error) => {
        reject(error.message);
      });
    });
  }

  /**
   * Update the component. id is required.
   * @param {component} c - The graph component, can be a graph, edge, or vertex.
   * @return {promise} The promise with the results.
   */
  update(c, index, type) {

    /* This instance object reference */
    let self = this;

    /* Promise for the search results */
    return new Promise((resolve, reject)=> {

      /* Building the query */
      let obj = self._buildObject(c, index, type, true);

      //console.log(obj);

      /* execute search */
      self._client.update(obj).then((response)=> {

        resolve(response);

      }, (error) => {
        reject(error.message);
      });
    });
  }

  /**
   * Delete a document with the provided id.
   * @param {component} c - The document to be deleted, must contain id, type, and index.
   * @return {promise} The promise with the results.
   */
  delete(c, index, type) {

    /* This instance object reference */
    let self = this;

    /* Promise for the search results */
    return new Promise((resolve, reject)=> {

      /* Building the query */
      let obj = self._buildObject(c, index, type);

      /* execute search */
      self._client.delete(obj).then((response)=> {

        resolve(response);

      }, (error) => {
        reject(error.message);
      });
    });
  }

  /**
   * Search the elastic search engine for matching results.
   * @param {component} c - The graph component, can be a graph, edge, or vertex.
   * @return {promise} The promise with the results.
   */
  search(c, index, type) {

    /* This instance object reference */
    let self = this;

    /* Promise for the search results */
    return new Promise((resolve, reject)=> {

      /* Building the query */
      let q = self._buildQuery(c, index, type)

      /* execute search */
      self._client.search(q).then((response)=> {

        resolve(response.hits.hits);

      }, (error) => {

        reject(error.message);
      });
    });
  }

  /**
   * Count the elastic search engine matching results.
   * @param {component} c - The graph component, can be a graph, edge, or vertex.
   * @return {promise} The promise with the counter.
   */
  count(c, index, type) {

    /* This instance object reference */
    let self = this;

    /* Promise for the search results */
    return new Promise((resolve, reject)=> {

      /* Building the query */
      let q = self._buildQuery(c);

      /* execute search */
      self._client.count(q).then((response)=> {

        resolve(response);

      }, (error) => {
        reject(error.message);
      });
    });
  }

  /**
   * Builds the search query with the provided component information.
   * @param {component} c - The graph component, can be a graph, edge, or vertex.
   * @return {string} The query string for the elasticsearch engine.
   */
  _buildQuery(c, index, type) {

    return c;
  }

  /**
   * Builds the object to be inserted/updated and indexed in the elasticsearch engine.
   * @param {component} c - The graph component, can be a graph, edge, or vertex.
   * @return {object} The elasticsearch object parameter.
   */
  _buildObject(c, index, type, isUpdate) {

    /* instantiate the object */
    let obj = {
      index: index,
      type: type
    };
    /* if the id is present, assign */
    if (c.hasOwnProperty('id')) {
      obj.id = c.id;
    }
    /* check if update */
    if (isUpdate) {
      obj.body = {doc: c};
    } else {
      obj.body = c;
    }
    /* return object parameter */
    return obj;
  }
}


/* exporting the module */
module.exports = Search;