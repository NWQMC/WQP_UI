/* jslint browser: true */
/* global $ */
/* global _ */
/* global Config */
/* global _gaq */


var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Initializes the download form and provides methods to get information from the form
 * @param {Object} options
 * 		@prop {Jquery element} $form - The form which contains all of the query parameters
 * 		@prop {PORTAL.VIEWS.downloadProgressDialog} downloadProgressDialog
 * @return {Object}
 * 		@func initialize
 * 		@func getQueryParams
 */

PORTAL.VIEWS.downloadFormView = function(options) {
	"use strict";

	var self = {};

	/*
	 * @return {PORTAL.VIEWS.placeInputView}
	 */
	var getPlaceInputView = function() {
	// Initialize Place inputs
		var getCountryFromState = function(id) {
			return (id) ? id.split(':')[0] : '';
		};
		var getStateFromCounty = function(id) {
			var ids = id.split(':');
			return (ids.length > 1) ? ids[0] + ':' + ids[1] : '';
		};

		var countryModel = PORTAL.MODELS.cachedCodes({
			codes : 'countrycode'
		});
		var stateModel = PORTAL.MODELS.codesWithKeys({
			codes : 'statecode',
			keyParameter : 'countrycode',
			parseKey : getCountryFromState
		});
		var countyModel = PORTAL.MODELS.codesWithKeys({
			codes : 'countycode',
			keyParameter : 'statecode',
			parseKey : getStateFromCounty
		});
		return PORTAL.VIEWS.placeInputView({
			$container : $('#place'),
			countryModel : countryModel,
			stateModel : stateModel,
			countyModel : countyModel
		})	;
	};

	/*
	 * Initializes the form and sets up the DOM event handlers
	 * @return jquery promise
	 * 		@resolve - if all initialization including successful fetches are complete
	 * 		@reject - if any fetches failed.
	 */
	self.initialize = function() {
		var placeInputView = getPlaceInputView();
		var pointLocationInputView = PORTAL.VIEWS.pointLocationInputView({
			$container : options.$form.find('#point-location')
		});
		var boundingBoxInputView = PORTAL.VIEWS.boundingBoxInputView({
			$container : options.$form.find('#bounding-box')
		});
		var siteParameterInputView = PORTAL.VIEWS.siteParameterInputView({
			$container : options.$form.find('#site-params'),
			siteTypeModel : PORTAL.MODELS.cachedCodes({codes : 'sitetype'}),
			organizationModel : PORTAL.MODELS.cachedCodes({codes : 'organization'})
		});
		var nldiView = PORTAL.VIEWS.nldiView({
			insetMapDivId : 'nldi-inset-map',
			mapDivId : 'nldi-map',
			$inputContainer : options.$form.find('#nldi-param-container')
		});
		var samplingParametersInputView = PORTAL.VIEWS.samplingParameterInputView({
			$container : options.$form.find('#sampling'),
			sampleMediaModel : PORTAL.MODELS.cachedCodes({codes: 'samplemedia'}),
			characteristicTypeModel : PORTAL.MODELS.cachedCodes({codes: 'characteristictype'})
		});
		var biologicalSamplingInputView = PORTAL.VIEWS.biologicalSamplingInputView({
			$container : options.$form.find('#biological'),
			assemblageModel : PORTAL.MODELS.cachedCodes({codes: 'assemblage'})
		});
		var dataDetailsView = PORTAL.VIEWS.dataDetailsView({
			$container : options.$form.find('#download-box-input-div'),
			updateResultTypeAction : function(resultType) {
				options.$form.attr('action', PORTAL.queryServices.getFormUrl(resultType));
			}
		});

		// fetch the providers and initialize the providers select
		var initializeProviders = PORTAL.MODELS.providers.fetch()
			.done(function () {
				PORTAL.VIEWS.createStaticSelect2(options.$form.find('#providers-select'),
					PORTAL.MODELS.providers.getIds());
			});

		// Initialize form sub view
		var initPlaceInputView = placeInputView.initialize();
		var initSiteParameterInputView = siteParameterInputView.initialize();
		var initSamplingParametersInputView = samplingParametersInputView.initialize();
		var initBiologicalSamplingInputInputView = biologicalSamplingInputView.initialize();
		var initComplete = $.when(
			initBiologicalSamplingInputInputView,
			initializeProviders,
			initPlaceInputView,
			initSamplingParametersInputView,
			initSiteParameterInputView);

		dataDetailsView.initialize();
		pointLocationInputView.initialize();
		boundingBoxInputView.initialize();
		if (Config.NLDI_ENABLED) {
			nldiView.initialize();
		} else {
			options.$form.find('#nldi-container').hide();
			options.$form.find('#nldi-inset-map').hide();
			options.$form.find('#nldi-map').hide();
		}

		// Create help popovers which close when you click anywhere else other than another popover trigger.
		$('html').click(function () {
			$('.popover-help').popover('hide');
		});
		options.$form.find('.popover-help').each(function () {
			var options = $.extend({}, PORTAL.MODELS.help[($(this).data('help'))], {
				html: true,
				trigger: 'manual'
			});
			$(this).popover(options).click(function (e) {
				$(this).popover('toggle');
				e.stopPropagation();
			});
		});

		// Add Click handler for form show/hide/button
		options.$form.find('.panel-heading .show-hide-toggle').click(function () {
			PORTAL.UTILS.toggleShowHideSections($(this), $(this).parents('.panel').find('.panel-body'));
		});

		options.$form.find('.subpanel-heading .show-hide-toggle').click(function () {
			PORTAL.UTILS.toggleShowHideSections($(this), $(this).parents('.subpanel').find('.subpanel-body'));
		});

		// Set up the Download button
		options.$form.find('#main-button').click(function (event) {
			var fileFormat = dataDetailsView.getMimeType();
			var resultType = dataDetailsView.getResultType();
			var queryParamArray = self.getQueryParamArray();
			var queryString = decodeURIComponent(PORTAL.UTILS.getQueryString(queryParamArray));

			var startDownload = function(totalCount) {
				_gaq.push([
					'_trackEvent',
					'Portal Page',
					dataDetailsView.getResultType() + 'Download',
					queryString,
					parseInt(totalCount)]);

				options.$form.submit();
			};

			event.preventDefault();

			if (!PORTAL.CONTROLLERS.validateDownloadForm(options.$form)) {
				return;
			}

			_gaq.push([
				'_trackEvent',
				'Portal Page',
				resultType + 'Count',
				queryString
			]);

			options.downloadProgressDialog.show('download');
			PORTAL.queryServices.fetchQueryCounts(resultType, queryParamArray, PORTAL.MODELS.providers.getIds())
				.done(function(counts) {
					options.downloadProgressDialog.updateProgress(counts, resultType, fileFormat, startDownload);
				})
				.fail(function(message) {
					options.downloadProgressDialog.cancelProgress(message);
				});
		});

		return initComplete;
	};

	/*
	 * Validate the form and return true if it is valid, false otherwise
	 * @return {Boolean}
	 */
	self.validateDownloadForm = function() {
		return PORTAL.CONTROLLERS.validateDownloadForm(options.$form);
	};

	/*
	 * Return an array of Objects with name and value properties representing the current state of the form. Empty
	 * values are removed from the array
	 * @return {Array of Objects with name and value properties}
	 */
	self.getQueryParamArray = function () {
		// Need to eliminate form parameters within the mapping-div
		var $formInputs = options.$form.find(':input').not('#mapping-div :input, #nldi-inset-map :input, #nldi-map :input');
		return _.filter($formInputs.serializeArray(), function(param) {
			return (param.value);
		});
	};
	
	return self;
};