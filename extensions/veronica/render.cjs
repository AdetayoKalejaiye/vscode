/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const { randomBytes } = require('node:crypto');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

/** Build trusted markup; user content is inserted with textContent by the webview script. */
exports.render = ({ kind, resource, cspSource, t = value => value }) => {
	const nonce = randomBytes(24).toString('base64');
	const label = value => escape(t(value));
	const home = kind === 'home';
	return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${escape(cspSource)}; script-src 'nonce-${nonce}'; img-src ${escape(cspSource)};">
	<link rel="stylesheet" href="${escape(resource('workspace.css'))}"><title>Veronica</title></head><body class="${home ? 'home' : 'agent'}">
	<header><span class="wordmark">∨ &nbsp; Veronica</span><span class="badge">${label('Interface preview')}</span></header>
	${home ? `<main><section class="intro"><p class="eyebrow">${label('A workspace for the physical world')}</p><h1>${label('What will you build?')}</h1><p class="lede">${label('Start with an idea. Shape it together.')}</p><div class="actions"><button data-action="openProject">${label('Open a project')}</button><button class="secondary" data-action="focusAgent">${label('Work with Veronica')} ↗</button></div></section>
	<section class="design-surface" aria-label="${label('Illustrative design canvas')}"><div class="surface-title"><span>${label('Design workspace')}</span><span class="muted">${label('Illustration · no CAD loaded')}</span></div>
	<svg class="blueprint" viewBox="0 0 600 220" role="img" aria-label="${label('An illustrative mechanical bracket')}"><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" class="grid-line"/></pattern></defs><path fill="url(#grid)" d="M0 0H600V220H0Z"/><g class="part"><path d="m208 134 104 48 96-57-104-48zM208 134V78l96-57v56M304 21l104 48v56M208 78l104 48 96-57M312 126v56"/><ellipse cx="260" cy="131" rx="13" ry="7"/><ellipse cx="355" cy="133" rx="13" ry="7"/><path d="m246 66 57 26 65-38" class="construction"/></g><g class="dimension"><path d="m208 184 104 48m-104-58v20m104 28v20M430 69v56m-8-56h16m-16 56h16"/></g></svg>
	<p class="canvas-caption">${label('Your parts, assemblies, and design decisions will live here.')}</p></section>
	<section class="steps"><article><span class="step-number">01</span><h2>${label('Describe the goal')}</h2><p>${label('Capture what it should do, where it fits, and what matters.')}</p></article><article><span class="step-number">02</span><h2>${label('Review together')}</h2><p>${label('Keep the brief and project context visible before approving.')}</p></article><article><span class="step-number">03</span><h2>${label('Stay in control')}</h2><p>${label('Approve a brief or send it back. Execution comes later.')}</p></article></section></main>` : `<main><section class="assistant-intro"><p class="eyebrow">${label('Design with Veronica')}</p><h1>${label('From idea to something real.')}</h1><p>${label('Describe a part, a mechanism, or a problem you want to solve.')}</p></section>`}
	<section class="brief-section ${home ? 'home-brief' : ''}" aria-label="${label('Design brief')}">
	<div class="section-heading"><h2>${label('Design brief')}</h2><span id="project" class="muted"></span></div>
	<p class="notice">${label('No agent connected. This preview captures and reviews briefs; it does not generate CAD or run tools.')}</p>
	<form id="composer"><label for="prompt">${label('What would you like to make?')}</label><textarea id="prompt" rows="5" maxlength="12000" required placeholder="${label('A compact desk lamp with an adjustable arm. It should fit on a small desk and be easy to assemble…')}"></textarea>
	<div class="context-row"><label><input id="attach" type="checkbox"> ${label('Reference the active file')}</label><span class="muted">${label('Path only')}</span></div>
	<div class="actions"><button type="submit">${label('Review brief')} ↑</button></div></form>
	<article id="review" hidden aria-live="polite"><div class="section-heading"><h3 id="review-title"></h3><span id="status" class="badge"></span></div><p id="brief-prompt" class="brief-text"></p><p id="reference" class="muted"></p><p id="review-note"></p><div class="actions"><button data-action="approve" id="approve">${label('Approve brief')}</button><button data-action="undo" id="undo" hidden>${label('Undo approval')}</button><button data-action="discard" id="discard" class="secondary">${label('Discard')}</button><button data-action="export" class="secondary">${label('Open as document')}</button></div><p class="muted">${label('Approving saves this brief in workspace history only. No design files are changed.')}</p></article>
	</section>${home ? '' : '</main>'}
	<footer>${label('Design intent first. Every decision reviewable.')}</footer>
	<template id="label-review">${label('Ready for your review')}</template><template id="label-approved">${label('Brief approved')}</template><template id="label-note-review">${label('Check the requirements and reference before approving. You can edit the brief above and review it again.')}</template><template id="label-note-approved">${label('Your brief is approved. An agent connection is needed before any design work can begin.')}</template><template id="label-replace">${label('Reviewing a new brief replaces the current brief in this preview.')}</template>
	<script nonce="${nonce}" src="${escape(resource('workspace.js'))}"></script></body></html>`;
};
