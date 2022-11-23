import { Player } from '@lottiefiles/react-lottie-player';

export const LottieTest = () => {
  return (
    <Player
      autoplay
      loop={false}
      src="https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json"
      style={{ height: '300px', width: '300px' }}
    ></Player>
  );
};
