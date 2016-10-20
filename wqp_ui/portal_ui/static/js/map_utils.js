/* jslint browser: true */
/* global WQP */
/* global OpenLayers */

var MapUtils = {};

MapUtils.XYZ_URL_POSTFIX = '${z}/${y}/${x}';

MapUtils.MERCATOR_PROJECTION = new OpenLayers.Projection("EPSG:900913");
MapUtils.WGS84_PROJECTION = new OpenLayers.Projection("EPSG:4326");

MapUtils.DEFAULT_CENTER = WQP.MapConfig.DEFAULT_CENTER;


// Set the maxResolutions and maxExtent as indicated in http://docs.openlayers.org/library/spherical_mercator.html
MapUtils.MAP_OPTIONS = {
	projection: MapUtils.MERCATOR_PROJECTION,
	maxResolution: 156543.0339,
	maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
//    restrictedExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,20037508.34, 20037508.34),
	controls: [
		new OpenLayers.Control.Navigation(),
		new OpenLayers.Control.ArgParser(),
		new OpenLayers.Control.Attribution(),
		new OpenLayers.Control.Zoom(),
		new OpenLayers.Control.ScaleLine(),
		new OpenLayers.Control.MousePosition({
			// Defined formatOutput because the displayProjection was not working.
			formatOutput: function (lonLat) {
				"use strict";
				lonLat.transform(MapUtils.MERCATOR_PROJECTION, MapUtils.WGS84_PROJECTION);
				return lonLat.toShortString();
			}
		}),
		new OpenLayers.Control.LayerSwitcher()
	]
};


// Returns an OpenLayers layer described by layer which has at least type and name properties. A url property
// should be defined if necessary. The layer is created with the options.
MapUtils.getLayer = function (layer, options) {
	"use strict";
	return new OpenLayers.Layer.XYZ(layer.name, layer.url + MapUtils.XYZ_URL_POSTFIX, options);
};


