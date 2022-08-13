const express = require('express');
const path = require('path');
const app = express();
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))
app.listen(3000, () => {
    console.log("3000");
})

app.get('/', (req, res)=>{
    res.render('home');
})

app.get('/weather', function(req,res){
    var request = require('request');
    var url = 'http://apis.data.go.kr/1360000/BeachInfoservice/getUltraSrtFcstBeach?serviceKey=Ttlq1ffL8kVaF2WzhW13DkIZRhzmTLgKbmHgakqODvcbe%2FC9ZRC0klrwGUbssZ1cBRs1NxiRscuJDqul0ukKhg%3D%3D&dataType=JSON'
    var beach_code = req.query.beach_code;
    var now = new Date();
    var Y = now.getFullYear();
    var M = now.getMonth()+1;
    var D = now.getDate();
    var H = now.getHours();
  
    if(M<10){
      M = '0'+String(M)
    }
  
    if(D<10){
      D = '0'+String(D)
    }
  
    if(H == 0){
      H='2330'
      var yesterDate = now.getTime() - (1 * 24 * 60 * 60 * 1000);
      now.setTime(yesterDate);
      
      Y = now.getFullYear();
      M = now.getMonth() + 1;
      D = now.getDate();
          
      if(M < 10){ 
        M = "0" + String(M); 
      }
      if(D < 10) { 
        D = "0" + String(D);
      }
    }
    else{
      if(H-1 < 10){
        H = "0" + String(H-1);
      }
      H = String(H-1) + "30";
    }
  
    var ymd = Y + "" + M + "" + D;
    var hours = H;
  
    url = url + "&base_date=" + ymd + "&base_time=" + hours + "&beach_num=" + beach_code + "&numOfRows=24";
    
    var options = {
      'method': 'GET',
      'url': url,
      'headers': {
      }
    };
    
    var time = [];
    var pty = [];
    var sky = [];
  
    request(options, function (error, response) {
      if (error) throw new Error(error);
      result = JSON.parse(response.body).response.body.items;
  
      for (let index = 0; index < 24; index++) {
        switch(result.item[index].category){
          case "PTY":
            pty.push(result.item[index].fcstValue);
            break;
          case "SKY":
            time.push(result.item[index].fcstTime)
            switch(result.item[index].fcstValue){
              case "1":
                sky.push("맑음");
                break;
              case "2":
                sky.push("구름조금");
                break;
              case "3":
                sky.push("구름많음");
                break;
              case "4":
                sky.push("흐림");
                break;
            }
            break;
          default:
            break;
        }
      };
  
      for (let index = 0; index < sky.length; index++) {
        if (pty[index] == "1" || pty[index] == "4" || pty[index] == "5" || pty[index] == "6") {
          sky[index] = "비";
        }
        else if(pty[index] != "0"){
          sky[index] = "눈";
        }
      }
  
      var data = new Object();
      var list = new Array();
  
      for (let index = 0; index < 6; index++) {
          var testList = new Array();
          testList.push(time[index]);
          testList.push(sky[index]);
          list.push(testList);
      }
      data.weather = list;
  
      var jsonData = JSON.stringify(data);
  
      res.send(jsonData)
    })
  })
  
  app.get('/info', function(req,res) { 
    var request = require('request');
    var url2 = 'https://www.tournmaster.com/seantour_map/travel/getBeachCongestionApi.do';
    
    var beach_name = encodeURI(req.query.beach_name);
  
    var options = {
      'method': 'GET',
      'url': url2,
      'headers': {
      }
    };
  
    request(options, function (error, response) {
      if (error) throw new Error(error);
  
      var data = JSON.parse(response.body)
      
      var current_people = -1;
      var congestion = -1;
  
      for (key in data) {
        if (beach_name == encodeURI(data[key].poiNm)) {
          current_people = data[key].uniqPop
          congestion = data[key].congestion
          break;
        }
      }
  
      var data = new Object() ;
          
      data.current_people = current_people;
      data.congestion = congestion;
    
      var jsonData = JSON.stringify(data);
  
      res.send(jsonData)
    });
  })