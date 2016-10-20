/* jslint browser: true */
/* global $ */
/* Config */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a site parameter input view object
 * @param {Object} options
 * 		@prop {Jquery element} $container - element where the site parameter inputs are contained
 * 		@prop {PORTAL.MODELS.cachedCodes} siteTypeModel
 * 		@prop {PORTAL.MODELS.cachedCodes} organizationModel
 * @returns {Object}
 * 		@func initialize;
 */
PORTAL.VIEWS.siteParameterInputView = function(options) {
	"use strict";

	var self = {};

	var initializeOrganizationSelect = function($select, model) {
		var formatData = function(data) {
			return {
				id : data.id,
				text : data.id + ' - ' + data.desc
			};
		};
		var isMatch = function(searchTerm, data) {
			var termMatcher;
			if (searchTerm) {
				termMatcher = new RegExp(searchTerm, 'i');
				return (termMatcher.test(data.id) || termMatcher.test(data.desc));
			}
			else {
				return true;
			}
		};
		PORTAL.VIEWS.createCodeSelect($select, {
			model : model,
			formatData : formatData,
			isMatch : isMatch
		}, {
			minimumInputLength: 2,
			closeOnSelect : false
		});
	};

	/*
	 * Initialize the widgets and DOM event handlers
	 * @return Jquery promise
	 * 		@resolve - when all models have been fetched successfully
	 * 	    @reject - if any model's fetch failed.
	 */
	self.initialize = function() {
		var $siteTypeSelect = options.$container.find('#siteType');
		var $organizationSelect = options.$container.find('#organization');
		var $siteIdInput = options.$container.find('#siteid');
		var $hucInput = options.$container.find('#huc');

		var fetchSiteType = options.siteTypeModel.fetch();
		var fetchOrganization = options.organizationModel.fetch();
		var fetchComplete = $.when(fetchSiteType, fetchOrganization);

		fetchSiteType.done(function() {
			PORTAL.VIEWS.createCodeSelect($siteTypeSelect, {model : options.siteTypeModel});
		});
		fetchOrganization.done(function() {
			initializeOrganizationSelect($organizationSelect, options.organizationModel);
		});

		// Add event handlers
		PORTAL.VIEWS.inputValidation({
			inputEl: $siteIdInput,
			validationFnc: PORTAL.validators.siteIdValidator
		});
		PORTAL.VIEWS.inputValidation({
			inputEl: $hucInput,
			validationFnc: PORTAL.hucValidator.validate,
			updateFnc: PORTAL.hucValidator.format
		});

		return fetchComplete;
	};

	return self;
};


