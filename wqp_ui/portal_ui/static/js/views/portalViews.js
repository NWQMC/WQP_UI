/*jslint browser: true */
/*global $ */
/*global _ */
/*global Config */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * @param {jquery element for select} el
 * @param {Array of Strings} ids -  to be used for select options
 * @param {Object} select2Options
 */
PORTAL.VIEWS.createStaticSelect2 = function (el, ids, select2Options) {
	"use strict";
	var defaultOptions = {
		allowClear: true,
		theme: 'bootstrap',
		data: _.map(ids, function (id) {
			return {id: id, text: id};
		})
	};
	el.select2($.extend({}, defaultOptions, select2Options));
};

/*
 * Creates a select2 which uses pageing and dynamic querying
 * @param {jquery element} el - selecting a hidden input
 * @param {Object} spec
 *    @prop {String} codes - String used in the url to retrieve the select2's data.
 *    @prop {Number} pagesize (optional) - page size to use in request. Defaults to 20
 *    @prop {Function} formatData (optional) - Function takes an Object with value, desc (optional), and providers properties and returns a string.
 * @param {Object} select2Options
 */
PORTAL.VIEWS.createPagedCodeSelect = function (el, spec, select2Options) {
	"use strict";
	spec.pagesize = (spec.pagesize) ? spec.pagesize : 20;

	if (!('formatData' in spec)) {
		spec.formatData = function (data) {
			var desc = (data.hasOwnProperty('desc') && (data.desc) ? data.desc
				: data.value);
			return desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')';
		};
	}

	var defaultOptions = {
		allowClear: true,
		theme: 'bootstrap',
		templateSelection: function (object) {
			return (_.has(object, 'id')) ? object.id : null;
		},
		ajax: {
			url: Config.CODES_ENDPOINT + '/' + spec.codes,
			dataType: 'json',
			data: function (params) {
				return {
					text: params.term,
					pagesize: spec.pagesize,
					pagenumber: params.page,
					mimeType: 'json'
				};
			},
			delay: 250,
			processResults: function (data, params) {
				var results = _.map(data.codes, function (code) {
					return {
						id: code.value,
						text: spec.formatData(code)
					};
				});
				var page = params.page || 1;

				return {
					results: results,
					pagination: {
						more : ((spec.pagesize * page) < data.recordCount)
					}
				};
			}
		}
	};
	el.select2($.extend(defaultOptions, select2Options));
};
/*
 @param {jquery element selecting a select input} el
 @param {Object} options
 @prop {Object} model - object which is created by a call to PORTAL.MODELS.cachedCodes and the data has already been fetched.
 @prop {Function} isMatch - Optional function with two parameters - term {String} which contains the search term and
 lookup {Object} representing an object in model. Should return Boolean
 @prop {Function} formatData - Optional function takes data (object with id, desc, and providers) and produces a select2 result object
 with id and text properties.
 @param {Object} select2Options
 */
PORTAL.VIEWS.createCodeSelect = function (el, options, select2Options) {
	"use strict";
	var isMatch;
	var formatData;
	var defaultOptions;

	// Assign defaults for optional parameters
	if (_.has(options, 'isMatch')) {
		isMatch = options.isMatch;
	}
	else {
		isMatch = function (term, lookup) {
			var termMatcher;
			if (term) {
				termMatcher = new RegExp(term, 'i');
				return termMatcher.test(lookup.desc);
			}
			else {
				return true;
			}
		};
	}
	if (_.has(options, 'formatData')) {
		formatData = options.formatData;
	}
	else {
		formatData = function (data) {
			return {
				id: data.id,
				text: data.desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')'
			};
		};
	}

	//Initialize the select2
	defaultOptions = {
		allowClear: true,
		theme: 'bootstrap',
		matcher: function (term, data) {
			var searchTerm = (_.has(term, 'term')) ? term.term : '';
			if (isMatch(searchTerm, options.model.getLookup(data.id))) {
				return data;
			}
			else {
				return null;
			}
		},
		templateSelection: function (data) {
			var result;
			if (_.has(data, 'id')) {
				result = data.id;
			}
			else {
				result = null;
			}
			return result;
		},
		data: _.map(options.model.getAll(), formatData)
	};

	el.select2($.extend(defaultOptions, select2Options));
};
/*
 * @param {jquery element selecting a select input} el
 * @param {Object} options
 * 		@prop {Object} model - object which is created by a call to PORTAL.MODELS.codesWithKeys
 *		@prop {Function} isMatch - Optional function with two parameters - term {Object} which contains a term property for the search term and
 *			data {Object} representing an option. Should return Boolean.
 *		@prop {Function} formatData - Optional function takes data (object with id, desc, and providers) and produces a select2 result object
 *			with id and text properties.
 *		@prop {Function} getKeys - returns an array of keys to use when retrieving valid options for this select.
 *	@param {Object} select2Options
 */
PORTAL.VIEWS.createCascadedCodeSelect = function (el, options, select2Options) {
	"use strict";
	// Assign defaults for optional parameters
	var defaultOptions = {
		allowClear: true,
		theme: 'bootstrap'
	};
	if (!_.has(options, 'isMatch')) {
		options.isMatch = function (term, data) {
			var termMatcher;
			if (term) {
				termMatcher = new RegExp(term.term, 'i');
				return termMatcher.test(data.id);
			}
			else {
				return true;
			}
		};
	}

	if (!_.has(options, 'formatData')) {
		options.formatData = function (data) {
			return {
				id: data.id,
				text: data.desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')'
			};
		};
	}

	// Set up the ajax transport property to fetch the options if they need to be refreshed,
	// otherwise use what is in the model.
	defaultOptions.ajax = {
		transport: function (params, success, failure) {
			var deferred = $.Deferred();
			var modelKeys = options.model.getAllKeys().sort();
			var selectedKeys = options.getKeys().sort();
			var filteredLookups;

			if (_.isEqual(modelKeys, selectedKeys)) {
				filteredLookups = _.filter(options.model.getAll(), function (lookup) {
					return options.isMatch(params.data.term, lookup);
				});
				deferred.resolve(filteredLookups);
			}
			else {
				options.model.fetch(selectedKeys)
					.done(function (data) {
						deferred.resolve(data);
					})
					.fail(function () {
						deferred.reject();
					});
			}
			deferred.done(success).fail(failure);

			return deferred.promise();
		},
		processResults: function (resp) {
			var result = _.map(resp, function (lookup) {
				return options.formatData(lookup);
			});
			return {results: result};
		}
	};

	el.select2($.extend(defaultOptions, select2Options));
};
