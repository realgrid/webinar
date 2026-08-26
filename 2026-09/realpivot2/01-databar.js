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
})
