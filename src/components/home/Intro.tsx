import { HeartIcon } from './icons';

export default function Intro() {
  return (
    <section className="intro" id="tentang">
      <p className="section-kicker">Ini Nice Mice</p>
      <h2>
        Kami ingin pengalaman memilih undangan digital <em>terasa lebih personal</em>
      </h2>
      <p>
        Nice Mice menghadirkan berbagai tema undangan digital yang bisa kamu pilih sesuai selera dan
        kisah cintamu. Setelah menemukan yang cocok, biar kami bantu menyiapkan hingga siap disebar.
      </p>
      <div className="intro-doodle">
        <HeartIcon />
      </div>
    </section>
  );
}
