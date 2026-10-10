'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {openInExternalBrowser} = require('../line-links');

const site = 'https://hiderou23-spec.github.io/tsuruta-family-trip-2026/';

test('LINE comment deep link opens externally while preserving item and comment IDs', () => {
  const url = openInExternalBrowser(site + '?familyItem=trip_20261224&comment=comment_42');
  const parsed = new URL(url);
  assert.equal(parsed.origin, 'https://hiderou23-spec.github.io');
  assert.equal(parsed.pathname, '/tsuruta-family-trip-2026/');
  assert.equal(parsed.searchParams.get('familyItem'), 'trip_20261224');
  assert.equal(parsed.searchParams.get('comment'), 'comment_42');
  assert.equal(parsed.searchParams.get('openExternalBrowser'), '1');
});

test('query values and fragments are retained, including encoded Japanese', () => {
  const source = site + '?familyItem=' + encodeURIComponent('クリスマスイブ') +
    '&comment=' + encodeURIComponent('コメント 1') + '#comments';
  const parsed = new URL(openInExternalBrowser(source));
  assert.equal(parsed.searchParams.get('familyItem'), 'クリスマスイブ');
  assert.equal(parsed.searchParams.get('comment'), 'コメント 1');
  assert.equal(parsed.hash, '#comments');
});

test('external-browser setting is not duplicated on repeated application', () => {
  const parsed = new URL(openInExternalBrowser(openInExternalBrowser(site + '?openExternalBrowser=0')));
  assert.deepEqual(parsed.searchParams.getAll('openExternalBrowser'), ['1']);
});

test('both group and individual LINE notification buttons use external browser URLs', () => {
  const source = readFileSync(join(__dirname, '..', 'index.js'), 'utf8');
  const links = source.match(/uri:openInExternalBrowser\(url\)/g) || [];
  assert.equal(links.length, 2);
});
