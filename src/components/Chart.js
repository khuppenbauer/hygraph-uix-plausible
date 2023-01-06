import React, { useState, useEffect, useMemo } from 'react';
import { useFormSidebarExtension } from '@graphcms/uix-react-sdk';
import { Chart } from 'react-charts';
import { ResizableBox as ReactResizableBox } from 'react-resizable';

const baseUrl = 'https://plausible.io';
const endPoint = '/api/v1/stats/timeseries';
const metrics = 'visitors,pageviews,bounce_rate,visit_duration,visits';
const period = '6mo';

const LineChart = ({ data }) => {
  const width = 200;
  const height = 200;
  const primaryAxis = useMemo(
    () => ({
      getValue: (datum) => datum.primary,
    }),
    [],
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum) => datum.secondary,
        elementType: 'line',
      },
    ],
    [],
  );

  return (
    <div style={{ marginLeft: 20 }}>
      <div
        style={{
          display: 'inline-block',
          background: 'white',
          padding: '.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 30px 40px rgba(0,0,0,.1)',
          width: 'auto',
        }}
      >
        <ReactResizableBox width={width} height={height}>
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <Chart
              options={{
                data,
                primaryAxis,
                secondaryAxes,
              }}
            />
          </div>
        </ReactResizableBox>
      </div>
    </div>
  );
};

const ChartComponent = ({ page }) => {
  const {
    extension,
  } = useFormSidebarExtension();

  const [chartData, setChartData] = useState(null);
  const { sidebarConfig, config } = extension;
  const { PLAUSIBLE_TOKEN: token } = config;
  const { PLAUSIBLE_SITE_ID: siteId } = sidebarConfig;
  const prefix = sidebarConfig.SLUG_PREFIX || '/';

  useEffect(() => {
    const url = `${baseUrl}${endPoint}?site_id=${siteId}&filters=event:page==${prefix}${page}/&metrics=${metrics}&period=${period}`;
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    const req = new Request(url, {
      headers,
      method: 'GET',
    });
    fetch(req)
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          throw new Error(`failed: ${JSON.stringify(data)}`);
        }
        const { results } = data;
        const sum = results.reduce((a, b) => ({ pageviews: a.pageviews + b.pageviews }));
        if (sum.pageviews > 0) {
          const res = metrics.split(',').map((metric) => {
            const items = results.map((item) => (
              {
                primary: item.date,
                secondary: item[metric] || 0,
              }
            ));
            return {
              label: metric,
              data: items,
            };
          });
          setChartData(res);
        }
      });
  }, []);
  if (chartData) {
    return (
      <>
        <p>Letzte 6 Monate</p>
        <LineChart data={chartData} />
      </>
    );
  }
  return null;
};

export default ChartComponent;
