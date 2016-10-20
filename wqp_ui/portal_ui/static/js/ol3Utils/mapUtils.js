/* jslint browser: true */
/* global ol */
/* global Config */
/* global _ */

var WQP = WQP || {};

WQP.ol3 = WQP.ol3 || {};

WQP.ol3.mapUtils = (function() {
	"use strict";

	var self = {};

	self.createXYZBaseLayer = function(layerInfo, isVisible) {
		return new ol.layer.Tile({
			title : layerInfo.name,
			type : 'base',
			visible : isVisible,
			source : new ol.source.XYZ({
				attributions : [
					new ol.Attribution({
						html : layerInfo.attribution
					})
				],
				url : layerInfo.url + '{z}/{y}/{x}'
			})
		});
	};

	/*
	 * @param {Boolean} isVisible - True if layer should be visible initially
	 * @param {ol3.map} map - Map where layer will be displayed
	 * @returns ol.layer.Tile
	 */
	self.getEsriHydroLayer = function(isVisible, map) {
		var esriHydroURL = 'http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer/tile/';
		var hydroTileLayer = new ol.layer.Tile({
			title : 'ESRI Hydro Layer',
			map : map,
			visible : isVisible,
			source : new ol.source.XYZ({
				url : esriHydroURL + '{z}/{y}/{x}'
			})
		});
		return hydroTileLayer;
	};

	/*
	 * @param {Object} - wms parameter overrides
	 * @param {Object} - wms layer option overrides
	 * @returns ol.layer.Tile
	 */
	self.getNWISSitesLayer = function (wmsParams, layerOptions) {
		var defaultParams = {
			LAYERS: 'qw_portal_map:nwis_sites',
			VERSION: '1.1.1',
			FORMAT: 'image/png',
			TRANSPARENT: true
		};
		var defaultLayerOptions = {
			title : 'NWIS Stream Gages'
		};

		var finalWMSParams = _.extend({}, defaultParams, wmsParams);
		var finalLayerOptions = _.extend({}, defaultLayerOptions, layerOptions);

		var layerSource = new ol.source.TileWMS({
			params: finalWMSParams,
			url : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms'
		});
		finalLayerOptions.source = layerSource;
		return new ol.layer.Tile(finalLayerOptions);
	};

	return self;

})();