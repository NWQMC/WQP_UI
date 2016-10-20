/* jslint browser:true */
/* global $ */
/* global _ */
/* global Config */
/* global log */

var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};

PORTAL.MODELS.providers = function () {
	"use strict";
	var ids = [];

	return {
		/*
		 * @return {$.Deferred.promise} which is resolved if the fetch of providers is a success and rejected with the errors
		 * message if the request fails.
		 */
		fetch: function () {
			var deferred = $.Deferred();
			$.ajax({
				url: Config.CODES_ENDPOINT + '/providers',
				data: {mimeType: 'json'},
				type: 'GET',
				success: function (data, textStatus, jqXHR) {
					ids = [];
					$.each(data.codes, function (index, code) {
						ids.push(code.value);
					});
					deferred.resolve();
				},
				error: function (jqXHR, textStatus, error) {
					ids = [];
					log.error('Unable to retrieve provider list with error: ' + error);
					deferred.reject(error);
				}
			});
			return deferred.promise();
		},

		/*
		 * @return {Array of String} of provider id strings
		 */
		getIds: function () {
			return ids;
		},

		/*
		 * Parses availableProviders, removes providers that are not in the model. If the string contains all of the ids
		 * in the model, then return 'all' otherwise return a comma separated list of the valid providers.
		 * @param {String} availableProviders - Space separated list of providers
		 * @return {String}
		 */
		formatAvailableProviders: function (availableProviders /* String containing space separated list of providers */) {
			var isValidId = function(id) {
				return _.contains(ids, id);
			};
			var availableList = availableProviders.split(' ');
			var resultList = _.filter(availableList, isValidId);

			if (resultList.length === ids.length) {
				return 'all';
			}
			else {
				return resultList.join(', ');
			}
		}
	};
}();


