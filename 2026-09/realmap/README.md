# RealMap

## 주제
대한민국 지도에 데이터 시각화하기

- 시도별 인구밀도를 색으로 표현한 맵차트를 처음부터 만들어보면서, RealMap의 지도·데이터·색 설정을 소개합니다.

## 발표 내용

| 단계 | 설정 | 내용 |
|---|---|---|
| 맵차트 띄우기 | `map` · `body` | 설치와 `createChartAsync`, 지도 파일 url, 투영법(`projection`), 섬 배치(`insets` · `dokdo` · `padding`) |
| 데이터 연결 | `series` | 맵 시리즈에 데이터 연결. 지도의 `rm-id`와 데이터의 `id`를 맞춰서 연결하며, `data` 대신 `dataUrl`로 파일 분리 가능 |
| 값을 색으로 | `colorScale` | `minColor` · `maxColor` · `stepCount`로 값을 색으로. 값 차이가 너무 크면 `logBase`로 완화 |

발표 자료는 `2026-09-slides.pdf`입니다.

## 예제

완성된 맵차트 설정은 `src/main.ts` 한 파일에 들어 있습니다. 지도와 인구밀도 데이터는 `public` 폴더에 있습니다.

| 파일 | 내용 |
|---|---|
| `index.html` | 리얼맵 컨테이너 |
| `src/main.ts` | 라이선스 등록 · 맵차트 설정 |
| `public/kr-sido-low.topo.json` | 대한민국 시도 지도 |
| `public/kr-sido-density.json` | 시도별 인구밀도 데이터 |

## 실행

```bash
cd 2026-09/realmap
pnpm install
pnpm dev
```

## 라이선스 만료시

- https://support.realgrid.com
- 위의 사이트 방문 후 라이선스 재발급하여 사용할 것

## 참고자료

| | |
|---|---|
| 가이드 문서 | https://realmap.co.kr/guide/map |
| 지역 아이디 검색 | https://realmap.co.kr/guide/map-ids |
| 컬러스케일 | https://realmap.co.kr/guide/colorscale |
| 시리즈 | https://realmap.co.kr/guide/series |
| 지도 저장소 | https://github.com/realgrid/realmap-collection-dist |
