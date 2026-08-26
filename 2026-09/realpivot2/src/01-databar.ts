import type { PivotBookConfiguration } from '../lib/realpivot2.js'

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

const config: PivotBookConfiguration = {
    general: {
        theme: 'light',
    },
    inspector: {
        visible: false,
    },
    tables: [
        {
            name: '1 dataBar',
            title: 'dataBar - 열 안에서 상대 크기',
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
                        dataBar: {
                            visible: true,
                            compareScope: 'column',
                            barOnly: false,
                        },
                    },
                ],
            },
        },
    ],
}

control.loadBook(cm, config)
