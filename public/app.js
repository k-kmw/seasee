// var mapContainer = document.getElementById('map'), // 지도를 표시할 div
//     mapOption = {
//         center: new kakao.maps.LatLng(35.450701, 127.570667), // 지도의 중심좌표
//         level: 13 // 지도의 확대 레벨
//     };

// var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

// const markers = [[35.15833, 129.15992, "해운대해수욕장"], [35.15300, 129.11896, "광안리해수욕장"]]

// markers.forEach(m => {
//     // 마커가 표시될 위치입니다
//     var markerPosition  = new kakao.maps.LatLng(m[0], m[1]);
//     // 마커를 생성합니다
//     var marker = new kakao.maps.Marker({
//         position: markerPosition,
//         clickable: true,
//         text: m[2]
//     });
//     var iwContent = `<div style="padding:5px;">${m[2]} <br><a href="https://map.kakao.com/link/map/Hello World!,33.450701,126.570667" style="color:blue" target="_blank">큰지도보기</a> <a href="https://map.kakao.com/link/to/Hello World!,33.450701,126.570667" style="color:blue" target="_blank">길찾기</a></div>`, // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
//     iwPosition = new kakao.maps.LatLng(33.450701, 126.570667); //인포윈도우 표시 위치입니다

//     // 인포윈도우를 생성합니다
//     var infowindow = new kakao.maps.InfoWindow({
//         position : iwPosition,
//         content : iwContent
//     });

// // 마커 위에 인포윈도우를 표시합니다. 두번째 파라미터인 marker를 넣어주지 않으면 지도 위에 표시됩니다
// infowindow.open(map, marker);
//     // 마커가 지도 위에 표시되도록 설정합니다
//     marker.setMap(map);
// })

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

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

// 키워드로 장소를 검색합니다
searchPlaces();

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {
  var keyword = document.getElementById("keyword").value;

  //   if (!keyword.replace(/^\s+|\s+$/g, "")) {
  //     alert("키워드를 입력해주세요!");
  //     return false;
  //   }

  // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
  ps.keywordSearch(keyword, placesSearchCB);
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
  if (status === kakao.maps.services.Status.OK) {
    // 정상적으로 검색이 완료됐으면
    // 검색 목록과 마커를 표출합니다
    displayPlaces(data);

    // 페이지 번호를 표출합니다
    displayPagination(pagination);
  } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
    alert("검색 결과가 존재하지 않습니다.");
    return;
  } else if (status === kakao.maps.services.Status.ERROR) {
    alert("검색 결과 중 오류가 발생했습니다.");
    return;
  }
}

// 키워드로 장소를 검색합니다
ps.keywordSearch("해수욕장 ", placesSearchCB);

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
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

  // 마커에 클릭이벤트를 등록합니다
  kakao.maps.event.addListener(marker, "click", function () {
    // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
    infowindow.setContent(
      '<div style="padding:5px;font-size:12px;">' + place.place_name + "</div>"
    );
    infowindow.open(map, marker);
    const placeName = place.place_name;
    const index = placeName.indexOf("해");
    let name = placeName.slice(0, index);
    if (placeName === "해운대해수욕장") {
      name = "해운대";
    }
    getRes(name).then((res) => {
      const people = res.data.current_people;
      const deleting = document.querySelector("span");
      if (deleting !== null) {
        deleting.remove();
      }
      const span = document.createElement("span");
      if (people === -1) {
        span.append("정보 없음");
      } else {
        span.append(`현재 사람수: ${res.data.current_people}`);
      }
      document.body.append(span);
    });
  });
}

kakao.maps.event.addListener(map, "click", function (mouseEvent) {
  // 클릭한 위도, 경도 정보를 가져옵니다
  var latlng = mouseEvent.latLng;

  var message = "클릭한 위치의 위도는 " + latlng.getLat() + " 이고, ";
  message += "경도는 " + latlng.getLng() + " 입니다";

  var resultDiv = document.getElementById("result");
  resultDiv.innerHTML = message;
});

async function getRes(loc) {
  return await axios.get(`http://localhost:3000/info?beach_name=${loc}`);
}
