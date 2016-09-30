
from unittest import TestCase

import geojson

from ..utils import get_site_feature, site_feature_generator, site_geojson_generator

class TestGetSiteFeature(TestCase):

    def test_invalid_lat_lon(self):
        station = {
            'dec_lat_va' : 'Abcd',
            'dec_long_va' : '-100.0',
            'dec_coord_datum_cd' : 'NAD83'
        }
        self.assertIsNone(get_site_feature(station))

        station['dec_lat_va'] = '45.0'
        station['dec_long_va'] = 'abcd'
        self.assertIsNone(get_site_feature(station))

    def test_invalid_coord_datum_cd(self):
        station = {
            'dec_lat_va' : '45.0',
            'dec_long__va' : '-100.0',
            'dec_coord_datum_cd' : ''
        }
        self.assertIsNone(get_site_feature(station))

    def test_valid_data(self):
        station = {
            'dec_lat_va': '45.0',
            'dec_long_va': '-100.0',
            'dec_coord_datum_cd': 'NAD83',
            'station_nm' : 'Black River',
            'agency_cd' : 'USGS',
            'site_no' : '12345',
            'huc_cd' : '03120312',
            'site_tp_cd' : 'ST',

        }
        expectedProperties = {
            'stationName' : 'Black River',
            'agencyCode' : 'USGS',
            'siteNumber' : '12345',
            'hucCode' : '03120312',
            'SiteTypeCode' : 'ST',
            'SiteType' : 'Stream',
            'url': 'http://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=12345'
        }
        result = geojson.loads(geojson.dumps(get_site_feature(station)))


        self.assertEqual(result['properties'], expectedProperties)
        self.assertEqual(result['geometry']['type'], 'Point')


class TestSiteGeneratorTestCase(TestCase):

    HEADERS = '\t'.join(['agency_cd', 'site_no', 'station_nm', 'site_tp_cd', 'dec_lat_va', 'dec_long_va',
               'coord_acy_cd', 'dec_coord_datum_cd', 'alt_va', 'alt_acy_va', 'alt_datum_cd',
               'huc_cd'])

    def test_empty_rdb(self):
        site_lines = []
        iter_lines = (line for line in site_lines)
        self.assertEqual(tuple(site_feature_generator(iter_lines)),())

    def test_rdb_with_only_comments(self):
        site_lines = ['#comment1', '#comment2', '#comment3']
        iter_lines = (line for line in site_lines)
        self.assertEqual(tuple(site_feature_generator(iter_lines)), ())


    def test_rdb_with_only_headers(self):
        site_lines = ['#comment1', '#comment2', '#comment3', self.HEADERS]
        iter_lines = (line for line in site_lines)
        self.assertEqual(tuple(site_feature_generator(iter_lines)), ())

    def test_rdb_with_headers_but_no_data(self):
        site_lines = ['#comment1', '#comment2', '#comment3', self.HEADERS, 'line to skip']
        iter_lines = (line for line in site_lines)
        self.assertEqual(tuple(site_feature_generator(iter_lines)), ())

    def test_rdb_with_data(self):
        site1 = '\t'.join(['USGS', '00336840', 'BISCUIT BROOK NTN SITE', 'AT', '41.9942589', '-74.5032094',
                           'S', 'NAD83', '2087', '4.3', 'NAVD88', '02040104'])
        site2 = '\t'.join(['USGS', '01300450', 'BEAVER SWAMP BROOK AT RYE NY	ST', '40.98', '-73.7019444',
                          'S', 'NAD83',	'49', '4.3', 'NAVD88', '02030102'])
        site_lines = ['#comment1', '#comment2', '#comment3', self.HEADERS, 'line to skip', site1, site2]
        iter_lines = (line for line in site_lines)

        result = tuple(site_feature_generator(iter_lines))
        self.assertEqual(len(result), 2)

