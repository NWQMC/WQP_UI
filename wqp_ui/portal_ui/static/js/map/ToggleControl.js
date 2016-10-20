/* jslint browser: true */
/* global ol */

var PORTAL = PORTAL || {};
PORTAL.MAP = PORTAL.MAP || {};

/*
 * Extends ol.control.Control - Creates a button which when clicked activates the interaction. Click again to deactive the interaction
 * Can be styled with the map-toggle-on and map-toggle-off classes. The button is contained within a div with class map-toggle
 * @param {Object} opt_options
 * 		Additional properties:
 * 		@prop {ol.interaction} interaction - interaction to enable/disable
 * 		@prop {String} tooltip - String to show as tool tip on control
 */
PORTAL.MAP.ToggleControl = function(opt_options) {
	"use strict";
	var self = this;
	var options = opt_options || {};
	var element = document.createElement('div');
	var button = document.createElement('button');

	var toggleInteraction = function(e) {
		if (button.className.search('map-toggle-on') !== -1) {
			button.className = button.className.replace('map-toggle-on', 'map-toggle-off');
			options.interaction.setActive(false);
		}
		else {
			button.className = button.className.replace('map-toggle-off', 'map-toggle-on');
			options.interaction.setActive(true);
		}
	};
	element.className = 'map-toggle';
	button.type = 'button';
	button.className = 'map-toggle-off';
	button.title = (options.tooltip) ? options.tooltip : '';
	element.appendChild(button);

	options.interaction.setActive(false);

	button.addEventListener('click', toggleInteraction);

	ol.control.Control.call(this, {
		element: element,
		target : options.target
	});
};

ol.inherits(PORTAL.MAP.ToggleControl, ol.control.Control);