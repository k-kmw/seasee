// 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
    level: 14, // 지도의 확대 레벨
  };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places(map);

// 키워드로 장소를 검색합니다
ps.keywordSearch("해수욕장", placesSearchCB);

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
  if (status === kakao.maps.services.Status.OK) {
    for (var i = 0; i < data.length; i++) {
      displayMarker(data[i]);
    }
  }
}

var imageSrc =
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png", // 마커이미지의 주소입니다
  imageSize = new kakao.maps.Size(64, 69), // 마커이미지의 크기입니다
  imageOption = { offset: new kakao.maps.Point(27, 69) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
// var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
//   markerPosition = new kakao.maps.LatLng(place.y, place.x); // 마커가 표시될 위치입니다

// 지도에 마커를 표시하는 함수입니다
function displayMarker(place) {
  // 마커를 생성하고 지도에 표시합니다
  var marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(place.y, place.x),
  });

  // 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우를 생성합니다
  var iwContent = '<div style="padding:5px;">' + place.place_name + "</div>"; // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다

  // 인포윈도우를 생성합니다
  var infowindow = new kakao.maps.InfoWindow({
    content: iwContent,
  });

  // 마커에 마우스오버 이벤트를 등록합니다
  kakao.maps.event.addListener(marker, "mouseover", function () {
    // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
    infowindow.open(map, marker);
  });

  // 마커에 마우스아웃 이벤트를 등록합니다
  kakao.maps.event.addListener(marker, "mouseout", function () {
    // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
    infowindow.close();
  });

  // 마커에 클릭이벤트를 등록합니다
  kakao.maps.event.addListener(marker, "click", function (e) {
    // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
    infowindow.setContent(
      '<div style="padding:5px;font-size:12px;">' + place.place_name + "</div>"
    );
    infowindow.open(map, marker);
  });
}

// 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({
  content: iwContent,
  removable: iwRemoveable,
});

// 지도의 이동 기능을 막는 기능입니다.
function setDraggable(draggable) {
  // 마우스 드래그로 지도 이동 가능여부를 설정합니다
  map.setDraggable(draggable);
}

// 지도의 축소, 확대 기능을 막는 기능입니다.
function setZoomable(zoomable) {
  // 마우스 휠로 지도 확대,축소 가능여부를 설정합니다
  map.setZoomable(zoomable);
}

// // 자동실행되는 코드
// window.onload = function () {
//   setDraggable(false);
//   setZoomable(false);
// };
