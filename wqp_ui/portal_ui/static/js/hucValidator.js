var PORTAL = PORTAL || {};
PORTAL.hucValidator = function () {

	var INVALID = {
		isValid: false,
		errorMessage: 'HUCs should be entered as semi-colon separated numbers with 2, 4, 6 or 8 digits with optional \'*\' wildcard'
	};
	var VALID = {isValid: true};
	var starReg = /\*$/g;

	var that = {};

	that.validate = function (value) {
		// Function takes a string value and returns an object with properties isValid indicating
		// whether the value is a valid huc. If the value is invalid, an errorMessage property is
		// added to the returned object.

		var i;
		var thisHuc;

		var hucArray = value.split(';');

		for (i = 0; i < hucArray.length; i++) {
			if (hucArray[i]) {
				if (hucArray[i].length > 8) {
					return INVALID;
				}
				thisHuc = hucArray[i].replace(starReg, '');
				if (isNaN(thisHuc)) {
					return INVALID;
				}
				if (thisHuc.length !== 2 && thisHuc.length !== 4 && thisHuc.length !== 6 && thisHuc.length !== 8) {
					return INVALID;
				}
			}
		}

		return VALID;
	};

	that.format = function (value) {
		// Return value modified to pad with wildcard if the huc value has fewer than 8 characters
		var i;
		var resultArray = [];

		var hucArray = value.split(';');
		for (i = 0; i < hucArray.length; i++) {
			if (hucArray[i]) {

				if (hucArray[i].search(starReg) === -1 && hucArray[i].length < 8) {
					resultArray.push(hucArray[i] + '*');
				}
				else {
					resultArray.push(hucArray[i]);
				}
			}
		}
		return resultArray.join(';');
	};

	return that;
}();

