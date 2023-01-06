import React, { useState, useEffect, useMemo } from 'react';
import { useFormSidebarExtension } from '@graphcms/uix-react-sdk';

const baseUrl = 'https://plausible.io';
const endPoint = '/api/v1/stats/breakdown';
const metrics = 'visitors,events';
const property = 'event:name';

const StatsComponent = ({ page }) => {
  const {
    extension,
  } = useFormSidebarExtension();

  const [statsData, setStatsData] = useState(null);
  const { sidebarConfig, config } = extension;
  const { PLAUSIBLE_TOKEN: token } = config;
  const { PLAUSIBLE_SITE_ID: siteId, SLUG_PREFIX: prefix } = sidebarConfig;

  useEffect(() => {
    const url = `${baseUrl}${endPoint}?site_id=${siteId}&filters=event:page==${prefix}${page}**&metrics=${metrics}&property=${property}`;
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
        setStatsData(results);
      });
  }, []);
  if (statsData) {
    return statsData.map((data) => {
      const { name, events, visitors } = data;
      const label = name === 'pageview' ? 'Seitenansichten' : name;
      return (
        <>
          <p>Gesamt</p>
          <div key={name}>
            {label}: {events} Besucher: {visitors}
          </div>
        </>
      );
    });
  }
  return null;
};

export default StatsComponent;
