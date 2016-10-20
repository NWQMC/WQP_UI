
from unittest import TestCase

import mock
from requests_mock import Mocker as Requests_Mocker

from ..views import nwis_sites, US_HUC2s
from ... import app

@Requests_Mocker()
class TestSitesViewTestCase(TestCase):



    def test_invalid_parameters(self, m):
        m.head('http://waterservices.usgs.gov/nwis/site/', status_code=400, reason='Invalid parameters')
        with app.test_request_context('/sites/'):
            response = nwis_sites()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, 'Invalid parameters')

    @mock.patch('wqp_ui.sites.views.site_geojson_generator')
    def test_valid_parameters(self, m, mock_gen):
        m.head('http://waterservices.usgs.gov/nwis/site/')
        with app.test_request_context('/sites/?statecd=WI&siteType=ST'):
            response = nwis_sites()
        mock_gen.assert_called_with([{'format': 'rdb', 'statecd': [u'WI'], 'siteType': ['ST']}])

    @mock.patch('wqp_ui.sites.views.site_geojson_generator')
    def test_one_huc2(self, m, mock_gen):
        m.head('http://waterservices.usgs.gov/nwis/site/')
        with app.test_request_context('/sites/?huc=01'):
            response = nwis_sites()

        self.assertEqual(response.status_code, 200)
        mock_gen.assert_called_with([{'format': 'rdb', 'huc': [u'01']}])

    @mock.patch('wqp_ui.sites.views.site_geojson_generator')
    def test_three_huc2(self, m, mock_gen):
        m.head('http://waterservices.usgs.gov/nwis/site/')
        with app.test_request_context('/sites/?huc=01,02,03'):
            response = nwis_sites()

        gen_calls = mock_gen.call_args[0][0]
        self.assertEqual(len(gen_calls), 3)
        self.assertTrue([param for param in gen_calls if param['huc'] == ['01']])
        self.assertTrue([param for param in gen_calls if param['huc'] == ['02']])
        self.assertTrue([param for param in gen_calls if param['huc'] == ['03']])


    @mock.patch('wqp_ui.sites.views.site_geojson_generator')
    def test_ten_huc8(self, m, mock_gen):
        m.head('http://waterservices.usgs.gov/nwis/site/')
        with app.test_request_context(
                '/sites/?huc=01010101,01010102,01010103,01010104,01010105,01010106,01010107,01010108,01010109,01010110'):
            response = nwis_sites()

        gen_calls = mock_gen.call_args[0][0]
        self.assertEqual(len(gen_calls), 1)
        self.assertEqual(gen_calls[0]['huc'],
                         [u'01010101,01010102,01010103,01010104,01010105,01010106,01010107,01010108,01010109,01010110'])

    @mock.patch('wqp_ui.sites.views.site_geojson_generator')
    def test_eleven_huc8(self, m, mock_gen):
        m.head('http://waterservices.usgs.gov/nwis/site/')
        with app.test_request_context(
                '/sites/?huc=01010101,01010102,01010103,01010104,01010105,01010106,01010107,01010108,01010109,01010110,02020202'):
            response = nwis_sites()

        gen_calls = mock_gen.call_args[0][0]
        self.assertEqual(len(gen_calls), 2)
        self.assertTrue([param for param in gen_calls
                        if param['huc'] == ['01010101,01010102,01010103,01010104,01010105,01010106,01010107,01010108,01010109,01010110']])
        self.assertTrue([param for param in gen_calls if param['huc'] == ['02020202']])

    @mock.patch('wqp_ui.sites.views.site_geojson_generator')
    def test_no_required_args(self, m, mock_gen):
        m.head('http://waterservices.usgs.gov/nwis/site/')
        with app.test_request_context('/sites/?siteType=ST'):
            response = nwis_sites()

        gen_calls = mock_gen.call_args[0][0]
        self.assertEqual(len(gen_calls), len(US_HUC2s))
        self.assertEqual(len([param for param in gen_calls if param['siteType'] == ['ST']]), len(US_HUC2s))