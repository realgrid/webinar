# RealMap 드릴다운 맵차트 예제

이 폴더는 RealMap으로 드릴다운 맵차트를 만드는 예제(Vite + npm `realmap`)입니다. 시작 화면(`start.html`, `src/start.ts`)에 기능을 하나씩 요청해 가며 완성 화면(`index.html`, `src/main.ts`)과 같은 맵차트를 만듭니다.

- 수정 대상은 `src/start.ts`(필요하면 `start.html`)입니다. 이 폴더의 파일만 고칩니다.
- `src/main.ts`는 완성 화면이므로 고치지 않고 참고하지도 않습니다.

## RealMap 옵션과 API는 Real MCP로 먼저 확인합니다

- RealMap 옵션이나 API를 쓰기 전에 Real MCP(`real-mcp`)로 확인합니다. 추측하거나 기억에 의존하지 않습니다.
  - `search_resources`(product=`realmap`)로 가이드·config 문서를 찾고, 본문이 더 필요하면 `get_resource`로 읽습니다.
  - 타입이 필요하면 타입 정의(`list_dts_files`, `get_package_file`)에서 확인합니다. 파일이 크면 필요한 타입 이름으로 검색해 해당 선언만 읽습니다.
- Real MCP 문서에 없는 옵션은 쓰지 않습니다.

## 요청한 것만 구현합니다

- 요청한 기능만 `src/start.ts`에 더합니다. 요청하지 않은 기능과 리팩터링은 더하지 않습니다.
- 아래 기능은 따로 요청할 때만 구현합니다. 요청하기 전에는 문서나 예제에 있어도 쓰지 않습니다.
  - 선택한 시도만 표시(`drilldown.scope`), 확대 전환(`drilldown.transition`·`duration`·`fillRatio`)
  - 울릉도 인셋·독도(`insets`·`dokdo`), 지도 `padding` 조정
  - 컬러스케일 범위 고정(`minValue`·`maxValue`), 값 없는 지역(`nullStep`·`tooltip.nanText`), 라벨 겹침(`hideOverlapped`)
  - 드릴업(Esc·버튼), 비교 막대, 지시선(`callout`), 막대 라벨(`pointLabel`·`barLabel`), 선택 강조(`selection`)
- 문서의 완성 예제(`examples-interactive-drilldown` 등)를 통째로 가져오지 않습니다. 필요한 옵션만 골라 기존 코드에 맞춰 넣습니다.

## 코드 작성 규칙

- 기존 코드의 구조와 스타일(`areaOptions`, 색상, 들여쓰기 4칸, 작은따옴표)을 유지합니다.
- 파일은 Edit 도구로 고칩니다. 변경 내용을 확인할 수 있도록 Bash(python·sed 등)로 파일을 쓰거나 바꾸지 않습니다.
- 화면에 표시하는 숫자는 약어(`k`·`M` 등) 없이 천 단위 쉼표를 넣은 전체 값(예: 3,442)으로 표시합니다. 숫자 형식 옵션의 기본값이 약어 표기이면 문서에서 해당 옵션을 확인해 지정합니다.
- 코드를 고친 뒤 `npx tsc --noEmit`으로 타입 검사를 하고, 오류가 있으면 고칩니다.
- `as any`는 쓰지 않습니다. API가 넓은 타입을 반환하면 Real MCP에서 실제 타입을 확인해 그 타입으로 좁힙니다(예: `chart.seriesByName()`의 결과를 `as MapSeries`로). 확인되지 않으면 타입을 억지로 맞추지 않고, 확인하지 못했다고 답변에 적습니다.
- 패키지 설치(`npm install`), 개발 서버 실행(`npm run dev`), 빌드(`npm run build`)는 사용자가 합니다. 요청하지 않으면 실행하지 않습니다.

## 예제 코드 정보

- 지도 파일 주소는 `mapUrl` 상수, 데이터는 `public/`의 JSON입니다.
- 시군구 데이터(`kr-sigun-population-density-2026-07.json`)에는 `originalName`이 있고 `name`은 없습니다. `nameField`는 지정하지 않습니다. 지도의 영역 이름이 `name`으로 채워지므로 툴팁과 라벨에서 `name`을 그대로 씁니다(realmap 1.1.28 이상).
- 지역 id는 시도 두 자리(경기도 `31`), 시군구 다섯 자리(하남시 `31180`)입니다.
- `src/util.ts`에 이미 있는 것은 새로 만들지 않고 가져다 씁니다.
  - `NATION_DENSITY`: 전국 인구밀도(명/㎢)
  - `calloutEndOf(chart, coord)`: 비교 막대를 둘 경위도를 반환합니다. 지시선(callout)을 요청받았을 때만 막대 시리즈 `data`의 `callout`에 넣습니다.

## 답변 방식

- 코드를 고친 뒤, 근거로 쓴 Real MCP 문서의 uri를 한 줄로 알립니다.
- 한국어 존댓말로 짧게 답합니다. 코드 주석은 한국어로 씁니다.
