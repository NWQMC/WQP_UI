/* jslint browser: true */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a bounding box input view object
 * @param {Object} options
 * 		@prop {Jquery element} $container - element where the bounding box inputs are contained
 * @returns {Object}
 *  	@func initialize;
 */

PORTAL.VIEWS.boundingBoxInputView = function(options) {
	"use strict";

	var self = {};

	/*
	 * Initializes all input widgets and DOM event handlers
	 */
	self.initialize = function() {
		var $textInputs = options.$container.find('input[type="text"]');
		var $north = options.$container.find('#north');
		var $south = options.$container.find('#south');
		var $west = options.$container.find('#west');
		var $east = options.$container.find('#east');
		PORTAL.VIEWS.inputValidation({
			inputEl: $textInputs,
			validationFnc: PORTAL.validators.realNumberValidator
		});

		//Update bBox hidden input if any of the bounding box text fields are updated
		$textInputs.change(function () {
			var north = $north.val();
			var south = $south.val();
			var east = $east.val();
			var west = $west.val();
			var bboxVal = '';
			if ((north) && (south) && (east) && (west)) {
				bboxVal = west + ',' + south + ',' + east + ',' + north;
			}
			options.$container.find('input[name="bBox"]').val(bboxVal);
		});
	};

	return self;
};
