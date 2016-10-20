/*jslint browser: true */
/*global Config */
/*global $ */
/*global _ */
/*global log */


var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};

/*
 * @param {Object} options
 * 		@prop {String} codes - String used in the url to retrieve the model's data.
 * @returns {PORTAL.MODELS.cachedCodes}
 *      @prop {Function} fetch
 *      @prop {Function} getAll
 *     @prop {Function} getLookups
 */
PORTAL.MODELS.cachedCodes = function (options) {
	"use strict";
	var self = {};

	var cachedData = [];

	/*
	 * @return {$.Promise}.
	 * 		@resolve {Array of Objects} - Each object has String properties: id, desc, and providers.
	 * 	    @reject {String} - the error message.
	 */
	self.fetch = function () {
		var fetchDeferred = $.Deferred();
		var URL = Config.CODES_ENDPOINT + '/' + options.codes;
		$.ajax({
			url: URL,
			type: 'GET',
			data: {
				mimeType: 'json'
			},
			success: function (data, textStatus, jqXHR) {
				cachedData = _.map(data.codes, function (code) {
					return {
						id: code.value,
						desc: (_.has(code, 'desc') && (code.desc)) ? code.desc : code.value, // defaults to value
						providers: code.providers
					};
				});

				fetchDeferred.resolve(cachedData);
			},

			error: function (jqXHR, textStatus, error) {
				log.error('Can\'t  get ' + options.codes + ', Server error: ' + error);
				fetchDeferred.reject(error);
			}
		});
		return fetchDeferred.promise();
	};

	/*
	 * @returns {Array of Objects} - Each object has String properties: id, desc, and providers. This is the
	 * same object that is returned with the last successfully fetch.
	 */
	self.getAll = function () {
		return cachedData;
	};

	/*
	 * @returns {Object} - The object in the model with the matching id property. Object contains id, desc, and providers
	 * 		properties. Return undefined if no object exists
	 */
	self.getLookup = function (id) {
		return _.find(cachedData, function (lookup) {
			return (lookup.id === id);
		});
	};

	return self;
};
/*
 *
 * @param {Object} options -
 *          @prop {String} codes - Used in the ajax url to retrieve the data
 *          @prop {String} keyParameter - the parameter name to use to retrieve the appropriate data subset
 *          @prop {Function} parseKey - function takes a lookup item and returns a string for the key it represents.
 * @returns {PORTAL.MODELS.codesWithKeys}
 *          @prop {Function} fetch
 * 			@prop {Function} getAll
 * 			@prop {Function} getAllKeys
 *			@prop {Function} getDataForKey
 *
 */
PORTAL.MODELS.codesWithKeys = function (options) {
	"use strict";
	var self = {};

	var cachedData = [];
	/* Each object where each value is an array of objects with properties id, desc, and providers */

	/*
	 * @param {Array of String} keys - the set of keys to be used when retrieving the lookup codes
	 * @returns {Jquery.Promise}
	 * 		@resolve {Array of Objects} - each object is a lookup with id, desc, and providers properties.
	 * 		@reject {String} descriptive error string
	 */
	self.fetch = function (keys) {
		var fetchDeferred = $.Deferred();
		var URL = Config.CODES_ENDPOINT + '/' + options.codes;

		$.ajax({
			url: URL + '?' + options.keyParameter + '=' + keys.join(';'),
			type: 'GET',
			data: {
				mimeType: 'json'
			},
			success: function (data, textStatus, jqXHR) {
				cachedData = _.map(keys, function (key) {
					return {
						key: key,
						data: _.chain(data.codes)
							.filter(function (lookup) {
								return (options.parseKey(lookup.value) === key);
							})
							.map(function (lookup) {
								return {
									id: lookup.value,
									desc: (_.has(lookup, 'desc') && (lookup.desc)) ? lookup.desc : lookup.value, // defaults to value
									providers: lookup.providers
								};
							})
							.value()
					};
				});
				fetchDeferred.resolve(self.getAll());
			},
			error: function (jqXHR, textStatus, error) {
				log.error('Can\'t get ' + options.codes + ', Server error: ' + error);
				fetchDeferred.reject(error);
			}
		});

		return fetchDeferred.promise();
	};

	/*
	 * @return {Array of Object} - Object has id, desc, and providers string properties
	 */
	self.getAll = function () {
		return _.chain(cachedData).pluck('data').flatten().value();
	};

	/*
	 * @return {Array of String}
	 */
	self.getAllKeys = function () {
		return _.pluck(cachedData, 'key');
	};

	/*
	 * @return {Array of Objects} - Each object is a lookup with id, desc, and providers properties. Return undefined if that key
	 * is not in the model
	 */
	self.getDataForKey = function (key) {
		var isMatch = function (object) {
			return object.key === key;
		};
		var lookup = _.find(cachedData, isMatch);
		if (lookup) {
			return lookup.data;
		}
		else {
			return undefined;
		}
	};

	return self;
};