/* jslint browser: true */
/* global log */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a pointLocationInputView object
 * @param {Object} options
 * 		@prop {Jquery element} $container - element where the point location inputs are contained
 * @returns
 * 		@func initialize;
 */
PORTAL.VIEWS.pointLocationInputView = function(options) {
	"use strict";

	var self  = {};

	// GeoLocation easter egg.
	var updateMyLocation = function($lat, $lon) {
		var updateInputs = function(position) {
			$lat.val(position.coords.latitude);
			$lon.val(position.coords.longitude);
		};

		var displayError = function(err) {
			log.error('ERROR(' + err.code + '): ' + err.message);
			//TODO: Add call to show alert
		};

		navigator.geolocation.getCurrentPosition(updateInputs, displayError, {
			timeout: 8000,
			maximumAge: 60000
		});

		return false;
	};

	/*
	 * Initializes all widgets and DOM event handlers
	 */
	self.initialize = function() {
		PORTAL.VIEWS.inputValidation({
			inputEl: options.$container.find('input[type="text"]'),
			validationFnc: PORTAL.validators.realNumberValidator
		});

		// only give user the option if their browser supports geolocation
		if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
			var $useMyLocationDiv = options.$container.find('#useMyLocation');
			var $lat = options.$container.find('#lat');
			var $lon = options.$container.find('#long');

			$useMyLocationDiv.html('<button class="btn btn-info" type="button">Use my location</button>');
			$useMyLocationDiv.find('button').click(function () {
				updateMyLocation($lat, $lon);
			});
		}
	};

	return self;
};