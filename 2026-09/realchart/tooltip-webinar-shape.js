/**
 * @title 'simpleMode · listMarker'
 * @demo
 *
 * 툴팁 형태 · 목록 마커
 */

const config = {
    general: {
        theme: 'dark',
        animatable: false,
    },
    credits: false,
    title: { text: 'simpleMode · listMarker', align: 'left' },
    subtitle: {
        text: "simpleMode off · shape 'diamond' · size 14",
        align: 'left',
        style: { fill: '#9aa4b0', fontSize: '12px' },
    },
    legend: { location: 'top', align: 'right' },
    tooltip: {
        scope: 'axis',
        simpleMode: true,
        borderRadius: 15,
        headerHeight: 15,
        tailSize: 20,
        listMarkerShape: 'diamond',
        listMarkerSize: 14,
        listMarkerGap: 20,
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

function syncSubtitle() {
    const mode = config.tooltip.simpleMode ? 'on' : 'off';
    config.subtitle.text =
        `simpleMode ${mode} · shape '${config.tooltip.listMarkerShape}' · size ${config.tooltip.listMarkerSize}`;
}

let chart;

const tool = {
    width: 1020,
    height: 620,
    axis: false,
    theme: false,
    actions: [
        {
            type: 'check',
            label: 'simpleMode',
            value: false,
            action: ({ value }) => {
                config.tooltip.simpleMode = value;
                syncSubtitle();
                chart.load(config);
            },
        },
        {
            type: 'select',
            label: 'listMarkerShape',
            data: ['circle', 'diamond', 'square'],
            value: 'diamond',
            action: ({ value }) => {
                config.tooltip.listMarkerShape = value;
                syncSubtitle();
                chart.load(config);
            },
        },
        {
            type: 'select',
            label: 'listMarkerSize',
            data: ['8', '10', '14', '18'],
            value: '14',
            action: ({ value }) => {
                config.tooltip.listMarkerSize = Number(value);
                syncSubtitle();
                chart.load(config);
            },
        },
    ],
};

function init() {
    chart = RealChart.createChart(document, 'realchart', config);
    setActions2('actions', tool);
    window.__tooltipWebinar = {
        config,
        chart,
        reload() {
            chart.load(config);
        },
    };
}
