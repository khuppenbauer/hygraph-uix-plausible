import React, { useState, useEffect } from 'react';
import { Wrapper, useFormSidebarExtension } from '@graphcms/uix-react-sdk';
import ChartComponent from './Chart';
import StatsComponent from './Stats';

const AnalyticsComponent = () => {
  const {
    extension,
    form: { getFieldState },
  } = useFormSidebarExtension();

  const [page, setPage] = useState(null);
  const { sidebarConfig } = extension;
  const {
    PLAUSIBLE_SITE_ID: siteId, PLAUSIBLE_DASHBOARD_AUTH: auth, SLUG_PREFIX: prefix, SLUG_FIELD: slug,
  } = sidebarConfig;
  useEffect(() => {
    getFieldState(slug)
      .then((state) => {
        const { value } = state;
        setPage(value);
      });
  }, [getFieldState, slug]);

  if (page) {
    const style = {
      display: 'block',
      color: '#ffffff',
      paddingTop: '10px',
      margin: '10px 0px',
      background: 'rgb(0, 173, 159)',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '100%',
      height: '40px',
      fontSize: '14px',
      textAlign: 'center',
      textDecoration: 'none',
    };
    return (
      <>
        <ChartComponent page={page} />
        <StatsComponent page={page} />
        <br />
        { auth && <a style={style} href={`https://plausible.io/${siteId}?auth=${auth}&page=${prefix}${page}`} target="_blank">Dashboard</a>}
      </>
    );
  }
  return null;
};

const declaration = {
  extensionType: 'formSidebar',
  name: 'Plausible Analytics',
  description: 'Show Plausible Analytics',
  config: {
    PLAUSIBLE_TOKEN: {
      type: 'string',
      displayName: 'API Token',
      required: true,
    },
  },
  sidebarConfig: {
    PLAUSIBLE_SITE_ID: {
      type: 'string',
      displayName: 'Site ID',
      required: true,
    },
    PLAUSIBLE_DASHBOARD_AUTH: {
      type: 'string',
      displayName: 'Dashboard Auth',
      required: false,
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
    <AnalyticsComponent />
  </Wrapper>
);

export default Analytics;
