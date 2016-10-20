/* jslint browser: true */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};
//
// @params spec has the following properties
//      inputEl - Inputs whose value needs to be validated
//      validationFnc - function takes value. Returns an object with two properties
//          isValid property indicates whether the validation passed and errorMessage
//          contains the errorMessage is the validation did not pass.
//      updateFnc - optional function takes value and returns the formated value. This function
//          can assume that isValid has already been called and value is a valid entry.
//      event - optional. The event that this validation should be triggered on. Defaults to 'change'
PORTAL.VIEWS.inputValidation = function (spec) {
	"use strict";

	var event = spec.event || 'change';

	spec.inputEl.on(event, function (ev) {
		var inputValue = $(this).val();
		var result = spec.validationFnc(inputValue, ev);
		var parent = $(this).parent();

		parent.find('.error-message').remove();
		if (result.isValid) {
			parent.removeClass('alert alert-danger');
			if (spec.updateFnc) {
				$(this).val(spec.updateFnc(inputValue));
			}
		}
		else {
			parent.addClass('alert alert-danger');
			parent.append('<div class="error-message">' + result.errorMessage + '</div>');
		}
	});
};

