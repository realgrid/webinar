/**
 * @title 'crosshair'
 * @demo
 *
 * 카테고리 띠(auto→bar) · 세로선(line)
 */

const config = {
    general: {
        theme: 'dark',
        animatable: false,
        pointHovering: { scope: 'axis' },
    },
    credits: false,
    title: { text: 'crosshair', align: 'left' },
    subtitle: {
        text: "type: 'line' — 세로선으로 현재 위치",
        align: 'left',
        style: { fill: '#9aa4b0', fontSize: '12px' },
    },
    legend: { location: 'top', align: 'right' },
    tooltip: {
        scope: 'axis',
    },
    xAxis: {
        type: 'category',
        categories: ['1월', '2월', '3월', '4월', '5월', '6월'],
        crosshair: {
            visible: true,
            type: 'line',
            followPointer: false,
            flag: {
                minWidth: 36,
                textStyles: { fill: '#102027', fontWeight: 'bold' },
            },
            style: { stroke: '#4db8a8', strokeWidth: 1.5 },
        },
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
            tooltipDetail: '<b>${yValue}</b>억원',
            data: [{ x: 0, y: 95 }, { x: 1, y: 100 }, { x: 2, y: 120 }, { x: 3, y: 110 }, { x: 4, y: 125 }, { x: 5, y: 130 }],
        },
        {
            type: 'bargroup',
            name: '판매 채널',
            children: [
                {
                    name: '온라인몰',
                    color: '#5c6bc0',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [{ x: 0, y: 52 }, { x: 1, y: 58 }, { x: 2, y: 61 }, { x: 3, y: 55 }, { x: 4, y: 64 }, { x: 5, y: 70 }],
                },
                {
                    name: '매장',
                    color: '#26a69a',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [{ x: 0, y: 31 }, { x: 1, y: 29 }, { x: 2, y: 33 }, { x: 3, y: 36 }, { x: 4, y: 34 }, { x: 5, y: 38 }],
                },
                {
                    name: 'B2B',
                    color: '#8d6e63',
                    tooltipDetail: '<b>${yValue}</b>억원',
                    data: [{ x: 0, y: 18 }, { x: 1, y: 22 }, { x: 2, y: 19 }, { x: 3, y: 24 }, { x: 4, y: 27 }, { x: 5, y: 25 }],
                },
            ],
        },
    ],
};

const TYPE_SUB = {
    auto: 'true / auto — 카테고리 축에서 bar 띠',
    line: "type: 'line' — 세로선으로 현재 위치",
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
            label: 'type',
            data: ['auto', 'line'],
            value: 'line',
            action: ({ value }) => {
                config.xAxis.crosshair.type = value;
                config.subtitle.text = TYPE_SUB[value];
                chart.load(config);
            },
        },
    ],
};

function init() {
    chart = RealChart.createChart(document, 'realchart', config);
    setActions2('actions', tool);
}
