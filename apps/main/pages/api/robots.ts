import getConfig from 'next/config';

import devRobotsFile from '@mediature/main/pages/assets/public/dev/robots.txt';
import prodRobotsFile from '@mediature/main/pages/assets/public/prod/robots.txt';

const { publicRuntimeConfig } = getConfig();

export default function handler(req, res) {
  // Only allow indexing in production
  if (publicRuntimeConfig.appMode === 'prod') {
    res.send(prodRobotsFile);
  } else {
    res.send(devRobotsFile);
  }
}
