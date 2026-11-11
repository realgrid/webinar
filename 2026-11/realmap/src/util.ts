// 발표에서 직접 치지 않고 미리 준비해 둔 상수와 함수.
import type { MapChart, MapCoord } from 'realmap';

// 전국 인구밀도(명/㎢). 데이터 파일에 없어서 데모 데이터로 계산했다.
// 시도 인구밀도 × 시도 면적(2026-07 시도 지도 도형의 구면 면적)을 모두 더해 전체 면적으로 나눈 값이다.
export const NATION_DENSITY = 531.8;

// 비교 막대 밑동을 둘 곳(px). 가로는 화면 왼쪽·오른쪽 끝에서 이만큼 안쪽이다.
// 차트는 지도 본체를 컨테이너보다 20px 안쪽에서 잘라 그리므로, 가장 긴 막대 아래 라벨(전남광주)도 잘리지 않을 만큼 안쪽에 둔다.
export const COMPARE_SIDE = 110;
// 막대 아래 값 라벨을 기준선에서 띄우는 간격(px).
export const COMPARE_LABEL_GAP = 6;
// 세로는 막대와 라벨이 화면 밖으로 잘리지 않는 범위 안에 둔다.
export const COMPARE_ABOVE = 140; // 막대 밑동 위로: 이름 라벨 + 막대
export const COMPARE_BELOW = 125 + COMPARE_LABEL_GAP; // 막대 밑동 아래로: 간격 + 값 라벨 + 브레드크럼·색상자 자리

/**
 * 비교 막대 밑동을 둘 경위도를 계산해 반환한다.
 *
 * 반환값을 막대 시리즈 data의 callout에 지정하면, 막대가 그 위치로 옮겨지고 클릭한 지점에서 지시선이 그어진다.
 * - 가로: 화면 왼쪽 절반을 클릭하면 왼쪽 여백, 오른쪽 절반이면 오른쪽 여백이다. 화면 끝에서 COMPARE_SIDE만큼 안쪽이다.
 * - 세로: 클릭한 지점과 같은 높이라 지시선이 수평이 된다. 막대와 라벨이 화면 밖으로 잘리지 않게 위아래를 제한한다.
 *
 * 첫 인자는 맵차트 인스턴스, 둘째 인자는 클릭한 지점의 경위도(onPointClick의 coord)다.
 */
export function calloutEndOf(chart: MapChart, [lon, lat]: MapCoord): MapCoord {
    const { clientWidth: width, clientHeight: height } = document.getElementById('realmap')!;
    // 지시선이 지도를 가로지르지 않도록, 화면 왼쪽 절반을 클릭했으면 왼쪽 여백에 둔다.
    const onLeft = lon < chart.pointToMap(width / 2, 0)[0];
    const [endLon, top] = chart.pointToMap(onLeft ? COMPARE_SIDE : width - COMPARE_SIDE, COMPARE_ABOVE);
    const [, bottom] = chart.pointToMap(0, height - COMPARE_BELOW);
    // 막대와 라벨이 화면 안에 들어오도록 위도를 제한한다.
    const endLat = Math.min(Math.max(lat, bottom), top);

    return [endLon, endLat];
}
