import log from 'loglevel';
import { TOOLTIP } from './tooltipDefinitions';
import ArcGisOnlineHelpView from './views/arcGisOnlineHelpView';
import DownloadFormView from './views/downloadFormView';
import ShowAPIView from './views/showAPIView';
import SiteMapView from './views/siteMapView';
import DownloadProgressDialog from './downloadProgressDialog';

$(document).ready(function () {
    // Set the loglevel
    if (Config.DEBUG) {
        log.setLevel('debug', false);
    } else {
        log.setLevel('warn', false);
    }

    let $form = $('#params');

    // Create sub views
    let downloadProgressDialog = new DownloadProgressDialog($('#download-status-dialog'));
    let downloadFormView = new DownloadFormView({
        $form : $form,
        downloadProgressDialog : downloadProgressDialog
    });
    let siteMapView = new SiteMapView({
        $container : $('#mapping-div'),
        downloadProgressDialog : downloadProgressDialog,
        downloadFormView : downloadFormView
    });
    let showAPIView = new ShowAPIView({
        $container : $('#show-queries-div'),
        getQueryParamArray : $.proxy(downloadFormView.getQueryParamArray, downloadFormView),
        getResultType: $.proxy(downloadFormView.getResultType, downloadFormView)
    });

    let arcGisOnlineHelpView = new ArcGisOnlineHelpView({
        $button : $('#show-arcgis-online-help'),
        $dialog : $('#arcgis-online-dialog'),
        $siteMapViewContainer : $('#mapping-div'),
        getQueryParamArray : $.proxy(downloadFormView.getQueryParamArray, downloadFormView)
    });

    //Initialize subviews
    let initDownloadForm = downloadFormView.initialize();
    siteMapView.initialize();
    showAPIView.initialize();
    arcGisOnlineHelpView.initialize();

    initDownloadForm.fail(function(jqxhr) {
        let $dialog = $('#service-error-dialog');
        if (jqxhr.status === 401 || jqxhr.status === 403) {
            $dialog.find('.modal-body').html('No longer authorized to use the application. Please reload the page to login again');
        }
        $dialog.modal('show');
    });

    // Initialize Vue.js
    var app = new Vue({
        el: '#app',
        delimiters: ['[[', ']]'],
        data: {
            message: 'vue is working',
            countryTooltip: TOOLTIP.country,        
        }
    });
});
