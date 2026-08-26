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
            name: '3 highlight',
            title: 'highlight - 열별 Top 2 · Bottom 2 · 평균 이상',
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
                        highlight: {
                            visible: true,
                            compareScope: 'column',
                            ruleMode: 'first',
                            rules: [
                                {
                                    type: 'top',
                                    value: 2,
                                    // 배경 연한 초록, 글자 진한 초록
                                    style: { backgroundColor: '#ecfdf5', color: '#047857', bold: true },
                                },
                                {
                                    type: 'bottom',
                                    value: 2,
                                    // 배경 연한 분홍, 글자 진한 빨강
                                    style: { backgroundColor: '#fff1f2', color: '#be123c' },
                                },
                                {
                                    type: 'aboveAvg',
                                    // 글자 파랑
                                    style: { color: '#1d4ed8' },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
})
