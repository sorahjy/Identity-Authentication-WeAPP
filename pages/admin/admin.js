//admin.js
//获取应用实例
const app = getApp()
var Bmob = require('../../utils/bmob.js');//!!
var common = require('../../utils/common.js');//!!
var QRCode = require('../../utils/weapp-qrcode.js')//!!
var latitude_new = '';
var longitude_new = '';
var latitude_val='';
var longitude_val='';

Page({
  data: {
    // motto: '您好，欢迎使用！',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    urlArr: [],
    loading: true,
    thispathFile: '',
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../admin/admin'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    wx.getLocation({
      success: function(res) {
        latitude_new=res.latitude;
        longitude_new=res.longitude;
      },
    })

    var Diary = Bmob.Object.extend("Location");
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(Diary);
    //查询单条数据，第一个参数是这条数据的objectId值
    query.get("qWKy111m", {
      success: function (result) {
        // 查询成功，调用get方法获取对应属性的值
        longitude_val = result.get("longitude");
        latitude_val = result.get("latitude");
      },
      error: function (object, error) {
        // 查询失败
      }
    });

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  //设置密码
  setPassword:function(){
    wx.navigateTo({
      url: '../fix/fix',
    })
  },

  //查看签到情况
  seelog:function(){
    var log = new Array();
    var Diary = Bmob.Object.extend("Login");
    var query = new Bmob.Query(Diary);
    // 查询所有数据
    query.find({
      success: function (results) {
        console.log("共查询到 " + results.length + " 条记录");
        // console.log(results);
        // 循环处理查询到的数据
        for (var i = 0 ; i < results.length ; i++) {
          var object = results[i];
          console.log(object.id + ' - ' + results[i].createdAt)
          var ans = object.get('nickname') + " " + results[i].createdAt
          if(Math.abs(object.get('latitude')+object.get('longitude')-latitude_val-longitude_val)<0.03){
            ans=ans+" 位置合法"
          }else{
            ans = ans + " 位置非法"
          }
          log[results.length-1-i] = ans;
        }
        //  console.log(log)
        for(var i=0;i<results.length;i++){
          app.globalData.log[i]=log[i]
        }
        wx.navigateTo({
          url: '../logs/logs',
        })
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });

  },

  //设定签到位置
  setLocation: function () {
    
    var Diary = Bmob.Object.extend("Location");
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(Diary);
    //查询单条数据，第一个参数是这条数据的objectId值
    query.get("qWKy111m", {
      success: function (result) {
        // 查询成功，调用get方法获取对应属性的值
        var longitude_old = result.get("longitude");
        var latitude_old = result.get("latitude");
        wx.showModal({
          title: '即将更新地理位置',
          content: '地理位置将发生如下变化:\r\n旧经度:'+
          +longitude_old+'\r\n新经度:'+longitude_new+
          '\r\n旧纬度:'+latitude_old+'\r\n新纬度:'+latitude_new,
          success: function(res){
            if(res.confirm){
              console.log('用户点击确定')
              var Diary = Bmob.Object.extend("diary");
              var query = new Bmob.Query(Diary);
              longitude_val=longitude_new;
              latitude_val=latitude_new;
              query.get('qWKy111m', {
                success: function (result) {
                  // 回调中可以取得这个 GameScore 对象的一个实例，然后就可以修改它了
                  result.set('longitude', longitude_new);
                  result.set('latitude',latitude_new);
                  result.save();
                  
                  // The object was retrieved successfully.
                },
                error: function (object, error) {

                }
                
              });
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })

        
      },
      error: function (object, error) {
        // 查询失败
      }
    });

    
  }
})

