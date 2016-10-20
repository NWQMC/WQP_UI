var PORTAL = PORTAL || {};

PORTAL.validators = function () {
    "use strict";
    var that = {};

    that.siteIdValidator = function (value) {
        var dashIndex;
        if (value) {
            dashIndex = value.indexOf('-');
            if (dashIndex === -1 || dashIndex === 0 || dashIndex === value.length - 1) {
                return {
                    isValid: false,
                    errorMessage: 'Format is AGENCY-STATION. NWIS sites should use "USGS" as the AGENCY.'
                };
            }
            else {
                return {isValid: true};
            }
        }
        else {
            return {isValid: true};
        }
    };

    that.realNumberValidator = function (value) {
        if (value) {
            if (isNaN(value)) {
                return {
                    isValid: false,
                    errorMessage: 'Enter a floating point number.'
                };
            }
            else {
                return {isValid: true};
            }
        }
        else {
            return {isValid: true};
        }
    };

    that.nonNegativeValidator = function(value) {
        var result;
        var MSG = "Enter a positive number";
        if (!value) {
            result = {
                isValid : true,
            };
        }
        else if (value.match(/^[1-9]\d*$/g)) {
            result = {
                isValid : true
            };
        }
        else {
            result = {
                isValid : false,
                errorMessage : MSG
            };
        }
        return result;
    };

    return that;
}();


