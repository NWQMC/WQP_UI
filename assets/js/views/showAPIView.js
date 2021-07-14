import queryService from '../queryService';
import { getQueryString, getCurlString } from '../utils';


/*
 * Initializes the windows which show the various API calls
 * @param {Object} options
 *      @prop {Jquery element} $container - The container containing the show button and the query windows.
 *      @prop {Function} getQueryParamArray - Returns the current query parameter array
 *      @prop {Function} getResultType - Returns the result type value the user selected in the form
 *      @returns {Array of Objects with name and value properties}
 */
export default class ShowAPIView {
    constructor({$container, getQueryParamArray, getResultType}) {
        this.$container = $container;
        this.getQueryParamArray = getQueryParamArray;
        this.getResultType = getResultType;
        this.showAPIViewVisible = false;
    }

    initialize() {
        let $apiQueryDiv = this.$container.find('#api-queries-div');
        let $apiQueryTitle = this.$container.find('#query-div b');
        let $apiQueryText = this.$container.find('#query-div textarea');
        let $curlText = this.$container.find('#curl-query-div textarea');
        let $wfsText = this.$container.find('#getfeature-query-div textarea');

        const showServiceCallsHandler = () => {
            let resultType = this.getResultType();
            let queryParamArray = this.getQueryParamArray();
            const queryParamsWithoutCSRFToken = queryParamArray.filter( param => param.name !== 'csrf_token' );

            let apiQueryString = queryService.getFormUrl(resultType, getQueryString(queryParamsWithoutCSRFToken));
            let curlString = getCurlString(resultType, queryParamsWithoutCSRFToken);

            $apiQueryDiv.show();
            $apiQueryTitle.html(resultType.replace(/([A-Z])/g, ' $1'));
            $apiQueryText.html(apiQueryString);
            $curlText.html(curlString);

            let queryWithoutDataProfileArray = queryParamsWithoutCSRFToken.filter( param => param.name !== 'dataProfile' );
            $wfsText.html(L.WQPSitesLayer.getWfsGetFeatureUrl(queryWithoutDataProfileArray));
        };

        // Update the service calls when the
            this.showAPIViewVisible = true;
            showServiceCallsHandler();

        this.$container.closest('form').change(() => {
            if (this.showAPIViewVisible) {
                showServiceCallsHandler();
            }
        });
    }
}
