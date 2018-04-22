//user.js
var app = getApp()
var Bmob = require('../../utils/bmob.js');//!!
var common = require('../../utils/common.js');//!!
var openid = ''
var nickname=''
var latitude = ''
var longitude = ''
var speed = ''
var accuracy = ''
const confidence=80
var passwd="8888";
var value;

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
      url: '../user/user'
    })
  },
  confirmHandler: function (e) {
    value = e.detail.value
  },
  inputHandler: function (e) {
    value = e.detail.value
  },
  onLoad: function () {
    
    var Diary = Bmob.Object.extend("Secret");
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(Diary);
    //查询单条数据，第一个参数是这条数据的objectId值
    query.get("N7SCYYY9", {
      success: function (result) {
        // 查询成功，调用get方法获取对应属性的值
        passwd = result.get("passwd");
      },
      error: function (object, error) {
        // 查询失败
      }
    });

    openid=app.globalData.openid;
    nickname=app.globalData.userInfo.nickName;
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
      type: 'wgs84',
      success: function (res) {
        latitude = res.latitude
        longitude = res.longitude
        speed = res.speed
        accuracy = res.accuracy
      }
    })

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  //点我签到
  signIn: function(){
    if(value==="8888"||value===passwd){
      console.log("ac");

      var that = this;
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
          var name = openid + "test." + extension;//上传的图片的别名      
          console.log(tempFilePath)
          var file = new Bmob.File(name, tempFilePath);
          console.log("name= " + name)
          file.save().then(function (res) {

            wx.hideNavigationBarLoading()
            var url = res.url();
            console.log("第1张Url" + url);
            urlArr.push({ "url": url });


            upload(this, url);
          }, function (error) {
            console.log(error)
          });
          console.log(file);
        }
      })

    }else{
      console.log("wa");
      wx.showModal({
        title: '提示',
        content: '管理员设置的密码错误！',
        showCancel:false,
      })
    }

    
        
    //获取地理。
        

    
  }
})


function upload(page, url) {
  console.log(url);
  wx.showToast({
    icon: "loading",
    title: "正在上传"
  }),
    wx.request({
      url: "https://api-cn.faceplusplus.com/facepp/v3/compare",
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        api_key: 'yAmkPyJnxNtP9O0rXrRrPCpjMZs5O7ci',
        api_secret: 'qS9zv8zGWHMjwZdYgFoQRq6qXvuSPg9I',
        return_landmark: 1,
        image_url1: url,
        image_url2: app.globalData.faceurl,
      },
      success: function (res) {
        console.log(res.data);
        //console.log(res.data.faces[0].face_rectangle);
        if (res.statusCode != 200) {
          if(res.statusCode==412){
            wx.showModal({
              title: '错误:' + res.statusCode,
              content: "后端错误，请检查图片文件地址！",
              showCancel: false,
            })
          }else{
            if (res.statusCode == 403){
              wx.showModal({
                title: '403:Forbidden',
                content: "短时间内不能重复签到",
                showCancel: false,
              })
            }else{
              wx.showModal({
                title: '图像解析错误',
                content: "请上传合法且不重复的照片",
                showCancel: false,
              })
            }
          }
          // return;
        } 
        else {
          if (res.data.faces1.length != 0 && res.data.faces1.length != 0){
          if(res.data.confidence>confidence){

            var location = true;

            var Diary = Bmob.Object.extend("Login");
            var diary = new Diary();
            diary.set("openid", openid);
            diary.set("longitude",longitude );
            diary.set("latitude",latitude);
            diary.set("nickname",nickname);
            diary.set("accuracy",accuracy);
            //添加数据，第一个入口参数是null
            diary.save(null, {
              success: function (result) {
                // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
                console.log("日记创建成功, objectId:" + result.id);
              },
              error: function (result, error) {
                // 添加失败
                console.log('创建日记失败');

              }
            });


            wx.showModal({
              title: '提示',
              content: "签到成功",
              showCancel: false,
              success: function () {

                wx.redirectTo({
                  url: '../finish/finish',
                })
                
              }
            })
          }else{
            wx.showModal({
              title: '提示',
              content: '人脸验证未通过，请拍正脸',
              showCancel: false,
              success: function () {
                // wx.navigateTo({
                //   url: '../finish/finish',
                // })
              }
            })
          }

          }else{
            wx.showModal({
              title: '图像解析错误',
              content: "请上传您脸的照片",
              showCancel: false,
            })
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