import './style.css'
import { ReportViewer, setLicenseKey } from 'realreport';
import 'realreport/dist/realreport.css';
import { REALREPORT_LICENSE } from './license';

// 리얼리포트 라이선스는 뷰어를 생성하기 전에 한 번만 등록합니다.
setLicenseKey(REALREPORT_LICENSE);

const app = document.querySelector<HTMLDivElement>('#app')!;
app.style.height = '100vh';

const viewer = new ReportViewer('app', {});
viewer.preview();
