//index.js
var Bmob = require('../../utils/bmob.js');//!!
var common = require('../../utils/common.js');//!!
var app = getApp()
var openid = ''
var nickname = ''

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    //canIUse: wx.canIUse('button.open-type.getUserInfo')
    urlArr: [],
    loading: true,
    thispathFile: ''
  },
  //事件处理函数
  onLoad: function (options) {
    openid = app.globalData.openid
    if (app.globalData.userInfo) {
      nickname = app.globalData.userInfo.nickName
      app.globalData.nickname = nickname;
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      nickname = app.globalData.userInfo.nickName
      app.globalData.nickname = nickname;
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
  },
  //上传

  register_user: function () {
    var that = this;
    var identity = "user";
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'],
      sourceType: ['camera'], // 记得删除album
      success: function (res) {
        wx.showNavigationBarLoading()
        that.setData({
          loading: false,
          src: res.tempFilePath,
          thispathFile: res.tempFilePaths[0]
        })
        var urlArr = new Array();
        // var urlArr={};
        console.log("res= " + res)
        var tempFilePath = res.tempFilePaths;
        console.log("tempFilePath= " + tempFilePath)

        var newDate = new Date();
        var newDateStr = newDate.toLocaleDateString();


        var extension = /\.([^.]*)$/.exec(tempFilePath);
        if (extension) {
          extension = extension[1].toLowerCase();
        }
        var name = openid + "." + extension;//上传的图片的别名      
        console.log(tempFilePath)
        var file = new Bmob.File(name, tempFilePath);
        console.log("name= " + name)
        file.save().then(function (res) {

          wx.hideNavigationBarLoading()
          var url = res.url();
          console.log("第1张Url" + url);
          urlArr.push({ "url": url });
          upload(this, url, "user");
        }, function (error) {
          console.log(error)
        });
        console.log(file);
      }
    })
    return;
  },

  register_admin: function () {
    var that = this;
    var identity = "admin";
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'],
      sourceType: ['camera'], // 记得删除album
      success: function (res) {
        wx.showNavigationBarLoading()
        that.setData({
          loading: false,
          src: res.tempFilePath,
          thispathFile: res.tempFilePaths[0]
        })
        var urlArr = new Array();
        // var urlArr={};
        console.log("res= " + res)
        var tempFilePath = res.tempFilePaths;
        console.log("tempFilePath= " + tempFilePath)

        var newDate = new Date();
        var newDateStr = newDate.toLocaleDateString();


        var extension = /\.([^.]*)$/.exec(tempFilePath);
        if (extension) {
          extension = extension[1].toLowerCase();
        }
        var name = openid + "." + extension;//上传的图片的别名      
        console.log(tempFilePath)
        var file = new Bmob.File(name, tempFilePath);
        console.log("name= " + name)
        file.save().then(function (res) {

          wx.hideNavigationBarLoading()
          var url = res.url();
          console.log("第1张Url" + url);
          urlArr.push({ "url": url });
          upload(this, url, "admin");
        }, function (error) {
          console.log(error)
        });
        console.log(file);
      }
    })
    return;
  }
  //end
})



function upload(page, url, identity) {
  console.log(url);
  wx.showToast({
    icon: "loading",
    title: "正在上传"
  }),
    wx.request({
      url: "https://api-cn.faceplusplus.com/facepp/v3/detect",
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        api_key: 'yAmkPyJnxNtP9O0rXrRrPCpjMZs5O7ci',
        api_secret: 'qS9zv8zGWHMjwZdYgFoQRq6qXvuSPg9I',
        return_landmark: 1,
        image_url: url    //已解决
      },
      success: function (res) {
        console.log(res.data);
        //console.log(res.data.faces[0].face_rectangle);
        if (res.statusCode != 200) {
          if (res.statusCode == 403) {
            wx.showModal({
              title: '验证失败',
              content: "过于频繁或照片重复，请稍后再试！",
              showCancel: false,
            })
          } else {
            wx.showModal({
              title: '验证失败',
              content: "错误代码" + res.statusCode,
              showCancel: false,
            })
          }
          // return;
        }
        else {
          if (res.data.faces.length == 0) {
            wx.showModal({
              title: '提示',
              content: "照片不包含人脸！请重新拍照！",
              showCancel: false,

            })
          }
          else {
            var Diary = Bmob.Object.extend("Users");
            var diary = new Diary();
            diary.set("openid", openid);
            diary.set("identity", identity);
            diary.set("url", url);
            diary.set("nickname", nickname);
            //添加数据，第一个入口参数是null
            diary.save(null, {
              success: function (result) {
                // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
                console.log("日记创建成功, objectId:" + result.id);
                wx.showModal({
                  title: '提示',
                  content: "注册成功",
                  showCancel: false,
                  success: function () {
                    app.globalData.faceurl = url;
                    wx.navigateTo({
                      url: '../' + identity + '/' + identity,
                    })
                  }
                })

              },
              error: function (result, error) {
                // 添加失败
                console.log('创建日记失败');

              }
            });
            /*
            wx.showModal({
              title: '提示',
              content: "验证成功",
              showCancel: false,
              success: function () {
                wx.navigateTo({
                  url: '../'+identity+'/'+identity,
                })
              }
            })
            */
          }
        }
      },
      fail: function (e) {
        console.log(e);
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false,

        })
      },
      // complete: function () {
      //   wx.hideToast();  //隐藏Toast
      // }
    })
}