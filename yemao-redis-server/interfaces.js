var settings = require('./settings')
var redis = require('redis')

var interfaces={};
interfaces = {
    myclient : null,
    getClient : function () {
        console.log('get client:');
        return redis.createClient(settings.RDS_POST,settings.RDS_HOST,settings.RDS_OPTS);
    },
    quitClient : function () {
        if( interfaces.myclient ){
            console.log("client quit:")
            // 关闭连接
            interfaces.myclient.quit();
        }
    },
    getData : function (param,callback) {
        if( param ){
            if( param.interfaceId != null ){
                interfaces.myclient = interfaces.getClient();
                interfaces[param.interfaceId](param,function (result) {
                    //console.log('getData result:'+JSON.stringify(result));
                    callback(result);
                    interfaces.quitClient();
                });
            }
        }
    },
    getIndexInfo : function (param,callback) {
        var client = interfaces.myclient;
        if( client ){
            var num = 3;
            var index = 0;
            var data = {
                imgList: {},
                noticeList: {},
                orderList: {}
            };
            //indexImgList
            client.lrange('indexImgList', '0', '-1', function(err, reply){
                // console.log('imglist:'+reply.toString());
                data.imgList = reply;
                index += 1;
                if(index==num){
                    callback(data);
                }
            });

            //indexNoticeList
            client.lrange('indexNoticeList', '0', '-1', function(err, reply){
                // console.log('indexNoticeList:'+reply.toString());
                data.noticeList.notice = reply;
                index += 1;
                if(index==num){
                    callback(data);
                }
            });

        }
    },
    testFun : function (param) {
        if( param ){
            return JSON.stringify("callback:"+JSON.stringify(param))
        }else {
            return 'test function !';
        }
    }
}
module.exports=interfaces;
