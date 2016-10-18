from flask import Blueprint, make_response, render_template


wqx = Blueprint('wqx',
                __name__,
                template_folder='templates',
                static_folder='static',
                static_url_path='/wqx/static'
                )


@wqx.route('/WQX-Outbound/2_0/index.xsd')
def wqx_index_xsd():
    xml = render_template('wqx/index.xsd')
    response = make_response(xml)
    response.headers['Content-Type'] = 'application/xml'
    return response


@wqx.route('/WQX-Outbound/2_0/index.html')
def wqx_index_html():
    return render_template('wqx/index.html')


@wqx.route('/WQX-Outbound/2_0/docs/index.html')
def wqp_docs_index_html():
    return render_template('wqx/docs/index.html')
