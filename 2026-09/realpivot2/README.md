# RealPivot2

## 주제
데이터 시각화 기능 활용방법

- 별도의 차트 없이 피벗 테이블 자체에서 데이터의 패턴과 추세를 시각적으로 보여주는 RealPivot2의 시각화 기능을 소개합니다.

## 예제

발표 순서와 같은 일곱 개 화면입니다. 옵션은 `src` 폴더의 각 `00`~`06` TypeScript 파일에서 바로 고치면 됩니다.

| 파일 | 내용 |
|---|---|
| `index.html` | 예제 목록 |
| `00-plain.html` | 숫자만 있는 피벗 |
| `01-databar.html` | dataBar · compareScope |
| `02-heatmap.html` | heatmap |
| `03-highlight.html` | highlight |
| `04-icon.html` | icon |
| `05-showas.html` | showAs + dataBar |
| `06-series.html` | 피벗시리즈 |

라이선스(`lib/realpivot2-lic.js`)는 `localhost`에서만 사용하실 수 있습니다.

## 실행

Node.js 20.19 이상 또는 22.12 이상이 필요합니다. 터미널에서 이 폴더로 이동한 뒤 의존성을 설치하고 개발 서버를 시작합니다.

```bash
cd 2026-09/realpivot2
npm install
npm run dev
```

브라우저에서 `http://localhost:5173/`이 자동으로 열립니다. 발표 중 `src/01-databar.ts` 같은 파일을 저장하면 Vite가 화면을 바로 갱신합니다. TypeScript 원본을 직접 사용하므로 별도 컴파일 명령은 필요하지 않습니다.

프로덕션 빌드와 빌드 결과 확인은 다음 명령을 사용합니다.

```bash
npm run build
npm run preview
```

`dist` 폴더에는 목록 화면과 `00`~`06` 예제 화면이 모두 생성됩니다. `npm run preview`를 실행하면 `http://localhost:4173/`에서 결과를 확인할 수 있습니다.
