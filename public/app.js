// 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
  };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();

// 키워드로 장소를 검색합니다
ps.keywordSearch("해수욕장 ", placesSearchCB);

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 키워드로 장소를 검색합니다
searchPlaces();

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {
  const keyword = document.getElementById("keyword").value;
  // console.log(keyword);
  if (keyword === " ") {
    ps.keywordSearch("해수욕장", placesSearchCB);
  } else {
    ps.keywordSearch(keyword, placesSearchCB);
  }

  // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
}

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB(data, status) {
  if (status === kakao.maps.services.Status.OK) {
    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
    // LatLngBounds 객체에 좌표를 추가합니다
    var bounds = new kakao.maps.LatLngBounds();

    for (var i = 0; i < data.length; i++) {
      displayMarker(data[i]);
      bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
    }

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
  }
}

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
  // 마커를 생성하고 지도에 표시합니다
  var marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(place.y, place.x),
  });

  var markerImage = new kakao.maps.MarkerImage(
    "img/marker.png",
    new kakao.maps.Size(25, 25),
    new kakao.maps.Point(13, 34)
  );
  marker.setImage(markerImage);

  // 마커에 클릭이벤트를 등록합니다
  kakao.maps.event.addListener(marker, "click", function () {
    // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
    infowindow.setContent(
      '<div style="padding:5px;font-size:12px;">' + place.place_name + "</div>"
    );
    // console.log(place);
    infowindow.open(map, marker);
    const placeName = place.place_name;
    const index = placeName.indexOf("해", 1);
    let name = placeName.slice(0, index);
    const deletePeople = document.querySelector("span");
    if (deletePeople !== null) {
      deletePeople.remove();
    }
    const deleteWeather = document.querySelector("ul");
    if (deleteWeather !== null) {
      deleteWeather.remove();
    }
    const deleteUrl = document.querySelector("a");
    if (deleteUrl !== null) {
      deleteUrl.remove();
    }

    const url = place.place_url;
    const a = document.createElement("a");
    a.append(url);
    a.href = url;
    a.target = "blank";
    document.body.append(a);

    getPeople(name).then((res) => {
      const people = res.data.current_people;

      const span = document.createElement("span");
      if (people === -1) {
        span.append("사람 수 정보 없음");
      } else {
        span.append(`현재 사람수: ${res.data.current_people}`);
      }
      document.body.append(span);
    });

    // console.log(marker.getPosition());
    const lat = parseFloat(place.x);
    const lon = parseFloat(place.y);
    getWether(lon, lat).then((res) => {
      const datas = res.data.weather;
      // console.log(datas);
      const ul = document.createElement("ul");
      datas.forEach((data) => {
        const li = document.createElement("li");
        li.append(data);
        ul.append(li);
        document.body.append(ul);
      });
    });
  });
}

async function getPeople(loc) {
  return await axios.get(`http://localhost:3000/info?beach_name=${loc}`);
}

async function getWether(lat, lon) {
  return await axios.get(`http://localhost:3000/weather?lat=${lat}&lng=${lon}`);
}
