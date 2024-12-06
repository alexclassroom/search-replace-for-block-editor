import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { dispatch, select } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { Modal, TextControl, ToggleControl, Button, Tooltip } from '@wordpress/components';

import './styles/app.scss';

import { getAllowedBlocks, getBlockEditorIframe, isCaseSensitive, inContainer } from './utils';
import { Shortcut } from './shortcut';

/**
 * Search & Replace for Block Editor.
 *
 * This function returns a JSX component that comprises
 * the Tooltip, Search Icon, Modal & Shortcut.
 *
 * @since 1.0.0
 *
 * @returns {JSX.Element}
 */
const SearchReplaceForBlockEditor = () => {
  const [replacements, setReplacements] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [replaceInput, setReplaceInput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [context, setContext] = useState(false);

  /**
   * Open Modal.
   *
   * @since 1.0.0
   *
   * @returns {void}
   */
  const openModal = (): void => {
    setIsModalVisible(true);
    setReplacements(0);
    searchInput ? replace(false) : '';
  }

  /**
   * Close Modal.
   *
   * @since 1.0.0
   *
   * @returns {void}
   */
  const closeModal = (): void => {
    setIsModalVisible(false);
    setReplacements(0);
  }

  /**
   * On Selection.
   *
   * Populate the search field when the user selects
   * a text range in the Block Editor.
   *
   * @since 1.2.0
   *
   * @returns {void}
   */
  const handleSelection = () => {
    const selectedText = getBlockEditorIframe().getSelection().toString();
    const modalSelector = '.search-replace-modal';

    if (selectedText && !inContainer(modalSelector)) {
      setSearchInput(selectedText);
    }
  };

  /**
   * Listen for case-sensitivity change.
   *
   * Constantly listen for when the user changes the
   * case-sensitivity.
   *
   * @since 1.3.0
   *
   * @returns {void}
   */
  useEffect(() => {
    replace(false);
  }, [searchInput, caseSensitive]);

  /**
   * Handle case sensitive toggle feature
   * to enable user perform case-sensitive search
   * and replacements.
   *
   * @since 1.1.0
   *
   * @param {boolean} newValue
   */
  const handleCaseSensitive = (newValue: boolean): void => {
    setCaseSensitive( newValue );
  }

  /**
   * Handle the implementation for when the user
   * clicks the 'Replace' button.
   *
   * @since 1.0.0
   *
   * @returns {void}
   */
  const replace = (context = false): void => {
    setContext(context);
    setReplacements(0);

    if (!searchInput) {
      return;
    }

    const pattern = new RegExp(
      `(?<!<[^>]*)${searchInput}(?<![^>]*<)`,
      isCaseSensitive() || caseSensitive ? 'g' : 'gi'
    );

    select('core/block-editor').getBlocks().forEach((element) => {
      recursivelyReplace(element, pattern, replaceInput, context);
    });
  };

  /**
   * Recursively traverse and replace the text in the
   * Block Editor with the user's text. Perform attribute update
   * on a case by case basis based on mutating attribute.
   *
   * @since 1.0.0
   * @since 1.0.1 Handle edge-cases for quote, pullquote & details block.
   *
   * @param {Object} element Gutenberg editor block.
   * @param {string} pattern Search pattern.
   * @param {string} text    Replace pattern.
   *
   * @returns {void}
   */
  const recursivelyReplace = (element, pattern, text, context) => {
    if (getAllowedBlocks().indexOf(element.name) !== -1) {
      const args = { element, pattern, text, context };

      switch (element.name) {
        case 'core/quote':
        case 'core/pullquote':
          replaceBlockAttribute(args, 'citation');
          break;

        case 'core/details':
          replaceBlockAttribute(args, 'summary');
          break;

        default:
          replaceBlockAttribute(args, 'content');
          break;
      }
    }

    if (element.innerBlocks.length) {
      element.innerBlocks.forEach((innerElement) => {
        recursivelyReplace(innerElement, pattern, text, context);
      });
    }
  }

  /**
   * Do the actual job of replacing the string
   * by dispatching the change using the block's clientId
   * as reference.
   *
   * @since 1.0.1
   *
   * @param {Object} args      Args object containing element, pattern and text.
   * @param {string} attribute The attribute to be mutated e.g. content.
   *
   * @returns {void}
   */
  const replaceBlockAttribute = (args, attribute) => {
    const { attributes, clientId } = args.element;

    if (undefined === attributes || undefined === attributes[attribute]) {
      return;
    }

    let oldString: string = attributes[attribute].text || attributes[attribute];
    let newString: string = oldString.replace(args.pattern, () => {
      setReplacements((items) => items + 1);
      return args.text;
    });

    if (newString === oldString) {
      return;
    }

    const property = {};
    property[attribute] = newString;

    if(args.context){
      (dispatch('core/block-editor') as any).updateBlockAttributes(clientId, property);
    }

    // Handle edge-case ('value') with Pullquotes.
    if (attributes.value) {
      if(args.context){
        (dispatch('core/block-editor') as any)
        .updateBlockAttributes(clientId, { value: newString });  
      }
      setReplacements((items) => items + 1);
    }
  }

  /**
   * Listen for Selection.
   *
   * Constantly listen for when the user selects a
   * a text in the Block Editor.
   *
   * @since 1.2.0
   *
   * @returns {void}
   */
  useEffect(() => {
    const editor = getBlockEditorIframe();

    editor.addEventListener(
      'selectionchange', handleSelection
    );

    return () => {
      editor.removeEventListener(
        'selectionchange', handleSelection
      );
    };
  }, []);

  return (
    <>
      <Shortcut onKeyDown={openModal} />
      <Tooltip text={__('Search & Replace', 'search-replace-for-block-editor')}>
        <Button
          icon={ search }
          label={__('Search & Replace', 'search-replace-for-block-editor')}
          onClick={openModal}
        />
      </Tooltip>
      {
        isModalVisible && (
          <Modal
            title={__('Search & Replace', 'search-replace-for-block-editor')}
            onRequestClose={closeModal}
            className="search-replace-modal"
          >
            <div id="search-replace-modal__text-group">
              <TextControl
                type="text"
                label={__('Search')}
                value={searchInput}
                onChange={(value) => setSearchInput(value)}
                placeholder="Lorem ipsum..."
                __nextHasNoMarginBottom
              />
              <TextControl
                type="text"
                label={__('Replace')}
                value={replaceInput}
                onChange={(value) => setReplaceInput(value)}
                __nextHasNoMarginBottom
              />
            </div>

            <div id="search-replace-modal__toggle">
              <ToggleControl
                label={__('Match Case | Expression', 'search-replace-for-block-editor')}
                checked={caseSensitive}
                onChange={handleCaseSensitive}
                __nextHasNoMarginBottom
              />
            </div>

            {
              context ? (
                <div id="search-replace-modal__notification">
                  <p>
                    <strong>{replacements}</strong> {__('item(s) replaced successfully', 'search-replace-for-block-editor')}.
                  </p>
                </div>
              ) : ''
            }

            {
              !context && searchInput ? (
                <div id="search-replace-modal__notification">
                <p>
                  <strong>{replacements}</strong> {__('item(s) found', 'search-replace-for-block-editor')}.
                </p>
              </div>
              ) : ''
            }

            <div id="search-replace-modal__button-group">
              <Button
                variant="primary"
                onClick={() => replace(true)}
              >
                {__('Replace')}
              </Button>
              <Button
                variant="secondary"
                onClick={closeModal}
              >
                {__('Done')}
              </Button>
            </div>
          </Modal>
        )
      }
    </>
  );
};

export default SearchReplaceForBlockEditor;
