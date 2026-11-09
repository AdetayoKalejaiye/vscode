/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode = require('vscode');
const { render } = require('./render.cjs');
const { createBrief, transitionBrief } = require('./model.cjs');

/** Register the dependency-free Veronica UI shell. No model requests or CAD operations run here. */
exports.activate = context => {
	const surfaces = new Set();
	let panel;
	let brief = context.workspaceState.get('veronica.brief');
	let pending = Promise.resolve();
	const t = (...args) => vscode.l10n.t(...args);
	const snapshot = () => ({ brief, project: vscode.workspace.name || t('No project open') });
	const broadcast = () => {
		for (const surface of surfaces) {
			surface.postMessage({ type: 'state', ...snapshot() });
		}
	};
	const save = async next => {
		await context.workspaceState.update('veronica.brief', next);
		brief = next;
		broadcast();
	};
	const handle = async message => {
		if (!message || typeof message.type !== 'string') { return; }
		switch (message.type) {
			case 'ready': broadcast(); break;
			case 'openProject': await vscode.commands.executeCommand('vscode.openFolder'); break;
			case 'focusAgent': await vscode.commands.executeCommand('veronica.agentView.focus'); break;
			case 'createBrief': {
				if (typeof message.prompt !== 'string' || !message.prompt.trim() || message.prompt.length > 12000) { return; }
				const file = message.attach === true ? vscode.window.activeTextEditor?.document.uri : undefined;
				if (message.attach === true && (!file || !vscode.workspace.getWorkspaceFolder(file))) {
					vscode.window.showInformationMessage(t('Open a project file in the editor before referencing it.'));
					return;
				}
				const reference = file ? vscode.workspace.asRelativePath(file) : undefined;
				await save(createBrief(message.prompt, reference));
				break;
			}
			case 'approve': case 'undo': case 'discard':
				if (brief && message.id === brief.id) { await save(transitionBrief(brief, message.type)); }
				break;
			case 'export': {
				if (!brief || message.id !== brief.id) { return; }
				const text = ['# Veronica', '', brief.prompt, '', t('Status: {0}', brief.status === 'approved' ? t('Approved') : t('Awaiting review')), '', brief.reference || '', '', t('Interface preview only. No CAD changes have been made.')].join('\n');
				await vscode.window.showTextDocument(await vscode.workspace.openTextDocument({ content: text, language: 'markdown' }));
				break;
			}
		}
	};
	const attach = (webview, kind, disposables) => {
		webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] };
		surfaces.add(webview);
		webview.html = render({ kind, t, resource: name => webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', name)).toString(), cspSource: webview.cspSource });
		disposables.push(webview.onDidReceiveMessage(message => {
			// Serialize updates from both surfaces so review actions cannot race each other.
			pending = pending.then(() => handle(message)).catch(() => {
				vscode.window.showErrorMessage(t('Veronica could not complete this action. Please try again.'));
			});
		}));
	};
	context.subscriptions.push(vscode.window.registerWebviewViewProvider('veronica.agentView', {
		resolveWebviewView: view => {
			const disposables = [];
			attach(view.webview, 'agent', disposables);
			disposables.push(view.onDidChangeVisibility(() => { if (view.visible) { broadcast(); } }));
			const cleanup = view.onDidDispose(() => {
				surfaces.delete(view.webview);
				for (const disposable of disposables) { disposable.dispose(); }
				cleanup.dispose();
			});
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('veronica.openHome', () => {
		if (panel) { panel.reveal(); return; }
		panel = vscode.window.createWebviewPanel('veronica.home', t('Veronica · Design Home'), vscode.ViewColumn.One, {});
		const current = panel;
		const disposables = [];
		attach(current.webview, 'home', disposables);
		const cleanup = current.onDidDispose(() => {
			surfaces.delete(current.webview);
			for (const disposable of disposables) { disposable.dispose(); }
			panel = undefined;
			cleanup.dispose();
		});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('veronica.focusAgent', () => vscode.commands.executeCommand('veronica.agentView.focus')));
	context.subscriptions.push({ dispose: () => panel?.dispose() });
	if (vscode.workspace.getConfiguration('veronica').get('openHomeOnStartup') && vscode.window.tabGroups.all.every(group => group.tabs.length === 0)) {
		vscode.commands.executeCommand('veronica.openHome');
		vscode.commands.executeCommand('veronica.focusAgent');
	}
};
