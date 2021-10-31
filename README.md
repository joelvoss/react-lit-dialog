# @react-lit/dialog

An accessible dialog or "modal" window.

## Installation

```bash
$ npm i @react-lit/dialog
# or
$ yarn add @react-lit/dialog
```

## Example

```js
import * as React from 'react';
import { Dialog } from "@react-lit/dialog";

function Example() {
  const [showDialog, setShowDialog] = React.useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  return (
    <button onClick={open}>Open Dialog</button>

    <Dialog isOpen={showDialog} onDismiss={close}>
      <button onClick={close}>
        <VisuallyHidden>Close</VisuallyHidden>
        <span aria-hidden>×</span>
      </button>
      <p>I am the Dialog!</p>
    </Dialog>
  );
}
```

## Development

(1) Install dependencies

```bash
$ npm i
# or
$ yarn
```

(2) Run initial validation

```bash
$ ./Taskfile.sh validate
```

(3) Run tests in watch-mode to validate functionality.

```bash
$ ./Taskfile test -w
```

---

_This project was set up by @jvdx/core_
