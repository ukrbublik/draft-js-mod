/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule editOnDragOver
 * @format
 * @flow
 */

'use strict';

import type DraftEditor from 'DraftEditor.react';

/**
 * Drag behavior has begun from outside the editor element.
 */
function editOnDragOver(editor: DraftEditor, e: SyntheticDragEvent<>): void {
  //Fix issue #1454
  //editor._internalDrag = false;
  editor.setMode('drag');
  e.preventDefault();
}

module.exports = editOnDragOver;
