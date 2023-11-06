import { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';

import devRobotsFile from '@mediature/main/src/pages/assets/public/dev/robots.txt';
import prodRobotsFile from '@mediature/main/src/pages/assets/public/prod/robots.txt';
import { apiHandlerWrapper } from '@mediature/main/src/utils/api';

const { publicRuntimeConfig } = getConfig();

export function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow indexing in production
  if (publicRuntimeConfig.appMode === 'prod') {
    res.send(prodRobotsFile);
  } else {
    res.send(devRobotsFile);
  }
}

export default apiHandlerWrapper(handler);
