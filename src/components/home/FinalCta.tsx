import { ORDER_MESSAGE } from '../../config';
import OrderLink from './OrderLink';
import { ArrowIcon, SparkIcon } from './icons';

export default function FinalCta() {
  return (
    <section className="final-cta" id="mulai">
      <div className="final-cta-copy">
        <p className="section-kicker">Sudah punya pilihan?</p>
        <h2>Dengan Nice Mice, undanganmu lebih punya cerita!</h2>
        <p>
          Pilih tema dari katalog Nice Mice atau diskusikan ide desain custom kamu bersama tim kami
          sekarang.
        </p>
      </div>
      <OrderLink
        className="button button-primary button-large"
        message={ORDER_MESSAGE}
        button="final_cta"
      >
        Ngobrol Gratis, Yuk!
        <ArrowIcon />
      </OrderLink>
      <div className="final-spark">
        <SparkIcon />
      </div>
    </section>
  );
}
