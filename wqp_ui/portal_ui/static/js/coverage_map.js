/* jslint browser: true */
/* global numeral */
/* global OpenLayers */
/* global $ */
/* global MapUtils */
/* global CoverageMapConfig */
/* global Config */

var CoverageMap = {};

CoverageMap.map = null; // Set at initialization
CoverageMap.dataLayer = null; // Set at initialization. The parameters can be changed to get different data layers.

// The array defines the order of the base layers in the layer switcher. First one in list will be selected.
// The strings map to properties in MapUtils.BASE_LAYERS.
CoverageMap.BASE_LAYERS = ['light_grey_base', 'world_street'];

CoverageMap.zoomTo = function (l, b, r, t) {
	"use strict";
	var bounds = new OpenLayers.Bounds(l, b, r, t);

	bounds.transform(MapUtils.WGS84_PROJECTION, MapUtils.MERCATOR_PROJECTION);

	CoverageMap.map.zoomToExtent(bounds);
	return false;
};

// Creates and initializes the coverage mapper
CoverageMap.init = function (divId) {
	"use strict";
	OpenLayers.ProxyHost = "";

	var detailDialogEl = $('#map-detail-dialog');

	var getCount = function (object, property) {
		if (property in object) {
			return numeral(object[property]).format('0,0');
		}
		else {
			return '0';
		}
	};
	var formatInfo = function (feature) {
		var html = '';
		html = '<button type="button" class="btn" onclick="CoverageMap.zoomTo(' + feature.bounds + ')">Zoom to feature</button><br/>';

		html += '<p><b>Total discrete samples:&nbsp;</b>';

		var discreteSampleCount = getCount(feature.attributes, 'DISCRETE_SAMPLE_COUNT');
		html += discreteSampleCount + '</p>';

		if ((discreteSampleCount > 0) && (CoverageMap.get_date_filter() ==='all_time')) {
			var minDate = feature.attributes.MIND.split('-');
			var maxDate = feature.attributes.MAXD.split('-');

			html += '<p>Samples taken from&nbsp;' + feature.attributes.MIND +
				'&nbsp;to&nbsp;' + feature.attributes.MAXD + '</p>';
		}
		if (CoverageMap.get_data_source() === 'all') {
			html += '<p><b>EPA STORET discrete samples:&nbsp;</b>' + getCount(feature.attributes, 'EPA_DISCRETE_SAMPLE_COUNT') + '</br>';
			html += '<b>USGS NWIS discrete samples:&nbsp;</b>' + getCount(feature.attributes, 'NWIS_DISCRETE_SAMPLE_COUNT') + '</p>';
		}
		return html;
	};

	var showDetailDialog = function (features, xy) {
		// Shows the detail dialog.
		var title;
		var html = '<div id="coverage-map-popup">';
		var display_by;

		if (features.length > 0) {
			display_by = CoverageMap.get_display_by();
			title = features[0].attributes[CoverageMapConfig.TITLE_ATTR[display_by]];
			if (display_by === 'counties') {
				title += ', ' + features[0].attributes[CoverageMapConfig.TITLE_ATTR.states];
			}
			html += '<div id="coverage-map-id-title">' + title + '</div>' + formatInfo(features[0]);
		}
		else {
			html += '<div id="coverage-map-id-title">No Feature info available</div>';
		}
		html += '</div>';
		CoverageMap.map.addPopup(new OpenLayers.Popup.FramedCloud(
			"idPopup",
			CoverageMap.map.getLonLatFromPixel(xy),
			null,
			html,
			null,
			true
		));
	};

	CoverageMap.map = new OpenLayers.Map(divId, MapUtils.MAP_OPTIONS);

	// Add loading panel control
	var loadingpanel = new OpenLayers.Control.LoadingPanel();
	CoverageMap.map.addControl(loadingpanel);

	var baseLayers = [];
	for (i = 0; i < CoverageMap.BASE_LAYERS.length; i++) {
		baseLayers[i] = MapUtils.getLayer(WQP.MapConfig.BASE_LAYER_URL[CoverageMap.BASE_LAYERS[i]], {
			isBaseLayer: true,
			transitionEffect: 'resize'
		});
	}
	var i = 0;

	CoverageMap.map.addLayers(baseLayers);

	// Default to states and all sources with no styling
	CoverageMap.dataLayer = new OpenLayers.Layer.WMS(
		"Data",
		Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms',
		{
			layers: CoverageMapConfig.LAYER_PARAM.states,
			format: 'image/png',
			viewparams: CoverageMapConfig.get_viewparams('all_time', 'all')
		},
		{
			displayInLayerSwitcher: false,
			isBaseLayer: false,
			singleTile: true,
			visibility: true,
			opacity: 0.75
		}
	);
	CoverageMap.map.addLayer(CoverageMap.dataLayer);

	// Initialize detail dialog
	detailDialogEl.dialog({autoOpen: false});


	var infoControl = new OpenLayers.Control.WMSGetFeatureInfo({
		title: "Detail information available by clicking",
		queryVisible: true,
		layers: [CoverageMap.dataLayer],
		infoFormat: 'application/vnd.ogc.gml',
		eventListeners: {
			beforegetfeatureinfo: function (event) {
				var date_filter = CoverageMap.get_date_filter();
				var source = CoverageMap.get_data_source();

				this.vendorParams = {
					viewparams: CoverageMapConfig.get_viewparams(date_filter, source)
				};
			},
			getfeatureinfo: function (event) {
				var features = this.format.read(event.text);
				showDetailDialog(features, event.xy);
			}
		}
	});
	CoverageMap.map.addControl(infoControl);

	var center = new OpenLayers.LonLat(MapUtils.DEFAULT_CENTER.lon, MapUtils.DEFAULT_CENTER.lat);
	CoverageMap.map.setCenter(center.transform(MapUtils.WGS84_PROJECTION, MapUtils.MERCATOR_PROJECTION));
	CoverageMap.map.zoomTo(3);
	infoControl.activate();

};

CoverageMap.updateDataLayerSLD = function (display_by, date_filter, source) {
	"use strict";
	CoverageMap.dataLayer.mergeNewParams({
		layers: CoverageMapConfig.LAYER_PARAM[display_by],
		viewparams: CoverageMapConfig.get_viewparams(date_filter, source),
		sld: encodeURI(CoverageMapConfig.get_sld_param(display_by, date_filter, source))
	});
};

CoverageMap.updateLegend = function (imgEl, display_by, date_filter, source) {
	"use strict";
	imgEl.attr(
		'src',
		Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms?request=GetLegendGraphic&format=image/png&layer=' + CoverageMapConfig.LAYER_PARAM[display_by] +
		'&legend_options=fontName:Verdana;fontAntiAliasing:true;' +
		'&sld=' + encodeURIComponent(CoverageMapConfig.get_sld_param(display_by, date_filter, source)));
};

// next three functions return the coverage map display options.
CoverageMap.get_display_by = function () {
	"use strict";
	return $('input[name="display-by"]:checked').val();
};
CoverageMap.get_date_filter = function () {
	"use strict";
	return $('input[name="date"]:checked').val();
};

CoverageMap.get_data_source = function () {
	"use strict";
	return $('input[name="data-source"]:checked').val();

};

