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
                    dateFields: ['월;month', '분기;quarter', '년도;year'],
                },
                { name: '상품', source: 'Product', type: 'str' },
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
            name: '4 icon',
            title: 'icon - traffic-3 로 등급 나누기',
            cube: 'orders',
            emptyText: '-',
            fields: {
                rows: [{ name: '상품' }],
                columns: [{ name: '분기' }],
                values: [
                    {
                        name: '주문 금액',
                        aggregate: 'sum',
                        numberFormat: '#,##0',
                        width: 130,
                        icon: {
                            visible: true,
                            iconSet: 'traffic-3',
                            compareScope: 'column',
                            divideMode: 'value',
                            thresholds: [30000, 50000],
                        },
                    },
                ],
            },
        },
    ],
}

control.loadBook(cm, config)
