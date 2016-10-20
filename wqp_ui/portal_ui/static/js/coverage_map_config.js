CoverageMapConfig = {};


CoverageMapConfig.LAYER_PARAM = {
	'states': 'qw_portal_map:states_all',
	'counties': 'qw_portal_map:counties_all',
	'huc8': 'qw_portal_map:huc8_all'
};
CoverageMapConfig.SOURCE_VIEWPARAMS = {
	'storet': 'source1:E;source2:E',
	'nwis': 'source1:N;source2:N',
	'all': 'source1:E;source2:N'
};
CoverageMapConfig.get_viewparams = function (date_filter, source) {
	return CoverageMapConfig.SOURCE_VIEWPARAMS[source] + ';timeFrame:' + date_filter;
};

CoverageMapConfig.SLD_DATASOURCE = {
	'storet': 'E',
	'nwis': 'N',
	'all': 'A'
};
CoverageMapConfig.SLD_GEOMETRY = {
	'states': 'S',
	'counties': 'C',
	'huc8': 'H'
};
CoverageMapConfig.SLD_TIMEFRAME = {
	'past_12_months': '1',
	'past_60_months': '5',
	'all_time': 'A'
};
CoverageMapConfig.get_sld_param = function (display_by, date_filter, source) {
	return Config.SLD_ENDPOINT +
		'?dataSource=' + CoverageMapConfig.SLD_DATASOURCE[source] +
		'&geometry=' + CoverageMapConfig.SLD_GEOMETRY[display_by] +
		'&timeFrame=' + CoverageMapConfig.SLD_TIMEFRAME[date_filter];
};

CoverageMapConfig.TITLE_ATTR = {
	'states': 'STATE',
	'counties': 'COUNTY_NAME',
	'huc8': 'CAT_NUM'
};

