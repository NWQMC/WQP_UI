import arrow
import cPickle as pickle
import sys

from flask import render_template, request, make_response, redirect, url_for, abort, Response, jsonify, Blueprint
import redis
import requests
import ujson

from .. import app
from ..utils import pull_feed, geoserver_proxy_request, generate_provider_list, generate_organization_list, \
    get_site_info, check_org_id, generate_redis_db_number, generate_site_list_from_streamed_tsv
from ..tasks import generate_site_list_from_streamed_tsv_async


# Create blueprint
portal_ui = Blueprint('portal_ui', __name__,
                      template_folder='templates',
                      static_folder='static',
                      static_url_path='/portal_ui/static')
# fix a mysterious encoding issue, see
# http://stackoverflow.com/questions/21129020/how-to-fix-unicodedecodeerror-ascii-codec-cant-decode-byte
# this is a great reason to update to python 3,
# which is unicode by default and doesn't suffer from so many weird problems due to encoding
reload(sys)
sys.setdefaultencoding('utf8')

# set some useful local variables from the global config variables
code_endpoint = app.config['CODES_ENDPOINT']
base_url = app.config['SEARCH_QUERY_ENDPOINT']
redis_config = app.config['REDIS_CONFIG']
cache_timeout = app.config['CACHE_TIMEOUT']


@portal_ui.route('/index.jsp')
@portal_ui.route('/index/')
@portal_ui.route('/', endpoint='home-canonical')
def home():
    if request.path == '/index.jsp' or request.path == '/index/':
        return redirect(url_for('home-canonical')), 301
    return render_template('index.html')
 

@portal_ui.route('/contact_us.jsp')
@portal_ui.route('/contact_us/', endpoint='contact_us-canonical')
def contact_us():
    if request.path == '/contact_us.jsp':
        return redirect(url_for('contact_us-canonical')), 301
    return render_template('contact_us.html')


@portal_ui.route('/portal.jsp')
@portal_ui.route('/portal/', endpoint='portal-canonical')
def portal():
    if request.path == '/portal.jsp':
        return redirect(url_for('portal-canonical')), 301
    return render_template('portal.html')


@portal_ui.route('/portal_userguide.jsp')
@portal_ui.route('/portal_userguide/', endpoint='portal_userguide-canonical')
def portal_userguide():
    if request.path == '/portal_userguide.jsp':
        return redirect(url_for('portal_userguide-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_user_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('portal_userguide.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/webservices_documentation.jsp')
@portal_ui.route('/webservices_documentation/', endpoint='webservices_documentation-canonical')
def webservices_documentation():
    if request.path == '/webservices_documentation.jsp':
        return redirect(url_for('webservices_documentation-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_web_services_guide&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('webservices_documentation.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/faqs.jsp')
@portal_ui.route('/faqs/', endpoint='faqs-canonical')
def faqs():
    if request.path == '/faqs.jsp':
        return redirect(url_for('faqs-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_faqs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('faqs.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/upload_data.jsp')
@portal_ui.route('/upload_data/', endpoint='upload_data-canonical')
def upload_data():
    if request.path == '/upload_data.jsp':
        return redirect(url_for('upload_data-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_upload_data&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('upload_data.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/coverage.jsp')
@portal_ui.route('/coverage/', endpoint='coverage-canonical')
def coverage():
    if request.path == '/coverage.jsp':
        return redirect(url_for('coverage-canonical')), 301
    return render_template('coverage.html')


@portal_ui.route('/wqp_description.jsp')
@portal_ui.route('/wqp_description/', endpoint='wqp_description-canonical')
def wqp_description():
    if request.path == '/wqp_description.jsp':
        return redirect(url_for('wqp_description-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_about&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('wqp_description.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/orgs.jsp')
@portal_ui.route('/orgs/', endpoint='orgs-canonical')
def orgs():
    if request.path == '/orgs.jsp':
        return redirect(url_for('orgs-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=contributing_orgs&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('orgs.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/apps_using_portal.jsp')
@portal_ui.route('/apps_using_portal/', endpoint='apps_using_portal-canonical')
def apps_using_portal():
    if request.path == '/apps_using_portal.jsp':
        return redirect(url_for('apps_using_portal-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=wqp_applications&excludedSpaceKeys%3D&sort=modified&maxResults=10&timeSpan=600&showContent=true&confirm=Create+RSS+Feed"
    return render_template('apps_using_portal.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/other_portal_links.jsp')
@portal_ui.route('/other_portal_links/', endpoint='other_portal_links-canonical')
def other_portal_links():
    if request.path == '/other_portal_links.jsp':
        return redirect(url_for('other_portal_links-canonical')), 301
    feed_url = "https://my.usgs.gov/confluence/createrssfeed.action?types=page&spaces=qwdp&title=myUSGS+4.0+RSS+Feed&labelString=other_portal_links&excludedSpaceKeys%3D&sort=modified&maxResults=1&timeSpan=3650&showContent=true&confirm=Create+RSS+Feed"
    return render_template('other_portal_links.html', feed_content=pull_feed(feed_url))


@portal_ui.route('/public_srsnames.jsp')
@portal_ui.route('/public_srsnames/', endpoint='public_srsnames-canonical')
def public_srsnames():
    if request.path == '/public_srsnames.jsp':
        return redirect(url_for('public_srsnames-canonical')), 301
    return render_template('public_srsnames.html')
    

@portal_ui.route('/wqp_geoserver/<op>', methods=['GET', 'POST'])
def wqp_geoserverproxy(op):
    target_url = app.config['WQP_MAP_GEOSERVER_ENDPOINT'] + '/' + op
    return geoserver_proxy_request(target_url)
    

@portal_ui.route('/sites_geoserver/<op>', methods=['GET', 'POST'])
def sites_geoserverproxy(op):
    target_url = app.config['SITES_MAP_GEOSERVER_ENDPOINT'] + '/' + op
    return geoserver_proxy_request(target_url)

@portal_ui.route('/crossdomain.xml')
def crossdomain():
    xml = render_template('crossdomain.xml')
    response = make_response(xml)
    response.headers["Content-Type"] = "application/xml"  
    return response   
    

@portal_ui.route('/kml/wqp_styles.kml')
def kml():
    xml = render_template('wqp_styles.kml')
    response = make_response(xml)
    response.headers["Content-Type"] = "application/vnd.google-earth.kml+xml"
    return response


@portal_ui.route('/img/<image_file>')
def images(image_file):
    return app.send_static_file('img/'+image_file)


@portal_ui.route('/provider/', endpoint='uri_base')
def uri_base():
    providers = generate_provider_list(code_endpoint)
    if providers['status_code'] == 200 and providers['providers']:
        if providers['providers']:
            provider_list = providers['providers']
            return render_template('provider_base.html', providers=provider_list)
        else:
            abort(500)
    elif providers['status_code'] == 404:
        abort(500)
    elif providers['status_code'] == 500:
        abort(500)


@portal_ui.route('/provider/<provider_id>/', endpoint='uri_provider')
def uri_provider(provider_id):
    providers = generate_provider_list(code_endpoint)['providers']
    if provider_id not in providers:
        abort(404)
    else:
        organizations_response = generate_organization_list(code_endpoint, provider_id)
        if organizations_response['status_code'] == 200:
            if organizations_response['organizations']:
                organizations = organizations_response['organizations']
                return render_template('provider_page.html', provider=provider_id, organizations=organizations)
            else:
                abort(500)
        elif organizations_response['status_code'] == 404:
            abort(404)
        elif organizations_response['status_code'] == 500:
            abort(500)


@portal_ui.route('/provider/<provider_id>/<organization_id>/', endpoint='uri_organization')
def uri_organization(provider_id, organization_id):
    providers = generate_provider_list(code_endpoint)['providers']
    if provider_id not in providers:
        abort(404)
    org_check = check_org_id(organization_id, code_endpoint)
    if org_check['status_code'] == 200 and org_check['org_exists'] == False:
        abort(404)
    rendered_site_template = None
    search_endpoint = base_url + "Station/search/"
    if redis_config:
        redis_db_number = generate_redis_db_number(provider_id)
        redis_session = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'],
                                          db=redis_db_number, password=redis_config.get('password'))
        all_sites_key = 'all_sites_' + provider_id + '_' + organization_id
        redis_all_site_data = redis_session.get(all_sites_key)
        if redis_all_site_data:
            rendered_site_template = pickle.loads(redis_all_site_data)
        else:
            sites_request = requests.get(search_endpoint, {"organization": organization_id, "providers": provider_id,
                                       "mimeType": "geojson", "sorted": "no", "uripage": "yes"})
            if sites_request.status_code == 200:
                total_site_count = int(sites_request.headers['Total-Site-Count'])
                if sites_request.text == ']}':
                    abort(404)
                else:
                    sites_geojson = ujson.loads(sites_request.text)
                    rendered_site_template = render_template('sites.html', provider=provider_id,
                                                             organization=organization_id, sites_geojson=sites_geojson,
                                                             total_site_count=total_site_count)
                    redis_session.set(all_sites_key, pickle.dumps(rendered_site_template, 2))
            elif sites_request.status_code == 500:
                abort(500)
            elif sites_request.status_code == 400:
                abort(404)
    else:
        sites_request = requests.get(search_endpoint, {"organization": organization_id, "providers": provider_id,
                                                       "mimeType": "geojson", "sorted": "no", "uripage": "yes"})
        if sites_request.status_code == 200:
            total_site_count = int(sites_request.headers['Total-Site-Count'])
            if sites_request.text == ']}':
                abort(404)
            else:
                sites_geojson = ujson.loads(sites_request.text)
                rendered_site_template = render_template('sites.html', provider=provider_id,
                                                         organization=organization_id, sites_geojson=sites_geojson,
                                                         total_site_count=total_site_count)
        elif sites_request.status_code == 500:
            abort(500)
        elif sites_request.status_code == 400:
            abort(404)
    if rendered_site_template:
        return Response(rendered_site_template)
    else:
        abort(404)


@portal_ui.route('/provider/<provider_id>/<organization_id>/<path:site_id>/', endpoint='uri_site')
def uris(provider_id, organization_id, site_id):
    providers = generate_provider_list(code_endpoint)['providers']
    if provider_id not in providers:
        abort(404)
    org_check = check_org_id(organization_id, code_endpoint)
    if org_check['status_code'] == 200 and org_check['org_exists'] == False:
        abort(404)
    site_data = None
    if redis_config:
        redis_db_number = generate_redis_db_number(provider_id)
        r = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'], db=redis_db_number,
                              password=redis_config.get('password'))
        site_key = 'sites_' + provider_id + '_' + str(organization_id) + "_" + str(site_id)
        redis_site_data = r.get(site_key)
        if redis_site_data:
            site_data = pickle.loads(redis_site_data)
        else:
            service_site_data = get_site_info(base_url, provider_id, site_id, organization_id)
            if service_site_data['status_code'] == 200 and service_site_data['site_data']:
                site_data = service_site_data['site_data']
                site_key = 'sites_' + provider_id + '_' + str(site_data['OrganizationIdentifier']) + "_" + \
                           str(site_data['MonitoringLocationIdentifier'])
                r.set(site_key, pickle.dumps(site_data, protocol=2))
            elif service_site_data['status_code'] == 500:
                abort(500)
    else:
        service_site_data = get_site_info(base_url, provider_id, site_id, organization_id)
        if service_site_data['status_code'] == 200 and service_site_data['site_data']:
            site_data = service_site_data['site_data']
        elif service_site_data['status_code'] == 500:
            abort(500)
    if site_data:
        site_data_additional = {}
        if site_data.get('CountryCode') == 'US' and site_data.get('StateCode') and site_data.get('CountyCode'):
            statecode = 'US:' + site_data['StateCode']
            search_string = statecode + ':' + site_data['CountyCode']
            county_request = requests.get(code_endpoint + "/countycode", {"statecode": statecode, "mimeType": "json",
                                                                          "text": search_string})
            if county_request.status_code == 200:
                county_info = county_request.json()
                if county_info.get('recordCount') == 1:
                    info_list = county_info['codes'][0]['desc'].split(',')
                    site_data_additional[u'StateName'] = info_list[1]
                    site_data_additional[u'CountyName'] = info_list[2]
        if site_data.get('ProviderName') == 'NWIS':
            nwis_id_list = site_data['MonitoringLocationIdentifier'].split('-')
            site_data_additional[u'NWISOrg'] = nwis_id_list[0]
            site_data_additional[u'NWISNumber'] = nwis_id_list[1]

        return render_template('site.html', site=site_data, site_data_additional=site_data_additional,
                               provider=provider_id, organization=organization_id,
                               site_id=site_id, cache_timeout=cache_timeout)
    else:
        abort(404)


@portal_ui.route('/clear_cache/<provider_id>/')
def clear_cache(provider_id=None):
    if redis_config:
        redis_db_number = generate_redis_db_number(provider_id)
        r = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'], db=redis_db_number,
                              password=redis_config.get('password'))
        r.flushdb()
        return 'site cache cleared for: ' + provider_id
    else:
        return "no redis cache, no cache to clear"


@portal_ui.route('/rebuild_site_cache/<provider_id>/')
def rebuild_site_cache(provider_id=None):
    providers = generate_provider_list(code_endpoint)['providers']
    if provider_id not in providers:
        abort(404)
    redis_db = generate_redis_db_number(provider_id)
    sites = generate_site_list_from_streamed_tsv(base_url, redis_config=redis_config, provider_id=provider_id,
                                                 redis_db=redis_db)
    if sites['cached_count'] > 0:
        return 'rebuilt site cache for ' + provider_id+' with ' + str(sites['cached_count']) + ' cached and ' + \
               str(sites['error_count']) + ' errors.'

    else:
        return str(sites)



@portal_ui.route('/sites_cache_task/<provider_id>', methods=['POST'])
def sitescachetask(provider_id):
    providers = generate_provider_list(code_endpoint)['providers']
    if provider_id not in providers:
        abort(404)
    redis_db = generate_redis_db_number(provider_id)
    task = generate_site_list_from_streamed_tsv_async.apply_async(args=[base_url, redis_config,
                                                                          provider_id, redis_db])
    return jsonify({}), 202, {'Location': url_for('taskstatus',
                                                  task_id=task.id)}
@portal_ui.route('/status/<task_id>')
def taskstatus(task_id):
    task = generate_site_list_from_streamed_tsv_async.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'current': 0,
            'total': 1,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'current': task.info.get('current', 0),
            'total': task.info.get('total', 1),
            'status': task.info.get('status', '')
        }
        if 'result' in task.info:
            response['result'] = task.info['result']
    else:
        # something went wrong in the background job
        response = {
            'state': task.state,
            'current': 1,
            'total': 1,
            'status': str(task.info),  # this is the exception raised
        }
    return jsonify(response)

@portal_ui.route('/manage_cache')
def manage_cache():
    provider_list = ['NWIS','STORET','STEWARDS','BIODATA']
    status_list = []
    if redis_config:
        for provider in provider_list:
            redis_db_number = generate_redis_db_number(provider)
            r = redis.StrictRedis(host=redis_config['host'], port=redis_config['port'], db=redis_db_number,
                                  password=redis_config.get('password'))
            provider_site_load_status = r.get(provider+'_sites_load_status')
            if provider_site_load_status:
                load_status = pickle.loads(provider_site_load_status)
                time = arrow.get(load_status['time_utc'])
                load_status['time_zulu'] = time.format('YYYY-MM-DD HH:mm:ss ZZ')
                load_status['time_human'] = time.humanize()
                status_list.append(load_status)
    return render_template('cache_manager.html', status=status_list)

@portal_ui.route('/robots.txt')
def robots():
    return render_template('robots.txt')
