import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Contact } from './Contact';
import { PrivacyNote } from './PrivacyNote';

// jsdom has no showModal()/close(). These stand-ins do the two things the
// component relies on: toggle `open`, and fire `close` the way a browser does.
const proto = HTMLDialogElement.prototype;
const original = { showModal: proto.showModal, close: proto.close };

beforeEach(() => {
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  proto.showModal = original.showModal;
  proto.close = original.close;
  document.body.style.overflow = '';
});

describe('PrivacyNote', () => {
  it('opens the note from the footer link and locks the page behind it', async () => {
    const user = userEvent.setup();
    render(<PrivacyNote />);
    const dialog = document.querySelector('dialog');
    expect(dialog).not.toHaveAttribute('open');

    await user.click(screen.getByRole('button', { name: 'Gizlilik' }));

    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleName('Privacy');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes on its button and on a backdrop click, releasing the page', async () => {
    const user = userEvent.setup();
    render(<PrivacyNote />);
    const dialog = document.querySelector('dialog') as HTMLDialogElement;

    await user.click(screen.getByRole('button', { name: 'Gizlilik' }));
    await user.click(screen.getByRole('button', { name: /Kapat/ }));
    expect(dialog).not.toHaveAttribute('open');
    expect(document.body.style.overflow).toBe('');

    await user.click(screen.getByRole('button', { name: 'Gizlilik' }));
    await user.click(dialog);
    expect(dialog).not.toHaveAttribute('open');
  });

  it('names the two services a visit does reach', () => {
    render(<PrivacyNote />);
    const text = document.querySelector('dialog')?.textContent ?? '';
    expect(text).toContain('Cloudflare');
    expect(text).toContain('Kick');
  });
});

describe('Contact footer', () => {
  it('offers the privacy note and no empty legal links', () => {
    render(<Contact />);
    expect(screen.getByRole('button', { name: 'Gizlilik' })).toBeInTheDocument();
    expect(screen.queryByText('Şartlar')).not.toBeInTheDocument();
    expect(document.querySelector('footer a[href="#"]')).toBeNull();
  });
});
