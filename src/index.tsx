import {
    __experimentalFullscreenModeClose as FullscreenModeClose,
    __experimentalMainDashboardButton as MainDashboardButton,
} from '@wordpress/edit-post';
import { __ , setLocaleData } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { Modal, TextControl, Button } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { search } from '@wordpress/icons';

import './styles.scss';

import replace from './utils/replace';

setLocaleData( { '': {} }, 'search-replace-for-block-editor' );

const SearchReplaceForBlockEditor = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [replaceInput, setReplaceInput] = useState('');

  const openModal = () => {
    setIsModalVisible(true);
  }

  const closeModal = () => {
    setIsModalVisible(false);
  }

  /**
   * Handle the implementation for when the user
   * clicks the 'Replace' button.
   *
   * @return {void}
   */
  const replace = () => {
    setReplacements(0);

    const pattern = new RegExp(
      `(?<!<[^>]*)${searchInput}(?<![^>]*<)`,
      'gi'
    );

    select('core/block-editor').getBlocks().forEach((element) => {
      recursivelyReplace(element, pattern, replaceInput);
    });
  };

  /**
   * Recursively traverse and replace the text in the
   * Block Editor with the user's text.
   *
   * @param {Object} element Gutenberg editor block.
   * @param {string} pattern Search pattern.
   * @param {string} text    Replace pattern.
   */
  const recursivelyReplace = (element, pattern, text) => {
    if ([].indexOf(element.name) === -1) {
      replaceString(element, pattern, text);
    }

    if (element.innerBlocks.length) {
      element.innerBlocks.forEach((innerElement) => {
        recursivelyReplace(innerElement, pattern, text);
      });
    }
  }

  /**
   * Do the actual job of replacing the string
   * by dispatching the change using the block's clientID
   * as reference.
   *
   * @param {Object} element Gutenberg editor block.
   * @param {string} pattern Search pattern.
   * @param {string} text    Replace pattern.
   */
  const replaceString = (element, pattern, text) => {
    const { name, attributes, clientId } = element;
    let oldString = '';
    let newString = '';

    oldString = 'core/list' === name ? attributes.values : attributes.content;
    newString = oldString.replace(pattern, () => {
      setReplacements((items) => items + 1);
      return text;
    });

    if (newString === oldString) {
      return;
    }

    if ('core/list' === name) {
      (dispatch('core/block-editor') as any).updateBlockAttributes(
        clientId,
        {
          values: newString
        }
      );
    } else {
      (dispatch('core/block-editor') as any).updateBlockAttributes(
        clientId,
        {
          content: newString
        }
      );
    }
  };

  return (
    <MainDashboardButton>
      <FullscreenModeClose />
      <Button
        icon={search}
        onClick={openModal}
      />
      {
        isModalVisible && (
          <Modal
            title={__('Search & Replace')}
            onRequestClose={closeModal}
            className="search-replace-modal"
          >
            <Container className="search-replace-modal__text-group">
              <TextControl
                type="text"
                label={__('Search')}
                value={searchInput}
                onChange={(value)=>setSearchInput(value)}
                placeholder="Lorem ipsum..."
              />
              <TextControl
                type="text"
                label={__('Replace')}
                value={replaceInput}
                onChange={(value)=>setReplaceInput(value)}
              />
            </Container>
            <Container className="search-replace-modal__button-group">
              <Button
                variant="primary"
                onClick={replace}
              >
                {__('Replace')}
              </Button>
              <Button
                variant="secondary"
                onClick={closeModal}
              >
                {__('Done')}
              </Button>
            </Container>
          </Modal>
        )
      }
    </MainDashboardButton>
  );
};

registerPlugin( 'search-replace-for-block-editor', {
  render: SearchReplaceForBlockEditor,
} );
