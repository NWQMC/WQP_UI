/* jslint browser: true */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a sampling parameter input view
 * @param {Object} options
 * 		@prop {Jquery element} $container - element where the biological sampling parameter inputs are contained
 * 		@prop {PORTAL.MODELS.cachedCodes} assemblageModel
 * @return {Object}
 *	 	@func initialize
 */
PORTAL.VIEWS.biologicalSamplingInputView = function(options) {
	"use strict";

	var self = {};

	/*
	 * Initialize select2's and set up any DOM event handlers
	 * @return Jquery.promise
	 * 		@resolve - all models have been successfully fetched
	 * 		@reject - one or models have not been successfully fetched
	 */
	self.initialize = function() {
		var $assemblage = options.$container.find('#assemblage');
		var $taxonomicName = options.$container.find('#subject-taxonomic-name');

		var fetchAssemblageModel = options.assemblageModel.fetch();
		var fetchComplete = $.when(fetchAssemblageModel);

		fetchAssemblageModel.done(function() {
			PORTAL.VIEWS.createCodeSelect($assemblage, {model : options.assemblageModel});
		});
		PORTAL.VIEWS.createPagedCodeSelect($taxonomicName, {codes: 'subjecttaxonomicname'},
			{closeOnSelect : false}
		);

		return fetchComplete;
	};

	return self;
};
