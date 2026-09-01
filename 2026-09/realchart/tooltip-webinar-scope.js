/**
 * @title 'tooltip.scope'
 * @demo
 *
 * hover · point · group · axis — 툴팁에 포함할 데이터 범위
 */

const config = {
    general: {
        theme: 'dark',
        animatable: false,
    },
    credits: false,
    title: { text: 'tooltip.scope', align: 'left' },
    subtitle: {
        text: 'group — 채널 3 · 목표 제외',
        align: 'left',
        style: { fill: '#9aa4b0', fontSize: '12px' },
    },
    legend: { location: 'top', align: 'right' },
    tooltip: {
        scope: 'hover',
    },
    xAxis: {
        categories: ['1월', '2월', '3월', '4월', '5월', '6월'],
        tooltipHeader: '<b>2026년 ${name}</b> · 전사',
        tooltipListRow: ['${series}', '${detail}'],
        tooltipFooter: '<t style="fill:#546e7a">목표 + 판매 채널</t>',
    },
    yAxis: {
        title: '억원',
        label: { numberFormat: '#,##0' },
    },
    series: [
        {
            type: 'line',
            name: '목표',
            color: '#ffa726',
            marker: { radius: 3 },
            style: { strokeWidth: 2, strokeDasharray: '5 4' },
            tooltipText: '<b>${name}</b><br>${series}: ${yValue}억원',
            tooltipDetail: '<b>${yValue}</b>억원',
            data: [{ x: 0, y: 95 }, { x: 1, y: 100 }, { x: 2, y: 120 }, { x: 3, y: 110 }, { x: 4, y: 125 }, { x: 5, y: 130 }],
        },
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
                    tooltipText: '<b>${name}</b><br>${series}: ${yValue}억원',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [{ x: 0, y: 52 }, { x: 1, y: 58 }, { x: 2, y: 61 }, { x: 3, y: 55 }, { x: 4, y: 64 }, { x: 5, y: 70 }],
                },
                {
                    name: '매장',
                    color: '#26a69a',
                    tooltipText: '<b>${name}</b><br>${series}: ${yValue}억원',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [{ x: 0, y: 31 }, { x: 1, y: 29 }, { x: 2, y: 33 }, { x: 3, y: 36 }, { x: 4, y: 34 }, { x: 5, y: 38 }],
                },
                {
                    name: 'B2B',
                    color: '#8d6e63',
                    tooltipText: '<b>${name}</b><br>${series}: ${yValue}억원',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [{ x: 0, y: 18 }, { x: 1, y: 22 }, { x: 2, y: 19 }, { x: 3, y: 24 }, { x: 4, y: 27 }, { x: 5, y: 25 }],
                },
            ],
        },
    ],
};

const SCOPE_SUB = {
    hover: 'hover — 크로스헤어 OFF면 point와 같음',
    point: 'point — 가리킨 데이터만',
    group: 'group — 채널 3 · 목표 제외',
    axis: 'axis — 목표 + 채널 4',
};

let chart;

const tool = {
    width: 1020,
    height: 620,
    axis: false,
    theme: false,
    actions: [
        {
            type: 'select',
            label: 'scope',
            data: ['hover', 'point', 'group', 'axis'],
            value: 'group',
            action: ({ value }) => {
                config.tooltip.scope = value;
                config.general.pointHovering.scope =
                    value === 'hover' ? 'point' : value;
                config.subtitle.text = SCOPE_SUB[value];
                chart.load(config);
            },
        },
    ],
};

function init() {
    chart = RealChart.createChart(document, 'realchart', config);
    setActions2('actions', tool);
}
