/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { render } = require('../render.cjs');

/** Mock the public command boundary to verify that the home reuses native chat. */
function activate({ restored = false, startup = true } = {}) {
	const commands = new Map();
	const calls = [];
	let receive;
	const disposable = { dispose() {} };
	const webview = {
		cspSource: 'https://webview.example', asWebviewUri: uri => uri,
		onDidReceiveMessage: callback => { receive = callback; return disposable; }
	};
	const vscode = {
		l10n: { t: text => text }, Uri: { joinPath: (...segments) => segments.join('/') }, ViewColumn: { One: 1 },
		workspace: { getConfiguration: () => ({ get: () => startup }) },
		window: {
			tabGroups: { all: [{ tabs: restored ? [{}] : [] }] },
			createWebviewPanel: () => ({ webview, reveal() {}, onDidDispose: () => disposable }),
			showErrorMessage: message => calls.push(['error', message])
		},
		commands: {
			registerCommand: (id, callback) => { commands.set(id, callback); return disposable; },
			executeCommand: async (...args) => { calls.push(args); return commands.get(args[0])?.(); }
		}
	};
	const context = { exports: {}, require: id => id === 'vscode' ? vscode : require(path.join(__dirname, '..', id)) };
	vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../extension.cjs'), 'utf8'), context);
	context.exports.activate({ extensionUri: '/veronica', subscriptions: [] });
	return { calls, commands, webview, send: async message => receive(message) };
}

test('fresh startup opens design home and native chat without submitting a query', () => {
	const host = activate();
	assert.deepEqual(host.calls, [['veronica.openHome'], ['veronica.focusAgent'], ['workbench.action.chat.open']]);
});

test('restored tabs and disabled startup are respected', () => {
	assert.deepEqual([activate({ restored: true }).calls, activate({ startup: false }).calls], [[], []]);
});

test('home routes only supported actions through native commands', async () => {
	const host = activate();
	host.calls.length = 0;
	await host.send({ type: 'focusAgent', query: 'Do not submit this' });
	await host.send({ type: 'openProject' });
	await host.send({ type: 'executeTool' });
	await host.send(null);
	assert.deepEqual(host.calls, [['veronica.focusAgent'], ['workbench.action.chat.open'], ['vscode.openFolder']]);
});

test('home renders safely without a duplicate chat composer', () => {
	const html = render({ resource: file => `https://webview.example/${file}`, cspSource: 'https://webview.example', t: value => value === 'What will you build?' ? '<script>bad</script>' : value });
	assert.equal(html.includes('<script>bad</script>'), false);
	assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;/);
	assert.match(html, /default-src 'none'/);
	assert.match(html, /script-src 'nonce-[^']+'/);
	assert.equal(html.includes('unsafe-inline') || html.includes('<textarea') || html.includes('id="composer"'), false);
});
