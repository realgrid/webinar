/**
 * @title 'tooltip.style / CSS'
 * @demo
 *
 * CSS 클래스로 배경·테두리·글자색 변경
 */

const config = {
    general: {
        theme: 'dark',
        animatable: false,
    },
    credits: false,
    title: { text: 'style · CSS', align: 'left' },
    subtitle: {
        text: "tooltip.style: 'webinar-tooltip'",
        align: 'left',
        style: { fill: '#9aa4b0', fontSize: '12px' },
    },
    legend: { location: 'top', align: 'right' },
    tooltip: {
        scope: 'axis',
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

function installWebinarCss() {
    if (document.getElementById('tooltip-webinar-css')) {
        return;
    }
    const style = document.createElement('style');
    style.id = 'tooltip-webinar-css';
    style.textContent = `
        #realchart .webinar-tooltip { opacity: 1; font-size: 14px; }
        #realchart .webinar-tooltip .rct-tooltip-back {
            fill: #172c3b;
            stroke: #4db8a8;
            stroke-width: 1.5;
        }
        #realchart .webinar-tooltip .rct-tooltip-top { fill: #2eb8a2; }
        #realchart .webinar-tooltip .rct-tooltip-text,
        #realchart .webinar-tooltip .rct-tooltip-list,
        #realchart .webinar-tooltip .rct-tooltip-row,
        #realchart .webinar-tooltip .rct-tooltip-row-text,
        #realchart .webinar-tooltip .rct-tooltip-row-detail { fill: #edf7f5; }
        #realchart .webinar-tooltip .rct-tooltip-row-marker {
            fill: #4db8a8;
            stroke: #edf7f5;
            stroke-width: 1;
        }
    `;
    document.head.appendChild(style);
}

function init() {
    installWebinarCss();
    RealChart.createChart(document, 'realchart', config);
}
