/* jslint browser: true */
/* global $ */
/* global _ */
/* global Config */

var PORTAL = PORTAL || {};
PORTAL.UTILS = function() {
	"use strict";
	var self = {};

	var COLLAPSE_IMG = Config.STATIC_ENDPOINT + 'img/collapse.png';
	var EXPAND_IMG = Config.STATIC_ENDPOINT + 'img/expand.png';

	/*
	 * Returns a query string suitable for use as a URL query string with parameters on the ignoreList
	 * removed.
	 * @param {Array of Object} queryParamArray - Each object has a name property and a value property both with string values
	 * @param {Array of String} ignoreList - Names to be removed from paramArray before serializing
	 * @param {Boolean} multiSelectDelimited - if true param names that appear more than once are serialized as a single param with ';' separated values
	 * @return {String} - String suitable for use as a URL query string.
	 */
	self.getQueryString = function(queryParamArray, ignoreList, multiSelectDelimited) {
		var thisIgnoreList = (ignoreList) ? ignoreList : [];
		var resultArray = _.reject(queryParamArray, function (param) {
			return _.contains(thisIgnoreList, param.name);
		});

		if (multiSelectDelimited) {
			resultArray = _.chain(resultArray)
				.groupBy('name')
				.map(function(groupedParam, name) {
					return {
						name : name,
						value : _.pluck(groupedParam, 'value').join(';')
					};
				})
				.value();
		}
		return $.param(resultArray);
	};
	
	self.getQueryParamJson = function(queryParamArray) {
		var result = {};

		_.chain(queryParamArray) 
			.groupBy(function(param) {
				return param.name;
			})
			.each(function(values, name) {
				result[name] = _.pluck(values, 'value');
			});

		return result;
	};

	self.isExtraSmallBrowser = function() {
		return $('body').width() < 750;
	};

	/*
	 * Add/Remove the disabled attribute for $els and make the element appear enabled/disabled.
	 * @param {Array of jquery input elements} $els
	 * @param {Boolean} isEnabled
	 */
	self.setEnabled = function($els, isEnabled /* Boolean */) {
		$els.prop('disabled', !isEnabled);
		$els.each(function() {
			var $label = $('label[for="' + $(this).attr('id') + '"]');
			if (isEnabled) {
				$label.removeClass('disabled');
			}
			else {
				$label.addClass('disabled');
			}
		});
	};

	/*
	 * @param {Jquery element} $button - The show/hide toggle button jquery element
	 * @param {Jquery element} $contentDiv - The content div that is controlled by buttonEl.
	 * @return {Boolean} - true if contentDivEl is now visible, false otherwise.
	 */
	self.toggleShowHideSections = function($button, $contentDiv) {
		var $buttonImg = $button.find('img');
		if ($buttonImg.attr('alt') === 'show') {
			$button.attr('title', $button.attr('title').replace('Show', 'Hide'));
			$buttonImg.attr('alt', 'hide').attr('src', COLLAPSE_IMG);
			$contentDiv.slideDown();
			return true;
		}
		else {
			$button.attr('title', $button.attr('title').replace('Hide', 'Show'));
			$buttonImg.attr('alt', 'show').attr('src', EXPAND_IMG);
			$contentDiv.slideUp();
			return false;
		}
	};
	return self;
}();