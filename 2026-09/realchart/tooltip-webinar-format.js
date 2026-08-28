/**
 * @title 'numberFormat · timeFormat'
 * @demo
 *
 * 툴팁 숫자·날짜 표시 형식
 */

const config = {
    general: { theme: 'dark', animatable: false },
    credits: false,
    title: { text: 'numberFormat · timeFormat', align: 'left' },
    subtitle: {
        text: "number '#,##0' · time 'yyyy.MM'",
        align: 'left',
        style: { fill: '#9aa4b0', fontSize: '12px' },
    },
    legend: false,
    tooltip: {
        scope: 'point',
        numberFormat: '#,##0.0',
        timeFormat: 'yyyy.MM',
    },
    xAxis: {
        type: 'time',
        minPadding: 0.08,
        maxPadding: 0.08,
        tick: { stepInterval: '1m' },
        label: { timeFormat: 'M월' },
    },
    yAxis: {
        title: '억원',
        label: { numberFormat: '#,##0' },
    },
    series: [
        {
            name: '온라인몰',
            color: '#5c6bc0',
            tooltipText:
                '<b>${xValue}</b><br>' +
                '${series}: <b>${yValue}</b>억원',
            data: [
                { x: new Date(2026, 0, 1), y: 52 },
                { x: new Date(2026, 1, 1), y: 58 },
                { x: new Date(2026, 2, 1), y: 61 },
                { x: new Date(2026, 3, 1), y: 55 },
                { x: new Date(2026, 4, 1), y: 64 },
                { x: new Date(2026, 5, 1), y: 70 },
            ],
        },
    ],
};

function syncSubtitle() {
    config.subtitle.text =
        `number '${config.tooltip.numberFormat}' · time '${config.tooltip.timeFormat}'`;
}

let chart;

const tool = {
    width: 1020,
    height: 620,
    axis: false,
    theme: false,
    actions: [
        {
            type: 'select',
            label: 'numberFormat',
            data: ['#,##0', '#,##0.0', '#,##0.00'],
            value: '#,##0',
            action: ({ value }) => {
                config.tooltip.numberFormat = value;
                syncSubtitle();
                chart.load(config);
            },
        },
        {
            type: 'select',
            label: 'timeFormat',
            data: ['yyyy.MM', 'yyyy-MM-dd', 'yyyy년 M월'],
            value: 'yyyy.MM',
            action: ({ value }) => {
                config.tooltip.timeFormat = value;
                syncSubtitle();
                chart.load(config);
            },
        },
    ],
};

function init() {
    chart = RealChart.createChart(document, 'realchart', config);
    setActions2('actions', tool);
}
