
from unittest import TestCase

from flask import Flask
from ..views import wqx


class WqxTestCase(TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(wqx)
        self.client = self.app.test_client()

    def test_wqx_index_xsd(self):
        resp = self.client.get('/WQX-Outbound/2_0/index.xsd')
        self.assertIn('xsd:schema', resp.data)
        self.assertEqual('application/xml', resp.headers['Content-Type'])

    def test_wqx_index_html(self):
        resp = self.client.get('/WQX-Outbound/2_0/index.html')
        self.assertIn('WQX-Outbound Schema Info', resp.data)

    def test_wqx_doc_index_html(self):
        resp = self.client.get('/WQX-Outbound/2_0/docs/index.html')
        self.assertIn('Schema', resp.data)
