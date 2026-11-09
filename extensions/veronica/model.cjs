/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const { randomUUID } = require('node:crypto');

/** Store the user's brief, never an invented agent response. */
exports.createBrief = (prompt, reference) => ({ id: randomUUID(), prompt: prompt.trim(), reference, status: 'review' });

/** Only a pending review can be approved; only an approval can be undone. */
exports.transitionBrief = (brief, action) => {
	if (action === 'approve' && brief.status === 'review') { return { ...brief, status: 'approved' }; }
	if (action === 'undo' && brief.status === 'approved') { return { ...brief, status: 'review' }; }
	if (action === 'discard' && brief.status === 'review') { return undefined; }
	return brief;
};
