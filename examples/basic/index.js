import * as React from 'react';
import { Dialog } from '../../src/index';
import { VisuallyHidden } from '@react-lit/visually-hidden';

export function Example() {
	const [showDialog, setShowDialog] = React.useState(false);
	const open = () => setShowDialog(true);
	const close = () => setShowDialog(false);

	return (
		<>
			<h2>Example: Basic</h2>
			<div>
				<button onClick={open}>Open Dialog</button>

				<Dialog
					isOpen={showDialog}
					onDismiss={close}
					style={{
						boxShadow: '0 4px 6px #000',
						borderRadius: 6,
						padding: '0.5rem',
					}}
				>
					<button onClick={close}>
						<VisuallyHidden>Close</VisuallyHidden>
						<span aria-hidden>×</span>
					</button>
					<p>I am the Dialog!</p>
					<input type="text" placeholder="Name" />
					<input type="text" placeholder="Surname" />
				</Dialog>
			</div>
		</>
	);
}
