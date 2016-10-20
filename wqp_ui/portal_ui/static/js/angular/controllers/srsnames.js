function srsnames($scope, $http) {
	$scope.gridData = {
		data: 'data',
		showFilter: true,
		enableColumnResize: true
	};

	$scope.downloadUrl = Config.PUBLIC_SRSNAMES_ENDPOINT + '?mimeType=csv'

	$http({method: 'get', url: Config.PUBLIC_SRSNAMES_ENDPOINT + '?mimeType=json'})
		.success(function (thisdata, status) {
			$scope.data = thisdata.pcodes;
			$scope.maxLastRevDate = thisdata.maxLastRevDate;
		})
		.error(function (data, status) {
			alert(status);
		});

};
