var PORTAL = PORTAL || {};
PORTAL.dateValidator = function () {
	var DELIM = '-';
	var sepRegExp = new RegExp('/', 'g');
	var INVALID = {
		isValid: false,
		errorMessage: 'Dates should be entered as mm-dd-yyyy, mm-yyyy, or yyyy'
	};
	var VALID = {isValid: true};

	var that = {};

	that.validate = function (value) {
		// Function takes a string value and returns an object with properties isValid indicating
		// whether the value is a valid date. If the value is invalid, an errorMessage property is
		// added to the returned object.

		var dateValues;
		var i;
		if (value) {
			dateValues = value.replace(sepRegExp, '-').split('-');
			if (dateValues.length > 3) {
				return INVALID;
			}
			else
			//Check that all are numbers
				for (i = 0; i < dateValues.length; i++) {
					if (!dateValues[i] || isNaN(dateValues[i])) {
						return INVALID;
					}
				}

			// Check for correct number of digits.
			if (dateValues.length === 3) {
				if (dateValues[0].length < 3 && dateValues[1].length < 3 && dateValues[2].length === 4) {
					return VALID;
				}
			}
			else if (dateValues.length === 2) {
				if (dateValues[0].length < 3 && dateValues[1].length === 4) {
					return VALID;
				}
			}
			else {
				if (dateValues[0].length === 4) {
					return VALID;
				}
			}
			return INVALID;
		}
		else {
			return VALID;
		}
	};

	that.format = function (value, isLow) {
		// Returns value modified to use the format WQP is expecting
		// The isLow boolean is used to format dates that use only month-year or year.

		var getZeroFilled = function (n, width) {
			// Returns n with zeros prepending if necessary to that the returned
			// string has width characters.
			var result = n;
			var i;
			if (n.length < width) {
				for (i = 0; i < width - n.length; i++) {
					result = '0' + result;
				}
			}
			return result;
		};

		var month, day, year;
		var dateValues;

		if (value) {
			dateValues = value.replace(sepRegExp, '-').split('-');

			if (dateValues.length === 3) {
				month = getZeroFilled(dateValues[0], 2);
				day = getZeroFilled(dateValues[1], 2);
				year = dateValues[2];
			}
			else if (dateValues.length === 2) {
				//Assumes month-year
				month = getZeroFilled(dateValues[0], 2);
				year = dateValues[1];
				if (isLow) {
					day = '01';
				}
				else {
					// This works because months start at zero in js and a zero day gives you the last day in the previous month
					day = (new Date(year, month, 0)).getDate();
				}
			}
			else if (dateValues.length === 1) {
				year = dateValues[0];
				if (isLow) {
					day = '01';
					month = '01';
				}
				else {
					day = '31';
					month = '12';
				}
			}

			return month + DELIM + day + DELIM + year;
		}
		else {
			return '';
		}
	};

	return that;
}();


