import logging
import json
import os
import sys

from authlib.flask.client import OAuth
from celery import Celery
from celery.signals import after_setup_task_logger
from flask import Flask, jsonify, request
from flask_wtf.csrf import CSRFProtect
from flask_swagger import swagger
from requests import Session
from whitenoise import WhiteNoise

from .flask_swagger_blueprint import get_swaggerui_blueprint


__version__ = '5.14.0'


def _create_log_handler(log_dir=None, log_name=__name__):
    """
    Create a handler object. The logs will be streamed
    to stdout if a logfile is not specified using a StreamHandler.
    If a logfile is specified, a handler will be created so logs
    will be written to the file.

    :param str log_dir: optional path of a directory where logs can be written to
    :return: a handler
    :rtype: logging.Handler

    """
    if log_dir is not None:
        log_file = '{}.log'.format(log_name)
        log_path = os.path.join(log_dir, log_file)
        log_handler = logging.FileHandler(log_path)
    else:
        log_handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - {%(pathname)s:L%(lineno)d} - %(message)s')
    log_handler.setFormatter(formatter)
    return log_handler


def _custom_celery_handler(logger=None, *args, **kwargs):
    """
    Function to modify the logger object used by Celery.

    This function should be passed to celery's logging
    setup signals.

    :param logging.logger logger: Logger object provided by a celery signal

    """
    log_dir = app.config.get('LOGGING_DIRECTORY')
    log_level = app.config.get('LOGGING_LEVEL')
    celery_handler = _create_log_handler(log_dir,
                                         log_name=Celery.__name__.lower() + '_tasks')
    logger.setLevel(log_level)
    logger.addHandler(celery_handler)


app = Flask(__name__.split()[0], instance_relative_config='NO_INSTANCE_CONFIG' not in os.environ)

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
if 'NO_INSTANCE_CONFIG' not in os.environ:
    app.config.from_pyfile('config.py')

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

# Enable authentication if configured.
oauth = None  # pylint: disable=C0103
if app.config.get('WATERAUTH_AUTHORIZE_URL'):
    oauth = OAuth(app)  # pylint: disable=C0103
    oauth.register('waterauth',
                   client_kwargs={'verify': app.config.get('VERIFY_CERT', True)}
                   )

if app.config.get('LOGGING_ENABLED'):
    log_directory = app.config.get('LOGGING_DIRECTORY')
    loglevel = app.config.get('LOGGING_LEVEL')
    handler = _create_log_handler(log_directory)
    # Do not set logging level in the handler.
    # Otherwise, if Flask's DEBUG is set to False,
    # all logging will be disabled.
    # Instead, set the level in the logger object.
    app.logger.setLevel(loglevel)
    app.logger.addHandler(handler)
    # celery uses two loggers: one global/worker logger and a second task logger
    # global/worker logs are handled by the celeryd process running the VM
    # this configures a handler for the task logger:
    after_setup_task_logger.connect(_custom_celery_handler)

csrf = CSRFProtect(app)


@app.before_request
def log_before():
    url = request.path
    method = request.method
    app.logger.debug('Request of type %s made to %s', method, url)


@app.after_request
def log_after(response):
    resp_status = response.status
    resp_headers = response.headers
    app.logger.debug('Response: %s, %s', resp_status, resp_headers)
    return response


session = Session()
session.verify = app.config['VERIFY_CERT']


# Load static assets manifest file, which maps source file names to the
# corresponding versioned/hashed file name.
_manifest_path = app.config.get('ASSET_MANIFEST_PATH')
if _manifest_path:
    with open(_manifest_path, 'r') as f:
        app.config['ASSET_MANIFEST'] = json.loads(f.read())


from .auth.views import auth_blueprint  # pylint: disable=C0413
from .portal_ui_blueprint.views import portal_ui  # pylint: disable=C0413
from .sites.views import sites_blueprint  # pylint: disable=C0413
from .wqx.views import wqx  # pylint: disable=C0413
from . import filters  # pylint: disable=C0413

app.register_blueprint(auth_blueprint, url_prefix='')
app.register_blueprint(portal_ui, url_prefix='')
app.register_blueprint(sites_blueprint, url_prefix='/sites')
app.register_blueprint(wqx, url_prefix='/portal/schemas')


# Set up swagger endpoints
@app.route('/spec')
def spec():
    host = request.url_root.rstrip('/').replace(app.config['WSGI_STR'], '')
    return jsonify(swagger(app,
                           from_file_keyword="swagger_from_file",
                           template={
                               "host": host.replace('http://', ''),
                               "info": {
                                   "version": "1.0",
                                   "title": "WQP Sites service"
                               }
                           }))

# Create swagger ui blueprint
SWAGGER_URL = '/apidocs'
API_VIEW_FUNC = 'spec'

swaggerui_blueprint = get_swaggerui_blueprint(
    api_view_func=API_VIEW_FUNC
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

app.wsgi_app = WhiteNoise(app.wsgi_app, root='/home/python/assets', prefix='static/')
