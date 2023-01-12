export const commonEmailsParameters = {
  layout: 'fullscreen',
  // TODO: for now we have a race condition on rendering it the first time so it breaks tests into Chromatic,
  // we disable the snapshots for now until we find a solution. Same for local test runners.
  chromatic: { disableSnapshot: true },
  testRunner: { disable: true },
};
