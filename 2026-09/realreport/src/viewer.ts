import './style.css';
import { FontStore, ReportViewer, setLicenseKey } from 'realreport';
import type { ReportDataSet, ReportForm } from 'realreport';
import 'realreport/dist/realreport.css';
import { REALREPORT_LICENSE } from './license';

// 리얼리포트 라이선스는 뷰어를 생성하기 전에 한 번만 등록합니다.
setLicenseKey(REALREPORT_LICENSE);

export interface Demo {
  viewer: ReportViewer;
  reportForm: ReportForm;
  dataSet?: ReportDataSet;
  preview(form?: ReportForm): void;
}

/**
 * 리포트 양식(.r2)과 데이터를 불러와 #viewer 영역에 미리보기하고,
 * 헤더의 출력 · PDF 출력 버튼을 연결합니다.
 */
export async function setupDemo(
  reportUrl: string,
  dataUrl?: string,
): Promise<Demo> {

  // 리포트에서 사용할 폰트를 등록합니다.
  await FontStore.registerFonts([
    { name: 'NanumGothic', source: '/fonts/NanumGothic.otf', weight: 'normal' },
    { name: 'NanumGothic', source: '/fonts/NanumGothicBold.otf', weight: 'bold' },
  ]);
  FontStore.defaultFont = 'NanumGothic';

  // 1. 양식파일 r2, 데이터셋 json을 불러옵니다.
  const [reportForm, rawDataSet] = await Promise.all([
    fetch(reportUrl).then((res) => res.json() as Promise<ReportForm>),
    dataUrl
      ? fetch(dataUrl).then((res) => res.json() as Promise<ReportDataSet>)
      : undefined,
  ]);

  let dataSet = rawDataSet;

  // 2. 뷰어 객체 생성과 보고서 양식과 데이터셋 연결
  const viewer = new ReportViewer('viewer', reportForm, dataSet);

  // 3. 뷰어 미리보기
  const preview = (form?: ReportForm) => {
    if (form) {
      viewer.reportForm = form;
    }

    viewer.preview({
      async: true
    });
  };

  preview();

  // 헤더의 버튼들을 뷰어 API와 연결합니다.
  const actions: Record<string, () => void> = {
    'btn-zoom-out': () => viewer.zoomOut(),
    'btn-zoom-in': () => viewer.zoomIn(),
    'btn-fit-width': () => viewer.fitToWidth(),
    'btn-fit-height': () => viewer.fitToHeight(),
    'btn-fit-page': () => viewer.fitToPage(),
    'btn-print': () => viewer.print({}),
    'btn-pdf': () => viewer.exportPdf(),
    'btn-image': () => viewer.exportImage({ type: 'png' }),
  };

  for (const [id, action] of Object.entries(actions)) {
    document.getElementById(id)?.addEventListener('click', action);
  }

  return { viewer, reportForm, dataSet, preview };
}
