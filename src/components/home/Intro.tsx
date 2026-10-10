import { HeartIcon } from './icons';

export default function Intro() {
  return (
    <section className="intro" id="tentang">
      <p className="section-kicker">Ini nice mice</p>
      <h2>
        Kami percaya undangan bukan cuma informasi, tapi <em>pembuka dari sebuah perayaan.</em>
      </h2>
      <p>
        Temukan desain yang paling cocok dengan suasana perayaanmu, lalu biarkan kami menyiapkan
        detailnya.
      </p>
      <div className="intro-doodle">
        <HeartIcon />
      </div>
    </section>
  );
}
