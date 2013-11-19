var _ = require('underscore'),
    debug = require('debug')('Job'),
    Parser = require('./parser'),
    EventEmitter = require('events').EventEmitter,
    Proxy = require('./proxy');


/**
 * Job Constructor
 *
 * A job is for a given resource. It contains at least one
 * Proxy and at least one Parser. It also re-emits events
 * received from the Parser & Proxy for Roach to listen to.
 *
 * @param {string} url
 * @param {string} name
 * @api public
 */
function Job( url, name, options ) {
  debug("New Job Named: '%s' with URL %s", name, url);

  var self = this;

  this.parseTriggered = false;
  this._name = name;
  this._url = url;
  this._emitter = new EventEmitter();
  this._proxy = new Proxy(url, options);
  this._proxy.on('document', this.document, this);
  this._proxy.on('error', this.errorHandler, this);

  //name for job door
  this._parser = new Parser(name);

  // the done event is emitted once all the filters are applied
  this._parser.on('done', this.exit, this);
  this._parser.on('error', this.errorHandler, this);
  this._parser.on('parsed', this.parsed, this);
}


Job.prototype.on = function( name, callback, scope ) {
  this._emitter.on( name, _.bind( callback, scope ) );
};


/**
 * Lazily add a filter to the parser
 *
 *
 * @param {string} fpath - Filter path (either custom or in default filters)
 * @param {object} params - Parameter(s) passed to the filter
 * @return {Job} this
 * @api public
 */
Job.prototype.filter = function( fpath, params ) {
  this._parser.filter.call(this._parser, fpath, params);

  return this;
};


/**
 * Returns the proxy for this Job
 *
 * @return {Proxy}
 * @api public
 */
Job.prototype.getProxy = function(){
  return this._proxy;
};


/**
 * Adds a filter function directly to the parser
 *
 * Could be used publicly but filter() is preferred.
 *
 * @param {function} callback - The filter function to be called
 * @param {object} params - Parameter(s) passed to the filter
 * @api public
 */
Job.prototype.addFilter = function(callback, params){
  this._parser.addFilter.call(this._parser, arguments);
};


/**
 * Kicks off the job by calling fetch() on its Proxy
 *
 * @api public
 */
Job.prototype.run = function(){
    this._proxy.fetch();
};


/**
 * Event Handlers
 * ------------------------------------------
 */
Job.prototype.document = function(document){
  this._parser.setDocument(document);
  this._parser.applyFilters();
};


Job.prototype.parsed = function(type, data){
  this.parseTriggered = true;

  // We re-emit this event for roach to listen to
  this._emitter.emit('job:parsed', type, data);
};


Job.prototype.exit = function(name){
  this._emitter.emit('exit', name);
};


Job.prototype.errorHandler = function(error){
  this._emitter.emit('error', error);
};

module.exports = Job;
