angular.module('myApp.services', [])

.factory('httpQuery', function($http) {
    var param = {'limit': 100,'offset': 0,'access_token': localStorage.accessToken || ''};
    return {
        jsonp: function(url,params){
            angular.forEach(params,function(v,k){
                param[k] = v;
            });
            param.jsonpcallback =  'JSON_CALLBACK';
            return $http({ method: 'JSONP',url: appConfig.servicesUrl + url ,params: param });
        },
        post: function(url,params){
            angular.forEach(params,function(v,k){
                param[k] = v;
            });
            return $http({ method: 'POST',url: appConfig.servicesUrl + url,data: param });
        },
        get: function(url,params){
            angular.forEach(params,function(v,k){
                param[k] = v;
            });
            return  $http({ method: 'GET', url: appConfig.servicesUrl + url,params: param });
        }
    }
})
.factory('CustomerService', function($http,$rootScope,$ionicLoading) {
	var items = [];
	return {
		all : function(callback) {
            //var param = {'limit': 10,'offset': 0,'jsonpcallback': 'JSON_CALLBACK','access_token': localStorage.accessToken};
			$http({
				method : 'get',
				url : './data/customers/searchIndex.json',
				//params : param
			}).success(function(response) {
				console.log(response);
				if (response.error == 0) {
					items = response.list;
					callback(response);
				} else {
					console.log(response.msg);
				}
			});
		},
		getCustomers : function(callback){
   //          var param = {'limit': 500,'offset': 0,'jsonpcallback': 'JSON_CALLBACK','access_token': localStorage.accessToken};
			// //param.industry_id = $rootScope.searchCondition&&$rootScope.searchCondition.industry || '335';
			// param.area_id = $rootScope.searchCondition&&$rootScope.searchCondition.area || '';
			// param.income = $rootScope.searchCondition&&$rootScope.searchCondition.salary || '';
			// param.service_type = $rootScope.searchCondition&&$rootScope.searchCondition.demand || '';
			// param.newadd = $rootScope.searchCondition&&$rootScope.searchCondition.newadd || '';
			$http({
				method : 'get',
				url : './data/customers/userList.json',
				//params : param
			})
			.success(function(response) {
					console.log(response);
				$ionicLoading.hide();
				if (response.error == 0) {
					callback(response);
				} else {
					console.log(response.msg);
				}
			});
		},
		//getCustomerList : function(callback){
         //   var param = {'limit': 50,'offset': 0,'jsonpcallback': 'JSON_CALLBACK','access_token': localStorage.accessToken};
		//	param.area_id = $rootScope.searchCondition.area || '';
		//	param.income = $rootScope.searchCondition.salary || '';
		//	param.service_type = $rootScope.searchCondition.demand || '';
		//	param.sex = $rootScope.searchCondition.sex || '2';
		//	$http({
		//		method : 'JSONP',
		//		url : appConfig.servicesUrl + '/b/find/searchresult',
		//		params : param
		//	})
		//	.success(function(response) {
		//		$ionicLoading.hide();
		//		if (response.error == 0) {
		//			callback(response);
		//		} else {
		//			console.log(response.msg);
		//		}
		//	});
		//},
		sendMass : function(customerIds,message){
            var param = {'limit': 50,'offset': 0,'jsonpcallback': 'JSON_CALLBACK','access_token': localStorage.accessToken};
			//console.log(customerIds+message);
			param.customerIds = customerIds.join(',');
			param.message = message;
			$http({
				method : 'JSONP',
				url : appConfig.servicesUrl + '/b/find/sendmsg',
				params : param
			}).success(function(response) {
				if (response.error == 0) {
					window.plugins.toast.showShortBottom("发送成功",function(a){window.history.back()},function(b){});					
				} else {
					window.plugins.toast.showShortBottom(response.msg,function(a){},function(b){});
				}
			});
		},
		cleanCache: function(callback){
            var param = {'limit': 50,'offset': 0,'jsonpcallback': 'JSON_CALLBACK','access_token': localStorage.accessToken};
			$http({
				method : 'JSONP',
				url : appConfig.servicesUrl + '/b/find/clearnsearch',
				params : param
			}).success(function(response) {
				console.log(response);
				if (response.error == 0) {
					callback(response);
				} else {
					console.log(response.msg);
				}
			});			
		},
		checkSendabled: function(customerCountPlus,limitAmount){
			return true;
		}
	}
})


.factory('jrdCache', function ($cacheFactory) {
	return $cacheFactory('jrdCache', function ($cacheFactory) {
		return $cacheFactory('jrdCache'+localStorage.userId,{});
	});
})