import { applyFilters } from '@wordpress/hooks';
import { getBlockTypes } from '@wordpress/blocks';

/**
 * Allowed Blocks.
 *
 * This function filters the list of text blocks
 * using the `allowedBlocks` hook.
 *
 * @since 1.0.0
 *
 * @returns {string[]}
 */
export const getAllowedBlocks = () => {
  /**
   * Allow Text Blocks.
   *
   * Filter and allow only these Specific blocks
   * for the Search & Replace.
   *
   * @since 1.0.0
   *
   * @param {string[]} blocks List of Blocks.
   * @returns {string[]}
   */
  return applyFilters('search-replace-for-block-editor.allowedBlocks', getTextBlocks()) as string[];
}

/**
 * Get Text Blocks.
 *
 * This function grabs the list of text blocks
 * and returns the block names.
 *
 * @since 1.0.0
 *
 * @returns {string[]}
 */
const getTextBlocks = () => getBlockTypes()
  .filter((block) => {
    return !!(block.category === 'text');
  })
  .map((block) => {
    return block.name;
  });
