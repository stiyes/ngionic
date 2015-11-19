angular.module('myApp.controllers')

    .controller('AppController', function($scope, $state,$window, $location, $ionicActionSheet,jrdCache) {

        $scope.goToPage = function(page) {
            // console.log($rootScope.isTablet);
            $location.url('/' + page);
        };

        $scope.goBack = function() {
            $window.history.back();
        };
        $scope.logout = function () {
            if (localStorage.getItem('userId')) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('consultantLat');
                localStorage.removeItem('consultantLng');
                jrdCache.removeAll();
                $state.go('login');
            }
        };
        $scope.popSheet = function(){
            $ionicActionSheet.show({
                titleText: '您确定要退出账号？',
                buttons: [
                    { text: '确定' }
                ],
                destructiveText: '',
                cancelText: '取消',
                cancel: function() {
                    console.log('取消');
                },
                buttonClicked: function() {
                    $scope.logout();
                    return true;
                },
                destructiveButtonClicked: function() {
                    return true;
                }
            });
        };
    })

    .controller('CustomerController', function($scope,$state,$timeout,$location,$rootScope,$ionicModal,$ionicLoading,$ionicActionSheet,$http,CustomerService,jrdCache) {
        
        if(jrdCache.get('searchOptions') === undefined) {
            $scope.filter = {
                demand: []
            }
            CustomerService.all(function(items){
                $scope.searchOptions = items.list;
                $scope.searchData = items.searchData;
                $scope.searchKey = items.search;
                $scope.cosults = items;
                jrdCache.put('searchOptions', $scope.searchOptions);
                jrdCache.put('searchData', $scope.searchData);
                jrdCache.put('searchKey', $scope.searchKey);
            })
        }
        else {
            $scope.filter = jrdCache.get('filterHistory') || {demand: []};
            $scope.searchOptions = jrdCache.get('searchOptions');
            $scope.searchData = jrdCache.get('searchData');
            $scope.searchKey = jrdCache.get('searchKey');
            console.log($scope.searchOptions);
        }
        $timeout(function(){
            CustomerService.all(function(items) {
                $scope.searchData = items.searchData;
                //$scope.searchKey = items.search;
                //$scope.cosults = items;
                //jrdCache.put('searchOptions', $scope.searchOptions);
                jrdCache.put('searchData', $scope.searchData);
                //jrdCache.put('searchKey', $scope.searchKey);
                //$scope.$apply();
            })},100);

        //function getDemandTxt(){
        //    var demandTxt = [],demandIds = [];
        //    angular.forEach($scope.searchOptions[0].selected, function(v, k) {
        //        if(v.selected){
        //            demandTxt.push(v.optionText);
        //            demandIds.push(parseInt(v.optionId));
        //        };
        //    })
        //    $rootScope.demandTxt = demandTxt.join('/');
        //    $rootScope.demandIds = demandIds.join(',');
        //}

        // 打开选项
        $scope.openSelect = function(item){
            $scope.filterPageTitle = item.title;
            $scope.filterOptions = item.options;
            $scope.filterOptionIndex = item.key;

            $ionicModal.fromTemplateUrl('views/customer/filter.html', function(modal) {
                $rootScope.modal = modal;
                $rootScope.modal.show();
            }, {
                scope : $scope,
                animation: 'slide-in-up'
            });
        };

        // 隐藏弹出层
        $scope.hideModal = function(){
            $rootScope.modal.remove()
        }
        $rootScope.searchCondition = {};
        $scope.$watch('filter', function (items) {
            jrdCache.put('filterHistory', $scope.filter);
            angular.forEach($scope.filter,function(v,k){
                var demands = {texts:[],args :[]};
                switch(k){
                    case 'demand':
                        angular.forEach(v,function(v,k){
                            if(v){
                                demands.args[k] = k;
                            }else{
                                demands.args.splice(k,1);
                            }
                        })
                        getFilterText('demand',Object.keys(demands.args))
                        break;
                    //case 'sex':
                    //    getFilterText('sex',items.sex);
                    //    break;
                    //case 'industry':
                    //    getFilterText('industry',items.industry);
                    //    break;
                    case 'salary':
                        getFilterText('salary',items.salary);
                        break;
                    case 'area':
                        getFilterText('area',items.area);
                        break;
                    case 'newadd':
                        getFilterText('newadd',items.newadd);
                        break;
                }
                // 获取到demand的ids，并存入全局搜索条件结果集合里
                $rootScope.searchCondition.demand = Object.keys(demands.args).join(',');
            })
        }, true);

        /*
         *
         * 获取过滤条件的文本
         * args.type   过滤条件选择的类型
         * args.indexs 过滤条件选择的索引集
         *
         */
        function getFilterText(type,indexs){
            console.log(indexs);
            angular.forEach($scope.searchOptions,function(v,k){
                if(v.key == type){
                    console.log(type);
                    if(typeof indexs == "object"){
                        var selectedTxt = [];
                        for(var j in indexs){
                            for(var i= 0,l= v.options.length;i<l;i++){
                                if(v.options[i].optionId == indexs[j]){
                                    selectedTxt.push(v.options[i].optionText);
                                }
                            }
                        }
                        $scope.searchOptions[k].selected = {'optionId':indexs.join(','),'optionText':selectedTxt.join('+')};
                    }else{
                        console.log(type);
                        console.log(v);
                        console.log($scope.searchOptions);
                        for(var i= 0,l= v.options.length;i<l;i++){
                            if(v.options[i].optionId == indexs){
                                $scope.searchOptions[k].selected = {'optionId':indexs,'optionText':v.options[i].optionText};
                            }
                        }
                    }
                }
            })
        }


        //找客户
        $scope.searchCustomer = function(){
            var searchItems = [],
                searchString = [],
                paramObj = {},
                searchKey = jrdCache.get('searchKey');
            angular.forEach($scope.searchOptions, function(v, k) {
                if(v.selected){
                    paramObj[v.key] = v.selected.optionId;
                    searchKey[v.key] = v.selected.optionId;
                    searchString.push(v.selected.optionText);
                }
            });
            $rootScope.searchCondition = paramObj;
            $state.go('customer-result');
        }


        //从历史记录中找客户
        $scope.searchCustomerFromHistory = function(){
            var keyString = [],i=0;
            angular.forEach($scope.searchData,function(v,k){
                v == '' ? v = '不限' : v;
                switch(k){
                    case 'serviceType':                        
                        keyString[i++] = v;
                        break;
                    case 'sex':
                        keyString[i++] = v;
                        break;
                    case 'income':
                        keyString[i++] = v;
                        break;
                }                
            })
            $rootScope.searchCondition = $scope.searchKey;
            $rootScope.searchString = keyString.slice(0,3).join(' + ');
            $state.go('customer-result');
        };
        //清除历史数据
        $scope.cleanCache = function(cleanCache){
            $ionicActionSheet.show({
                actionSheetClass: 'action-sheet-clear',
                buttons: [
                    { text: '确定',classNames: 'button-ok'},
                    { text: '取消',classNames: 'button-cancel'}
                ],
                //destructiveText: '确定',
                //cancelText: '取消',
                cancel: function() {
                    console.log('取消');
                },
                titleText: '请选择操作',
                buttonClicked: function(index) {
                    if(index == 0){
                        CustomerService.cleanCache(function(res){
                            if(res.error == 0){
                                $scope.searchData = '';
                                jrdCache.put('searchData', $scope.searchData);
                            }
                        });
                    }
                    return true;
                },
                destructiveButtonClicked: function() {
                    console.log('退出');
                    return true;
                }
            });

        }
    })

    .controller('ResultController', function($scope,$ionicPopup,$rootScope,$ionicLoading,$timeout,CustomerService,jrdCache) {

        $scope.filtered ={}
        var current;
        $scope.toggled = function(open,index){
            var backdrop = document.getElementById('backdrop');
            if(open){
                current = index;
                backdrop.style.cssText='display:block;visibility: visible;opacity: 1;top:79px;z-index: 9;';
            }else{
                if(current == index){
                    backdrop.style.cssText='';  
                }
            }
        };
        $scope.filterChange = function(item,items){
            angular.forEach(items,function(v){
                v.order = 0;
            })
            item.order = 1;
        };
        $scope.customers = {};
        $scope.customers.list = [];
        var searchKey = jrdCache.get('searchKey'),
            searchKeyValues = '';
        //searchKey['industry'] = $stateParams.id;
        angular.forEach(searchKey,function(v,k){
            searchKeyValues += v;
        });
        searchKeyValues = searchKeyValues.split(',').join('');
        $scope.$on('$viewContentLoaded',
            function(event, toState, toParams, fromState, fromParams){
                $ionicLoading.show({
                    template: '<i class="ion-loading-c" style="font-size:36px;"></i>',
                    noBackdrop : true
                });
            }
        );
        CustomerService.getCustomers(function(items){
            console.log(items);
            $ionicLoading.hide();
            $scope.customers = items;
            $scope.limitAmount = items.sentRankLimitNum;
            $scope.clickCount = items.sentRankLimitNum;
            $scope.customersGroup = items.list;
            $scope.filters = items.filters;
            $scope.customerIds = [];
        });

        $scope.getItemHeight = function(item){
            if(item.requests.length>0){
                return 101;
            }
            return 81;
        };

        $scope.customerCountPlus = 0; 
        $scope.cancel = true;
        $scope.$watch('customersGroup', function (items) {
            var count =0,customerIds = [];
            angular.forEach(items,function(v,k){
                // if (count < $scope.limitAmount && $scope.clickCount > 0) {
                //     v.selected = true;
                //     $scope.clickCount--;
                // }
                if (v.selected) {
                    count += 1;
                    customerIds = customerIds.concat(v.id);
                    $scope.cancel = true;
                }
                else {
                    v.selected = false;                    
                }

            });
            $scope.customerCountPlus = count;
            $scope.customerIds = customerIds;
        }, true);
        $scope.$watch('customerCountPlus', function (count) {
            if (count > $scope.limitAmount) {
                $ionicLoading.show({
                    template: "<h4>您的名额上限已满</h4><p>提升您的等级可以获得更多名额</p>",
                    delay: 100,
                    noBackdrop: true,
                    duration: 1500
                });
                $scope.customerCountPlus = $scope.limitAmount;
                for (var i = 0; i < $scope.customersGroup.length; i++) {
                    var v = $scope.customersGroup[i];
                    if (v.id == $scope.customerIds[count - 1]) {
                        v.selected = false;
                        $scope.customerIds.splice(count - 1, 1);
                        break;
                    }

                }
                $scope.cancel = false;
            }else {
                $scope.cancel = true;
            }
        }, true);
        $scope.showPopup = function() {
            $scope.data = {};

            var massPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="data.message" />',
                title: '输入您的群发信息',
                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '发送',
                        type: 'button-positive',
                        onTap: function(e) {
                          if (!$scope.data.message) {
                            //don't allow the user to close unless he enters wifi password
                            e.preventDefault();
                          } else {
                            return $scope.data.message;
                          }
                        }
                    }
                    ]
            });
            massPopup.then(function(res) {
                if(res !== undefined){
                    console.log($scope.customerIds);
                    CustomerService.sendMass($scope.customerIds,res);
                }
            });
        };

        $scope.sendMass = function(){
            $scope.showPopup();
        }
        //检查是否可以发送私信
        $scope.checkAbility = function(){
            if(!$scope.limitAmount || $scope.customerIds.length == 0){
                return true;
            }else{
                return false;
            }
        }
    })