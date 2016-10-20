
from flask import Blueprint, request, make_response, Response
from requests import head as requests_head

from .utils import site_geojson_generator, is_huc2, is_huc8
from .. import app

NWIS_SITES_SERVICE_ENDPOINT = app.config['NWIS_SITES_SERVICE_ENDPOINT']
REQUIRED_SERVICE_ARGUMENTS = ('sites', 'statecd', 'huc', 'bbox', 'countycd')
US_HUC2s = ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
            '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21')

MAX_HUC2 = 1
MAX_HUC8 = 10


sites = Blueprint('sites', __name__)


@sites.route('/', methods=['GET'])
def nwis_sites():
    """
    NWIS site geojson retrieval
    Uses the same query parameters as described here, http://waterservices.usgs.gov/rest/Site-Test-Tool.html. If no major filters are used, the service downloads data for all US huc 2's. In addition there is no restriction on the number of hucs defined in the 'huc' parameters. Returns a geojson feature collection containing all of the NWIS sites in the query.
    ---
    tags:
      - Sites
    parameters:
      - name: huc
        in: query
        type: string
        description: list of huc 2's or huc 8's separated by commas
      - name: sites
        in: query
        type: string
        description: list of site numbers separated by commas
      - name: stateCd
        in: query
        type: string
        description: US Postal Code (example WI)
      - name: bBox
        in: query
        type: string
        description: west,sout,east,north
      - name: countyCd
        in: query
        type: string
        description: 5 digit county code
      - name: startDt
        in: query
        type: string
        description: start date (example 1990-01-01)
      - name: endDt
        in: query
        type: string
        description: end date (example 1990-01-01)
      - name: siteStatus
        in: query
        type: string
        description: all | active | inactive
      - name: siteType
        in: query
        type: string
        description: Example 'ST'
      - name: hasDataTypeCd
        in: query
        type: string
        description: list of allowed values
      - name: parameterCd
        in: query
        type: string
        description: USGS parameter code
    responses:
      200:
        description: Returns a geojson feature collection of NWIS sites
        schema:
          type: object
          required:
          - crs
          - type
          - features
          properties:
            crs:
              type: object
            type:
              type: string
            features:
              type: array
              items:
                type: object
                required:
                - geometry
                - type
                properties:
                  geometry:
                    type: array
                    items:
                      type: number
                  type:
                    type: string
                  properties:
                    type: array
                    items:
                      type: object
                      properties:
                        hucCode:
                          type: string
                        agencyCd:
                          type: string
                        siteNumber:
                          type: string
                        stationName:
                          type: string
                        SiteTypeCode:
                          type: string
                        SiteType:
                          type: string
                        url:
                          type: string

          example:
            crs:
              type: name
              properties:
                name: 'urn:ogc:def:crs:EPSG::4326'
            type: FeatureCollection
            features:
              - geometery:
                  type: Point
                  coordinates: [-67.1, 46.5]
                type: Feature
                properties:
                  - hucCode: '01010101'
                    agencyCd: USGS
                    siteNumber: '00336840'
                    stationName: Name of your station
                    SiteTypeCode: ST
                    SiteType: Stream
                    url: 'http://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=00336840'
      400:
        description: Bad Request
        schema:
          type: string
    """

    site_request_params = dict(request.args)
    site_request_params['format'] = 'rdb'
    params_list = []

    # If none of the required service arguments are used, we will retrieve the entire
    huc_values = None
    if not any(k.lower() in REQUIRED_SERVICE_ARGUMENTS for k in request.args.keys()):
        huc_values = US_HUC2s

    elif 'huc' in [key.lower() for key in site_request_params.keys()]:
        huc_values = request.args['huc'].split(',')

    # Check for limits on the number of huc2s and huc8s. If it exceeds NWIS limitation, then
    # multiple service calls will be needed.
    if huc_values:
        huc2s = [hucid for hucid in huc_values if is_huc2(hucid)]
        huc8s = [hucid for hucid in huc_values if is_huc8(hucid)]
        huc2_count = len(huc2s)
        huc8_count = len(huc8s)

        if huc2_count > MAX_HUC2 or huc8_count > MAX_HUC8:
            # Make a requests.get for each huc2 and for groups of 10 huc8s.
            # We add these as a one element array because that's the way we get them from requests.args
            for huc2 in huc2s:
                new_params = dict(site_request_params)
                new_params['huc'] = [huc2]
                params_list.append(new_params)

            for index in range(((huc8_count - 1) / MAX_HUC8) + 1):
                new_params = dict(site_request_params)
                new_params['huc'] = [','.join(huc8s[index * MAX_HUC8:min(huc8_count, (index + 1) * MAX_HUC8)])]
                params_list.append(new_params)

    # If we don't have to make multiple requests just add the site_request_params received to params_list
    if not params_list:
        params_list.append(site_request_params)

    # Make a head request to validate the parameters. If it fails, don't proceed, just return the error
    head_response = requests_head(NWIS_SITES_SERVICE_ENDPOINT, params=params_list[0])
    if head_response.status_code != 200:
        response = make_response(head_response.reason, head_response.status_code)

    else:
        response = Response(site_geojson_generator(params_list), content_type='application/json')

    return response

