const gitRevision = require('git-rev-sync');

function getGitRevisionDate() {
  return gitRevision.date().toISOString().split('.')[0].replace(/\D/g, ''); // Remove milliseconds and keep only digits
}

function getHumanVersion() {
  const gitTag = gitRevision.tag();

  // If no commit tag, use the technical version since it's not a production deployment
  if (gitTag === gitRevision.long()) {
    return getTechnicalVersion();
  } else {
    return gitTag;
  }
}

function getTechnicalVersion() {
  const revisionDate = getGitRevisionDate();

  return `v${process.env.npm_package_version}-${revisionDate}-${gitRevision.short(null, 12)}`;
}

module.exports = {
  getGitRevisionDate,
  getHumanVersion,
  getTechnicalVersion,
};
