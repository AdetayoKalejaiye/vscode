/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createBrief, transitionBrief } = require('../model.cjs');
const { render } = require('../render.cjs');

const settle = () => new Promise(resolve => setImmediate(resolve));

/** A small extension API boundary mock; no editor internals or DOM behavior are stubbed. */
function activate({ restored = false, activeFile = false, saved } = {}) {
	const commands = new Map();
	const messages = [];
	const notices = [];
	const storage = new Map(saved ? [['veronica.brief', saved]] : []);
	let receive;
	let provider;
	const disposable = { dispose() {} };
	const webview = {
		cspSource: 'https://webview.example', asWebviewUri: uri => uri,
		postMessage: message => messages.push(message),
		onDidReceiveMessage: callback => { receive = callback; return disposable; }
	};
	const view = { webview, onDidChangeVisibility: () => disposable, onDidDispose: () => disposable };
	const vscode = {
		l10n: { t: (text, ...args) => text.replace(/\{(\d+)\}/g, (_, i) => args[i]) },
		Uri: { joinPath: (...segments) => segments.join('/') }, ViewColumn: { One: 1 },
		workspace: {
			name: '<Project>', getConfiguration: () => ({ get: () => true }),
			getWorkspaceFolder: () => activeFile ? {} : undefined, asRelativePath: () => 'parts/bracket.step',
			openTextDocument: async options => options
		},
		window: {
			activeTextEditor: activeFile ? { document: { uri: 'project/parts/bracket.step' } } : undefined,
			tabGroups: { all: [{ tabs: restored ? [{}] : [] }] },
			registerWebviewViewProvider: (_, value) => { provider = value; return disposable; },
			createWebviewPanel: () => ({ ...view, reveal() {} }),
			showInformationMessage: message => notices.push(message), showErrorMessage: message => notices.push(message),
			showTextDocument: async document => { messages.push({ document }); }
		},
		commands: {
			registerCommand: (id, callback) => { commands.set(id, callback); return disposable; },
			executeCommand: async id => commands.get(id)?.()
		}
	};
	const context = { exports: {}, require: id => id === 'vscode' ? vscode : require(path.join(__dirname, '..', id)) };
	vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../extension.cjs'), 'utf8'), context);
	context.exports.activate({ extensionUri: '/veronica', subscriptions: [], workspaceState: { get: key => storage.get(key), update: async (key, value) => storage.set(key, value) } });
	provider.resolveWebviewView(view);
	return { messages, notices, storage, webview, send: async message => { receive(message); await settle(); }, commands };
}

test('approval requires review and undo returns to review without changing intent', () => {
	const brief = createBrief('  Make a bracket  ', 'parts/bracket.step');
	const approved = transitionBrief(brief, 'approve');
	assert.deepEqual({ status: approved.status, prompt: approved.prompt, reference: approved.reference, undo: transitionBrief(approved, 'undo'), forbiddenDiscard: transitionBrief(approved, 'discard'), discarded: transitionBrief(brief, 'discard') }, { status: 'approved', prompt: 'Make a bracket', reference: 'parts/bracket.step', undo: brief, forbiddenDiscard: approved, discarded: undefined });
});

test('host persists briefs, rejects stale approvals, and exports without writing files', async () => {
	const host = activate({ activeFile: true });
	await host.send({ type: 'createBrief', prompt: '<script>alert(1)</script>', attach: true });
	const brief = host.storage.get('veronica.brief');
	await host.send({ type: 'approve', id: 'stale' });
	assert.equal(host.storage.get('veronica.brief').status, 'review');
	await host.send({ type: 'approve', id: brief.id });
	await host.send({ type: 'export', id: brief.id });
	assert.deepEqual({ status: host.storage.get('veronica.brief').status, reference: brief.reference, export: host.messages.at(-1).document.language, notices: host.notices }, { status: 'approved', reference: 'parts/bracket.step', export: 'markdown', notices: [] });
	await host.send({ type: 'undo', id: brief.id });
	await host.send({ type: 'discard', id: brief.id });
	assert.equal(host.storage.get('veronica.brief'), undefined);
});

test('host rejects invalid prompts and explains a missing active file', async () => {
	const host = activate();
	for (const message of [null, {}, { type: 'createBrief', prompt: '' }, { type: 'createBrief', prompt: 'x'.repeat(12001) }, { type: 'createBrief', prompt: 'Bracket', attach: true }]) { await host.send(message); }
	assert.deepEqual({ saved: host.storage.size, notices: host.notices }, { saved: 0, notices: ['Open a project file in the editor before referencing it.'] });
});

test('restored tabs are not replaced and persisted brief is sent when a view is ready', async () => {
	const saved = createBrief('Make a linkage');
	const host = activate({ restored: true, saved });
	assert.equal(host.webview.html.includes('class="agent"'), true);
	await host.send({ type: 'ready' });
	assert.deepEqual(host.messages.at(-1).brief, saved);
});

test('webview uses nonce CSP, escaped translations, and external scripts', () => {
	const html = render({ kind: 'home', resource: file => `https://webview.example/${file}`, cspSource: 'https://webview.example', t: value => value === 'What will you build?' ? '<script>bad</script>' : value });
	assert.equal(html.includes('<script>bad</script>'), false);
	assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;/);
	assert.match(html, /default-src 'none'/);
	assert.match(html, /script-src 'nonce-[^']+'/);
	assert.equal(html.includes('unsafe-inline'), false);
});
