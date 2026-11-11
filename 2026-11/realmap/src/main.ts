import { createChartAsync, MapChart, MapSeries, setLicenseKey, type ChartConfiguration, type MapSeriesOptions } from 'realmap';
import { NATION_DENSITY, calloutEndOf } from './util';
import 'realmap/realmap-style.css';
import './style.css';

const COMPARE_SERIES = '인구밀도 비교';
const lic = "upVcPE+wPOl3H1t2EmYDS2ZHHsIGhYOFvAiOqCN7jMR+G9Zkz21+pcq/Q/nqT35UsqOdgUX2HtMO5+/xJSE3Lre03PbNvFj8a0WNeh/nPIX1KQaxJnLqta7gd3yWMcJl0ZfYF2VLhgr9YLxChWwJkg==";

const mapUrl = 'https://unpkg.com/realmap-collection/2026-07';

const areaOptions: MapSeriesOptions = {
    style: { stroke: '#2b3a55', strokeWidth: 0.8 },
    hoverStyle: { stroke: '#e2e8f0', strokeWidth: 1.6 },
    pointLabel: {
        visible: true,
        effect: 'outline',
        hideOverlapped: true,
    },
};

// 드릴다운한 시도의 id. 비교 막대에서 시도 값을 찾는 데 쓴다.
let drilledSidoId = '';

const config: ChartConfiguration = {
    title: false,
    credits: false,
    general: {
        clickAction: 'drilldown',
        onDrilldown: ({ area }) => {
            drilledSidoId = area ?? '';
        },
        onDrillup: ({ chart }) => {
            drilledSidoId = '';
            chart.removeSeries(COMPARE_SERIES);
            chart.selection.clear();
        },
    },
    map: [
        {
            name: '시도',
            url: `${mapUrl}/kr-sido-low.topo.json`,
            insets: ['제주도', '울릉도', '백령도'],
            dokdo: 0.2,
            padding: '0.2 0.1 0.1 0.1',
        },
        {
            name: '시군구',
            url: `${mapUrl}/kr-sigun-low.topo.json`,
            insets: ['울릉도'],
            dokdo: 0.2,
            padding: '0.2 0.4 0.1 0.4',
        },
    ],
    body: {
        projection: 'mercator',
    },
    colorScale: {
        // 어두운 배경이라 밀도가 낮을수록 어둡고, 높을수록 밝은 하늘색이다.
        minColor: '#16294a',
        maxColor: '#7dd3fc',
        stepCount: 5,
        logBase: 10,
        // 시도·시군구 두 데이터의 최소·최대로 범위를 고정한다.
        minValue: 19.5,
        maxValue: 25692,
        barLength: '90%',
        barWidth: 25,
        // 값이 null인 지역(군산시)을 회색으로 칠하고, 색상자에 '자료 없음' 칸을 둔다.
        nullStep: {
            visible: true,
            color: '#4b5563',
            label: '자료 없음',
            gap: 14,
        },
    },
    drilldownPanel: {
        type: 'text',
        align: 'left',
        verticalAlign: 'bottom',
    },
    tooltip: {
        nanText: '--',
    },
    series: [
        {
            name: '시도 인구밀도',
            map: '시도',
            ...areaOptions,
            dataUrl: '/kr-sido-population-density-2026-07.json',
            tooltipText: '<b>${name}</b><br>${value;;#,##0.#} 명/㎢<br>클릭하면 시군구 보기',
            drilldown: {
                scope: 'selected',
                transition: 'zoom',
                duration: 500,
                fillRatio: 0.85,
            },
            detail: {
                ...areaOptions,
                name: '시군구 인구밀도',
                map: '시군구',
                nameField: 'originalName',
                dataUrl: '/kr-sigun-population-density-2026-07.json',
                tooltipText: '<b>${name}</b><br>${value;;#,##0.#} 명/㎢',
                selection: {
                    visible: true,
                    style: {
                        stroke: '#fb923c',
                        strokeWidth: 2.4,
                    },
                },
                onPointClick: ({ chart, id, coord }) => {
                    const sidoSeries = chart.seriesByName('시도 인구밀도') as MapSeries;
                    const sigunSeries = sidoSeries.detail;
                    const sido = sidoSeries.pointById(drilledSidoId);
                    const sigun = sigunSeries.pointById(id);

                    chart.removeSeries(COMPARE_SERIES);
                    chart.addSeries({
                        type: 'bar',
                        name: COMPARE_SERIES,
                        width: 132,
                        height: 90,
                        callout: {
                            visible: true,
                            style: {
                                stroke: '#f8fafc',
                                strokeWidth: 1.25,
                                filter: 'drop-shadow(0 0 1px rgba(2, 6, 23, 0.9)) drop-shadow(0 0 4px rgba(56, 189, 248, 0.75))',
                            },
                            anchorPoint: {
                                radius: 3.5,
                                style: {
                                    fill: '#f8fafc',
                                    filter: 'drop-shadow(0 0 1px rgba(2, 6, 23, 0.9)) drop-shadow(0 0 6px rgba(125, 211, 252, 1))',
                                },
                            },
                        },
                        pointLabel: {
                            visible: true,
                            position: 'bottom',
                            text: `<b>${sigun.name}</b><br><t style="opacity:0.7">인구밀도 (명/㎢)</t>`,
                        },
                        barLabel: {
                            visible: true,
                            position: 'top',
                            numberFormat: '#,##0',
                            numberSymbols: '',
                        },
                        categories: [
                            { name: '전국', color: '#64748b' },
                            { name: sido.name, color: '#38bdf8' },
                            { name: sigun.name, color: '#fb923c' },
                        ],
                        data: [
                            {
                                coord,
                                value: [NATION_DENSITY, sido.getValue(), sigun.getValue()],
                                callout: [calloutEndOf(chart, coord!)],
                            },
                        ],
                    });
                    sigunSeries.select(sigun);

                    return false;
                },
            },
        },
    ],
};

main();

async function main() {
    setLicenseKey(lic);
    const chart = await createChartAsync(document, 'realmap', config);
    onChartLoaded(chart);
}

function drillUp(chart: MapChart) {
    chart.drillup();
}

function onChartLoaded(chart: MapChart) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') drillUp(chart);
    });

    const drillupButton = document.getElementById('drillup');
    drillupButton?.addEventListener('click', () => {
        drillUp(chart);
    });
}
