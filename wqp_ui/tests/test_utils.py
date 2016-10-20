from wqp_ui.utils import generate_redis_db_number, check_org_id, generate_provider_list
import unittest
import requests_mock


class RedisDbNumberTestCase(unittest.TestCase):
    """Tests for generate redis_db_number"""
    def test_will_nwis_return_1(self):
        """will NWIS give back a db value of 1?"""
        assert generate_redis_db_number('NWIS') == 1

    def test_will_storet_return_2(self):
        """will STORET give back a db value of 2?"""
        assert generate_redis_db_number('STORET') == 2

    def test_will_stewards_return_3(self):
        """will STEWARDS give back a db value of 3?"""
        assert generate_redis_db_number('STEWARDS') == 3

    def test_will_biodata_return_4(self):
        """will BIODATA give back a db value of 4?"""
        assert generate_redis_db_number('BIODATA') == 4

    def test_will_other_return_0(self):
        """will any other value give back a db value of 0?"""
        assert generate_redis_db_number('RANDOM') == 0


class CheckOrgIdTestCase(unittest.TestCase):
    """tests for check_org_id"""
    @requests_mock.Mocker(kw='mock')
    def test_when_an_org_exists(self, **kwargs):
        """will an org that exists return what is expected"""
        kwargs['mock'].get('http://www.wqp_ui-mock.gov/Codes/Organization?mimeType=json&text=1119USBR_WQX',
                           text='{"codes":[{"value":"1119USBR_WQX","desc":"Bureau of Reclamation","providers":"STORET"}],"recordCount":1}',
                           status_code=200)
        response = check_org_id('1119USBR_WQX', 'http://www.wqp_ui-mock.gov/Codes')
        assert response == {'org_exists': True, 'status_code': 200, "org_name": "Bureau of Reclamation"}

    @requests_mock.Mocker(kw='mock')
    def test_when_an_org_exists_and_matches_more_than_1(self, **kwargs):
        """will an org that exists return what is expected"""
        kwargs['mock'].get('http://www.wqp_ui-mock.gov/Codes/Organization?mimeType=json&text=1119USBR',
                           text='{"codes":[{"value":"1119USBR","desc":"Bureau of Reclamation","providers":"STORET"},{"value":"1119USBR_WQX","desc":"Bureau of Reclamation","providers":"STORET"}],"recordCount":2}',
                           status_code=200)
        response = check_org_id('1119USBR', 'http://www.wqp_ui-mock.gov/Codes')
        assert response == {'org_exists': True, 'status_code': 200, "org_name": "Bureau of Reclamation"}

    @requests_mock.Mocker(kw='mock')
    def test_when_an_org_doesnt_exist(self, **kwargs):
        """will an org that exists return what is expected when it matches more than 1 """
        kwargs['mock'].get('http://www.wqp_ui-mock.gov/Codes/Organization?mimeType=json&text=1119USB',
                           text='{"codes":[{"value":"1119USBR","desc":"Bureau of Reclamation","providers":"STORET"},{"value":"1119USBR_WQX","desc":"Bureau of Reclamation","providers":"STORET"}],"recordCount":2}',
                           status_code=200)
        response = check_org_id('1119USB', 'http://www.wqp_ui-mock.gov/Codes')
        assert response == {'org_exists': False, 'status_code': 200, "org_name": None}

    @requests_mock.Mocker(kw='mock')
    def test_when_there_is_an_error(self, **kwargs):
        """If the app resturns an error, will the function return the status code"""
        kwargs['mock'].get('http://www.wqp_ui-mock.gov/Codes/Organization?mimeType=json&text=1119USB',
                           text='Something Bad Happened', status_code=500)
        response = check_org_id('1119USB', 'http://www.wqp_ui-mock.gov/Codes')
        assert response == {'org_exists': False, 'status_code': 500, "org_name": None}


class CheckGenerateProviderListTestCase(unittest.TestCase):
    """tests for generate_provider_list"""
    @requests_mock.Mocker(kw='mock')
    def test_provider_list(self, **kwargs):
        """for the happy path, will generate_provider_list return a list of providers"""
        kwargs['mock'].get('http://www.wqp_ui-mock.gov/Codes/providers?mimeType=json',
                           text='{"codes":[{"value":"BIODATA"},{"value":"STEWARDS"},{"value":"STORET"},{"value":"NWIS"}],"recordCount":4}',
                           status_code=200)
        response = generate_provider_list('http://www.wqp_ui-mock.gov/Codes')
        assert response == {'status_code': 200, "providers": ['BIODATA', 'NWIS', 'STEWARDS', 'STORET']}

    @requests_mock.Mocker(kw='mock')
    def test_provider_list_error(self, **kwargs):
        """if the wqp_ui services return an error, will generate provider list act appropriately"""
        kwargs['mock'].get('http://www.wqp_ui-mock.gov/Codes/providers?mimeType=json',
                           text='Something bad happened',
                           status_code=500)
        response = generate_provider_list('http://www.wqp_ui-mock.gov/Codes')
        assert response == {'status_code': 500, "providers": None}
