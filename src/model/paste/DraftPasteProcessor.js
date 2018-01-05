/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DraftPasteProcessor
 * @format
 * @flow
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type {DraftBlockRenderMap} from 'DraftBlockRenderMap';
import type {DraftBlockType} from 'DraftBlockType';
import type {DraftInlineStyle} from 'DraftInlineStyle';
import type {EntityMap} from 'EntityMap';

const CharacterMetadata = require('CharacterMetadata');
const ContentBlock = require('ContentBlock');
const ContentBlockNode = require('ContentBlockNode');
const DraftFeatureFlags = require('DraftFeatureFlags');
const Immutable = require('immutable');

const convertFromHTMLtoContentBlocks = require('convertFromHTMLToContentBlocks');
const generateRandomKey = require('generateRandomKey');
const getSafeBodyFromHTML = require('getSafeBodyFromHTML');
const sanitizeDraftText = require('sanitizeDraftText');

const {List, Repeat} = Immutable;

const experimentalTreeDataSupport = DraftFeatureFlags.draft_tree_data_support;
const ContentBlockRecord = experimentalTreeDataSupport
  ? ContentBlockNode
  : ContentBlock;

const DraftPasteProcessor = {
  processHTML(
    html: string,
    blockRenderMap?: DraftBlockRenderMap,
    _postProcessInlineTag?: (
      tag: string,
      node: Node,
      currentStyle: DraftInlineStyle,
    ) => DraftInlineStyle,
  ): ?{contentBlocks: ?Array<BlockNodeRecord>, entityMap: EntityMap} {
    return convertFromHTMLtoContentBlocks(
      html,
      getSafeBodyFromHTML,
      blockRenderMap,
      _postProcessInlineTag,
    );
  },

  processText(
    textBlocks: Array<string>,
    character: CharacterMetadata,
    type: DraftBlockType,
  ): Array<BlockNodeRecord> {
    return textBlocks.reduce((acc, textLine, index) => {
      textLine = sanitizeDraftText(textLine);
      const key = generateRandomKey();

      let blockNodeConfig = {
        key,
        type,
        text: textLine,
        characterList: List(Repeat(character, textLine.length)),
      };

      // next block updates previous block
      if (experimentalTreeDataSupport && index !== 0) {
        const prevSiblingIndex = index - 1;
        // update previous block
        const previousBlock = (acc[prevSiblingIndex] = acc[
          prevSiblingIndex
        ].merge({
          nextSibling: key,
        }));
        blockNodeConfig = {
          ...blockNodeConfig,
          prevSibling: previousBlock.getKey(),
        };
      }

      acc.push(new ContentBlockRecord(blockNodeConfig));

      return acc;
    }, []);
  },
};

module.exports = DraftPasteProcessor;
