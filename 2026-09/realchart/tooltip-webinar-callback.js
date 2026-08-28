/**
 * @title 'tooltipCallback'
 * @demo
 *
 * 계산·조건이 필요할 때 표시 문자열을 직접 반환
 */

function salesTooltip({ source, yValue }) {
    const previous = source.previous;
    const value = Number(yValue).toFixed(0);
    if (previous === null) {
        return (
            `<b>${source.month}</b><br>${source.channel}: ` +
            `<b>${value}</b>억원<br>` +
            '<t style="fill:#64748b">전월 데이터 없음</t>'
        );
    }
    const rate = ((yValue - previous) / previous) * 100;
    const rising = rate >= 0;
    const arrow = rising ? '▲' : '▼';
    const fill = rising ? '#16a34a' : '#dc2626';
    return (
        `<b>${source.month}</b><br>` +
        `${source.channel}: <b>${value}</b>억원<br>` +
        `<t style="fill:${fill}">전월 대비 ${arrow} ${Math.abs(rate).toFixed(1)}%</t>`
    );
}

const config = {
    general: { theme: 'dark', animatable: false },
    credits: false,
    title: { text: 'tooltipCallback', align: 'left' },
    subtitle: {
        text: '전월 대비처럼 계산이 필요할 때',
        align: 'left',
        style: { fill: '#9aa4b0', fontSize: '12px' },
    },
    legend: false,
    tooltip: {
        scope: 'point',
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
            name: '온라인몰',
            color: '#5c6bc0',
            tooltipCallback: salesTooltip,
            data: [
                { x: 0, y: 52, channel: '온라인몰', month: '1월', previous: null },
                { x: 1, y: 58, channel: '온라인몰', month: '2월', previous: 52 },
                { x: 2, y: 61, channel: '온라인몰', month: '3월', previous: 58 },
                { x: 3, y: 55, channel: '온라인몰', month: '4월', previous: 61 },
                { x: 4, y: 64, channel: '온라인몰', month: '5월', previous: 55 },
                { x: 5, y: 70, channel: '온라인몰', month: '6월', previous: 64 },
            ],
        },
    ],
};

function init() {
    RealChart.createChart(document, 'realchart', config);
}
