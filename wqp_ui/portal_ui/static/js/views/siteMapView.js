/* jslint browser: true */
/* global _gaq */
/* global $ */
/* global _ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};
/*
 * Managed the Site map and its controls.
 * @param {Object} options
 * 		@param {Jquery element} $container - contains the map and its controls
 * 		@param {PORTAL.VIEWS.downloadProgressDialog} downloadProgressDialog
 * 		@param {PORTAL.VIEWS.downloadFormView} downloadFormView
 * @return {Object}
 	* 	@func initialize
 */
PORTAL.VIEWS.siteMapView = function(options) {
	"use strict";

	var self = {};

	var STATION_RESULTS = 'Station';

	var mapId = 'query-results-map';

	var identifyDialog;
	var portalDataMap;

	/*
	 * Initialize the site map and all of it's controls
	 */
	self.initialize = function() {
		identifyDialog = PORTAL.VIEWS.identifyDialog({
			$dialog : $('#map-info-dialog'),
			$popover : options.$container.find('#map-popover')
		});
		portalDataMap = PORTAL.MAP.siteMap({
			mapDivId : mapId,
			$loadingIndicator : options.$container.find('#map-loading-indicator'),
			$legendDiv : options.$container.find('#query-map-legend-div .legend-container'),
			$sldSelect : options.$container.find('#sld-select-input'),
			identifyDialog : identifyDialog
		});

		var $mapContainer = options.$container.find('#query-map-container');
		var $legendContainer = options.$container.find('#query-map-legend-div');
		var $map = options.$container.find('#' + mapId);
		var $showHideBtn = options.$container.find('.show-hide-toggle');

		// The map div's height should always be set to the height its parent div.
		// OpenLayers will not draw the layer if the height of the map div is not set explictly.
		$map.height($mapContainer.height());
		$(window).resize(function() {
			var mapContainerHeight = $mapContainer.height();

			if (mapContainerHeight !== $map.height()) {
				$map.height(mapContainerHeight);
			}
		});

		identifyDialog.initialize(portalDataMap.clearBoxIdFeature);
		portalDataMap.initialize();

		// Add click handler for map show/hide button
		$showHideBtn.click(function() {
			var isVisible = PORTAL.UTILS.toggleShowHideSections($(this), $mapContainer);
			if (isVisible) {
				portalDataMap.render();
				$legendContainer.show();
			}
			else {
				$legendContainer.hide();
			}
		});

		// Add click handler for Show Sites button
		options.$container.find('#show-on-map-button').click(function () {
			var queryParamArray = options.downloadFormView.getQueryParamArray();
			var queryString = PORTAL.UTILS.getQueryString(queryParamArray);
			var siteIds = _.filter(queryParamArray, function(param) {
				return param.name === 'siteid';
			});

			var showMap = function (totalCount) {
				// Show the map if it is currently hidden
				if ($mapContainer.is(':hidden')) {
					$showHideBtn.click();
				}

				_gaq.push([
					'_trackEvent',
					'Portal Map',
					'MapCreate',
					decodeURIComponent(queryString),
					parseInt(totalCount)
				]);

				portalDataMap.updateSitesLayer(queryParamArray);
			};

			if (!options.downloadFormView.validateDownloadForm()) {
				return;
			}

			if (siteIds.length > 50) {
				options.downloadProgressDialog.show('map',
					'Unable to map sites. The query contains too many sites to be mapped. Downloads are still available');
			}
			else {
				_gaq.push([
					'_trackEvent',
					'Portal Map',
					'MapCount',
					decodeURIComponent(queryString)
				]);


				options.downloadProgressDialog.show('map');
				PORTAL.queryServices.fetchQueryCounts(STATION_RESULTS, queryParamArray, PORTAL.MODELS.providers.getIds())
					.done(function (counts) {
						var fileFormat = 'xml';
						options.downloadProgressDialog.updateProgress(counts, STATION_RESULTS, fileFormat, showMap);
					})
					.fail(function (message) {
						options.downloadProgressDialog.cancelProgress(message);
					});
			}
		});
	};

	return self;
};