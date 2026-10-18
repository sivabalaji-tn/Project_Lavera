import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const confetti = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 43) % 101}%`,
  delay: `${(index % 14) * 0.19}s`,
  duration: `${3.2 + (index % 5) * 0.55}s`,
  size: `${5 + (index % 3) * 2}px`,
  color: ['#d6b36d', '#f5ead2', '#72927d', '#b88948'][index % 4],
  shape: ['confetti-dot', 'confetti-dash', 'confetti-square'][index % 3],
}));

export default function LaunchWelcome({ onFinish }) {
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const autoTimer = useRef(null);
  const finishTimer = useRef(null);
  const finishRef = useRef(onFinish);

  useEffect(() => { finishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    document.body.classList.add('launch-open');
    return () => document.body.classList.remove('launch-open');
  }, []);

  const dismiss = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    window.clearTimeout(autoTimer.current);
    setClosing(true);
    finishTimer.current = window.setTimeout(() => finishRef.current(), 760);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishRef.current();
      return undefined;
    }
    autoTimer.current = window.setTimeout(dismiss, 5000);
    return () => {
      window.clearTimeout(autoTimer.current);
      window.clearTimeout(finishTimer.current);
    };
  }, [dismiss]);

  return (
    <section className={`launch-welcome${closing ? ' launch-welcome--closing' : ''}`} role="dialog" aria-modal="true" aria-label="Lavéra brand opening">
      <div className="launch-ribbons" aria-hidden="true">
        <div className="launch-ribbon launch-ribbon--upper"><span>LAVÉRA · NOW OPEN · SHINE WITH ELEGANCE · LAVÉRA · NOW OPEN · SHINE WITH ELEGANCE ·</span></div>
        <div className="launch-ribbon launch-ribbon--lower"><span>THE LITTLE THINGS DESERVE A CELEBRATION · THE LITTLE THINGS DESERVE A CELEBRATION ·</span></div>
      </div>
      <div className="launch-confetti" aria-hidden="true">
        {confetti.map((piece, index) => <i key={index} className={`launch-confetti__piece ${piece.shape}`} style={{ left: piece.left, animationDelay: piece.delay, animationDuration: piece.duration, width: piece.size, height: piece.size, backgroundColor: piece.color }} />)}
      </div>
      <div className="launch-welcome__content">
        <div className="launch-sparkle launch-sparkle--one" aria-hidden="true">✧</div>
        <div className="launch-sparkle launch-sparkle--two" aria-hidden="true">✦</div>
        <div className="launch-logo"><img src="/images/laveralogo.jpeg" alt="Lavéra — shine with elegance" /></div>
        <p className="launch-eyebrow"><span /> A NEW CHAPTER BEGINS <span /></p>
        <h1 className="launch-title">The doors are<br /><em>open.</em></h1>
        <p className="launch-subtitle">Welcome to Lavéra.<br />A little sparkle, a lot to celebrate.</p>
        <button className="launch-enter" onClick={dismiss}>Explore the collection <ArrowRight size={16} /></button>
        <p className="launch-auto-note">Taking you to the collection in a few seconds</p>
      </div>
      <div className="launch-progress" aria-hidden="true"><span /></div>
      <div className="launch-footer"><Sparkles size={14} /><span>LAVÉRA · SHINE WITH ELEGANCE</span><Sparkles size={14} /></div>
    </section>
  );
}
