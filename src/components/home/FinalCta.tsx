import OrderLink from './OrderLink';
import { ArrowIcon, SparkIcon } from './icons';

export default function FinalCta() {
  return (
    <section className="final-cta" id="mulai">
      <div className="final-cta-copy">
        <p className="section-kicker">Sudah punya pilihan?</p>
        <h2>Pesan template favoritmu dan kami siapkan sisanya.</h2>
        <p>
          Kirim nama template yang kamu pilih dan detail acaramu. Tim nice mice akan membantu sampai
          undangan siap dibagikan.
        </p>
      </div>
      <OrderLink
        className="button button-primary button-large"
        message="Halo nice mice, saya ingin pesan undangan digital."
      >
        Ngobrol dengan kami
        <ArrowIcon />
      </OrderLink>
      <div className="final-spark">
        <SparkIcon />
      </div>
    </section>
  );
}
