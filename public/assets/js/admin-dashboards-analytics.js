'use strict';

// Help Fuctions
(function () {

  let cardColor, headingColor, axisColor, shadeColor, borderColor;
  cardColor = config.colors.white;
  headingColor = config.colors.headingColor;
  axisColor = config.colors.axisColor;
  borderColor = config.colors.borderColor;

  // Total Revenue
  function totalRevenue() {

    $.ajax({
      url: '/admin/total-revenue-chart',
      data: {
      },
      method: 'post',
      success: (response) => {
        // Chart
        const totalRevenueChartEl = document.querySelector('#totalRevenueChart'),
          totalRevenueChartOptions = {
            series: [
              {
                name: 'Online',
                data: response.online
              },
              {
                name: 'COD',
                data: response.cod
              }
            ],
            chart: {
              height: 300,
              stacked: true,
              type: 'bar',
              toolbar: { show: false }
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '33%',
                borderRadius: 12,
                startingShape: 'rounded',
                endingShape: 'rounded'
              }
            },
            colors: [config.colors.primary, config.colors.info],
            dataLabels: {
              enabled: false
            },
            stroke: {
              curve: 'smooth',
              width: 6,
              lineCap: 'round',
              colors: [cardColor]
            },
            legend: {
              show: true,
              horizontalAlign: 'left',
              position: 'top',
              markers: {
                height: 8,
                width: 8,
                radius: 12,
                offsetX: -3
              },
              labels: {
                colors: axisColor
              },
              itemMargin: {
                horizontal: 10
              }
            },
            grid: {
              borderColor: borderColor,
              padding: {
                top: 0,
                bottom: -8,
                left: 20,
                right: 20
              }
            },
            xaxis: {
              // categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
              categories: response.date,
              labels: {
                style: {
                  fontSize: '13px',
                  colors: axisColor
                }
              },
              axisTicks: {
                show: false
              },
              axisBorder: {
                show: false
              }
            },
            yaxis: {
              labels: {
                style: {
                  fontSize: '13px',
                  colors: axisColor
                }
              }
            },
            responsive: [
              {
                breakpoint: 1700,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '32%'
                    }
                  }
                }
              },
              {
                breakpoint: 1580,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '35%'
                    }
                  }
                }
              },
              {
                breakpoint: 1440,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '42%'
                    }
                  }
                }
              },
              {
                breakpoint: 1300,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '48%'
                    }
                  }
                }
              },
              {
                breakpoint: 1200,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '40%'
                    }
                  }
                }
              },
              {
                breakpoint: 1040,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 11,
                      columnWidth: '48%'
                    }
                  }
                }
              },
              {
                breakpoint: 991,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '30%'
                    }
                  }
                }
              },
              {
                breakpoint: 840,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '35%'
                    }
                  }
                }
              },
              {
                breakpoint: 768,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '28%'
                    }
                  }
                }
              },
              {
                breakpoint: 640,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '32%'
                    }
                  }
                }
              },
              {
                breakpoint: 576,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '37%'
                    }
                  }
                }
              },
              {
                breakpoint: 480,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '45%'
                    }
                  }
                }
              },
              {
                breakpoint: 420,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '52%'
                    }
                  }
                }
              },
              {
                breakpoint: 380,
                options: {
                  plotOptions: {
                    bar: {
                      borderRadius: 10,
                      columnWidth: '60%'
                    }
                  }
                }
              }
            ],
            states: {
              hover: {
                filter: {
                  type: 'none'
                }
              },
              active: {
                filter: {
                  type: 'none'
                }
              }
            }
          };
        if (typeof totalRevenueChartEl !== undefined && totalRevenueChartEl !== null) {
          const totalRevenueChart = new ApexCharts(totalRevenueChartEl, totalRevenueChartOptions);
          totalRevenueChart.render();
        }


      }
    })
  }
  totalRevenue()


  // --------------------------------------------------------------------
  // Delivery CountChart
  function DeliveryCountChart() {
    $.ajax({
      url: '/admin/total-delivery-chart',
      data: {
      },
      method: 'post',
      success: (chartDelivery) => {
        document.getElementById('deliveryCount').innerHTML = chartDelivery.sum
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
                color: config.colors.warning,
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
            colors: [config.colors.warning],
            dataLabels: {
              enabled: false
            },
            stroke: {
              width: 5,
              curve: 'smooth'
            },
            series: [
              {
                name: 'Delivery',
                data: chartDelivery.count  // Change
              }
            ],
            xaxis: {
              categories: chartDelivery.date,
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
  DeliveryCountChart()

  // Category Products 
  // --------------------------------------------------------------------
  function categoryProducts() {
    $.ajax({
      url: '/admin/category-products-chart',
      data: {},
      method: 'post',
      success: (chartCategory) => {
        console.log(chartCategory,'ddd')

        const chartOrderStatistics = document.querySelector('#orderStatisticsChart'),
          orderChartConfig = {
            chart: {
              height: 165,
              width: 130,
              type: 'donut'
            },
            labels: chartCategory.category,    //Chnage
            series: chartCategory.count,   // Change total 200
            colors: [config.colors.primary, config.colors.warning, config.colors.danger, config.colors.success],
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
                      label: 'Total',
                      formatter: function (w) {
                        return chartCategory.sum;
                      }
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
  categoryProducts()

  // Order method Count Chart
  function OrderMethodCountChart() {
    $.ajax({
      url: '/admin/total-order-method-chart',
      data: {
      },
      method: 'post',
      success: (chartOrderMethod) => {

        const incomeChartEl = document.querySelector('#incomeChart'),
          incomeChartConfig = {
            series: [
              {
                name: 'COD',
                data: chartOrderMethod.cod   //Chnage
              },
              {
                name: 'Online',
                data: chartOrderMethod.online  //Chnage
              }
            ],
            chart: {
              height: 390,
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
                  strokeColor: config.colors.primary,
                  strokeWidth: 2,
                  size: 6,
                  radius: 8
                }
              ],
              hover: {
                size: 7
              }
            },
            colors: [config.colors.warning, config.colors.primary],
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
              categories: chartOrderMethod.date,   //Change
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
                show: false
              },
              min: 0,
              max: chartOrderMethod.large,
              tickAmount: 4
            }
          };
        if (typeof incomeChartEl !== undefined && incomeChartEl !== null) {
          const incomeChart = new ApexCharts(incomeChartEl, incomeChartConfig);
          incomeChart.render();
        }

      }
    })
  }
  OrderMethodCountChart()



})();

