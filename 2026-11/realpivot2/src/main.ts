import realpivot2lic from './realpivot2lic'

const { setLicenseKey, createDataSet, createCubeManager, createControl } = RealPivot2

// 라이선스 등록
setLicenseKey(realpivot2lic)

const rows = await fetch('/data/sample-01.json').then((r) => r.json())

const ds = await createDataSet([
    {
        name: 'sales',
        source: rows,
        table: {
            fields: [
                { name: '브랜드명', type: 'text' },
                { name: '모델명', type: 'text' },
                { name: '차종', type: 'text' },
                { name: '국산/수입', type: 'text' },
                { name: '연료', type: 'text' },
                { name: '판매수량', type: 'number' },
                { name: '차량가격', type: 'number' },
                { name: '판매금액', type: 'number' },
                { name: '판매날짜', type: 'date' },
            ],
            calculatedFields: [{ name: '판매금액', type: 'number', expression: '판매수량 * 차량가격' }],
        },
    },
])

const cm = createCubeManager(ds, [
    {
        name: 'sales',
        table: 'sales',
        schema: {
            dimensions: [
                { name: '판매날짜', type: 'date' },
                { name: '국산/수입', type: 'str' },
                { name: '브랜드명', type: 'str' },
                { name: '모델명', type: 'str' },
                { name: '차종', type: 'str' },
                { name: '연료', type: 'str' },
            ],
            measures: [{ name: '판매금액', type: 'f64', aggregate: 'sum' }],
        },
    },
])

const control = createControl(document, 'control', cm, {
    general: { theme: 'light' },
    tables: [
        {
            name: '첫 피벗',
            cube: 'sales',
            columnWidth: 120,
            fields: {},
        },
    ],
})

Object.assign(window, { demo: { control, cm, rows } })
