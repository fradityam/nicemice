import { Fragment } from 'react';
import { HeartIcon } from './icons';

const PHRASES = ['Pilih Tema', 'Kirim Detail Acara', 'Kami Siapkan', 'Tinggal Sebar'];

// The phrases run twice so the strip loops without a gap when it slides by half its width.
export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div>
        {[...PHRASES, ...PHRASES].map((phrase, index) => (
          <Fragment key={index}>
            <span>{phrase}</span>
            <HeartIcon />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
