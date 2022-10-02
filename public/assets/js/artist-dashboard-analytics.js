/**
 * Dashboard Analytics
 */

'use strict';

(function () {
    let cardColor, headingColor, axisColor, shadeColor, borderColor;

    cardColor = config.colors.white;
    headingColor = config.colors.headingColor;
    axisColor = config.colors.axisColor;
    borderColor = config.colors.borderColor;


    function top4Categorycategory() {
        $.ajax({
            url: '/artist/top-4-category',
            data: {
            },
            method: 'post',
            success: (categoryChart) => {
                console.log(categoryChart);
                const chartOrderStatistics = document.querySelector('#orderStatisticsChart'),
                    orderChartConfig = {
                        chart: {
                            height: 165,
                            width: 130,
                            type: 'donut'
                        },
                        labels: categoryChart.category,
                        series: categoryChart.count,
                        colors: [config.colors.primary, config.colors.secondary, config.colors.info, config.colors.success],
                        stroke: {
                            width: 5,
                            colors: cardColor
                        },
                        dataLabels: {
                            enabled: false,
                            formatter: function (val, opt) {
                                return parseInt(val) + '%';
                            }
                        },
                        legend: {
                            show: false
                        },
                        grid: {
                            padding: {
                                top: 0,
                                bottom: 0,
                                right: 15
                            }
                        },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '75%',
                                    labels: {
                                        show: true,
                                        value: {
                                            fontSize: '1.5rem',
                                            fontFamily: 'Public Sans',
                                            color: headingColor,
                                            offsetY: -15,
                                            formatter: function (val) {
                                                return parseInt(val);
                                            }
                                        },
                                        name: {
                                            offsetY: 20,
                                            fontFamily: 'Public Sans'
                                        },
                                        total: {
                                            show: true,
                                            fontSize: '0.8125rem',
                                            color: axisColor,
                                            label: 'products',

                                        }
                                    }
                                }
                            }
                        }
                    };
                if (typeof chartOrderStatistics !== undefined && chartOrderStatistics !== null) {
                    const statisticsChart = new ApexCharts(chartOrderStatistics, orderChartConfig);
                    statisticsChart.render();
                }
            }
        })
    }
    top4Categorycategory()





    function totalRevenue() {

        $.ajax({
            url: '/artist/total-revenue-chart',
            data: {
            },
            method: 'post',
            success: (revenueChart) => {

                const incomeChartEl = document.querySelector('#incomeChart'),
                    incomeChartConfig = {
                        series: [
                            {
                                name: '₹',
                                data: revenueChart.amount
                            }
                        ],
                        chart: {
                            height: 270,
                            parentHeightOffset: 0,
                            parentWidthOffset: 0,
                            toolbar: {
                                show: false
                            },
                            type: 'area'

                        },
                        dataLabels: {
                            enabled: false
                        },
                        stroke: {
                            width: 2,
                            curve: 'smooth'
                        },
                        legend: {
                            show: false
                        },
                        markers: {
                            size: 6,
                            colors: 'transparent',
                            strokeColors: 'transparent',
                            strokeWidth: 4,
                            discrete: [
                                {
                                    fillColor: config.colors.white,
                                    seriesIndex: 0,
                                    dataPointIndex: 7,
                                    strokeColor: config.colors.warning,
                                    strokeWidth: 2,
                                    size: 6,
                                    radius: 8
                                }
                            ],
                            hover: {
                                size: 7
                            }
                        },
                        colors: [config.colors.warning],
                        fill: {
                            type: 'gradient',
                            gradient: {
                                shade: shadeColor,
                                shadeIntensity: 0.6,
                                opacityFrom: 0.5,
                                opacityTo: 0.25,
                                stops: [0, 95, 100]
                            }
                        },
                        grid: {
                            borderColor: borderColor,
                            strokeDashArray: 3,
                            padding: {
                                top: -20,
                                bottom: -8,
                                left: -10,
                                right: 8
                            }
                        },
                        xaxis: {
                            categories: revenueChart.date,
                            axisBorder: {
                                show: false
                            },
                            axisTicks: {
                                show: false
                            },
                            labels: {
                                show: true,
                                style: {
                                    fontSize: '13px',
                                    colors: axisColor
                                }
                            }
                        },
                        yaxis: {
                            labels: {
                                style: {
                                    fontSize: '13px',
                                    colors: axisColor
                                }
                            },
                            min: 0,
                            max: revenueChart.large,
                            tickAmount: 4
                        }
                    };
                if (typeof incomeChartEl !== undefined && incomeChartEl !== null) {
                    const incomeChart = new ApexCharts(incomeChartEl, incomeChartConfig);
                    incomeChart.render();
                }


                // Count Order
                const profileReportChartEl = document.querySelector('#profileReportChart'),
                    profileReportChartConfig = {
                        chart: {
                            height: 80,
                            // width: 175,
                            type: 'line',
                            toolbar: {
                                show: false
                            },
                            dropShadow: {
                                enabled: true,
                                top: 10,
                                left: 5,
                                blur: 3,
                                color: config.colors.info,
                                opacity: 0.15
                            },
                            sparkline: {
                                enabled: true
                            }
                        },
                        grid: {
                            show: false,
                            padding: {
                                right: 8
                            }
                        },
                        colors: [config.colors.info],
                        dataLabels: {
                            enabled: false
                        },
                        stroke: {
                            width: 5,
                            curve: 'smooth'
                        },
                        series: [
                            {   
                                name : 'Ordered',
                                data: revenueChart.count
                            }
                        ],
                        xaxis: {

                            categories : revenueChart.date,
                            show: false,
                            lines: {
                                show: false
                            },
                            labels: {
                                show: false
                            },
                            axisBorder: {
                                show: false
                            }
                        },
                        yaxis: {
                            show: false
                        }
                    };
                if (typeof profileReportChartEl !== undefined && profileReportChartEl !== null) {
                    const profileReportChart = new ApexCharts(profileReportChartEl, profileReportChartConfig);
                    profileReportChart.render();
                }
            }
        })
    }
    totalRevenue()


})();
