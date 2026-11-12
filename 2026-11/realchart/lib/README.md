# RealChart 라이브러리

이 폴더에는 예제 실행에 필요한 RealChart 코어·Split 브라우저 번들과 스타일이 있습니다. 정식 사용 기준은 RealChart 1.5.2 이상입니다. 상품 선택에 쓰는 `selection` 옵션은 1.5.2부터 제공됩니다.

동봉 파일은 npm에 공개된 `realchart@1.5.2` 패키지의 파일을 예제 경로에 맞춰 이름만 바꾼 것입니다. `RealChart.getVersion()`은 `1.5.2`를 반환합니다.

| 이 폴더 | npm 패키지 |
|---|---|
| `realchart.js` | `index.js` |
| `realchart-split.js` | `split.js` |
| `realchart-style.css` | `realchart-style.css` |

공식 가이드는 `script` 태그에 우리테크 사이트에서 내려받는 배포본(`realchart.{version}.min.js`, `realchart-split.{version}.js`)을 쓰도록 안내합니다. 직접 구성할 때는 배포본을 쓰세요.

번들을 교체할 때는 다음을 확인하세요.

1. 검증할 `realchart` 버전을 정확히 지정해 코어·Split·스타일을 함께 교체합니다.
2. `RealChart.getVersion()`과 공급 패키지 버전이 일치하는지 확인합니다. 버전 번호를 확인할 수 없다면 정식 버전 검증 완료로 표시하지 않습니다.
3. 상품 선택 → 40분·45분 갱신(선택이 풀리고 손익은 첫 상품으로 바뀜) → 새로고침을 같은 번들로 확인합니다.

`realchart-lic.js`는 예제 실행용 라이선스로 **`localhost`** 에서만 동작합니다(2026-12-31까지). 라이브러리 사용과 재배포는 공급받은 라이선스 조건을 따릅니다.

Vite의 `publicDir`를 이 폴더로 지정했습니다. HTML에서는 `/realchart.js`처럼 정적 경로로 불러오고, 빌드에도 자동으로 포함합니다. `script` 태그로 읽으면 Split 모듈은 읽는 시점에 등록됩니다. npm 패키지(`realchart`)로 쓰는 방법은 상위 README의 실행 절을 참고하세요.
