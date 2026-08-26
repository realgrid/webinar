import { bootOrders } from './setup.js'

const { control, cm } = await bootOrders({
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
})

control.loadBook(cm, {
    general: { theme: 'light' },
    tables: [
        {
            name: '2 heatmap',
            title: 'heatmap - 색으로 값의 분포 보기',
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
                        heatmap: {
                            visible: true,
                            compareScope: 'all',
                            // 연한 노랑 → 주황 → 빨강
                            colors: ['#fef3c7', '#fdba74', '#dc2626'],
                        },
                    },
                ],
            },
        },
    ],
})
