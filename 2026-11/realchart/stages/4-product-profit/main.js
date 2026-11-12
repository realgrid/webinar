import { data } from '../../data.js';

const config = {
    general: { theme: 'dark', animatable: false },
    title: false,
    credits: false,
    legend: false,
    body: { style: { fill: '#111c2b' } },
    split: {
        visible: true,
        rows: 2,
        gap: 48,
        panes: [
            {
                row: 1,
                body: {
                    annotation: [{
                        type: 'text',
                        text: '<b style="fill:#f3f7fc">전체 상품 · 매출과 이익</b>',
                        offsetX: 9, offsetY: 6,
                        backgroundStyle: { fill: '#111c2b' },
                    }],
                },
                legend: {
                    visible: true,
                    align: 'right', verticalAlign: 'top',
                    useTextColor: true,
                    backgroundStyle: { fill: '#111c2b' },
                },
            },
            {
                row: 0,
                body: {
                    annotation: [{
                        type: 'text',
                        text: '<b style="fill:#f3f7fc">전체 상품 · 주문과 취소</b>'
                            + '<br><t style="fill:#b7c9e1">5분 구간별 건수</t>',
                        offsetX: 9, offsetY: 6,
                        backgroundStyle: { fill: '#111c2b' },
                    }],
                },
                legend: {
                    visible: true,
                    align: 'right', verticalAlign: 'top',
                    useTextColor: true,
                    backgroundStyle: { fill: '#111c2b' },
                },
            },
        ],
    },
    xAxis: [
        {
            name: 'time',
            type: 'linear',
            row: 0,
            strictMin: -2.5, strictMax: 37.5,
            tick: { stepInterval: 5 },
            label: { suffix: '분' },
            crosshair: {
                visible: true,
                flag: { visible: false },
                style: { stroke: '#ffcf70', strokeWidth: '2px' },
            },
            guide: [{
                type: 'range',
                startValue: 25, endValue: 35,
                style: { fill: '#539cff', fillOpacity: '0.10' },
            }],
        },
    ],
    yAxis: [
        {
            name: 'money',
            row: 1,
            strictMin: 0, strictMax: 15000,
            tick: { stepInterval: 2000 },
            label: { numberFormat: '#,##0', numberSymbols: '' },
            guide: [{
                type: 'line',
                value: 10000,
                label: {
                    text: '매출 목표 1억',
                    verticalAlign: 'bottom',
                    style: { fill: '#ffcf70' },
                },
                style: { stroke: '#ffcf70', strokeDasharray: '6 5' },
            }],
        },
        {
            name: 'orders',
            row: 0,
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
