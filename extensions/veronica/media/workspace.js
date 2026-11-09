/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(() => {
	const api = acquireVsCodeApi();
	const byId = id => document.getElementById(id);
	const label = id => byId(`label-${id}`).content.textContent;
	let brief;
	const initial = api.getState();
	byId('prompt').value = initial?.prompt || '';
	byId('attach').checked = initial?.attach === true;
	const persist = () => api.setState({ prompt: byId('prompt').value, attach: byId('attach').checked });
	byId('prompt').addEventListener('input', persist);
	byId('attach').addEventListener('change', persist);
	byId('composer').addEventListener('submit', event => {
		event.preventDefault();
		const prompt = byId('prompt').value.trim();
		if (prompt) { api.postMessage({ type: 'createBrief', prompt, attach: byId('attach').checked }); }
	});
	for (const button of document.querySelectorAll('[data-action]')) {
		button.addEventListener('click', () => api.postMessage({ type: button.dataset.action, id: brief?.id }));
	}
	window.addEventListener('message', event => {
		if (event.data?.type !== 'state') { return; }
		brief = event.data.brief;
		byId('project').textContent = event.data.project;
		byId('review').hidden = !brief;
		if (!brief) { return; }
		const approved = brief.status === 'approved';
		byId('review-title').textContent = label(approved ? 'approved' : 'review');
		byId('status').textContent = label(approved ? 'approved' : 'review');
		byId('brief-prompt').textContent = brief.prompt;
		byId('reference').textContent = brief.reference || '';
		byId('reference').hidden = !brief.reference;
		byId('review-note').textContent = label(approved ? 'note-approved' : 'note-review');
		byId('approve').hidden = approved;
		byId('discard').hidden = approved;
		byId('undo').hidden = !approved;
		// Preserve an in-progress edit when the other surface changes the saved brief.
		if (!byId('prompt').value) { byId('prompt').value = brief.prompt; }
	});
	api.postMessage({ type: 'ready' });
})();
