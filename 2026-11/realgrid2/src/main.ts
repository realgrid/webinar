import realgrid2lic from './realgrid2lic'

// ===== 라이브코딩 · 발표 중에는 이 함수에서 작성합니다. =====
function runDemo() {
   
}

// ===== 예제 그리드와 데이터. =====
const fields = [
    { fieldName: 'treeId', dataType: 'text' },
    { fieldName: 'name', dataType: 'text' },
    { fieldName: 'employeeId', dataType: 'text' },
    { fieldName: 'role', dataType: 'text' },
    { fieldName: 'region', dataType: 'text' },
    { fieldName: 'account', dataType: 'text' },
    { fieldName: 'target', dataType: 'number' },
    { fieldName: 'previousAmount', dataType: 'number' },
    { fieldName: 'amount', dataType: 'number' },
    { fieldName: 'status', dataType: 'text' },
]

let ds: any
let tree: any
let salesRow: number
let devRow: number
let minsuRow: number
let addedRow: number = -1
let gridDisposed = false

function createGrid() {
    if (typeof RealGrid === 'undefined') {
        throw new Error('RealGrid 파일을 찾지 못했습니다. public/realgrid 폴더를 확인하세요.')
    }

    ds = new RealGrid.LocalTreeDataProvider(true)
    ds.setFields(fields)
    ds.softDeleting = false

    tree = new RealGrid.TreeView('realgrid')
    gridDisposed = false
    tree.setDataSource(ds)
    tree.setColumns([
        {
            name: 'name',
            fieldName: 'name',
            width: 200,
            header: { text: '부서 / 담당자' },
            footer: { text: '전체 매출 합계' },
        },
        {
            name: 'employeeId',
            fieldName: 'employeeId',
            width: 100,
            header: { text: '사번' },
        },
        {
            name: 'role',
            fieldName: 'role',
            width: 80,
            header: { text: '직급' },
        },
        {
            name: 'region',
            fieldName: 'region',
            width: 80,
            header: { text: '담당 권역' },
        },
        {
            name: 'account',
            fieldName: 'account',
            width: 130,
            header: { text: '주요 고객' },
        },
        {
            name: 'target',
            fieldName: 'target',
            width: 140,
            header: { text: '10월 목표 (만원)' },
            numberFormat: '#,##0',
            footer: { numberFormat: '#,##0' },
        },
        {
            name: 'previousAmount',
            fieldName: 'previousAmount',
            width: 140,
            header: { text: '9월 매출 (만원)' },
            numberFormat: '#,##0',
            footer: { numberFormat: '#,##0' },
        },
        {
            name: 'amount',
            fieldName: 'amount',
            width: 140,
            editable: true,
            header: { text: '10월 매출 (만원)' },
            numberFormat: '#,##0',
            editor: { type: 'number' },
            footer: { numberFormat: '#,##0' },
        },
        {
            name: 'status',
            fieldName: 'status',
            width: 90,
            header: { text: '진행 상태' },
        },
    ])

    tree.displayOptions.fitStyle = 'even'
    tree.displayOptions.rowHeight = 36
    tree.header.height = 40
    tree.footer.height = 40
    tree.treeOptions.iconVisible = false
    tree.editOptions.commitByCell = true

    resetData()
}

function resetData(useStoredParentValues = true) {
    tree.cancel()
    // 매번 새 데이터를 만들며 첫 화면의 부모 소계는 미리 저장한 고정값입니다.
    const rows = [
        { treeId: '1', name: '영업1팀', employeeId: '', role: '', region: '', account: '', target: 15600, previousAmount: 11400, amount: 12000, status: '' },
        { treeId: '1.1', name: '민수', employeeId: 'E1001', role: '대리', region: '서울', account: '네오테크', target: 1500, previousAmount: 1100, amount: 1000, status: '진행' },
        { treeId: '1.2', name: '지수', employeeId: 'E1002', role: '과장', region: '인천', account: '한빛유통', target: 2200, previousAmount: 1600, amount: 1800, status: '완료' },
        { treeId: '1.3', name: '현우', employeeId: 'E1003', role: '대리', region: '경기 북부', account: '다온솔루션', target: 2000, previousAmount: 1400, amount: 1500, status: '제안' },
        { treeId: '1.4', name: '서연', employeeId: 'E1004', role: '사원', region: '경기 남부', account: '미래물류', target: 1600, previousAmount: 1300, amount: 1200, status: '상담중' },
        { treeId: '1.5', name: '도윤', employeeId: 'E1005', role: '차장', region: '서울', account: '새빛산업', target: 2700, previousAmount: 2000, amount: 2200, status: '진행' },
        { treeId: '1.6', name: '수빈', employeeId: 'E1006', role: '사원', region: '강원', account: '라온디자인', target: 1200, previousAmount: 800, amount: 900, status: '제안' },
        { treeId: '1.7', name: '지훈', employeeId: 'E1007', role: '대리', region: '인천', account: '우림메디컬', target: 2100, previousAmount: 1500, amount: 1600, status: '진행' },
        { treeId: '1.8', name: '예린', employeeId: 'E1008', role: '과장', region: '경기 남부', account: '가온교육', target: 2300, previousAmount: 1700, amount: 1800, status: '완료' },

        { treeId: '2', name: '영업2팀', employeeId: '', role: '', region: '', account: '', target: 18800, previousAmount: 14500, amount: 15000, status: '' },
        { treeId: '2.1', name: '유진', employeeId: 'E1009', role: '과장', region: '대전', account: '청해식품', target: 2200, previousAmount: 1700, amount: 1800, status: '진행' },
        { treeId: '2.2', name: '준호', employeeId: 'E1010', role: '차장', region: '충청', account: '해솔건설', target: 2600, previousAmount: 1900, amount: 2100, status: '완료' },
        { treeId: '2.3', name: '채원', employeeId: 'E1011', role: '대리', region: '광주', account: '누리케어', target: 1900, previousAmount: 1500, amount: 1400, status: '상담중' },
        { treeId: '2.4', name: '태현', employeeId: 'E1012', role: '과장', region: '전라', account: '다솜정밀', target: 2800, previousAmount: 2100, amount: 2300, status: '진행' },
        { treeId: '2.5', name: '소연', employeeId: 'E1013', role: '대리', region: '대구', account: '열린모빌리티', target: 2400, previousAmount: 1800, amount: 1900, status: '제안' },
        { treeId: '2.6', name: '승우', employeeId: 'E1014', role: '대리', region: '경북', account: '온새출판', target: 2100, previousAmount: 1600, amount: 1700, status: '진행' },
        { treeId: '2.7', name: '나연', employeeId: 'E1015', role: '과장', region: '부산', account: '별하리빙', target: 2500, previousAmount: 2200, amount: 2000, status: '완료' },
        { treeId: '2.8', name: '건우', employeeId: 'E1016', role: '사원', region: '경남', account: '마루엔지니어링', target: 2300, previousAmount: 1700, amount: 1800, status: '제안' },

        { treeId: '3', name: '파트너영업팀', employeeId: '', role: '', region: '', account: '', target: 22500, previousAmount: 16900, amount: 18000, status: '' },
        { treeId: '3.1', name: '하늘', employeeId: 'E1017', role: '차장', region: '수도권', account: '한울파트너스', target: 3200, previousAmount: 2400, amount: 2600, status: '완료' },
        { treeId: '3.2', name: '재민', employeeId: 'E1018', role: '과장', region: '충청', account: '리안네트웍스', target: 2700, previousAmount: 2000, amount: 2200, status: '진행' },
        { treeId: '3.3', name: '은지', employeeId: 'E1019', role: '대리', region: '호남', account: '푸른시스템', target: 2300, previousAmount: 1700, amount: 1800, status: '제안' },
        { treeId: '3.4', name: '성훈', employeeId: 'E1020', role: '차장', region: '수도권', account: '아람컨설팅', target: 3800, previousAmount: 2900, amount: 3100, status: '진행' },
        { treeId: '3.5', name: '다은', employeeId: 'E1021', role: '과장', region: '영남', account: '온빛기술', target: 3000, previousAmount: 2200, amount: 2400, status: '완료' },
        { treeId: '3.6', name: '진우', employeeId: 'E1022', role: '대리', region: '강원', account: '채움커머스', target: 2100, previousAmount: 1800, amount: 1600, status: '상담중' },
        { treeId: '3.7', name: '보경', employeeId: 'E1023', role: '과장', region: '전국', account: '이음네트워크', target: 3000, previousAmount: 2300, amount: 2500, status: '진행' },
        { treeId: '3.8', name: '시우', employeeId: 'E1024', role: '사원', region: '제주', account: '다올비즈', target: 2400, previousAmount: 1600, amount: 1800, status: '제안' },

        { treeId: '4', name: '온라인영업팀', employeeId: '', role: '', region: '', account: '', target: 18100, previousAmount: 13200, amount: 14000, status: '' },
        { treeId: '4.1', name: '민지', employeeId: 'E1025', role: '대리', region: '전국', account: '루미마켓', target: 2200, previousAmount: 1500, amount: 1700, status: '진행' },
        { treeId: '4.2', name: '지호', employeeId: 'E1026', role: '과장', region: '수도권', account: '봄빛스토어', target: 2500, previousAmount: 1800, amount: 2000, status: '완료' },
        { treeId: '4.3', name: '수연', employeeId: 'E1027', role: '사원', region: '충청', account: '모아샵', target: 1700, previousAmount: 1300, amount: 1200, status: '상담중' },
        { treeId: '4.4', name: '우진', employeeId: 'E1028', role: '대리', region: '호남', account: '달빛문구', target: 2300, previousAmount: 1600, amount: 1800, status: '진행' },
        { treeId: '4.5', name: '예진', employeeId: 'E1029', role: '대리', region: '영남', account: '하루홈', target: 2000, previousAmount: 1400, amount: 1500, status: '제안' },
        { treeId: '4.6', name: '상현', employeeId: 'E1030', role: '차장', region: '전국', account: '온새패션', target: 2900, previousAmount: 2100, amount: 2300, status: '완료' },
        { treeId: '4.7', name: '가은', employeeId: 'E1031', role: '사원', region: '강원', account: '담아리빙', target: 2100, previousAmount: 1700, amount: 1600, status: '진행' },
        { treeId: '4.8', name: '정우', employeeId: 'E1032', role: '과장', region: '제주', account: '오름스포츠', target: 2400, previousAmount: 1800, amount: 1900, status: '제안' },

        { treeId: '5', name: '고객성공팀', employeeId: '', role: '', region: '', account: '', target: 16400, previousAmount: 12300, amount: 13000, status: '' },
        { treeId: '5.1', name: '혜진', employeeId: 'E1033', role: '과장', region: '서울', account: '나래데이터', target: 1800, previousAmount: 1300, amount: 1400, status: '완료' },
        { treeId: '5.2', name: '동현', employeeId: 'E1034', role: '대리', region: '경기', account: '이룸제조', target: 2200, previousAmount: 1700, amount: 1800, status: '진행' },
        { treeId: '5.3', name: '윤서', employeeId: 'E1035', role: '대리', region: '충청', account: '푸름헬스', target: 1900, previousAmount: 1400, amount: 1500, status: '제안' },
        { treeId: '5.4', name: '민재', employeeId: 'E1036', role: '차장', region: '호남', account: '해봄에너지', target: 2600, previousAmount: 1900, amount: 2100, status: '완료' },
        { treeId: '5.5', name: '세영', employeeId: 'E1037', role: '사원', region: '부산', account: '소담푸드', target: 1600, previousAmount: 1100, amount: 1200, status: '상담중' },
        { treeId: '5.6', name: '지안', employeeId: 'E1038', role: '대리', region: '대구', account: '한결정보', target: 2100, previousAmount: 1600, amount: 1700, status: '진행' },
        { treeId: '5.7', name: '성민', employeeId: 'E1039', role: '과장', region: '전국', account: '길벗테크', target: 2400, previousAmount: 1800, amount: 1900, status: '완료' },
        { treeId: '5.8', name: '유나', employeeId: 'E1040', role: '사원', region: '제주', account: '모은서비스', target: 1800, previousAmount: 1500, amount: 1400, status: '제안' },

        { treeId: '6', name: '해외영업팀', employeeId: '', role: '', region: '', account: '', target: 20700, previousAmount: 15000, amount: 16000, status: '' },
        { treeId: '6.1', name: '수현', employeeId: 'E1041', role: '차장', region: '일본', account: '아시아브릿지', target: 2900, previousAmount: 2100, amount: 2300, status: '진행' },
        { treeId: '6.2', name: '영준', employeeId: 'E1042', role: '과장', region: '동남아', account: '동해트레이드', target: 2500, previousAmount: 1800, amount: 1900, status: '완료' },
        { treeId: '6.3', name: '소희', employeeId: 'E1043', role: '과장', region: '북미', account: '솔라링크', target: 3200, previousAmount: 2400, amount: 2600, status: '제안' },
        { treeId: '6.4', name: '승현', employeeId: 'E1044', role: '대리', region: '유럽', account: '넥스트포트', target: 2000, previousAmount: 1600, amount: 1500, status: '상담중' },
        { treeId: '6.5', name: '은서', employeeId: 'E1045', role: '과장', region: '중동', account: '하모니글로벌', target: 2800, previousAmount: 2000, amount: 2200, status: '진행' },
        { treeId: '6.6', name: '재윤', employeeId: 'E1046', role: '대리', region: '호주', account: '새롬인터내셔널', target: 2400, previousAmount: 1700, amount: 1800, status: '완료' },
        { treeId: '6.7', name: '다희', employeeId: 'E1047', role: '대리', region: '남미', account: '로움익스포트', target: 2700, previousAmount: 1900, amount: 2100, status: '진행' },
        { treeId: '6.8', name: '도현', employeeId: 'E1048', role: '사원', region: '중국', account: '비전월드', target: 2200, previousAmount: 1500, amount: 1600, status: '제안' },
    ]
    if (!useStoredParentValues) {
        rows.forEach(function (row) {
            if (row.treeId.indexOf('.') < 0) {
                row.target = 0
                row.previousAmount = 0
                row.amount = 0
            }
        })
    }
    ds.setRows(rows, 'treeId', false)
    const departments = ds.getChildren(-1)
    salesRow = departments[0]
    // 기존 라이브코딩 변수명을 유지하며 두 번째 부서인 영업2팀을 가리킵니다.
    devRow = departments[1]
    minsuRow = ds.getChildren(salesRow)[0]
    addedRow = -1
    tree.expandAll()
}

window.addEventListener('pagehide', function (event) {
    if (!event.persisted && !gridDisposed) {
        if (tree) {
            tree.destroy()
        }
        if (ds) {
            ds.destroy()
        }
        gridDisposed = true
    }
})

if (typeof RealGrid !== 'undefined') {
    RealGrid.setLicenseKey(realgrid2lic)
}
createGrid()
runDemo()
