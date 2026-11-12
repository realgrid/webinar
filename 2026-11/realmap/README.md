# RealMap

## 주제
RealMap으로 드릴다운 맵차트 만들기

- 시도별 인구밀도 맵차트에서 시도를 클릭하면 그 시도의 시군구로 드릴다운하고, 시군구를 클릭하면 전국 · 시도와 인구밀도를 비교하는 막대를 띄웁니다.
- 일부 단계는 직접 코딩하고, 일부 단계는 Claude가 Real-MCP로 리얼맵 문서를 찾아 코딩합니다.

## 발표 내용

| 단계 | 설정 | 내용 |
|---|---|---|
| 드릴다운 구현 | `map[]` · `series.detail` · `general.clickAction` · `drilldownPanel` | 시군구 지도와 데이터를 시도 시리즈의 `detail`로 연결하고, 클릭하면 드릴다운합니다. 드릴다운 패널(브레드크럼)로 현재 위치를 표시합니다 |
| 드릴다운 개선 | `drilldown` · `map` · `colorScale` · `tooltip` · `pointLabel` | 선택한 시도만 표시(`scope`), 확대 전환(`transition` · `duration` · `fillRatio`), 울릉도 · 독도 배치(`insets` · `dokdo` · `padding`), 컬러스케일 범위 고정(`minValue` · `maxValue`), 자료 없는 지역(`nullStep` · `nanText`), 라벨 겹침 숨기기(`hideOverlapped`) |
| 드릴업 | `chart.drillup()` | Esc 키와 버튼으로 시도 지도로 돌아갑니다 |
| 비교 막대 | `onPointClick` · `onDrilldown` · `onDrillup` · `addSeries` · `removeSeries` | 시군구를 클릭하면 막대 시리즈를 추가해 전국 · 시도 · 시군구 인구밀도를 비교합니다. 지시선(`callout`), 막대 라벨(`pointLabel` · `barLabel`), 선택 강조(`selection`)를 적용합니다 |

발표 자료는 `2026-11-slides.pdf`입니다.

## 예제

시작 화면과 완성 화면이 따로 있습니다. 발표에서는 시작 화면(`src/start.ts`)에 기능을 하나씩 더해 완성 화면(`src/main.ts`)을 만듭니다.

| 파일 | 내용 |
|---|---|
| `index.html` · `src/main.ts` | 완성 화면. 라이선스 등록 · 드릴다운 맵차트 설정 |
| `start.html` · `src/start.ts` | 시작 화면. 시도별 인구밀도 맵차트 |
| `src/util.ts` | 미리 준비해 둔 상수와 함수(전국 인구밀도, 비교 막대 위치 계산) |
| `src/style.css` | 화면 스타일 |
| `public/kr-sido-population-density-2026-07.json` | 시도별 인구밀도 데이터 |
| `public/kr-sigun-population-density-2026-07.json` | 시군구별 인구밀도 데이터 |

지도 파일은 `https://unpkg.com/realmap-collection/2026-07`에서 읽으므로 인터넷 연결이 필요합니다.

## 실행

```bash
cd 2026-11/realmap
npm install
npm run dev
```

- `http://localhost:5173/` — 완성 화면
- `http://localhost:5173/start.html` — 시작 화면

## 라이선스 만료시

- https://support.realgrid.com
- 위의 사이트 방문 후 라이선스 재발급하여 사용할 것

## 참고자료

| | |
|---|---|
| 가이드 문서 | https://realmap.co.kr/guide/map |
| 컬러스케일 | https://realmap.co.kr/guide/colorscale |
| 시리즈 | https://realmap.co.kr/guide/series |
| Real-MCP | https://support3.realgrid.com/guide/real-mcp |
| 지도 저장소 | https://github.com/realgrid/realmap-collection-dist |
