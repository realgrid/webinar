import { setupDemo } from './viewer';

const { viewer, dataSet } = await setupDemo(
  '/report/event-sample.r2',
  '/data/demo-1.json',
);

// 워터마크 체크박스를 visible 데이터셋과 연결합니다.
// 배경 아이템(워터마크)의 onGetVisible 이벤트가 visible의 watermark 값을 읽어
// 표시여부를 결정합니다.
const box = document.querySelector<HTMLInputElement>(
  '.page-toggles input[data-key="watermark"]',
);

// 워터마크 체크박스 이벤트
box?.addEventListener('change', () => {
  if (!dataSet) {
    return;
  }

  /**
   * dataSet
   * {
   *   "visible": {
   *     "values": {
   *       "watermark": true
   *     }
   *   }
   * }
   */
  dataSet.visible.values.watermark = box.checked;
  
  // 뷰어 데이터 바인딩
  viewer.dataSet = dataSet;

  // 뷰어 미리보기
  viewer.preview({ async: true });
});
