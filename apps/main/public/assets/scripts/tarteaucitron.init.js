// `tarteaucitron` as a cookie manager is too complex to configure and badly designed
// We use since it's the recommended way, but we expect an official government way that is clean to adopt (not just about UI like the DSFR shows, but a real manager recommended and maintained)
//
// Everything about "tarteaucitron" below is just workarounds, sorry about this...
// We should still wait for the consent to init some plugins instead of just relying on the cookie removal

tarteaucitron.init({
  privacyUrl: '/privacy',
  bodyPosition: 'bottom',

  hashtag: '#tarteaucitron',
  cookieName: 'tarteaucitron',

  orientation: 'middle',

  groupServices: false,
  serviceDefaultState: 'wait',

  showAlertSmall: false,
  cookieslist: true,

  closePopup: false,

  showIcon: false,

  adblocker: false,

  DenyAllCta: true,
  AcceptAllCta: true,
  highPrivacy: true,

  handleBrowserDNTRequest: true,

  removeCredit: true,
  moreInfoLink: true,

  useExternalCss: true,
  useExternalJs: false,

  readmoreLink: '',

  mandatory: true,
  mandatoryCta: false,
});

tarteaucitron.load();

// Look at https://tarteaucitron.io/en/install/ to know how to install services
// tarteaucitron.user.crispID = 'ID'; // We don't want it to load the script... should be investigated
(tarteaucitron.job = tarteaucitron.job || []).push('crisp');

// If never loaded before, display the alert
// TODO: impossible to make it working... it works after a random delay since their script loads services scripts and some others
// For now don't show an alert on first visit... just leave it in the footer... we just need to plan to aweful library :/

// if (tarteaucitron.cookie.read() === '') {
//   tarteaucitron.userInterface.openAlert();
// }
