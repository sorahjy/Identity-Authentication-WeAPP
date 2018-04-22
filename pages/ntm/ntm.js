//user.js
var app = getApp()
var Bmob = require('../../utils/bmob.js');//!!
var common = require('../../utils/common.js');//!!
var nickname = ''
var location = {
  latitude: '',
  longitude: '',
}
var value;
var appid = 'wx7ba411c09199c347'
var secret = '53acb43e01468e4ac26eee7a6b5c1564'
const basehost = "https://www.sorahjy.com"

Page({
  data: {
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
      url: '../ntm/ntm'
    })
  },
  confirmHandler: function (e) {
    value = e.detail.value
  },
  inputHandler: function (e) {
    value = e.detail.value
  },
  onLoad: function () {
    var scene = options.scene ? decodeURIComponent(options.scene).split(',') : []
    if (scene.length === 0) {
      //TODO 显示初始化失败，请重新刷取二维码
      return;
    }
    let answer = scene[0]
    let sid = scene[1]
    //获取位置
    //fixme 异步调用，可能获取不到
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        location.latitude = res.latitude
        location.longitude = res.longitude
      }
    })
    //获取用户登录code
    wx.login({
      success: (loginRes) => {
        //向后台申请签到
        wx.request({
          url: basehost + '/sign',
          method: 'POST',
          dataType: 'json',
          responseType: 'json',
          data: {
            sid: sid, // segmentId
            code: loginRes.code,
            answer: answer,
            location: location
          },
          success(res) {
            // status:
            //   'OK' /*签到成功*/ ||
            //   'OK_BUT_NOT_IN_DATABASE'/*签到成功，数据库里没有这个学生信息*/ ||
            //   'OK_BUT_NOT_IN_CLASS' /*签到成功，数据库里有学生信息，但是不在这个班上*/ ||
            //   'DUPLICATED'/*已签到成功的学生重复签到*/ ||
            //   'FAIL' /*签到失败，多为answer超时*/,
            // token: String || null, // 学生不在数据库(OK_BUT_NOT_IN_DATABASE)里的情况下，提供一个token来设置自己的学号和名字
            // number: String || null,// 和token势不两立，在数据库里的学号和名字会被返回
            // name: String || null // number和name只会在token为null的时候被填充
            switch (res.status) {
              case 'OK':
                //这里显示一个[签到成功]的界面
                wx.showModal({
                  title: '提示',
                  content: '签到成功',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
                //TODO姓名和学号都在res里，可以读出来显示
                break;
              case 'OK_BUT_NOT_IN_DATABASE':
                //TODO 这里需要一个填写学号和姓名的弹窗
                //这里是数据库中没有该学生信息的情况
                //提交数据填写并使用下面的SignIn()
                break;
              case 'OK_BUT_NOT_IN_CLASS':
                //TODO 这里需要显示一个[蹭课成功]的界面 类似于case’OK‘
                //姓名和学号都在res里，可以读出来显示
                break;
              case 'DUPLICATED':
                //TODO 这里需要显示一个‘请勿重复签到’的弹窗（或界面
                //姓名和学号都在res里，可以读出来显示
                break;
              default:
              //TODO 这里用于处理失败信息 请刷新重试等
            }
          },
          fail: function (res) {
            //TODO 弹出失败信息，提示：“请重新刷取二维码”
          },
        })
      },
      fail: () => {
            //TODO 弹出失败信息，提示：“登录/获取用户信息失败”
      }
    })
  },

  //fixme 没用就删了吧
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  //在'OK_BUT_NOT_IN_DATABASE'case下的对话框确认按钮
  signIn: function () {
    wx.request({
      url: basehost + '/sign/name',
      data: {
        token: res.token,
        number: '这里是用对话框获取的学号，Number类型',// 签到学生学号
        name: '这里是用对话框获取的姓名，Number类型', // 签到学生名字
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'json',
      success: function (res) {
        //TODO 这里弹出[签到成功]的界面
      },
      fail: function (res) {
        //TODO 弹出失败信息，提示：“请重新刷取二维码”
      },
    })
  }


})
