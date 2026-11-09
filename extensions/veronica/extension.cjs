/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode = require('vscode');
const { render } = require('./render.cjs');

/** Brand the design home and delegate all agent interaction to the native chat workbench. */
exports.activate = context => {
	let panel;
	const t = (...args) => vscode.l10n.t(...args);
	context.subscriptions.push(vscode.commands.registerCommand('veronica.focusAgent', () =>
		// Do not supply a query: opening the existing conversation must never submit a prompt.
		vscode.commands.executeCommand('workbench.action.chat.open')
	));
	context.subscriptions.push(vscode.commands.registerCommand('veronica.openHome', () => {
		if (panel) { panel.reveal(); return; }
		panel = vscode.window.createWebviewPanel('veronica.home', t('Veronica · Design Home'), vscode.ViewColumn.One, {});
		const current = panel;
		current.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] };
		current.webview.html = render({ t, resource: name => current.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', name)).toString(), cspSource: current.webview.cspSource });
		const receive = current.webview.onDidReceiveMessage(async message => {
			try {
				if (message?.type === 'openProject') { await vscode.commands.executeCommand('vscode.openFolder'); }
				if (message?.type === 'focusAgent') { await vscode.commands.executeCommand('veronica.focusAgent'); }
			} catch {
				vscode.window.showErrorMessage(t('Veronica could not open this view. Please try again.'));
			}
		});
		const cleanup = current.onDidDispose(() => { receive.dispose(); panel = undefined; cleanup.dispose(); });
	}));
	context.subscriptions.push({ dispose: () => panel?.dispose() });
	if (vscode.workspace.getConfiguration('veronica').get('openHomeOnStartup') && vscode.window.tabGroups.all.every(group => group.tabs.length === 0)) {
		vscode.commands.executeCommand('veronica.openHome');
		vscode.commands.executeCommand('veronica.focusAgent');
	}
};
