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
        { name: '금액·순위', source: 'TotalPrice', type: 'f64', aggregate: 'sum' },
        { name: '금액·비중', source: 'TotalPrice', type: 'f64', aggregate: 'sum' },
        { name: '금액·누계', source: 'TotalPrice', type: 'f64', aggregate: 'sum' },
    ],
})

control.loadBook(cm, {
    general: { theme: 'light' },
    tables: [
        {
            name: '5 비중+막대',
            title: 'showAs 뒤에 오버레이 - 순위 · 비중 · 누계',
            cube: 'orders',
            emptyText: '-',
            fields: {
                rows: [{ name: '상품', sort: { type: 'label', direction: 'asc' } }],
                columns: [{ name: '분기' }],
                values: [
                    {
                        name: '금액·순위',
                        aggregate: 'sum',
                        showAs: 'rank',
                        baseAxis: 'row',
                        numberFormat: '0',
                        width: 78,
                    },
                    {
                        name: '금액·비중',
                        aggregate: 'sum',
                        showAs: 'colPercent',
                        numberFormat: '0.0%',
                        width: 118,
                        dataBar: {
                            visible: true,
                            compareScope: 'column',
                        },
                    },
                    {
                        name: '금액·누계',
                        aggregate: 'sum',
                        showAs: 'running',
                        baseAxis: 'row',
                        numberFormat: '#,##0',
                        width: 118,
                    },
                ],
            },
            columnGrandTotal: { visible: true, position: 'end', fixed: true, label: '합계' },
        },
    ],
})
