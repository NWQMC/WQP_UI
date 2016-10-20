/* jslint browser: true */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Manages the data detail inputs view
 * @param {Object} options
 * 		@prop {Jquery element} $container - The div where the data detail inputs are contained
 * 		@func updateResultTypeAction - called whenever the result-type radio buttons are changed
 * 			@param {String} resultType - the checked radio button's value
 * @return {Object}
 * 		@func initialize
 *  	@func getResultType
 *		@func getMimeType
 */
PORTAL.VIEWS.dataDetailsView = function(options) {
	"use strict";

	var self = {};

	/*
	 * Initializes the widgets and sets up the DOM event handlers.
	 */
	self.initialize = function() {
		var $kml = options.$container.find('#kml');

		var $site = options.$container.find('#sites');
		var $samples = options.$container.find('#samples');
		var $biosamples = options.$container.find('#biosamples');

		var $sorted = options.$container.find('#sorted');
		var $hiddenSorted = options.$container.find('input[type="hidden"][name="sorted"]');
		var $mimeTypeRadioboxes = options.$container.find('input[name="mimeType"]');
		var $resultTypeRadioboxes = options.$container.find('input.result-type');

		$mimeTypeRadioboxes.change(function() {
			var kmlChecked = $kml.prop('checked');

			// Can only download results if kml is not checked
			PORTAL.UTILS.setEnabled($samples, !kmlChecked);
			PORTAL.UTILS.setEnabled($biosamples, !kmlChecked);
		});

		$resultTypeRadioboxes.change(function() {
			var resultType = $(this).val();
			var $dataProfile = options.$container.find('input[name="dataProfile"]');

			// Uncheck previously checked button
			options.$container.find('input.result-type:checked').not(this).prop('checked', false);

			PORTAL.UTILS.setEnabled($kml, $site.prop('checked'));

			// If biological results desired add a hidden input, otherwise remove it.
			if ($biosamples.prop('checked')) {
				if ($dataProfile.length === 0) {
					options.$container.append('<input type="hidden" name="dataProfile" value="biological" />');
				}
			}
			else {
				$dataProfile.remove();
			}
			options.updateResultTypeAction(resultType);
		});

		$sorted.change(function() {
			var val = $(this).is(':checked') ? 'yes' : 'no';
			$hiddenSorted.val(val);
		});
	};

	self.getResultType = function() {
		return options.$container.find('input.result-type:checked').val();
	};

	self.getMimeType = function() {
		return options.$container.find('input[name="mimeType"]:checked').val();
	};

	return self;
};
