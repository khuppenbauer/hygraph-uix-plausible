import React, { useState, useEffect } from 'react';
import { Wrapper, useFormSidebarExtension } from '@graphcms/uix-react-sdk';

const baseUrl = 'https://plausible.io';
const endPoint = '/api/v1/stats/aggregate';
const period = '6mo';

const Stats = () => {
  const {
    extension,
    form: { getFieldState },
  } = useFormSidebarExtension();

  const [visitors, setVisitors] = useState(0);
  const { sidebarConfig, config } = extension;
  const { PLAUSIBLE_TOKEN: token } = config;
  const { PLAUSIBLE_SITE_ID: siteId, SLUG_PREFIX: prefix, SLUG_FIELD: slug } = sidebarConfig;

  useEffect(() => {
    getFieldState(slug)
      .then((state) => {
        const { value: page } = state;
        const url = `${baseUrl}${endPoint}?site_id=${siteId}&period=${period}&filters=event:page==${prefix}${page}`;
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
            const { results: { visitors: { value } } } = data;
            setVisitors(value);
          });
      });
  }, [getFieldState, slug]);

  return (
    <div>Visitors: {visitors}</div>
  );
};

const declaration = {
  extensionType: 'formSidebar',
  name: 'Plausible Analytics',
  description: 'Show Plausible Analytics',
  config: {
    PLAUSIBLE_TOKEN: {
      type: 'string',
      displayName: 'Token',
      required: true,
    },
  },
  sidebarConfig: {
    PLAUSIBLE_SITE_ID: {
      type: 'string',
      displayName: 'Site ID',
      required: true,
    },
    SLUG_PREFIX: {
      type: 'string',
      displayName: 'Slug Prefix',
      required: false,
    },
    SLUG_FIELD: {
      type: 'string',
      displayName: 'Slug Field',
      required: true,
    },
  },
};

const Analytics = () => (
  <Wrapper declaration={declaration}>
    <Stats />
  </Wrapper>
);

export default Analytics;
