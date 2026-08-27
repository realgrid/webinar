import { setupDemo } from './viewer';

const { viewer, dataSet, preview } = await setupDemo(
  '/report/multi-page.r2',
  '/data/demo-2.json',
);

// 체크박스를 pageVisible 데이터셋과 연결합니다.
// 각 페이지의 onGetVisible 이벤트가 pageVisible의 sale · location 값을 읽어
// 페이지 표시여부를 결정합니다.
const boxes = document.querySelectorAll<HTMLInputElement>(
  '.page-toggles input[data-key]',
);

boxes.forEach((box) => {
  box.addEventListener('change', () => {
    if (!dataSet) {
      return;
    }

    dataSet.pageVisible.values[box.dataset.key!] = box.checked;
    viewer.dataSet = dataSet;
    preview();
  });
});
