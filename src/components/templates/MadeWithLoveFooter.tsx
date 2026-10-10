import type { ReactNode } from 'react';
import logo from '../../assets/images/home/nicemice-logo.webp';
import { Reveal } from './scrollReveal';

// The "Made with love by nicemice" credit under a template's closing section, drawn inside the
// template's scaled Figma frame like everything else, so all positions are frame px. The credit
// row is the same in every template (Figma's "Credits" group); each template passes its own
// background and torn edge, at their Figma positions.
//
// The music button (templateMusic) floats over the right 60px of the column. The credit row
// spans x 92–283 of the 375 frame, so it stays clear of the button on any column wider than
// 245px.

const CREDITS_X = 92;
const CREDITS_W = 191;
const CREDITS_H = 29;

export function MadeWithLoveFooter({
  y,
  bgTop,
  frameH,
  background,
  edge,
}: {
  /** Frame y of the credit row. */
  y: number;
  /** Frame y where the footer's background starts; it runs to the bottom of the frame. */
  bgTop: number;
  frameH: number;
  /** The background colour under the credit row. */
  background: string;
  /** The template's edge across the top of the footer (e.g. a paper rip), at its Figma position. */
  edge?: ReactNode;
}) {
  return (
    <>
      <div className="absolute inset-x-0" style={{ top: bgTop, height: frameH - bgTop, backgroundColor: background }} />
      {edge}
      <Reveal at={y} kind="fadeUp">
        <a
          href="https://nicemice.id"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute block"
          style={{ left: CREDITS_X, top: y, width: CREDITS_W, height: CREDITS_H }}
        >
          <span className="-translate-x-1/2 absolute left-[42.5px] top-px font-['Raleway'] text-[10px] leading-[28px] text-black whitespace-nowrap">
            Made with love by
          </span>
          {/* 600 × 144 artwork in a 100 × 24 slot: sharp at 2x even at the widest column. */}
          <img alt="nicemice" src={logo} className="absolute left-[91px] top-0 block h-[24px] w-[100px] max-w-none object-cover" />
        </a>
      </Reveal>
    </>
  );
}
