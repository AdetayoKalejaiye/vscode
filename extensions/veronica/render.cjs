/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const { randomBytes } = require('node:crypto');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

/** Render the design home. Conversations and agent controls live in native chat. */
exports.render = ({ resource, cspSource, t = value => value }) => {
	const nonce = randomBytes(24).toString('base64');
	const label = value => escape(t(value));
	return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${escape(cspSource)}; script-src 'nonce-${nonce}'; img-src ${escape(cspSource)};">
	<link rel="stylesheet" href="${escape(resource('workspace.css'))}"><title>Veronica</title></head><body class="home">
	<header><span class="wordmark">∨ &nbsp; Veronica</span><span class="badge">${label('Design workspace preview')}</span></header>
	<main><section class="intro"><p class="eyebrow">${label('A workspace for the physical world')}</p><h1>${label('What will you build?')}</h1><p class="lede">${label('Start with an idea. Shape it together.')}</p><div class="actions"><button data-action="openProject">${label('Open a project')}</button><button class="secondary" data-action="focusAgent">${label('Work with Veronica')}</button></div></section>
	<section class="design-surface" aria-label="${label('Illustrative design canvas')}"><div class="surface-title"><span>${label('Design workspace')}</span><span class="muted">${label('Illustration · no CAD loaded')}</span></div>
	<svg class="blueprint" viewBox="0 0 600 220" role="img" aria-label="${label('An illustrative mechanical bracket')}"><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" class="grid-line"/></pattern></defs><path fill="url(#grid)" d="M0 0H600V220H0Z"/><g class="part"><path d="m208 134 104 48 96-57-104-48zM208 134V78l96-57v56M304 21l104 48v56M208 78l104 48 96-57M312 126v56"/><ellipse cx="260" cy="131" rx="13" ry="7"/><ellipse cx="355" cy="133" rx="13" ry="7"/><path d="m246 66 57 26 65-38" class="construction"/></g><g class="dimension"><path d="m208 184 104 48m-104-58v20m104 28v20M430 69v56m-8-56h16m-16 56h16"/></g></svg>
	<p class="canvas-caption">${label('Your parts, assemblies, and design decisions will live here.')}</p></section>
	<section class="steps"><article><span class="step-number">01</span><h2>${label('Describe the goal')}</h2><p>${label('Capture what it should do, where it fits, and what matters.')}</p></article><article><span class="step-number">02</span><h2>${label('Review together')}</h2><p>${label('Use the existing chat context attachments and change review controls.')}</p></article><article><span class="step-number">03</span><h2>${label('Stay in control')}</h2><p>${label('Review agent changes with the native diff and approval controls.')}</p></article></section><p class="notice">${label('Use the native chat panel to plan, attach context, and review agent changes. Its existing model and sign-in setup still apply. CAD and machine-control tools are not connected yet.')}</p></main>
	<footer>${label('Design intent first. Every decision reviewable.')}</footer>
	<script nonce="${nonce}" src="${escape(resource('workspace.js'))}"></script></body></html>`;
};
