import { data, updates } from '../../data.js';

const config = {
    general: {
        theme: 'dark',
        animatable: false,
        onSelectionChanged: ({ chart }) => {
            const costs = chart.selection.focusedPoint?.source.costs;
            if (!costs) return;
            chart.getSeries('손익').updateOptions({
                data: [...costs, { isSum: true }],
            });
        },
    },
    title: false,
    credits: false,
    legend: false,
    body: { style: { fill: '#111c2b' } },
    split: {
        visible: true,
        rows: 2,
        cols: ['1.65*', '*'],
        gap: 48,
        panes: [
            {
                row: 1, col: 0,
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
                row: 0, col: 0,
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
            {
                row: 1, col: 1,
                body: {
                    annotation: [{
                        type: 'text',
                        text: '<b style="fill:#f3f7fc">상품별 실매출</b>',
                        offsetX: 9, offsetY: 6,
                        backgroundStyle: { fill: '#111c2b' },
                    }],
                },
            },
            {
                row: 0, col: 1,
                body: {
                    annotation: [{
                        type: 'text',
                        text: '<b style="fill:#f3f7fc">선택 상품 · 손익 구조</b>',
                        offsetX: 9, offsetY: 6,
                        backgroundStyle: { fill: '#111c2b' },
                    }],
                },
            },
        ],
    },
    xAxis: [
        {
            name: 'time',
            type: 'linear',
            row: 0, col: 0,
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
        {
            name: 'product',
            type: 'category',
            row: 1, col: 1,
            categories: ['텀블러', '머그컵', '드립백'],
        },
        {
            name: 'cost',
            type: 'category',
            row: 0, col: 1,
            categories: ['정상가 매출', '할인', '원가', '배송비', '최종 이익'],
        },
    ],
    yAxis: [
        {
            name: 'money',
            row: 1, col: 0,
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
            row: 0, col: 0,
            strictMin: 0, strictMax: 44,
            tick: { stepInterval: 10 },
        },
        {
            name: 'productMoney',
            row: 1, col: 1,
            strictMin: 0, strictMax: 8000,
            tick: { stepInterval: 2500 },
            label: { numberFormat: '#,##0', numberSymbols: '' },
        },
        {
            name: 'costMoney',
            row: 0, col: 1,
            strictMin: -1000, strictMax: 13500,
            tick: { stepInterval: 5000 },
            label: { numberFormat: '#,##0', numberSymbols: '' },
            guide: [{ type: 'line', value: 0, style: { stroke: '#a6b9d2' } }],
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
            pointLabel: {
                visible: true,
                suffix: '건',
                style: { fill: '#f3f7fc', fontSize: '12px' },
            },
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
        {
            name: '상품 매출',
            type: 'bar',
            xAxis: 'product', yAxis: 'productMoney',
            data: [
                { x: '텀블러', y: 3600, costs: [5000, -1400, -3000, -800] },
                { x: '머그컵', y: 2800, costs: [3400, -600, -1800, -400] },
                { x: '드립백', y: 2000, costs: [2400, -400, -1300, -300] },
            ],
            color: '#539cff',
            pointWidth: 48,
            pointLabel: {
                visible: true,
                numberSymbols: '',
                style: { fill: '#f3f7fc', fontSize: '16px' },
            },
            selection: {
                visible: true,
                style: { stroke: '#ffcf70', strokeWidth: '3px' },
                unselectedStyle: { opacity: '0.55' },
            },
            tooltipText: '<b>${x}</b><br>실매출 ${y}만 원',
        },
        {
            name: '손익',
            type: 'waterfall',
            xAxis: 'cost', yAxis: 'costMoney',
            data: [5000, -1400, -3000, -800, { isSum: true }],
            color: '#539cff',
            negativeColor: '#ff7c87',
            pointWidth: 42,
            pointLabel: {
                visible: true,
                effect: 'none',
                numberSymbols: '',
                style: { fill: '#f3f7fc', fontSize: '15px' },
            },
            tooltipText: '<b>${x}</b><br>${y}만 원',
        },
    ],
    tooltip: { scope: 'point', offset: 30 },
};

const chart = RealChart.createChart(document, 'chart', config);

document.querySelector('#advance').onclick = ({ target }) => {
    const update = updates.shift();
    chart.getSeries('매출').addPoint(update.revenue);
    chart.getSeries('이익').addPoint(update.profit);
    chart.getSeries('주문').addPoint(update.orders);
    chart.getSeries('취소').addPoint(update.cancellations);
    chart.getSeries('상품 매출').updateOptions({ data: update.sales });
    chart.getSeries('손익').updateOptions({
        data: [...update.sales[0].costs, { isSum: true }],
    });
    chart.getXAxis('time').updateOption('strictMax', update.minute + 2.5);
    target.disabled = updates.length === 0;
};
