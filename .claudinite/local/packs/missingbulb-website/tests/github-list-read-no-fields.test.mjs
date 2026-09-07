// Fixture for the github-list-read-no-fields declared check
// (../declared-checks.json): a violating call must find, a clean one must not.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadDeclaredChecks, guardFindings } from '../../../../shared/engine/checks/helpers/pattern-rules.mjs';

const packDir = new URL('..', import.meta.url).pathname;
const rule = loadDeclaredChecks(packDir).find((r) => r.id === 'github-list-read-no-fields');

test('rule is registered', () => {
  assert.ok(rule, 'github-list-read-no-fields is not in this pack\'s declared checks');
});

test('fires on search_issues with no fields', () => {
  const findings = guardFindings(rule, { name: 'mcp__github__search_issues', input: { query: 'is:issue' } });
  assert.equal(findings.length, 1);
  assert.match(findings[0].what, /mcp__github__search_issues/);
});

test('fires on list_issues with no fields', () => {
  const findings = guardFindings(rule, { name: 'mcp__github__list_issues', input: { owner: 'a', repo: 'b' } });
  assert.equal(findings.length, 1);
});

test('stays quiet once fields is passed', () => {
  const findings = guardFindings(rule, {
    name: 'mcp__github__search_issues',
    input: { query: 'is:issue', fields: ['number', 'title'] },
  });
  assert.equal(findings.length, 0);
});

test('stays quiet on a tool this check does not name', () => {
  const findings = guardFindings(rule, { name: 'mcp__github__issue_read', input: { method: 'get' } });
  assert.equal(findings.length, 0);
});
