import ReactGA from 'react-ga';

export const trackFeatureEvent = (action) => {
  ReactGA.event({
    category: 'Feature',
    action,
  });
};
