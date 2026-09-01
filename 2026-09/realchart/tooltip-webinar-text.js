/**
 * @title 'tooltipText'
 * @demo
 *
 * 시리즈 포인트 툴팁 기본 문구
 */

const config = {
    general: { theme: 'dark', animatable: false },
    credits: false,
    title: { text: 'tooltipText', align: 'left' },
    subtitle: {
        text: '시리즈 포인트 툴팁의 기본 문구',
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
            tooltipText:
                '<b>${name}</b><br>' +
                '${series}: ${yValue}억원<br>' +
                '<t style="fill:#2563eb">${channel}</t> · ${campaign;상시 운영}',
            data: [
                { x: 0, y: 52, channel: 'D2C', campaign: '신년 기획전' },
                { x: 1, y: 58, channel: 'D2C', campaign: '설맞이 프로모션' },
                { x: 2, y: 61, channel: 'D2C', campaign: '봄맞이 기획전' },
                { x: 3, y: 55, channel: 'D2C' },
                { x: 4, y: 64, channel: 'D2C', campaign: '여름 세일' },
                { x: 5, y: 70, channel: 'D2C', campaign: '상반기 결산' },
            ],
        },
    ],
};

function init() {
    RealChart.createChart(document, 'realchart', config);
}
