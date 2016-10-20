var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};

// A placement of left does not work well on xs devices as it goes off the
// left edge with no way to scroll.

PORTAL.MODELS.help = {
	country: {
		placement: 'auto',
		title: 'Country Help',
		content: '\
        <div>Countries represented in the database can be selected from the drop down list. \
        The available data sources are listed in parenthesis for each country. Multiple countries\
        may be selected. \
        </div>'
	},
	state: {
		placement: 'auto',
		title: 'State Help',
		content: '\
        <div>States or provinces for the selected countries can be selected from the drop down list. \
        If the countries select is clear, then US states are available. Selections are shown as XX:YY where \
        XX is the country code and YY is the FIPS code with the exception that postal code is shown for US states. \n\
        The available data sources are listed in parenthesis for each state. Multiple states may be selected. \
        </div>'
	},
	county: {
		placement: 'auto',
		title: 'County Help',
		content: '\
        <div>Counties for the selected states can be selected from the drop down list. \
        Selections are shown as XX:YY:ZZZ where XX is the country code, YY is the FIPS or postal code and \
        ZZZ is the county postal code. The available data sources are listed in parenthesis for each county. \
        Multiple counties may be selected.\
        </div>'
	},
	pointLocation: {
		placement: 'auto',
		title: 'Point Location Help',
		content: '\
                <div>Enter a latitude and longitude and a radial distance \
                        to create a search area. Distance should be entered in \
                        miles. Latitude and longitude should be entered in \
                        decimal degrees relative to the NAD83 datum. Longitudes \
                        in the western hemisphere should be preceded with a \
                        negative sign ("-"). Many stations outside the continental US do not have latitude and longitude referenced to WGS84 \
                        and therefore cannot be found using these parameters.\
                </div>\
                <br />\
                <div>\
                        <b>Example:</b>\
                        <br/>\
                        20 miles from Latitude 46.12 degrees N, Longitude 89.15 degrees W would be entered as:\
                        <ul>\
                                <li>Distance: 20</li>\
                                <li>Latitude: 46.12</li>\
                                <li>Longitude: -89.15</li>\
                        </ul>\
                </div>'
	},
	boundingBox: {
		placement: 'auto',
		title: 'Bounding Box Help',
		content: '\
                <div>Enter the North and South latitudes and the East and \
                West longitudes to create a bounding box. Latitude \
                and Longitude should be entered in decimal degrees \
                relative to the NAD83 datum. Longitudes in the \
                western hemisphere should be preceded with a negative sign ("-").\
                </div>\
                <br />\
                <div>\
                <b>Example:</b>\
                <ul>\
                        <li>North: 46.12</li>\
                        <li>East: -89.15</li>\
                        <li>South: 45.93</li>\
                        <li>West: -89.68</li>\
                </ul>\
                </div>'
	},
	siteType: {
		placement: 'auto',
		title: 'Site Type Help',
		content: '\
	        <div>\
	        A site type is a generalized location in the hydrologic cycle, or a man-made \
	        feature thought to affect the hydrologic conditions measured at a site. Site types can be selected \
	        from the drop down list. The available data sources are listed in parenthesis for each \
	        site type. Multiple site types may be selected.\
	        </div>'
	},
	organization: {
		placement: 'auto',
		title: 'Organization Help',
		content: '\
            <div>\
            A designator used to identify a unique business establishment within a context. \
            Select from a list of organization IDs represented in the source databases.\
            Multiple IDs may be selected.\
            </div>'
	},
	siteID: {
		placement: 'auto',
		title: 'Site ID Help',
		content: '\
                <div> \
                A site id is a designator used to describe the unique name, number, or code assigned to identify the monitoring\
                location.  Site IDs are case-sensitive and should be entered in the following format: AGENCY-STATION NUMBER.  More\
                than one site ID may be entered, separated by semicolons.  If you are entering an NWIS site, use "USGS" as the AGENCY.\
                </div>\
                <br />\
                <div>\
                <b>Examples:</b>\
                <ul>\
                        <li><i>For NWIS site:</i> USGS-301650084300701</li>\
                        <li><i>For STORET site:</i> R10BUNKER-CUA005-5</li>\
                        <li><i>For multiple sites:</i><br/> IN002-413354086221001;USSCS-311257091521312;USEPA-414007085591501</li>\
                </ul>\
        </div>\
        <p>For further information about NWIS versus STORET site ids, go to the <a href="../faqs#WQPFAQs-SiteIDs" target="FAQWin">FAQs</a> page</p>'
	},
	huc: {
		placement: 'auto',
		title: 'HUC Help',
		content: '\
                <div>A HUC is a federal code used to identify the hydrologic unit of the monitoring location to the cataloging unit\
                level of precision.  Full hydrologic unit codes (HUCs) or partial HUCs using trailing wildcards may be entered.  Only\
                trailing wildcards are accepted.  More than one HUC may be entered, separated by semicolons.\
                The <A href="http://water.usgs.gov/GIS/huc.html" target="_blank">lists and maps of hydrologic units</A>\
                are available from the USGS.</div>\
                <br />\
                <div>\
                <b>Examples:</b>\
                <ul>\
                        <li>01010003;01010004</li>\
                        <li>010801*</li>\
                        <li>01010003;010801*;01010005</li>\
                </ul>\
                </div>'
	},
	nldi: {
		placement: 'auto',
		title: 'NLDI Help',
		content: '\
			<div><p>Select a navigation direction and distance and click on a query location on the map to display sites upstream or downstream of that point. \
			The list of sites will be passed to the water quality portal query.</p>\
			<p>Use a distance with upstream tributaries to restrict the query size and ensure that the result does not crash the page</p>\
			<p>This tool uses the <a href="https://cida.usgs.gov/nldi/about"  target="_blank" title="Go to the Network Linked Data Index about page" >Network Linked Data Index</a> to navigate.</p>\
			</div>'
	},
	sampleMedia: {
		placement: 'auto',
		title: 'Sample Media Help',
		content: '\
        <div>A sample media indicates the environmental medium where a sample was taken. \
        Sample media can be selected \
        from the drop down list. The available data sources are listed in parenthesis for each \
        sample media. Multiple sample media may be selected.\
        </div>'
	},
	characteristicGroup: {
		placement: 'auto',
		title: 'Characteristic Group Help',
		content: '\
        <div>A characteristic group can be selected \
        from the drop down list. The available data sources are listed in parenthesis for each \
        characteristic group. Multiple characteristic groups may be selected.\
        </div>'
	},
	characteristicName: {
		placement: 'auto',
		title: 'Characteristics Help',
		content: '\
        <div>A characteristic identifies different types of environmental measurements. \
        The names are derived from the USEPA \
        <a href="http://iaspub.epa.gov/sor_internet/registry/substreg/home/overview/home.do" target="_blank">Substance Registry System (SRS)</a>. \
        The available data \
        sources are listed in parenthesis for each characteristic. Multiple characteristics may \
        be selected. </div>'
	},
	project: {
		placement: 'auto',
		title: 'Project ID Help',
		content: '\
    		The Project identifier is a designator used to uniquely identify a data collection project within a context of an organization.'
	},
	pcode: {
		placement: 'auto',
		title: 'Parameter Code Help',
		content: '\
                <div>A Parameter Code is a 5-digit number used in NWIS to uniquely identify a specific characteristic.  \
                One or more five-digit USGS parameter codes can be requested, separated by semicolons. For more information on NWIS \n\
                pcodes see <a target="_blank" href="http://nwis.waterdata.usgs.gov/usa/nwis/pmcodes">http://nwis.waterdata.usgs.gov/usa/nwis/pmcodes</a></div>\
                <br>\
                <div class="instructions"><b>Please Note:</b> Specifying a Parameter Code will limit the query to NWIS only.</div>\
                <br />\
                <div>\
                <b>Examples:</b>\
                <ul>\
                        <li>00065</li>\
                        <li>00065;00010</li>\
                </ul>\
                </div>'
	},
	minresults : {
		placement : 'auto',
		title : 'Minimum results per site Help',
		content: '\
        	<div>This limits the data returned to data from sites where at least a minimum number of results have been \
        	reported that conform to the rest of the query parameters.  For example, if you are looking for stream sites in \
        	Wisconsin that have nutrient samples taken beween 2010 and 2015, entering 10 in this box would return only results \
        	from sites where at least 10 nutrient result values have been reported</div>'
	},
	biologicalparams: {
		placement: 'auto',
		title: 'Biological Sampling Parameters Help',
		content: '\
        	<div>These parameters are related to samples of biological organisms, such as species name or the assemblage that a group of organisms belongs to</div>'
	},
	taxonomicName: {
		placement: 'auto',
		title: 'Taxonomic Name Help',
		content: '\
        	<div>The Taxonomic Name parameter queries the SubjectTaxonomicName in the WQP output.  This is typically in Genus species binomial nomenclature form.  For example, \
        	to look for sites sampled for the shovelnose sturgeon, enter <i>Scaphirhynchus platorynchus</i></div>'
	},
	assemblage: {
		placement: 'auto',
		title: 'Assemblage Help',
		content: '\
    		<div>The Assemblage is specific to biological collection data, and refers to "An association \
    		of interacting populations of organisms in a given waterbody."  Examples include macroinvertabrates and fish/nekton.  </div>'
	},

	xmlSchema: {
		placement: 'auto',
		title: 'WQX-Outbound Schema Info',
		content: '\
                <div>The Water Quality Portal (WQP) \
                        Web Services conform to the format defined in the below referenced XML schema.\
                </div> \
                <br />\
                <div>\
                <b>WQX-Outbound XML schema information:</b>\
                <ul>\
                        <li><a href="schemas/WQX-Outbound/2_0/index.xsd" target="_blank">WQX-Outbound XML schema</a></li>\
                        <li><a href="schemas/WQX-Outbound/2_0/docs/index.html" target="_blank">WQX-Outbound XML schema documentation</a></li>\
                </ul>\
                </div>'
	}
};


