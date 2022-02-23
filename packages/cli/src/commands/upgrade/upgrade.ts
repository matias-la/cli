async function upgrade() {
  throw new Error('upgrade command disabled by Exodus audit team due to security reasons');
}
const upgradeCommand = {
  name: 'upgrade [version]',
  description:
    "Upgrade your app's template files to the specified or latest npm version using `rn-diff-purge` project. Only valid semver versions are allowed.",
  func: upgrade,
};
export default upgradeCommand;
