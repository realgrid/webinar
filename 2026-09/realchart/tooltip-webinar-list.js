/**
 * @title '목록 툴팁'
 * @demo
 *
 * tooltipHeader · tooltipListRow · tooltipDetail · tooltipFooter
 */

const config = {
    general: {
        theme: 'dark',
        animatable: false,
        pointHovering: { scope: 'group' },
    },
    credits: false,
    title: { text: '목록 툴팁', align: 'left' },
    subtitle: {
        text: 'header · listRow · detail · footer',
        align: 'left',
        style: { fill: '#9aa4b0', fontSize: '12px' },
    },
    legend: { location: 'top', align: 'right' },
    tooltip: {
        scope: 'group',
    },
    xAxis: {
        categories: ['1월', '2월', '3월', '4월', '5월', '6월'],
    },
    yAxis: {
        title: '억원',
        label: { numberFormat: '#,##0' },
    },
    series: [
        {
            type: 'bargroup',
            name: '판매 채널',
            tooltipHeader: '<b>2026년 ${name}</b> · 판매 채널',
            tooltipListRow: ['${series}', '${detail}'],
            tooltipFooter: '<t style="fill:#546e7a">3개 채널</t>',
            children: [
                {
                    name: '온라인몰',
                    color: '#5c6bc0',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [
                        { x: 0, y: 52 },
                        { x: 1, y: 58 },
                        { x: 2, y: 61 },
                        { x: 3, y: 55 },
                        { x: 4, y: 64 },
                        { x: 5, y: 70 },
                    ],
                },
                {
                    name: '매장',
                    color: '#26a69a',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [
                        { x: 0, y: 31 },
                        { x: 1, y: 29 },
                        { x: 2, y: 33 },
                        { x: 3, y: 36 },
                        { x: 4, y: 34 },
                        { x: 5, y: 38 },
                    ],
                },
                {
                    name: 'B2B',
                    color: '#8d6e63',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [
                        { x: 0, y: 18 },
                        { x: 1, y: 22 },
                        { x: 2, y: 19 },
                        { x: 3, y: 24 },
                        { x: 4, y: 27 },
                        { x: 5, y: 25 },
                    ],
                },
            ],
        },
    ],
};

function init() {
    RealChart.createChart(document, 'realchart', config);
}
