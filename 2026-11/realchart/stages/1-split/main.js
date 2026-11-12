import { data } from '../../data.js';

const config = {
    general: { theme: 'dark', animatable: false },
    title: false,
    credits: false,
    legend: true,
    body: { style: { fill: '#111c2b' } },
    // split: 다음 단계에서 이 자리에 행·열 분할을 추가합니다.
    xAxis: [
        {
            name: 'time',
            type: 'linear',
            strictMin: -2.5, strictMax: 37.5,
            tick: { stepInterval: 5 },
            label: { suffix: '분' },
        },
    ],
    yAxis: [
        {
            name: 'money',
            strictMin: 0, strictMax: 15000,
            tick: { stepInterval: 2000 },
            label: { numberFormat: '#,##0', numberSymbols: '' },
        },
        {
            name: 'orders',
            position: 'opposite',
            grid: false,
            strictMin: 0, strictMax: 44,
            tick: { stepInterval: 10 },
        },
    ],
    series: [
        {
            name: '매출',
            type: 'line',
            xAxis: 'time', yAxis: 'money',
            data: data.revenue,
            color: '#539cff',
            style: { strokeWidth: '3px' },
            marker: { radius: 3.5 },
            tooltipText: '<b>${series}</b><br>${x}분 · ${y}만 원',
        },
        {
            name: '이익',
            type: 'line',
            xAxis: 'time', yAxis: 'money',
            data: data.profit,
            color: '#50d9bd',
            style: { strokeWidth: '3px' },
            marker: { radius: 3.5 },
            tooltipText: '<b>${series}</b><br>${x}분 · ${y}만 원',
        },
        {
            name: '주문',
            type: 'bar',
            xAxis: 'time', yAxis: 'orders',
            data: data.orders,
            color: '#539cff',
            pointWidth: 17,
            tooltipText: '<b>${series}</b><br>${x}분 구간 · ${y}건',
        },
        {
            name: '취소',
            type: 'bar',
            xAxis: 'time', yAxis: 'orders',
            data: data.cancellations,
            color: '#ff7c87',
            pointWidth: 17,
            tooltipText: '<b>${series}</b><br>${x}분 구간 · ${y}건',
        },
    ],
    tooltip: { scope: 'point', offset: 30 },
};

RealChart.createChart(document, 'chart', config);
