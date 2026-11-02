# RealPivot2 웨비나 예제 (2026-11)

## 실행

```sh
npm install
npm run dev
```

브라우저에서 Vite가 알려 주는 주소(기본 <http://localhost:5173>)를 엽니다.

## 내보내기 (Excel · CSV · PDF)

북 헤더의 `내보내기` 메뉴로 저장합니다. CSV는 RealPivot2에 기본 내장이고, Excel과 PDF는 아래 라이브러리를 `index.html`에서 `<script>`로 읽은 뒤 `src/main.ts`에서 `useAll({ ExcelJS, jsPDF: jspdf })`로 등록해야 메뉴가 켜집니다. 버전은 제품 패키지 의존성(`exceljs ^4.4.0`, `jspdf ^4.2.1`)에 맞췄습니다.

| 파일 | 용도 |
|---|---|
| `public/realpivot2/exceljs.min.js` | ExcelJS 4.4.0 · Excel(xlsx) 내보내기 |
| `public/realpivot2/jspdf.umd.min.js` | jsPDF 4.2.1 · PDF 내보내기 (`window.jspdf`) |
| `public/fonts/NotoSansKR-Regular.ttf` | PDF 한글 폰트. 북 설정 `export.pdf.fontUrl`로 지정 (jsPDF는 TTF만 읽음) |

v2.0.1 기준 주의할 점 (2026-10-30 확인):

- `book.save()` 결과에 `export` 설정이 빠져 있어, `control.loadBook()`으로 초기화·복원한 뒤에는 PDF 폰트가 기본값(woff2)으로 돌아가 한글이 Helvetica로 출력됩니다. Excel·CSV는 영향이 없습니다.
- 값은 화면 서식 없이 원시값으로 나갑니다. `행 합계 대비 %` 화면의 `74.80%`가 Excel·CSV·PDF에서는 `0.748…`입니다. 행·열 계층(예: `차종 › 연료`)은 그대로 나옵니다.
- CSV에는 UTF-8 BOM이 없어 Windows Excel에서 바로 열면 한글이 깨질 수 있습니다.
