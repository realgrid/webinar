const { setLogging, createDataSet, createCubeManager, createControl } = window.RealPivot2

setLogging(false)

const control = createControl(document, 'control')

const ds = await createDataSet(
    [
        {
            name: 'ecommerceOrders',
            sourceUrl: './asset/ecommerce-orders.csv',
            sourceType: 'csv',
            csvOptions: { quoted: true },
            table: {
                fields: [
                    { name: 'OrderID', type: 'text' },
                    { name: 'Date', type: 'date' },
                    { name: 'CustomerID', type: 'text' },
                    { name: 'Product', type: 'text' },
                    { name: 'Quantity', type: 'number' },
                    { name: 'UnitPrice', type: 'number' },
                    { name: 'ShippingAddress', type: 'text' },
                    { name: 'PaymentMethod', type: 'text' },
                    { name: 'OrderStatus', type: 'text' },
                    { name: 'TrackingNumber', type: 'text' },
                    { name: 'ItemsInCart', type: 'number' },
                    { name: 'CouponCode', type: 'text' },
                    { name: 'ReferralSource', type: 'text' },
                    { name: 'TotalPrice', type: 'number' },
                ],
            },
        },
    ],
    { indicator: 'progress', control },
)

const cm = createCubeManager(ds, [
    {
        name: 'orders',
        table: 'ecommerceOrders',
        schema: {
            dimensions: [
                {
                    name: '주문일',
                    source: 'Date',
                    type: 'date',
                    dateFields: ['월;month','반기;half', '분기;quarter', '년도;year'],
                },
                { name: '상품', source: 'Product', type: 'str' },
                { name: '결제 수단', source: 'PaymentMethod', type: 'str' },
            ],
            measures: [
                { name: '주문 금액', source: 'TotalPrice', type: 'f64', aggregate: 'sum' },
            ],
        },
        columnar: true,
    },
])

const config = {
    general: {
        theme: 'light',
    },
    tables: [
        {
            name: '6 series',
            title: '열시리즈 - sparkbar 는 연도 소계, sparkline 은 총계',
            cube: 'orders',
            emptyText: '-',
            rowHeight: 36,
            fields: {
                rows: [{ name: '결제 수단' }, { name: '상품' }],
                columns: [{ name: '반기', headerVisible: true }, { name: '월' }],
                values: [
                    { name: '주문 금액', aggregate: 'sum', numberFormat: '#,##0', width: 96 },
                ],
            },
            rowTotal: { collapseSingle: true },
            columnTotal: { collapseSingle: true },
            columnGrandTotal: { position: 'end', fixed: true },
            series: [
                {
                    name: 'byYear',
                    label: 'Trend\n(해당 연도 월별)',
                    dimension: '반기',
                    measure: '주문 금액',
                    width: 150,
                    position: 'start',
                    renderer: { type: 'sparkbar' },
                },
                {
                    name: 'byTotal',
                    label: 'Trend\n(전 기간)',
                    measure: '주문 금액',
                    width: 170,
                    renderer: { type: 'sparkline', lineColor: '#0f766e'},
                },
            ],
        },
    ],
}

control.loadBook(cm, config)
