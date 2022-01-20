import * as React from 'react';
import {
	getOwnerDocument,
	noop,
	useComposeRefs,
	composeEventHandlers,
	usePreventScroll,
} from '@react-lit/helper';
import { Portal } from '@react-lit/portal';
import { FocusScope } from '@react-lit/focus-scope';

////////////////////////////////////////////////////////////////////////////////

/**
 * Dialog renders a high-level component to render a modal dialog window over
 * the top of the page (or another dialog).
 */
export const Dialog = React.forwardRef(
	({ isOpen, onDismiss = noop, initialFocusRef, ...props }, parentRef) => (
		<DialogOverlay
			isOpen={isOpen}
			onDismiss={onDismiss}
			initialFocusRef={initialFocusRef}
		>
			<DialogContent ref={parentRef} {...props} />
		</DialogOverlay>
	),
);

////////////////////////////////////////////////////////////////////////////////

/**
 * DialogOverlay renders a low-level component if you need more control over
 * the styles or rendering of the dialog overlay.
 *
 * Note: You must render a `DialogContent` inside.
 */
export const DialogOverlay = React.forwardRef(
	({ as: Comp = 'div', isOpen = true, ...props }, parentRef) => {
		// NOTE(joel): We want to ignore the immediate focus of a tooltip so it
		// doesn't pop up again when the menu closes. It should only pop up when
		// focus returns again to the tooltip (like native OS tooltips).
		React.useEffect(() => {
			if (isOpen) {
				window.__REACT_LIT_DISABLE_TOOLTIPS = true;
			} else {
				window.requestAnimationFrame(() => {
					// Wait a frame so that this doesn't fire before tooltip does
					window.__REACT_LIT_DISABLE_TOOLTIPS = false;
				});
			}
		}, [isOpen]);

		return isOpen ? (
			<Portal>
				<DialogInner ref={parentRef} as={Comp} {...props} />
			</Portal>
		) : null;
	},
);

////////////////////////////////////////////////////////////////////////////////

/**
 * DialogInner
 */
export const DialogInner = React.forwardRef(
	(
		{
			as: Comp = 'div',
			dangerouslyBypassScrollLock = false,
			onClick,
			onDismiss = noop,
			onKeyDown,
			onMouseDown,
			style,
			initialFocusRef,
			...props
		},
		forwardedRef,
	) => {
		const mouseDownTarget = React.useRef(null);
		const overlayNode = React.useRef(null);
		const ref = useComposeRefs(overlayNode, forwardedRef);

		usePreventScroll(!dangerouslyBypassScrollLock);

		/**
		 * handleClick
		 * @param {event} React.MouseEvent
		 */
		function handleClick(event) {
			if (mouseDownTarget.current === event.target) {
				event.stopPropagation();
				onDismiss(event);
			}
		}

		/**
		 * handleKeyDown
		 * @param {event} React.KeyboardEvent
		 */
		function handleKeyDown(event) {
			if (event.key === 'Escape') {
				event.stopPropagation();
				onDismiss(event);
			}
		}

		/**
		 * handleMouseDown
		 * @param {event} React.MouseEvent
		 */
		function handleMouseDown(event) {
			mouseDownTarget.current = event.target;
		}

		React.useEffect(
			() =>
				overlayNode.current ? createAriaHider(overlayNode.current) : void null,
			[],
		);

		return (
			<FocusScope initialFocusRef={initialFocusRef}>
				<Comp
					{...props}
					ref={ref}
					style={{
						background: 'hsla(0, 0%, 0%, 0.33)',
						position: 'fixed',
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
						overflow: 'auto',
						...style,
					}}
					// NOTE(joel): We can ignore the `non-static-element-interactions`
					// warning here, because our overlay is only designed to capture
					// any outside clicks, not to serve as a clickable element itself.
					onClick={composeEventHandlers(onClick, handleClick)}
					onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
					onMouseDown={composeEventHandlers(onMouseDown, handleMouseDown)}
				/>
			</FocusScope>
		);
	},
);

////////////////////////////////////////////////////////////////////////////////

/**
 * DialogContent renders a low-level component if you need more control over
 * the styles or rendering of the dialog content.
 *
 * Note: Must be a child of `DialogOverlay`.
 *
 * Note: You only need to use this when you are also styling `DialogOverlay`,
 * otherwise you can use the high-level `Dialog` component and pass the props
 * to it. Any props passed to `Dialog` component (besides `isOpen` and
 * `onDismiss`) will be spread onto `DialogContent`.
 */
export const DialogContent = React.forwardRef(
	({ as: Comp = 'div', onClick, onKeyDown, style, ...props }, parentRef) => (
		<Comp
			aria-modal="true"
			role="dialog"
			tabIndex={-1}
			{...props}
			ref={parentRef}
			style={{
				width: '50vw',
				margin: '10vh auto',
				background: 'white',
				outline: 'none',
				...style,
			}}
			onClick={composeEventHandlers(onClick, event => {
				event.stopPropagation();
			})}
		/>
	),
);

////////////////////////////////////////////////////////////////////////////////

/**
 * createAriaHider
 * @param {HTMLElement} dialogNode
 * @returns {() => void}
 */
function createAriaHider(dialogNode) {
	const originalValues = [];
	/** @type {HTMLElement[]} */
	const rootNodes = [];
	const ownerDocument = getOwnerDocument(dialogNode);

	if (!dialogNode) return noop;

	Array.prototype.forEach.call(
		ownerDocument.querySelectorAll('body > *'),
		node => {
			const portalNode = dialogNode.parentNode?.parentNode?.parentNode;
			if (node === portalNode) {
				return;
			}
			const attr = node.getAttribute('aria-hidden');
			const alreadyHidden = attr !== null && attr !== 'false';
			if (alreadyHidden) {
				return;
			}
			originalValues.push(attr);
			rootNodes.push(node);
			node.setAttribute('aria-hidden', 'true');
		},
	);

	return () => {
		rootNodes.forEach((node, index) => {
			const originalValue = originalValues[index];
			if (originalValue === null) {
				node.removeAttribute('aria-hidden');
			} else {
				node.setAttribute('aria-hidden', originalValue);
			}
		});
	};
}
