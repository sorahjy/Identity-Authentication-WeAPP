//index.js
//获取应用实例
var app = getApp()
var that;
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var openid;

Page({
  data: {
    loading: true,
    url:'',
  },
  //事件处理函数

  onLoad: function () {
    that=this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求
          console.log(res.code)

          Bmob.User.requestOpenId(res.code, {
            success: function (result) {
              openid=result.openid;
              app.globalData.openid=openid;
              that.setData({
                loading: true,
                url: result.openid
              })
              console.log(result);
              //修改
              /*
              if (openid =="ot18I0RJwK8UEi69EvoxEaDjisdE"){
                console.log("huozhe");
                wx.navigateTo({
                  url: '../user/user',
                })
              }else{  
                wx.navigateTo({
                  url: '../register/register',
                })
              }
              */
              var Diary = Bmob.Object.extend("Users");
              var query = new Bmob.Query(Diary);
              query.equalTo("openid",openid);
              // 查询所有数据
              query.find({
                success: function (results) {
                  var count=results.length
                  console.log("共查询到 " + count + " 条记录");
                  if(count==0){
                    wx.redirectTo({
                      url: '../register/register',
                    })
                  }else{
                    var identity=results[0].get("identity");
                    app.globalData.faceurl=results[0].get("url");
                    if(identity=="user"){
                      wx.redirectTo({
                        url: '../user/user',
                      })
                    }else{
                      wx.redirectTo({
                        url: '../admin/admin',
                      })
                    }
                  }
                },
                error: function (error) {
                  console.log("查询失败: " + error.code + " " + error.message);
                }
              });
              //
            },
            error: function (error) {
              // Show the error message somewhere
              console.log("Error: " + error.code + " " + error.message);
            }
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
          common.showTip('获取用户登录态失败！', 'loading');
        }
      }
    });

  },
  refresh_url : function(){
    wx.navigateTo({
      url: '../index/index',
    })
  }
  
})
