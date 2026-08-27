import {createChartAsync, setLicenseKey, type ChartConfiguration} from 'realmap';
import 'realmap/realmap-style.css';

const lic = "upVcPE+wPOl3H1t2EmYDS2ZHHsIGhYOFvAiOqCN7jMR+G9Zkz21+pcq/Q/nqT35UsqOdgUX2HtMO5+/xJSE3Lre03PbNvFj8a0WNeh/nPIX1KQaxJnLqta7gd3yWMcJl0ZfYF2VLhgr9YLxChWwJkg==";

main();

async function main() {
    setLicenseKey(lic);
    const config: ChartConfiguration = {
        map: {
            url: '/kr-sido-low.geo.json',
            insets: ["백령도", "울릉도", "제주도"],
            padding: '0.1',
            dokdo: 0.2
        },
        body: {
            projection: 'mercator'
        },
        colorScale: {
            minColor: '#eaf1f9',
            maxColor: '#4a7fc1',
            stepCount: 4,
            logBase: 10
        },
        series: [
            {
                type: 'map',
                dataUrl: '/kr-sido-density.json',
                pointLabel: {
                    visible: true,
                    effect: 'outline'
                },
            }
        ]
    };
    await createChartAsync(document,'realmap', config);
}