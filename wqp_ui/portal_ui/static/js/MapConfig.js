/* jslint browser: true */

var WQP = WQP || {};

WQP.MapConfig = (function() {
	"use strict";

	var self = {};

	self.DEFAULT_CENTER = {
		lon: -82.5,
		lat: 48.2
	};

	self.BASE_LAYER_URL = {
		light_grey_base: {
			name: 'World Light Gray',
			url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/',
			attribution : 'Esri, HERE, DeLorme, NGA, USGS | Esri, HERE, DeLorme'
		},
		world_street: {
			name: 'World Street',
			url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/',
			attribution : 'Esri, HERE, DeLorme, NGA, USGS'
		},
		world_imagery: {
			name: 'World Imagery',
			url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/',
			attribution : 'Earthstar Geographics'
		},
		world_topo: {
			name: 'World Topo',
			url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/',
			attribution : 'Esri, FAO, NOAA'
		},
		world_relief: {
			name: 'World Relief',
			url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/',
			attribution : 'Esri, DeLorme, FAO, NOAA | Copyright:© 2014 Esri'
		}
	};

	return self;

})();
