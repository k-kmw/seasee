const express = require("express");
const path = require("path");
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static("views"));
app.listen(3000, () => {
  console.log("3000");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.use(express.static("public"));

app.get("/weather", function (req, res) {
  var request = require("request");

  // 위도경도 -> xy좌표
  var RE = 6371.00877; // 지구 반경(km)
  var GRID = 5.0; // 격자 간격(km)
  var SLAT1 = 30.0; // 투영 위도1(degree)
  var SLAT2 = 60.0; // 투영 위도2(degree)
  var OLON = 126.0; // 기준점 경도(degree)
  var OLAT = 38.0; // 기준점 위도(degree)
  var XO = 43; // 기준점 X좌표(GRID)
  var YO = 136; // 기1준점 Y좌표(GRID)

  function dfs_xy_conv(code, v1, v2) {
    var DEGRAD = Math.PI / 180.0;
    var RADDEG = 180.0 / Math.PI;

    var re = RE / GRID;
    var slat1 = SLAT1 * DEGRAD;
    var slat2 = SLAT2 * DEGRAD;
    var olon = OLON * DEGRAD;
    var olat = OLAT * DEGRAD;

    var sn =
      Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
      Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
    var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
    var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = (re * sf) / Math.pow(ro, sn);
    var rs = {};
    if (code == "toXY") {
      rs["lat"] = v1;
      rs["lng"] = v2;
      var ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
      ra = (re * sf) / Math.pow(ra, sn);
      var theta = v2 * DEGRAD - olon;
      if (theta > Math.PI) theta -= 2.0 * Math.PI;
      if (theta < -Math.PI) theta += 2.0 * Math.PI;
      theta *= sn;
      rs["x"] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
      rs["y"] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
    } else {
      rs["x"] = v1;
      rs["y"] = v2;
      var xn = v1 - XO;
      var yn = ro - v2 + YO;
      ra = Math.sqrt(xn * xn + yn * yn);
      if (sn < 0.0) -ra;
      var alat = Math.pow((re * sf) / ra, 1.0 / sn);
      alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

      if (Math.abs(xn) <= 0.0) {
        theta = 0.0;
      } else {
        if (Math.abs(yn) <= 0.0) {
          theta = Math.PI * 0.5;
          if (xn < 0.0) -theta;
        } else theta = Math.atan2(xn, yn);
      }
      var alon = theta / sn + olon;
      rs["lat"] = alat * RADDEG;
      rs["lng"] = alon * RADDEG;
    }
    return rs;
  }

  var url =
    "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?" +
    "serviceKey=%2B6ikhw3jlfLZuDjMkg0XUe9e3NzjWBeTwDrGyTB5BQLe3yZ5xIS5h%2BsQ6qTbyRrzvkPfZh4f%2B0Fc1x1a5t4FBg%3D%3D" +
    "&dataType=JSON";
  var lat = parseFloat(req.query.lat);
  var lng = parseFloat(req.query.lng);
  var nx = dfs_xy_conv("toXY", lat, lng).x;
  var ny = dfs_xy_conv("toXY", lat, lng).y;

  url = url + "&nx=" + nx + "&ny=" + ny;

  var now = new Date();
  var Y = now.getFullYear();
  var M = now.getMonth() + 1;
  var D = now.getDate();
  var H = now.getHours();

  if (M < 10) {
    M = "0" + String(M);
  }

  if (D < 10) {
    D = "0" + String(D);
  }

  if (H == 0) {
    H = "2330";
    var yesterDate = now.getTime() - 1 * 24 * 60 * 60 * 1000;
    now.setTime(yesterDate);

    Y = now.getFullYear();
    M = now.getMonth() + 1;
    D = now.getDate();

    if (M < 10) {
      M = "0" + String(M);
    }
    if (D < 10) {
      D = "0" + String(D);
    }
  } else {
    if (H - 1 < 10) {
      H = "0" + String(H - 1) + "30";
    } else H = String(H - 1) + "30";
  }

  var ymd = Y + "" + M + "" + D;
  var hours = H;

  url = url + "&base_date=" + ymd + "&base_time=" + hours + "&numOfRows=24";

  var options = {
    method: "GET",
    url: url,
    headers: {},
  };

  var time = [];
  var pty = [];
  var sky = [];

  request(options, function (error, response) {
    if (error) throw new Error(error);
    result = JSON.parse(response.body).response.body.items;

    for (let index = 0; index < 24; index++) {
      switch (result.item[index].category) {
        case "PTY":
          pty.push(result.item[index].fcstValue);
          break;
        case "SKY":
          time.push(result.item[index].fcstTime);
          switch (result.item[index].fcstValue) {
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
    }

    for (let index = 0; index < sky.length; index++) {
      if (
        pty[index] == "1" ||
        pty[index] == "4" ||
        pty[index] == "5" ||
        pty[index] == "6"
      ) {
        sky[index] = "비";
      } else if (pty[index] != "0") {
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

    res.send(jsonData);
  });
});

app.get("/info", function (req, res) {
  var request = require("request");
  var url2 =
    "https://www.tournmaster.com/seantour_map/travel/getBeachCongestionApi.do";

  var beach_name = encodeURI(req.query.beach_name);

  var options = {
    method: "GET",
    url: url2,
    headers: {},
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);

    var data = JSON.parse(response.body);

    var current_people = -1;
    var congestion = -1;

    for (key in data) {
      if (beach_name == encodeURI(data[key].poiNm)) {
        current_people = data[key].uniqPop;
        congestion = data[key].congestion;
        break;
      }
    }

    var data = new Object();

    data.current_people = current_people;
    data.congestion = congestion;

    var jsonData = JSON.stringify(data);

    res.send(jsonData);
  });
});

app.get("/info", function (req, res) {
  var request = require("request");
  var url2 =
    "https://www.tournmaster.com/seantour_map/travel/getBeachCongestionApi.do";

  var beach_name = encodeURI(req.query.beach_name);

  var options = {
    method: "GET",
    url: url2,
    headers: {},
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);

    var data = JSON.parse(response.body);

    var current_people = -1;
    var congestion = -1;

    for (key in data) {
      if (beach_name == encodeURI(data[key].poiNm)) {
        current_people = data[key].uniqPop;
        congestion = data[key].congestion;
        break;
      }
    }

    var data = new Object();

    data.current_people = current_people;
    data.congestion = congestion;

    var jsonData = JSON.stringify(data);

    res.send(jsonData);
  });
});
