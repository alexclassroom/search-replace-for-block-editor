interface Window {
	srfbe: {
		wpVersion: string;
	};
}

describe( 'getTextBlocks', () => {
	beforeEach( () => {
		jest.resetModules();
	} );

	it( 'getAllowedBlocks passes and returns default Text Blocks', () => {
		const { getAllowedBlocks } = require( '../src/core/utils' );

		const blocks = getAllowedBlocks();

		expect( blocks ).toEqual( [
			'core/paragraph',
			'core/heading',
			'core/list',
			'core/list-item',
			'core/quote',
			'core/code',
			'core/details',
			'core/missing',
			'core/preformatted',
			'core/pullquote',
			'core/table',
			'core/verse',
			'core/footnotes',
			'core/freeform',
		] );
		expect( blocks.length ).toBe( 14 );
	} );

	it( 'getAllowedBlocks returns limited number of Text Blocks', () => {
		jest.doMock( '@wordpress/blocks', () => ( {
			getBlockTypes: jest.fn( () => [
				{ name: 'core/paragraph' },
				{ category: 'text', name: 'core/paragraph' },
				{ category: 'image', name: 'core/image' },
				{ category: 'text', name: 'core/pullquote' },
				{ category: 'text', name: 'core/preformatted' },
			] ),
		} ) );

		const { getAllowedBlocks } = require( '../src/core/utils' );

		const blocks = getAllowedBlocks();

		expect( blocks.length ).toBe( 3 );
	} );

	it( 'getTextBlocks passes and returns Blocks in the `text` category', () => {
		jest.doMock( '@wordpress/blocks', () => ( {
			getBlockTypes: jest.fn( () => [
				1,
				'string',
				true,
				null,
				undefined,
				[],
				{},
				{ name: 'core/paragraph' },
				{ category: 'text', name: 'core/paragraph' },
				{ category: 'image', name: 'core/image' },
				{ category: 'text', name: 'core/pullquote' },
				{ category: 'text', name: 'core/preformatted' },
			] ),
		} ) );

		const { getTextBlocks } = require( '../src/core/utils' );

		const blocks = getTextBlocks();

		expect( blocks ).toEqual( [
			'core/paragraph',
			'core/pullquote',
			'core/preformatted',
		] );
	} );

	it( 'getTextBlocks passes and returns Length of Blocks', () => {
		jest.doMock( '@wordpress/blocks', () => ( {
			getBlockTypes: jest.fn( () => [
				1,
				'string',
				true,
				null,
				undefined,
				[],
				{},
				{ name: 'core/paragraph' },
				{ category: 'text', name: 'core/paragraph' },
				{ category: 'image', name: 'core/image' },
				{ category: 'text', name: 'core/pullquote' },
				{ category: 'text', name: 'core/preformatted' },
			] ),
		} ) );

		const { getTextBlocks } = require( '../src/core/utils' );

		const blocks = getTextBlocks();

		expect( blocks.length ).toBe( 3 );
	} );

	it( 'getTextBlocks passes and returns default Text Blocks', () => {
		jest.doMock( '@wordpress/blocks', () => ( {
			getBlockTypes: jest.fn( () => [] ),
		} ) );

		const { getTextBlocks } = require( '../src/core/utils' );

		const blocks = getTextBlocks();

		expect( blocks ).toEqual( [
			'core/paragraph',
			'core/heading',
			'core/list',
			'core/list-item',
			'core/quote',
			'core/code',
			'core/details',
			'core/missing',
			'core/preformatted',
			'core/pullquote',
			'core/table',
			'core/verse',
			'core/footnotes',
			'core/freeform',
		] );
		expect( blocks.length ).toBe( 14 );
	} );

	it( 'getShorcut passes and returns default Shortcut', () => {
		const { getShortcut } = require( '../src/core/utils' );

		const shortcut = getShortcut();

		expect( shortcut ).toEqual( {
			character: 'f',
			modifier: 'primaryShift',
		} );
	} );

	it( 'getShorcut passes and returns custom Shortcut', () => {
		const filter = {
			character: 'K',
			modifier: 'primaryAlt',
		};

		jest.doMock( '@wordpress/hooks', () => ( {
			applyFilters: jest.fn( ( arg ) => ( { ...filter } ) ),
		} ) );

		const { getShortcut } = require( '../src/core/utils' );

		const shortcut = getShortcut();

		expect( shortcut ).toEqual( {
			character: 'K',
			modifier: 'primaryAlt',
		} );
	} );

	it( 'getAppRoot returns an instance of HTMLDivElement', () => {
		const { getAppRoot } = require( '../src/core/utils' );

		const parent: HTMLElement = document.createElement( 'div' );
		const root = getAppRoot( parent );

		expect( root ).toBeInstanceOf( HTMLDivElement );
		expect( root ).toHaveProperty( 'id', 'search-replace' );
		expect( parent ).toContainElement( root );
	} );

	it( 'isSelectionInModal returns false by default if Selection is not made', () => {
		const { isSelectionInModal } = require( '../src/core/utils' );

		const status = isSelectionInModal();

		expect( status ).toBe( false );
		expect( status ).toBeFalsy();
	} );

	it( 'getBlockEditorIframe returns an instance of Document', () => {
		const { getBlockEditorIframe } = require( '../src/core/utils' );

		const iframe = getBlockEditorIframe();

		expect( iframe ).toBeInstanceOf( Document );
	} );

	it( 'isWpVersion returns true if WP version is up to or above passed in arg version', () => {
		window.srfbe = {
			wpVersion: '6.7.2',
		};

		const { isWpVersion } = require( '../src/core/utils' );

		const status = isWpVersion( '6.7.0' );

		expect( status ).toBe( true );
		expect( status ).toBeTruthy();
	} );

	it( 'isWpVersion returns false if WP version is not up to passed in arg version', () => {
		window.srfbe = {
			wpVersion: '6.7.0',
		};

		const { isWpVersion } = require( '../src/core/utils' );

		const status = isWpVersion( '6.7.1' );

		expect( status ).toBe( false );
		expect( status ).toBeFalsy();
	} );

	it( 'isWpVersion returns false if param version number is not valid', () => {
		window.srfbe = {
			wpVersion: '2.3',
		};

		const { isWpVersion } = require( '../src/core/utils' );

		const status = isWpVersion( '6.7' );

		expect( status ).toBe( false );
		expect( status ).toBeFalsy();
	} );

	it( 'isWpVersion returns false if one of params is invalid version number without dot notation', () => {
		window.srfbe = {
			wpVersion: '67',
		};

		const { isWpVersion } = require( '../src/core/utils' );

		const status = isWpVersion( '6.3.2' );

		expect( status ).toBe( false );
		expect( status ).toBeFalsy();
	} );

	it( 'isWpVersion returns false if param is not string', () => {
		const { isWpVersion } = require( '../src/core/utils' );

		const status = isWpVersion( 7 );

		expect( status ).toBe( false );
		expect( status ).toBeFalsy();
	} );

	it( 'getNumberToBase10 returns the correct Radix', () => {
		const { getNumberToBase10 } = require( '../src/core/utils' );

		const radix = getNumberToBase10( [ 5, 6, 1 ] );

		expect( radix ).toBe( 561 );
		expect( radix ).toBeGreaterThan( 0 );
	} );

	it( 'getNumberToBase10 receives non-array param and returns zero', () => {
		const { getNumberToBase10 } = require( '../src/core/utils' );

		const radix = getNumberToBase10( 'non-array' );

		expect( radix ).toBe( 0 );
		expect( radix ).toBeFalsy();
	} );

	it( 'getNumberToBase10 receives mixed array type and returns zero', () => {
		const { getNumberToBase10 } = require( '../src/core/utils' );

		const radix = getNumberToBase10( [ 1, 'zero', 2 ] );

		expect( radix ).toBe( 0 );
		expect( radix ).toBeFalsy();
	} );

	it( 'getFallbackTextBlocks gets array of default fallback text blocks', () => {
		const { getFallbackTextBlocks } = require( '../src/core/utils' );

		const fallbackTextBlocks = getFallbackTextBlocks();

		expect( fallbackTextBlocks.length ).toBe( 14 );
		expect( fallbackTextBlocks ).toBeInstanceOf( Array );
	} );

	it( 'getShorcutEvent returns the instance of a Keyboard Event', () => {
		const { getShortcutEvent } = require( '../src/core/utils' );

		const shortcutEvent = getShortcutEvent();

		expect( shortcutEvent ).toBeInstanceOf( KeyboardEvent );
	} );
} );
