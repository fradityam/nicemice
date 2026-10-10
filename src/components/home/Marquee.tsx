import { HeartIcon } from './icons';

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div>
        <span>UNDANGAN DIGITAL</span>
        <HeartIcon />
        <span>WEDDING WEBSITE</span>
        <HeartIcon />
        <span>RSVP ONLINE</span>
        <HeartIcon />
        <span>CERITA KALIAN</span>
        <HeartIcon />
        <span>UNDANGAN DIGITAL</span>
        <HeartIcon />
        <span>WEDDING WEBSITE</span>
      </div>
    </div>
  );
}
