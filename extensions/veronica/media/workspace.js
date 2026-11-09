/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(() => {
	const api = acquireVsCodeApi();
	for (const button of document.querySelectorAll('[data-action]')) {
		button.addEventListener('click', () => api.postMessage({ type: button.dataset.action }));
	}
})();
