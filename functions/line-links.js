'use strict';

function openInExternalBrowser(url) {
  const target = new URL(url);
  target.searchParams.set('openExternalBrowser', '1');
  return target.toString();
}

module.exports = { openInExternalBrowser };
