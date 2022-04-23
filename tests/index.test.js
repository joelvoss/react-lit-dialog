import * as React from 'react';
import { render, userEvent } from './test-utils';

import { Dialog } from '../src/index';

describe(`<Dialog />`, () => {
	const Comp = ({ show = false, withRef = false }) => {
		const [showDialog, setShowDialog] = React.useState(show);
		const initialFocusRef = withRef ? React.useRef() : null;

		return (
			<div data-testid="outer">
				<button onClick={() => setShowDialog(true)}>Show</button>
				<Dialog
					aria-label="Dialog"
					isOpen={showDialog}
					onDismiss={() => setShowDialog(false)}
					initialFocusRef={initialFocusRef}
				>
					<div data-testid="inner">
						<button onClick={() => setShowDialog(false)}>Close</button>
						<input data-testid="text" type="text" ref={initialFocusRef} />
						<p>I am the content</p>
					</div>
				</Dialog>
			</div>
		);
	};

	it(`should not have ARIA violations`, async () => {
		let { container } = render(<Comp show={true} />);
		await expect(container).toHaveNoAxeViolations();
	});

	it(`should render proper HTML`, async () => {
		let { queryByTestId } = render(<Comp />);
		expect(queryByTestId('outer')).toBeTruthy();
		expect(queryByTestId('inner')).toBeNull();
	});

	it(`should open and close the dialog`, async () => {
		const { getByText, queryByTestId } = render(<Comp />);

		expect(queryByTestId('outer')).toBeTruthy();
		expect(queryByTestId('inner')).toBeNull();

		await userEvent.click(getByText(/show/i));

		expect(queryByTestId('outer')).toBeTruthy();
		expect(queryByTestId('inner')).toBeTruthy();

		await userEvent.click(getByText(/Close/i));

		expect(queryByTestId('outer')).toBeTruthy();
		expect(queryByTestId('inner')).toBeNull();
	});

	it(`should close the dialog when the overlay is clicked`, async () => {
		const { baseElement, queryByTestId } = render(<Comp show={true} />);

		expect(queryByTestId('outer')).toBeTruthy();
		expect(queryByTestId('inner')).toBeTruthy();

		const overlay = getOverlay(baseElement);
		await userEvent.click(overlay);

		expect(queryByTestId('outer')).toBeTruthy();
		expect(queryByTestId('inner')).toBeNull();
	});

	it(`should focus the dialog contents on mount`, async () => {
		const { queryByText } = render(<Comp />);
		expect(document.activeElement).toBe(document.body);

		await userEvent.click(queryByText(/show/i));

		expect(document.activeElement).toBe(queryByText(/close/i));
	});

	it(`should trap focus within the dialog`, async () => {
		const { queryByText, queryByTestId } = render(<Comp show={true} />);
		expect(document.activeElement).toBe(queryByText(/close/i));

		await userEvent.tab();
		expect(document.activeElement).toBe(queryByTestId('text'));

		await userEvent.tab();
		expect(document.activeElement).toBe(queryByText(/close/i));
	});

	it(`should focus the initialFocusRef on mount`, async () => {
		const { queryByText, queryByTestId } = render(<Comp withRef/>);
		expect(document.activeElement).toBe(document.body);

		await userEvent.click(queryByText(/show/i));

		expect(document.activeElement).toBe(queryByTestId('text'));
	});
});

////////////////////////////////////////////////////////////////////////////////

function getOverlay(el) {
	const nodes = el.querySelectorAll('*[style]');
	let target = null;
	nodes.forEach(node => {
		if (node.style.background === 'rgba(0, 0, 0, 0.33)') {
			target = node;
		}
	});
	return target;
}
