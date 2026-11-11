import { createChartAsync, setLicenseKey, type ChartConfiguration, type MapSeriesOptions } from 'realmap';
import 'realmap/realmap-style.css';
import './style.css';

const lic = "upVcPE+wPOl3H1t2EmYDS2ZHHsIGhYOFvAiOqCN7jMR+G9Zkz21+pcq/Q/nqT35UsqOdgUX2HtMO5+/xJSE3Lre03PbNvFj8a0WNeh/nPIX1KQaxJnLqta7gd3yWMcJl0ZfYF2VLhgr9YLxChWwJkg==";
const mapUrl = 'https://unpkg.com/realmap-collection/2026-07';

const areaOptions: MapSeriesOptions = {
    style: { stroke: '#2b3a55', strokeWidth: 0.8 },
    hoverStyle: { stroke: '#e2e8f0', strokeWidth: 1.6 },
    pointLabel: {
        visible: true,
        effect: 'outline',
    },
};

const config: ChartConfiguration = {
    title: false,
    credits: false,
    map: {
        url: `${mapUrl}/kr-sido-low.topo.json`,
        insets: ['제주도', '울릉도', '백령도'],
        dokdo: 0.2,
        padding: '0.2 0.1 0.1 0.1',
    },
    body: {
        projection: 'mercator',
    },
    colorScale: {
        minColor: '#16294a',
        maxColor: '#7dd3fc',
        stepCount: 5,
        logBase: 10,
        barLength: '90%',
        barWidth: 25,
    },
    series: [
        {
            ...areaOptions,
            dataUrl: '/kr-sido-population-density-2026-07.json',
            tooltipText: '<b>${name}</b><br>${value;;#,##0.#} 명/㎢',
        },
    ],
};

main();

async function main() {
    setLicenseKey(lic);
    await createChartAsync(document, 'realmap', config);
}
