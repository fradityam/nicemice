import { CheckIcon } from './icons';

const STEPS = [
  {
    number: '01',
    title: 'Pilih templatenya',
    copy: 'Jelajahi katalog dan temukan desain yang paling terasa seperti kalian.',
    benefit: 'Pilihan tema yang berkarakter',
  },
  {
    number: '02',
    title: 'Kirim datanya',
    copy: 'Lengkapi detail acara, foto, dan cerita yang ingin ditampilkan.',
    benefit: 'Informasi tersusun rapi',
  },
  {
    number: '03',
    title: 'Bagikan bahagianya',
    copy: 'Setelah revisi selesai, undanganmu siap dikirim ke orang-orang tersayang.',
    benefit: 'Nyaman dibuka dari ponsel',
  },
];

export default function Process() {
  return (
    <section className="process" id="cara-kerja">
      <div className="process-title">
        <p className="section-kicker">Mudah dan lengkap</p>
        <h2>Semua yang kamu butuhkan, dalam tiga langkah sederhana.</h2>
        <p>
          Dari memilih desain sampai undangan siap dibagikan, prosesnya praktis dan tetap didampingi
          oleh tim nice mice.
        </p>
      </div>
      <div className="steps">
        {STEPS.map((step, index) => (
          <article className="step" key={step.number}>
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
            <span className="step-benefit">
              <CheckIcon />
              {step.benefit}
            </span>
            {index < STEPS.length - 1 && (
              <svg className="step-arrow" viewBox="0 0 120 48" aria-hidden="true">
                <path d="M5 31c32-18 65-20 104-4" />
                <path d="m95 15 15 12-18 8" />
              </svg>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
