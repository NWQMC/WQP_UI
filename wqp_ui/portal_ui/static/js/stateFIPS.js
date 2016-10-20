var stateFIPS = {
	fipsMap: {
		'01': {name: 'Alabama', postalCode: 'AL'},
		'02': {name: 'Alaska', postalCode: 'AK'},
		'04': {name: 'Arizona', postalCode: 'AZ'},
		'05': {name: 'Arkansas', postalCode: 'AR'},
		'06': {name: 'California', postalCode: 'CA'},
		'08': {name: 'Colorado', postalCode: 'CO'},
		'09': {name: 'Connecticut', postalCode: 'CT'},
		'10': {name: 'Delaware', postalCode: 'DE'},
		'11': {name: 'District of Columbia', postalCode: 'DC'},
		'12': {name: 'Florida', postalCode: 'FL'},
		'13': {name: 'Georgia', postalCode: 'GA'},
		'15': {name: 'Hawaii', postalCode: 'HI'},
		'16': {name: 'Idaho', postalCode: 'ID'},
		'17': {name: 'Illinois', postalCode: 'IL'},
		'18': {name: 'Indiana', postalCode: 'IN'},
		'19': {name: 'Iowa', postalCode: 'IA'},
		'20': {name: 'Kansas', postalCode: 'KS'},
		'21': {name: 'Kentucky', postalCode: 'KY'},
		'22': {name: 'Louisiana', postalCode: 'LA'},
		'23': {name: 'Maine', postalCode: 'ME'},
		'24': {name: 'Maryland', postalCode: 'MD'},
		'25': {name: 'Massachusetts', postalCode: 'MA'},
		'26': {name: 'Michigan', postalCode: 'MI'},
		'27': {name: 'Minnesota', postalCode: 'MN'},
		'28': {name: 'Mississippi', postalCode: 'MS'},
		'29': {name: 'Missouri', postalCode: 'MO'},
		'30': {name: 'Montana', postalCode: 'MT'},
		'31': {name: 'Nebraska', postalCode: 'NE'},
		'32': {name: 'Nevada', postalCode: 'NV'},
		'33': {name: 'New Hampshire', postalCode: 'NH'},
		'34': {name: 'New Jersey', postalCode: 'NJ'},
		'35': {name: 'New Mexico', postalCode: 'NM'},
		'36': {name: 'New York', postalCode: 'NY'},
		'37': {name: 'North Carolina', postalCode: 'NC'},
		'38': {name: 'North Dakota', postalCode: 'ND'},
		'39': {name: 'Ohio', postalCode: 'OH'},
		'40': {name: 'Oklahoma', postalCode: 'OK'},
		'41': {name: 'Oregon', postalCode: 'OR'},
		'42': {name: 'Pennsylvania', postalCode: 'PA'},
		'44': {name: 'Rhode Island', postalCode: 'RI'},
		'45': {name: 'South Carolina', postalCode: 'SC'},
		'46': {name: 'South Dakota', postalCode: 'SD'},
		'47': {name: 'Tennessee', postalCode: 'TN'},
		'48': {name: 'Texas', postalCode: 'TX'},
		'49': {name: 'Utah', postalCode: 'UT'},
		'50': {name: 'Vermont', postalCode: 'VT'},
		'51': {name: 'Virginia', postalCode: 'VA'},
		'53': {name: 'Washington', postalCode: 'WA'},
		'54': {name: 'West Virginia', postalCode: 'WV'},
		'55': {name: 'Wisconsin', postalCode: 'WI'},
		'56': {name: 'Wyoming', postalCode: 'WY'},
		'60': {name: 'American Samoa', postalCode: 'AS'},
		'64': {name: 'Federated States of Micronesia', postalCode: 'FM'},
		'66': {name: 'Guam', postalCode: 'GU'},
		'68': {name: 'Marshall Islands', postalCode: 'MH'},
		'69': {name: 'Northern Mariana Islands', postalCode: 'MP'},
		'70': {name: 'Palau', postalCode: 'PW'},
		'72': {name: 'Puerto Rico', postalCode: 'PR'},
		'74': {name: 'U.S. Minor Outlying Islands', postalCode: 'UM'},
		'78': {name: 'Virgin Islands of the U.S.', postalCode: 'VI'}
	},
	getPostalCode: function (fips/* String */) {
		if (stateFIPS.fipsMap[fips]) {
			return stateFIPS.fipsMap[fips].postalCode;
		}
		else {
			return '';
		}
	},

	getName: function (fips /* string */) {
		if (stateFIPS.fipsMap[fips]) {
			return stateFIPS.fipsMap[fips].name;
		}
		else {
			return '';
		}
	},

	getFromPostalCode: function (postalCode /* String */) {
		for (var fips in stateFIPS.fipsMap) {
			if (stateFIPS.fipsMap[fips].postalCode === postalCode) {
				return fips;
			}
		}
		return '';
	}
};

