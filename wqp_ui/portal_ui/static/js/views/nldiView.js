/* jslint browser: true */
/* global L */
/* global $ */
/* global _ */
/* global log */
/* global Config */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates the NHLD maps, an inset map and a larger map. Only one of the maps is shown.
 * The map shown is changed by clicking the expand/collapse control in the upper right of each map.
 * Each map also contains the Navigation selector.
 * @param {Object} options
 * 		@prop {String} insetMapDivId
 * 		@prop {String} mapDivId
 * 		@prop {Jquery element} $inputContainer
 */
PORTAL.VIEWS.nldiView  = function(options) {
	"use strict";

	var self = {};

	var huc12 = '';
	var pourPtLatLng;
	var navValue = {
		id: '',
		text : ''
	};
	var distanceValue = '';

	var insetMap, map;
	var $mapDiv = $('#' + options.mapDivId);
	var $insetMapDiv = $('#' + options.insetMapDivId);

	var nldiSiteCluster, nldiFlowlineLayers;
	var insetNldiSiteCluster, insetNldiFlowlineLayers;

	var getRetrieveMessage = function() {
		return '<p>Retrieving sites ' + navValue.text.toLowerCase() + ((distanceValue) ? ' ' + distanceValue + ' km' : '') + '.</p>';
	};

	var cleanUpMaps = function() {
		if (nldiSiteCluster) {
			nldiSiteCluster.clearLayers();
			map.removeLayer(nldiSiteCluster);
		}
		if (nldiFlowlineLayers) {
			map.removeLayer(nldiFlowlineLayers);
		}
		if (insetNldiSiteCluster) {
			insetNldiSiteCluster.clearLayers();
			insetMap.removeLayer(insetNldiSiteCluster);
		}
		if (insetNldiFlowlineLayers) {
			insetMap.removeLayer(insetNldiFlowlineLayers);
		}

		options.$inputContainer.html('');
	};

	var updateNldiInput = function(url) {
		var html = '';
		if (url) {
			html = '<input type="hidden" name="nldiurl" value="' + url + '" />';
		}

		options.$inputContainer.html(html);
	};


	/*
	 * @param {L.Point} point - This is the containerPoint where we are looking for a feature from the pour point endpoint
	 * @returns $Deferred.promise
	 * 		@resolve - Returns {Object} - the json data received from the request
	 * 		@reject	- If unable to fetch the pour point
	 */
	var fetchPourPoint = function(point) {
		var mapBounds = map.getBounds();
		return $.ajax({
			url : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms',
			method : 'GET',
			data : {
				version: '1.3.0',
				request: 'GetFeatureInfo',
				service: 'wms',
				layers : 'qw_portal_map:fpp',
				srs : 'EPSG:4326',
				bbox : mapBounds.getSouth() + ',' + mapBounds.getWest() + ',' + mapBounds.getNorth() + ',' + mapBounds.getEast(),
				width : map.getSize().x,
				height : map.getSize().y,
				'info_format' : 'application/json',
				'query_layers' : 'qw_portal_map:fpp',
				i : point.x,
				j : point.y
			}
		});
	};

	/*
	 * @param {String} comId
	 * @param {String} navigate
	 * @param {String}  distance
	 * @returns {String}
	 */
	var getNldiUrl = function(huc12, navigate, distance) {
		return Config.NLDI_SERVICES_ENDPOINT + 'huc12pp/' + huc12 + '/navigate/' + navigate + '/wqp_ui?distance=' + distance;
	};

	/*
	 * @param {String} comId
	 * @param {String} navigate
	 * @param {String}  distance
	 * @returns {jqXHR}
	 */
	var fetchNldiSites = function(huc12, navigate, distance) {
		return $.ajax({
			url : getNldiUrl(huc12, navigate, distance),
			method : 'GET'
		});

	};

	/*
	 * @param {String} comId
	 * @param {String navigate
	 * @returns $.jqXHR object
	 */
	var fetchNldiFlowlines = function(huc12, navigate, distance) {
		return $.ajax({
			url : Config.NLDI_SERVICES_ENDPOINT + 'huc12pp/' + huc12 + '/navigate/' + navigate,
			method : 'GET',
			data : {
				distance : distance
			}
		});
	};

	var updateNldiSites = function(huc12, navigate, distance) {
		var flowlineLayer = _.partial(L.geoJson);
		var siteLayer = _.partial(L.geoJson, _, {
			pointToLayer: function (featureData, latlng) {
				return L.circleMarker(latlng, {
					radius: 5,
					fillColor: "#ff3300",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});
			}
		});

		if ((huc12) && (navigate)) {
			$mapDiv.css('cursor', 'progress');
			$.when(fetchNldiSites(huc12, navigate, distance), fetchNldiFlowlines(huc12, navigate, distance))
				.done(function (sitesResponse, flowlinesResponse) {
					var flowlineBounds;
					var sitesGeojson = sitesResponse[0];
					var flowlinesGeojson = flowlinesResponse[0];
					var nldiSiteLayers = siteLayer(sitesGeojson);
					var insetNldiSiteLayers = siteLayer(sitesGeojson);

					log.debug('NLDI service has retrieved ' + sitesGeojson.features.length + ' sites.')
					map.closePopup();

					nldiFlowlineLayers = flowlineLayer(flowlinesGeojson);
					insetNldiFlowlineLayers = flowlineLayer(flowlinesGeojson);
					map.addLayer(nldiFlowlineLayers);
					insetMap.addLayer(insetNldiFlowlineLayers);

					flowlineBounds = nldiFlowlineLayers.getBounds();
					map.fitBounds(flowlineBounds);

					nldiSiteCluster = L.markerClusterGroup({
						maxClusterRadius : 40
					});
					insetNldiSiteCluster = L.markerClusterGroup();

					nldiSiteCluster.addLayer(nldiSiteLayers);
					insetNldiSiteCluster.addLayer(insetNldiSiteLayers);
					map.addLayer(nldiSiteCluster);
					insetMap.addLayer(insetNldiSiteCluster);

					updateNldiInput(getNldiUrl(huc12, navigate, distance));
				})
				.fail(function () {
					map.openPopup('Unable to retrieve NLDI information', map.getCenter());
					updateNldiInput('');
				})
				.always(function () {
					$mapDiv.css('cursor', '');
				});
		}
	};

	/*
	 * Leaflet mouse event handler to find the sites associated with the COMID at the location in the event and displays
	 * the sites and flowlines on the nldi map. Popups are used to tell the user if an error occurred in the process.
	 *
	 * @param {L.MouseEvent} ev
	 */
	var findSitesHandler = function(ev) {
		if (navValue.id) {
			log.debug('Clicked at location: ' + ev.latlng.toString());
			$mapDiv.css('cursor', 'progress');

			huc12 = '';
			pourPtLatLng = undefined;
			cleanUpMaps();
			map.closePopup();

			fetchPourPoint(ev.containerPoint.round())
				.done(function (result) {
					if (result.features.length === 0) {
						map.openPopup('<p>No query point has been selected. Please click on a point to query from.</p>', ev.latlng);
						$mapDiv.css('cursor', '');

					}
					else if (result.features.length > 1) {
						map.openPopup('<p>More than one query point has been selected. Please zoom in and try again.</p>', ev.latlng);
						$mapDiv.css('cursor', '');
					}
					else {
						huc12 = result.features[0].properties.HUC_12;
						pourPtLatLng = ev.latlng;
						map.openPopup(getRetrieveMessage(), ev.latlng);
						updateNldiSites(huc12, navValue.id, distanceValue);
					}
				})
				.fail(function () {
					map.openPopup('<p>Unable to retrieve points, service call failed</p>', ev.latlng);
					$mapDiv.css('cursor', '');
				});
		}
		else {
			map.openPopup('<p>Please select a navigation direction</p>', ev.latlng);
		}
	};

	/*
	 * Show the full size map and set it's navigation select value. Hide the inset map
	 */
	var showMap = function () {
		if ($mapDiv.is(':hidden')) {
			$insetMapDiv.hide();
			$mapDiv.parent().show();
			nldiControl.setNavValue(navValue.id);
			nldiControl.setDistanceValue(distanceValue);
			map.invalidateSize();
			map.setView(insetMap.getCenter(), insetMap.getZoom());
		}
		map.closePopup();
	};

	/*
	 * Show the inset map and set it's navigation select value. Hide the full size map
	 */
	var showInsetMap = function () {
		if ($insetMapDiv.is(':hidden')) {
			$insetMapDiv.show();
			$mapDiv.parent().hide();
			insetNldiControl.setNavValue(navValue.id);
			insetNldiControl.setDistanceValue(distanceValue);
			insetMap.invalidateSize();
			insetMap.setView(map.getCenter(), map.getZoom());
		}
	};

	/*
	 * @param {DOM event object} ev
	 * Handle the change event for the nav selection control.
	 */
	var navChangeHandler = function(ev) {
		navValue = {
			id : $(ev.target).val(),
			text : $(ev.target.selectedOptions[0]).html()
		};
		cleanUpMaps();
		if (navValue.id) {
			showMap();
			if (huc12) {
				map.openPopup(getRetrieveMessage(), pourPtLatLng);
				updateNldiSites(huc12, navValue.id, distanceValue);
			}
		}
		else {
			huc12 = '';
			pourPtLatLng = undefined;
			showInsetMap();
		}
	};

	var distanceChangeHandler = function(ev) {
		distanceValue = $(ev.target).val();
		cleanUpMaps();

		if (navValue.id) {
			showMap();
			if (huc12) {
				map.openPopup(getRetrieveMessage(),  pourPtLatLng);
				updateNldiSites(huc12, navValue.id, distanceValue);
			}
		}
		else {
			showInsetMap();
		}
	};

	var clearHandler = function() {
		huc12 = '';
		pourPtLatLng = undefined;
		navValue = {
			id: '',
			text : ''
		};
		distanceValue = '';

		this.setNavValue(navValue.id);
		this.setDistanceValue(distanceValue);

		cleanUpMaps();
		map.closePopup();
	};

	var insetBaseLayers = {
		'World Gray' : L.esri.basemapLayer('Gray')
	};
	var insetHydroLayer = L.esri.tiledMapLayer({
		url : "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});

	var baseLayers = {
		'World Gray' : L.esri.basemapLayer('Gray'),
		'World Topo' : L.tileLayer.provider('Esri.WorldTopoMap'),
		'World Street' : L.tileLayer.provider('Esri.WorldStreetMap'),
		'World Relief' : L.tileLayer.provider('Esri.WorldShadedRelief'),
		'World Imagery' : L.tileLayer.provider('Esri.WorldImagery')
	};
	var hydroLayer = L.esri.tiledMapLayer({
		url : "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});
	var nhdlPlusFlowlineLayer = L.tileLayer.wms('http://cida.usgs.gov/nwc/geoserver/gwc/service/wms',
		{
			layers : 'nhdplus:nhdflowline_network',
			format : 'image/png',
			transparent : true,
			opacity : 0.5
		}
	);

	var pourPointLayer = L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
		layers:'fpp',
		styles : 'pour_points',
		format : 'image/png',
		transparent : true,
		minZoom : 8
	});

	var layerSwitcher = L.control.layers(baseLayers, {
		'Hydro Reference' : hydroLayer,
		'NHDLPlus Flowline Network' : nhdlPlusFlowlineLayer,
		'WBD HU12 Pour Points' : pourPointLayer
	});

	var insetNldiControl = L.control.nldiControl({
		navChangeHandler : navChangeHandler,
		distanceChangeHandler : distanceChangeHandler,
		clearClickHandler : clearHandler
	});
	var nldiControl = L.control.nldiControl({
		navChangeHandler : navChangeHandler,
		distanceChangeHandler : distanceChangeHandler,
		clearClickHandler : clearHandler
	});

	var searchControl = L.control.searchControl(Config.GEO_SEARCH_API_ENDPOINT);

	var expandControl = L.easyButton('fa-lg fa-expand', showMap, 'Expand NLDI Map', {
		position : 'topright'
	});
	var collapseControl = L.easyButton('fa-lg fa-compress', showInsetMap, 'Collapse NLDI Map', {
		position: 'topright'
	});

	var MapWithSingleClickHandler = L.Map.extend({
		includes : L.SingleClickEventMixin
	});

	/*
	 * Initialize the inset and full size maps.
	 */
	self.initialize = function() {
		insetMap = L.map(options.insetMapDivId, {
			center: [37.0, -100.0],
			zoom : 3,
			layers : [insetBaseLayers['World Gray']],
			zoomControl : false
		});
		insetMap.addLayer(insetHydroLayer);
		insetMap.addControl(expandControl);
		insetMap.addControl(insetNldiControl);
		insetMap.addControl(L.control.zoom());

		map = new MapWithSingleClickHandler(options.mapDivId, {
			center: [37.0, -100.0],
			zoom : 3,
			layers : [baseLayers['World Gray'], hydroLayer, nhdlPlusFlowlineLayer, pourPointLayer],
			zoomControl : false
		});
		map.addControl(searchControl);
		map.addControl(collapseControl);
		map.addControl(layerSwitcher);
		map.addControl(nldiControl);
		map.addControl(L.control.zoom());

		map.addSingleClickHandler(findSitesHandler);
	};

	return self;
};