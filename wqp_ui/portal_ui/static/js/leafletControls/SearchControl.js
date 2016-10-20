/* jslint browser: true */
/* global L */
/* global $ */

/*
 * Requires jquery and the select2 widget
 * This code has only been tested with version 1.1 of the Texas Search API Dataservice.
 * See http://txpub.usgs.gov/DSS/search_api/1.1/web/index.html#tab5?top for more info
 *
 * @constructs
 * @param {String} searchAPIEndpoint - the url to the Texas Search API Dataservice
 * @param {Object} options
 * 		@prop {String} position - defaults to topright
 * 		@prop {Number} zoomToLevel - defaults to 11.
 */
L.control.SearchControl = L.Control.extend({

	options: {
		position: 'topright',
		zoomToLevel : 11
	},

	initialize : function(searchAPIEndpoint, options) {
		"use strict";
		L.setOptions(this, options);
		L.Control.prototype.initialize.apply(this, options);

		this.searchAPIEndpoint = searchAPIEndpoint;
		this.selectControl = undefined;
	},

	onAdd : function(map) {
		"use strict";
		var self = this;

		var searchResults;
		var container = L.DomUtil.create('div', 'leaflet-search-control-div');

		this.selectControl = L.DomUtil.create('select', 'leaflet-search-control-input', container);
		L.DomEvent.disableClickPropagation(this.selectControl);

		$(this.selectControl).select2({
			placeholder: 'Hint: Type a place and state (e.g. Franklin AZ), zip code, or area code',
			minimumInputLength: 3,
			ajax: {
				url: this.searchAPIEndpoint,
				dataType: 'json',
				delay: 500,
				data: function (params) {
					var terms = params.term.split(' ');
					var state = '';
					var thisTerm = '';
					// This assumes that the last word in the search phrase is a state code if it has two characters.
					if (terms.length > 1 && (terms[terms.length - 1].length === 2)) {
						thisTerm = terms.slice(0, terms.length - 1).join(' ');
						state = terms[terms.length - 1];
					}
					else {
						thisTerm = params.term;
					}
					return {
						term: thisTerm,
						state: state,
						topN: 50,
						LATmin: -90,
						LATmax: 90,
						LONmin: -180,
						LONmax: 180,
						includeGNIS: true,
						includeState: true,
						includeUsgsSiteSW: false,
						includeUsgsSiteGW: false,
						includeUsgsSiteSP: false,
						includeUsgsSiteAT: false,
						includeUsgsSiteOT: false,
						includeZIPcodes: true,
						includeAREAcodes: true,
						useCommonGnisClasses: true
					};
				},
				processResults: function (data) {
					var result = {};
					searchResults = data;
					result.results = data.map(function (el, index) {
						return {
							id: index,
							text: el.nm + ' ' + el.st + ' ' + el.ct
						};
					});
					return result;
				}
			}
		});
		L.DomEvent.disableClickPropagation(this.selectControl.nextSibling);


		$(this.selectControl).on('select2:select', function (ev) {
			var result = searchResults[ev.params.data.id];
			map.setView(L.latLng(result.y, result.x), self.options.zoomToLevel);
			ev.target.innerHTML = '<option id="' + ev.params.data.id + '" selected>' + ev.params.data.text + '</option>';
		});

		return container;
	},

	onRemove : function() {
		"use strict";
		$(this.selectControl).select2('destroy');

	}
});

L.control.searchControl = function(options) {
	"use strict";
	return new L.control.SearchControl(options);
};