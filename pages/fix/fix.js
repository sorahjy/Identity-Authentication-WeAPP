// pages/fix/fix.js

var Bmob = require('../../utils/bmob.js');//!!
var common = require('../../utils/common.js');//!!
var app = getApp()
var oldpass
var newpass


Page({

  data: {
  
  },

  onLoad: function (options) {

  },
  gobackbutton: function(){
    wx.redirectTo({
      url: '../admin/admin',
    })
  },
  oldPasswordHandler: function(e){
    oldpass=e.detail.value;
  },
  newPasswordHandler: function(e){
    newpass=e.detail.value
  },
  confirmbutton:function(e){
    var Diary = Bmob.Object.extend("Secret");
    var query = new Bmob.Query(Diary);
    query.get("N7SCYYY9", {
      success: function (result) {
        var val_passwd = result.get("passwd");
        if(val_passwd===oldpass){
          wx.showModal({
            title: '提示' ,
            content:  "确定要修改密码吗？此操作不可逆！",
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                var Diary = Bmob.Object.extend("Secret");
                var query = new Bmob.Query(Diary);

                query.get('N7SCYYY9', {
                  success: function (result) {
                    result.set('passwd', newpass);
                    result.save();
                    wx.showModal({
                      title: '提示',
                      content: '修改成功',
                      showCancel:false,
                      success:function(){
                        wx.redirectTo({
                          url: '../admin/admin',
                        })
                      }
                    })
                  },
                  error: function (object, error) {

                  }
                });
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }else{
          wx.showModal({
            title: '提示',
            content: "旧密码错误！请重新输入",
            showCancel: false,
          })
        }
      },
      error: function (object, error) {
        // 查询失败

      }
    });
  }


  
})