import feedparser
import requests
from bs4 import BeautifulSoup
from flask import request, make_response
import tablib
import redis
import csv
import cPickle as pickle


def pull_feed(feed_url):
    """
    pull page data from a my.usgs.gov confluence wiki feed
    :param feed_url: the url of the feed, created in confluence feed builder
    :return: the html of the page itself, stripped of header and footer
    """
    feed = feedparser.parse(feed_url)

    # Process html to remove unwanted mark-up and fix links
    post = ''
    if len(feed['entries']) > 0:
        soup = BeautifulSoup(feed['entries'][0].summary, 'html.parser')

        # Remove edited by paragraph
        soup.p.extract()

        # Remove final div in the feed
        feed_div = soup.find('div', class_='feed')
        children_divs = feed_div.findAll('div')
        children_divs[len(children_divs) - 1].extract()

        # Translate any in page links to use relative URL
        base = feed['entries'][0].summary_detail.base
        links = feed_div.select('a[href^="' + base + '"]')
        for link in links:
            link['href'] = link['href'].replace(base, '')
        post = unicode(soup)

    return post


def geoserver_proxy_request(target_url):
    """

    :param target_url:
    :return:
    """
    if request.method == 'GET':
        resp = requests.get(target_url + '?' + request.query_string)
        # This fixed an an ERR_INVALID_CHUNKED_ENCODING when the app was run on the deployment server.
        if 'transfer-encoding' in resp.headers:
            del resp.headers['transfer-encoding']
        # This fixed an net::ERR_CONTENT_DECODING_FAILED
        if 'content-encoding' in resp.headers:
            del resp.headers['content-encoding']
            
    else:
        resp = requests.post(target_url, data=request.data, headers=request.headers)
        if 'content-encoding' in resp.headers: 
            del resp.headers['content-encoding']
        
    return make_response(resp.content, resp.status_code, resp.headers.items())    


def generate_provider_list(endpoint):
    """

    :param endpoint: the base codes endpoint
    :return: a list of provider names
    """
    provider_endpoint = endpoint + '/providers'
    r = requests.get(provider_endpoint, {"mimeType": "json"})
    status_code = r.status_code
    provider_list = None
    if status_code == 200:
        codes = r.json().get('codes')
        provider_list = sorted([code['value'] for code in codes])
    return {"status_code": status_code, "providers": provider_list}


def check_org_id(org_id, code_endpoint):
    org_exists = False
    org_name = None
    org_endpoint = code_endpoint + '/Organization'
    r = requests.get(org_endpoint, {"mimeType": "json", "text": org_id})
    status_code = r.status_code
    if status_code == 200:
        codes = r.json().get('codes')
        for code in codes:
            if code['value'] == org_id:
                org_exists = True
                org_name = code['desc']
                break
    return {"org_exists": org_exists, "status_code": status_code, "org_name": org_name}


def generate_organization_list(endpoint, provider):
    """

    :param endpoint: the base codes endpoint
    :param provider: which provider we are looking for
    :return: a list of dicts of organizations and organization IDs for a specific provider
    """
    provider_endpoint = endpoint + '/organizations'
    r = requests.get(provider_endpoint, {"mimeType": "json"})
    status_code = r.status_code
    organization_list = None
    if status_code == 200:
        organization_list = []
        codes = r.json().get('codes')
        for organization in codes:
            org_dict = {}
            org_providers = organization['providers'].split(' ')
            if provider in org_providers:
                org_dict['id'] = organization['value']
                org_dict['name'] = organization['desc']
            if org_dict:
                organization_list.append(org_dict)
    return {"status_code": status_code, "organizations": organization_list}


def get_site_info(base_url, provider_id, site_id, organization_id):
    """

    :param base_url:
    :param provider_id:
    :param site_id:
    :param organization_id: id of the organization that has the site
    :return:
    """
    search_endpoint = base_url + "Station/search/"
    r = requests.get(search_endpoint, {"providers": provider_id, "siteid": site_id, "mimeType": "csv", "sorted": "no",
                                       "organization": organization_id, "uripage": "yes"})
    status_code = r.status_code
    site_data = None
    if status_code == 200 and r.text:
        site_data_raw = r.content
        data = tablib.Dataset().load(site_data_raw).dict[0]
        if data is not None:
            site_data = dict(data)
    return {"status_code": status_code, "site_data": site_data}


def make_cache_key():
    """
    this function gets the provider ID out of the path for the various URI fields, so that we can set the cache prefix
     in a way that can be cleared programatically.  The path needs to look like /provider/<provider_id>/*
    :return: the provider
    """
    path = request.path
    key = '_'.join(path.split('/'))
    return key


def generate_redis_db_number(provider):
    """

    :param provider: a WQP data provider
    :return: a database number to assign for redis to allow for cache clearing
    """
    # set a default
    redis_db_number = 0
    if provider == 'NWIS':
        redis_db_number = 1
    elif provider == 'STORET':
        redis_db_number = 2
    elif provider == 'STEWARDS':
        redis_db_number = 3
    elif provider == 'BIODATA':
        redis_db_number = 4
    return redis_db_number


def generate_site_list_from_streamed_tsv(base_url, redis_config, provider_id, redis_db, organization_id=None):
    """

    :param base_url: the base url we are using for the generating the search URL
    :param organization_id:
    :param provider_id:
    :param redis_config:
    :return: a list of dicts that describe sites that are associated with an organization under a data provider
    """
    search_endpoint = base_url+"Station/search/"
    r = requests.get(search_endpoint, {"organization": organization_id, "providers": provider_id,
                                       "mimeType": "tsv", "sorted": "no", "uripage": "yes"}, stream=True
                     )

    status = r.status_code
    header_line = None
    redis_session = None
    if redis_config:
        redis_session = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'], db=redis_db,
                                          password=redis_config.get('password'))
    error_count = 0
    cached_count = 0
    counter = 0
    for line in r.iter_lines():
        # filter out keep-alive new lines
        if line:
            if counter == 0:
                header_line = line
                header_object = csv.reader([header_line], delimiter='\t')
                for row in header_object:
                    header = row
                counter += 1
            elif counter >= 1:
                station = csv.reader([line], delimiter='\t')
                for row in station:
                    station_data = row
                    if len(station_data) == 36:
                        station_dict = dict(zip(header, station_data))
                        site_key = 'sites_' + provider_id + '_' + str(station_dict['OrganizationIdentifier']) + "_" + \
                                   str(station_dict['MonitoringLocationIdentifier'])
                        if redis_session:
                            redis_session.set(site_key, pickle.dumps(station_dict, protocol=2))
                        cached_count += 1
                    elif len(station_data) != 36:
                        error_count += 1

    return {"status": status, "cached_count": cached_count, "error_count": error_count}
