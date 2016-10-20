/* jslint browser: true */

var PORTAL = PORTAL || {};

PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Initializes the windows which show the various API calls
 * @param {Object} options
 * 		@prop {Jquery element} $container - The container containing the show button and the query windows.
 * 		@prop {Function} getQueryParamArray - Returns the current query parameter array
 	* 		@returns {Array of Objects with name and value properties}
 */
PORTAL.VIEWS.showAPIView = function(options) {
	"use strict";

	var self = {};

	self.initialize = function() {
		var $apiQueryDiv = options.$container.find('#api-queries-div');
		var $sitesText = options.$container.find('#sites-query-div textarea');
		var $resultsText = options.$container.find('#results-query-div textarea');
		var $wfsText = options.$container.find('#getfeature-query-div textarea');

		options.$container.find('#show-queries-button').click(function() {
			var queryParamArray = options.getQueryParamArray();
			var queryString = PORTAL.UTILS.getQueryString(queryParamArray);

			$apiQueryDiv.show();
			$sitesText.html(PORTAL.queryServices.getFormUrl('Station', queryString));
			$resultsText.html(PORTAL.queryServices.getFormUrl('Result', queryString));
			$wfsText.html(PORTAL.MAP.siteLayer.getWfsGetFeatureUrl(queryParamArray));
		});
	};

	return self;

};

