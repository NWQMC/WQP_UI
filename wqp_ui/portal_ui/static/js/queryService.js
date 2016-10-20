/*jslint browser: true*/
/* global log */
/* global _ */
/* global $ */
/* global Config */
/* global log */
/* global numeral */

var PORTAL = PORTAL || {};

PORTAL.queryServices = (function () {
	"use strict";
	var self = {};

	/*
	 * @param {String} resultType - 'Station' or 'Result'
	 * @param {Array of Objects with name and value properties representing query parameters} queryParamArray
	 * @param {Array of Strings} providers - The application's providers.
	 * @return {Jquery.Promise}
	 * 		@resolve {Object} - If the counts are successfully fetched this object will contain a 'total' property and
	 * 			properties for each provider. This property values will be an object with sites and results properties which
	 * 			will contain the counts for that provider (or total)
	 * 		@reject {String} - If the fetch fails, returns an error message.
	 */
	self.fetchQueryCounts = function(resultType, queryParamArray, providers) {
		var deferred = $.Deferred();

		var queryParamJson = PORTAL.UTILS.getQueryParamJson(queryParamArray);
		var countQueryJson = _.omit(queryParamJson, ['mimeType', 'zip', 'sorted']);

		var formatCount = function(countData, key) {
			var countString = _.has(countData, key) ? countData[key] : '0';
			return numeral(countString).format('0,0');
		};

		$.ajax({
			url : Config.QUERY_URLS[resultType] + '/count?mimeType=json',
			method : 'POST',
			contentType : 'application/json',
			data : JSON.stringify(countQueryJson),
			success : function(data) {
				var result = {
					total : {
						sites : formatCount(data, 'Total-Site-Count'),
						results : formatCount(data, 'Total-Result-Count')
					}
				};
				_.each(providers, function(provider) {
					result[provider] = {
						sites : formatCount(data, provider + '-Site-Count'),
						results : formatCount(data, provider + '-Result-Count')
					};
				});
				log.debug('Successfully got counts');
				deferred.resolve(result);
			},
			error: function(jqXHR, textStatus) {
				log.error('Unable to contact the WQP services: ' + textStatus);
				deferred.reject('Unable to contact the WQP services: ' + textStatus);
			}
		});

		return deferred.promise();
	};

	/*
	 * @param {String} resultType
	 * @param {String} queryParams - a query string
	 * @returns {String} - the url and query params to download data
	 */
	self.getFormUrl = function (resultType, queryParams) {
		var result = Config.QUERY_URLS[resultType];
		if (queryParams) {
			result = result + '?' + queryParams;
		}
		return result;
	};

	return self;

}());



