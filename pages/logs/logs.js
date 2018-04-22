//logs.js
const util = require('../../utils/util.js')
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var app=getApp();

 
Page({
  data: {
    logs: []
  },
  onLoad: function () {
    /*
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
    */
    wx.showModal({
      title: '您好，普通管理员',
      content: '您只能查看最近20条记录！',
      showCancel: false,
    })

    this.setData({
      logs: app.globalData.log
    })

    
    
    
  }

})
