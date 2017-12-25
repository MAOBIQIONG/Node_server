var uuid = require('node-uuid');
var sprintf = require("sprintf-js").sprintf;
var mongoClient = require('mongodb').MongoClient;
var host1 = "dds-uf651490bb013f441.mongodb.rds.aliyuncs.com";
var port1 = 3717;
var host2 = "dds-uf651490bb013f442.mongodb.rds.aliyuncs.com";
var port2 = 3717;
var username = "root";
var password = "Yx20171024";
var replSetName = "mgset-4959079";
var demoDb = "yemao";//数据库
// var demoColl = "runoob";//集合
// 官方建议使用的方案
var url = sprintf("mongodb://%s:%d,%s:%d/%s?replicaSet=%s", host1, port1, host2, port2, demoDb, replSetName);
    // url = 'mongodb://root:Yx20171024@dds-uf651490bb013f441.mongodb.rds.aliyuncs.com:3717,dds-uf651490bb013f442.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-4959079';
console.info("url:", url);

var mongodb={};
mongodb = {
    db:null,
    isNull : function (str) {
        if( str == null || str == undefined || str == '' || str == 'null' || str == 'undefined' ){
            return true;
        }   return false;
    },
    getClient : function (callback) {
        console.log('get mongo client:');
        mongoClient.connect(url, {
            db: { w: 1, native_parser: false },
            server: {
                poolSize: 5,
                socketOpations: { connectTimeoutMS: 500 },
                auto_reconnect: true
            },
            replSet: {},
            mongos: {}

        }, function(err, db) {
            if ( err ) {
                console.log('连接失败！');
            } else {
                console.log('连接成功！');
                mongodb.db = db;
                callback();
            }
        });
    },

    getMongoClient : function (callback) {
        //获取mongoClient
        mongoClient.connect(url, function(err, db) {
            if(err) {
                console.log('连接失败！');
                console.error("connect err:", err);
                return 1;
            }
            console.log('连接成功！');
            //授权. 这里的username基于admin数据库授权
            var adminDb = db.admin();
            adminDb.authenticate(username, password, function(err, result) {
                if(err) {
                    console.log('授权失败！');
                    console.error("authenticate err:", err);
                    return 1;
                }
                console.log('授权成功！');
                mongodb.db = db;
                callback();
            });
        });
    },

    logout : function () {
        // 注销数据库
        console.log("注销数据库:")
        mongodb.db.logout(function(err, result) {
            if ( err ) {
                console.log('注销失败...');
            }
            mongodb.db.close(); // 关闭连接
            console.log('连接已经关闭！');
        });
    },

    getData : function (param,callback) {
        //console.log("getData:")
        if( param ){
            if( param.interfaceId != null ){
                mongodb.getMongoClient(function () {
                    //console.log("get db:")
                    if( mongodb[param.interfaceId] ){
                        mongodb[param.interfaceId](param,function (result) {
                            //console.log('getData result:'+JSON.stringify(result));
                            callback(result);
                            mongodb.logout();
                        });
                    }else{
                        var result = {msg:'Interface does not exist：'+param.interfaceId};
                        callback(result);
                    }
                });
            }
        }
    },

    /**
     * 创建集合:
     * params:{
     *   interfaceId:函数名称,
     *   tableName:集合名称
     * }
     * */
    createTable : function (params,callback) {
        console.log("createTable:")
        if( mongodb.db ){
            var result = {};
            if( mongodb.isNull(params.coll) ){
                result = {msg:"Parameter error: missing collection name !"};
                callback(result);
                return;
            }
            mongodb.db.createCollection(params.coll, function(err, res) {
                if (err) {
                    console.log("error:" + err);
                    callback(err);
                }else{
                    result = {msg:"Create a collection: '"+params.coll+"' success !"};
                    callback(result);
                }
            });
        }
    },

    /**
     * 单条记录插入:
     * params:{
     *   interfaceId:函数名称,
     *   coll:集合名称,
     *   data:{
     *     _id:'',
     *     name:'',
     *     ...
     *   }
     * }
     * */
    insertData : function (params, callback) {
        //连接数据集合(表)
        if( mongodb.db ) {
            if( mongodb.isNull(params.coll) || params.data == null || params.data == undefined ){
                var result = {msg:"Parameter error: missing collection name or insert parameter !"};
                callback(result);
                return;
            }
            var data = params.rm == 0 ? JSON.parse(params.data) : params.data;
            var collection = mongodb.db.collection(params.coll);
            collection.insert(data, function (err, result) {
                if (err) {
                    console.log("error:" + err);
                    callback(err);
                }else{
                    callback(result);
                }
            });
        }
    },

    /**
     * 批量插入:
     * params:{
     *   interfaceId:函数名称,
     *   coll:集合名称,
     *   data:[{
     *     _id:'',
     *     name:'',
     *     ...
     *   },]
     * }
     * */
    insertMany : function (params, callback) {
        //连接数据集合(表)
        if( mongodb.db ) {
            if( mongodb.isNull(params.coll) || params.data == null || params.data == undefined ){
                var result = {msg:"Parameter error: missing collection name or insert parameter !"};
                callback(result);
                return;
            }
            var data = params.rm == 0 ? JSON.parse(params.data) : params.data;
            var collection = mongodb.db.collection(params.coll);
            collection.insertMany(data, function (err, result) {
                if (err) {
                    console.log("error:" + err);
                    callback(err);
                }else{
                    callback(result);
                }
            });
        }
    },

    /**
     * 单条记录插入/已存在则替换:
     * params:{
     *   interfaceId:函数名称,
     *   coll:集合名称,
     *   data:{
     *     _id:'',
     *     name:'',
     *     ...
     *   }
     * }
     * */
     saveData : function (params, callback) {
        //连接数据集合(表)
        if( mongodb.db ) {
            if( mongodb.isNull(params.coll) || params.data == null || params.data == undefined ){
                var result = {msg:"Parameter error: missing collection name or insert parameter !"};
                callback(result);
                return;
            }
            var data = params.rm == 0 ? JSON.parse(params.data) : params.data;
            var collection = mongodb.db.collection(params.coll);
            collection.save(data, function (err, result) {
                if (err) {
                    console.log("error:" + err);
                    callback(err);
                }else{
                    callback(result);
                }
            });
        }
    },

    /**
     * 修改:
     * params:{
     *   interfaceId:函数名称,
     *   coll:集合名称,
     *   whereData:{
     *     _id:'',
     *     ...
     *   },
     *   data:{
     *     name:'',
     *     ...
     *   }
     * }
     * */
    updateData : function (params, callback) {
        //连接数据集合(表)
        if( mongodb.db ) {
            if( mongodb.isNull(params.coll) || !params.data || !params.wheredata ){
                var result = {msg:"Parameter error: missing collection name or update parameter !"};
                callback(result);
                return;
            }
            /**
             * 示例：
             * data:{
             *   "$set":{"title":"xxx设计师通过了平台审核2"} // 如果不用$set，替换整条数据
             * },
             * wheredata:{"id":"1003"}
             * */
            var data = params.rm == 0 ? JSON.parse(params.data) : params.data;
            var wheredata = params.rm == 0 ? JSON.parse(params.wheredata) : params.wheredata;
            var collection = mongodb.db.collection(params.coll);
            collection.update(wheredata, data, function (err, result) {
                if (err) {
                    console.log("error:" + err);
                    callback(err);
                }else{
                    callback(result);
                }
            });
        }
    },

    /**
     * 查询:
     * params:{
     *   interfaceId:函数名称,
     *   coll:集合名称,
     *   where:{//查询参数，不传参数查询所有
     *     _id:''
     *   }
     * }
     * */
    queryData : function (params, callback){
        if( mongodb.db ) {
            if( mongodb.isNull(params.coll) ){
                var result = {msg:"Parameter error: missing collection name !"};
                callback(result);
                return;
            }
            var collection = mongodb.db.collection(params.coll);
            //查询条件
            var where = params.where || {};
            var other = params.other || {};//{sort:{a:-1,_id:1},skip:2,limit:3}
            collection.find(where,other).toArray(function (err, result) {
                if (err) {
                    console.log("error:" + err);
                    callback(err);
                }else{
                    callback(result);
                }
            });
        }
    },

    /**
     * 查询首页:
     * */
    getIndexInfo : function (params, callback){
        console.log("getIndexInfo:");
        var res = {},index=0,total=4;
        var colls = {
            imgList:'indexImgList',
            noticeList:'indexNoticeList',
            users:'users'
        };
        if( mongodb.db ) {
            //首页图片轮播
            var imgParams = {coll:colls.imgList};
            mongodb.queryData(imgParams,function (result) {
                index++;
                console.log("imgList index:"+index)
                res.imgList = result;
                if( index == total ){
                    callback(res);
                }
            });

            //首页通知轮播
            var noticeParams = {coll:colls.noticeList};
            mongodb.queryData(noticeParams,function (result) {
                index++;
                console.log("noticeList index:"+index)
                res.noticeList = result;
                //查询通知关联的用户
                if( Array.isArray(result) ){
                    var whereArr = [];
                    result.forEach(function(item,index){
                        whereArr.push({_id:item.user_id})
                    });
                    var nuParams = {coll:colls.users,where:{$or:whereArr}};
                    mongodb.queryData(nuParams,function (result) {
                        index++;
                        console.log("noticeUsers index:"+index);
                        res.noticeUsers = result;
                        if( index == total ){
                            callback(res);
                        }
                    });
                }else{
                    if( index == total ){
                        callback(res);
                    }
                }
            });

            var orderParams = {};
            mongodb.getOrderList(orderParams,function (result) {
                index++;
                console.log("getOrderList index:"+index);
                res.orderList = result.orderList;
                res.orderUsers = result.orderUsers;
                res.orderBidders = result.orderBidders;
                res.bidders = result.bidders;
                if( index == total ){
                    callback(res);
                }
            })
        }else{
            callback(res);
        }
    },

    getOrderList : function (params, callback) {
        console.log("getOrderList:");
        var res = {}, index = 0, total = 3;
        var colls = {
            users: 'users',
            orderList: 'orderList',
            orderParts: 'orderParts'
        };
        if (mongodb.db) {
            console.log("params:"+JSON.stringify(params))
            //首页订单列表
            var pageNo = params.pageNo || 0;
            var pageSize = params.pageSize || 10;
            var sort = params.sort || {order_price:-1,_id:1};
            var orderParams = {coll: colls.orderList,other:{sort:sort,skip:pageNo*pageSize,limit:pageSize}};
            console.log("orderParams:"+JSON.stringify(orderParams))
            mongodb.queryData(orderParams, function (result) {
                res.orderList = result;
                    try {
                    //查询订单相关信息
                    if (Array.isArray(result)) {
                        var whereArr = [],//雇主id
                            ids = [];//订单id
                        result.forEach(function (item, index) {
                            whereArr.push(item.order_user_id);
                            ids.push(item._id);
                        });
                        //查询雇主
                        var ouParams = {coll: colls.users, where: {_id: {$in: whereArr}}};
                        mongodb.queryData(ouParams, function (result) {
                            index++;
                            console.log("orderUsers index:" + index);
                            res.orderUsers = result;
                            if (index == total) {
                                callback(res);
                            }
                        });

                        //查询订单参与人
                        var obParams = {coll: colls.orderParts, where: {order_id: {$in: ids}}};
                        mongodb.queryData(obParams, function (result) {
                            index++;
                            console.log("orderUsers index:" + index);
                            res.orderBidders = result;
                            if (Array.isArray(result)) {
                                var userIds = [];//
                                result.forEach(function (item, index) {
                                    if (userIds.indexOf(item.user_id) < 0) {
                                        userIds.push(item.user_id)
                                    }
                                });
                                //查询参与人
                                var bParams = {coll: colls.users, where: {_id: {$in: userIds}}};
                                mongodb.queryData(bParams, function (result) {
                                    index++;
                                    console.log("bidders index:" + index);
                                    res.bidders = result;
                                    if (index == total) {
                                        callback(res);
                                    }
                                });
                            } else {
                                callback(res);
                            }
                        });
                    } else {
                        if (index == total) {
                            callback(res);
                        }
                    }
                } catch (err) {
                    res.err = err;
                    callback(res);
                }
            });
        }
    },

}
module.exports=mongodb;
