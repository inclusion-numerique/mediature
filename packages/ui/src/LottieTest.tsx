import { Player } from '@lottiefiles/react-lottie-player';

import cakeAnimation from './animations/lottie_test.json';

export const LottieTest = () => {
  return <Player autoplay loop={false} src={cakeAnimation} style={{ height: '300px', width: '300px' }}></Player>;
};
