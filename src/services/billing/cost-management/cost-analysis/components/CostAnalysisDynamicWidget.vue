<template>
    <div ref="chartRef" class="chart" />
</template>

<script lang="ts">
import { Dayjs } from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import { TimeUnit } from '@amcharts/amcharts4/core';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    useColumnChart, useLineChart, usePieChart, useStackedColumnChart, useStackedLineChart,
} from '@/common/composables/dynamic-chart';
import { CHART_TYPE, GRANULARITY } from '@/services/billing/cost-management/cost-analysis/lib/config';
import { ChartType, Granularity } from '@/services/billing/cost-management/cost-analysis/store/type';
import { ChartData, DynamicChartStateArgs, Legend } from '@/common/composables/dynamic-chart/type';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { PieChart, XYChart } from '@amcharts/amcharts4/charts';


interface Period {
    start: Dayjs;
    end: Dayjs;
}
interface Props {
    chart: XYChart | PieChart;
    chartType: ChartType;
    chartData: ChartData[];
    legends: Legend[];
    granularity: Granularity;
    period: Period;
}

export default {
    name: 'CostAnalysisColumnChart',
    props: {
        chart: {
            type: Object,
            default: () => ({}),
        },
        chartType: {
            type: String,
            default: CHART_TYPE.STACKED_COLUMN,
            validator(value: any) {
                return Object.values(CHART_TYPE).includes(value);
            },
        },
        chartData: {
            type: Array,
            default: () => ([]),
        },
        legends: {
            type: Array,
            default: () => ([]),
        },
        granularity: {
            type: String,
            default: GRANULARITY.DAILY,
            validator(value: any) {
                return Object.values(GRANULARITY).includes(value);
            },
        },
        period: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            proxyChart: makeProxy('chart', props, emit),
        });

        /* util */
        const convertChartDataWithPeriod = (timeUnit) => {
            const chartData = [] as ChartData[];
            let now = props.period.start.clone();
            while (now.isSameOrBefore(props.period.end, timeUnit)) {
                // eslint-disable-next-line no-loop-func
                const existData = props.chartData.find(d => now.isSame(d.date, timeUnit));
                if (existData) {
                    chartData.push(existData);
                } else {
                    chartData.push({
                        date: now.format('YYYY-MM-DD'),
                    });
                }
                now = now.add(1, timeUnit);
            }
            return chartData;
        };
        const getTimeUnit = () => {
            let unit: TimeUnit;
            if (props.granularity === GRANULARITY.ACCUMULATED) {
                if (props.period.end.diff(props.period.start, 'month') < 2) {
                    unit = 'day';
                } else if (props.period.end.diff(props.period.start, 'year') < 2) {
                    unit = 'month';
                } else {
                    unit = 'year';
                }
            } else if (props.granularity === GRANULARITY.MONTHLY) {
                unit = 'month';
            } else if (props.granularity === GRANULARITY.YEARLY) {
                unit = 'year';
            } else {
                unit = 'day';
            }

            return unit;
        };
        const drawChart = (ctx) => {
            const timeUnit = getTimeUnit();
            const convertedChartData = convertChartDataWithPeriod(timeUnit);
            const params: DynamicChartStateArgs = {
                data: convertedChartData,
                valueOptions: {},
                categoryOptions: {
                    legends: computed(() => props.legends),
                    path: 'date',
                    timeUnit,
                },
                chartContainer: ctx,
            };

            let chart;
            if (props.chartType === CHART_TYPE.STACKED_COLUMN) {
                ({ chart } = useStackedColumnChart(params));
            } else if (props.chartType === CHART_TYPE.COLUMN) {
                ({ chart } = useColumnChart(params));
            } else if (props.chartType === CHART_TYPE.LINE) {
                ({ chart } = useLineChart(params));
            } else if (props.chartType === CHART_TYPE.STACKED_LINE) {
                ({ chart } = useStackedLineChart(params));
            } else if (props.chartType === CHART_TYPE.DONUT) {
                ({ chart } = usePieChart(params));
            }

            state.proxyChart = chart;

            if (props.chartType !== CHART_TYPE.DONUT) {
                chart.scrollbarX = new am4core.Scrollbar();
            }
        };

        watch([() => state.chartRef, () => props.chartData], ([ctx, chartData]) => {
            if (ctx && (chartData as ChartData[]).length > 0) {
                drawChart(ctx);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
</style>
