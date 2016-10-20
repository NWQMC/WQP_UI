
from celery import Celery
from flask import Flask, jsonify, request
from flask_bower import Bower
from flask_swagger import swagger
from flask_swagger_ui import get_swaggerui_blueprint


__version__ = '4.1.0dev'


app = Flask(__name__.split()[0], instance_relative_config=True)

Bower(app)

# Loads configuration information from config.py and instance/config.py
app.config.from_object('config')
app.config.from_pyfile('config.py')

import assets

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

from portal_ui.views import portal_ui
from sites.views import sites
from wqx.views import wqx

app.register_blueprint(portal_ui, url_prefix='')
app.register_blueprint(sites,
                       url_prefix='/sites')
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
API_VIEW_FUNC= 'spec'

swaggerui_blueprint = get_swaggerui_blueprint(
    api_view_func=API_VIEW_FUNC
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


