/* jslint browser: true */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a sampling parameter input view
 * @param {Object} options
 * 		@prop {Jquery element} $container - element where the sampling parameter inputs are contained
 * 		@prop {PORTAL.MODELS.cachedCodes} sampleMediaModel
 * 		@prop {PORTAL.MODELS.cachedCodes} characteristicTypeModel
 * @return {Object}
 	* 	@func initialize
 */
PORTAL.VIEWS.samplingParameterInputView = function(options) {
	"use strict";

	var self = {};

	/*
	 * Initializes and sets up the DOM event handlers for the inputs
	 * @return Jquery.promise
	 * 		@resolve - all models have been successfully fetched
	 * 		@reject - one or models have not been successfully fetched
	 */
	self.initialize = function() {
		var $sampleMedia = options.$container.find('#sampleMedia');
		var $characteristicType = options.$container.find('#characteristicType');
		var $characteristicName = options.$container.find('#characteristicName');
		var $projectCode = options.$container.find('#project-code');
		var $minresults = options.$container.find('#minresults');
		var $startDate = options.$container.find('#startDateLo');
		var $endDate = options.$container.find('#startDateHi');

		var fetchSampleMedia = options.sampleMediaModel.fetch();
		var fetchCharacteristicType = options.characteristicTypeModel.fetch();
		var fetchComplete = $.when(fetchSampleMedia, fetchCharacteristicType);

		fetchSampleMedia.done(function() {
			PORTAL.VIEWS.createCodeSelect($sampleMedia, {model : options.sampleMediaModel});
		});
		fetchCharacteristicType.done(function() {
			PORTAL.VIEWS.createCodeSelect($characteristicType, {model : options.characteristicTypeModel});
		});

		PORTAL.VIEWS.createPagedCodeSelect($characteristicName, {codes: 'characteristicname'}, {closeOnSelect : false});
		PORTAL.VIEWS.createPagedCodeSelect($projectCode, {codes: 'project'},
			{closeOnSelect : false}
		);

		// Add input validations and reformatting handlers
		PORTAL.VIEWS.inputValidation({
			inputEl : $minresults,
			validationFnc : PORTAL.validators.nonNegativeValidator,
		})
		PORTAL.VIEWS.inputValidation({
			inputEl: $startDate,
			validationFnc: PORTAL.dateValidator.validate,
			updateFnc: function (value) {
				return PORTAL.dateValidator.format(value, true);
			}
		});
		PORTAL.VIEWS.inputValidation({
			inputEl: $endDate,
			validationFnc: PORTAL.dateValidator.validate,
			updateFnc: function (value) {
				return PORTAL.dateValidator.format(value, false);
			}
		});

		return fetchComplete;
	};

	return self;
};
