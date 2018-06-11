import find from 'lodash/collection/find';


const huc12FeatureSource = {
    id : 'huc12pp',
    text : 'HUC 12 pour points',
    mapLayer : L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
        layers:'fpp',
        styles : 'pour_points',
        format : 'image/png',
        transparent : true,
        zIndex : 20
    }),
    getFeatureInfoSource : {
        endpoint : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms',
        layerName : 'qw_portal_map:fpp',
        featureIdProperty : 'HUC_12'
    }
};

const nwisSitesFeatureSource = {
    id : 'nwissite',
    text : 'Active NWIS stream gages',
    mapLayer : L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
        layers: 'qw_portal_map:nwis_sites',
        format : 'image/png',
        transparent : true,
        zIndex : 20
    }),
    getFeatureInfoSource : {
        endpoint : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms',
        layerName : 'qw_portal_map:nwis_sites',
        featureIdProperty : 'siteId'
    }
};

export const FEATURE_SOURCES = [huc12FeatureSource, nwisSitesFeatureSource];
export const NAVIGATION_MODES = [
    {id : 'UM', text : 'Upstream main'},
    {id : 'DM', text : 'Downstream main'},
    {id : 'UT', text : 'Upstream with tributaries'},
    {id : 'DD', text : 'Downstream with diversions'}
];

let modelData;

export const reset = function() {
    modelData = {
        featureSource : nwisSitesFeatureSource, // should be one of FEATURE_SOURCES
        featureId : '',
        navigation : undefined, // Should be one of NAVIGATION_MODES
        distance : ''
    };
};

export const getData = function() {
    return modelData;
};

export const setData = function(property, value) {
    modelData[property] = value;
};

export const setFeatureSource = function(featureSourceId) {
    modelData.featureSource = find(FEATURE_SOURCES, function(source) {
        return source.id === featureSourceId;
    });
};

export const getUrl = function(dataSource) {
    var result = '';
    var dataSourceString = dataSource ? '/' + dataSource : '';
    if (modelData.featureSource && modelData.featureId && modelData.navigation) {
        result = Config.NLDI_SERVICES_ENDPOINT + modelData.featureSource.id + '/' + modelData.featureId +
            '/navigate/' + modelData.navigation.id +
            dataSourceString +
            '?distance=' + modelData.distance;
    }
    return result;
};

// Initialize modelData
reset();
