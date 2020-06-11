module.exports = {
  testPathForConsistencyCheck: 'resources/pages/index.test.js',
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    testPath
      .replace(/\.test\.([tj]sx?)/, `${snapshotExtension}.$1`)
      .replace(/resources([/\\]pages)/, '/resources/test/__snapshots__'),
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace(snapshotExtension, '.test')
}
