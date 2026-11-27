(() => {
  "use strict";
  // Original short phrases, synthesized locally. Each note is [MIDI pitch, offset, duration].
  const flags = {
    choice: [[67,0,.12],[72,.055,.15]],
    trophy: [[60,0,.21],[67,.11,.26],[72,.24,.36],[76,.35,.36]],
    crisis: [[52,0,.25],[48,.13,.28]],
    recovery: [[55,0,.15],[64,.11,.19],[67,.2,.25]],
    limit: [[67,0,.28],[64,.15,.27],[60,.36,.5]],
    collapse: [[58,0,.3],[53,.22,.32],[48,.47,.49]],
  };
  const chapters = [[55,60,64],[57,62,65],[60,65,69],[62,67,71],[65,72,76]];
  const victories = {
    space:[60,67,74,79], democracy:[60,64,67,72], conquest:[55,62,67,74],
    economy:[60,65,69,76], culture:[57,64,72,76], religion:[53,60,65,72],
  };
  const phrase = notes => notes.map((pitch,index)=>[pitch,index*.12,.27+index*.045]);
  let context;
  async function play(kind, volume, era=0, victory) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio || volume <= 0) return;
    try {
      context ??= new Audio();
      if (context.state === "suspended") await context.resume();
      const notes = kind === "era" ? phrase(chapters[era] ?? chapters[0]) :
        kind === "victory" ? phrase(victories[victory] ?? victories.space) : flags[kind];
      if (!notes) return;
      const start = context.currentTime + .018;
      for (const [pitch, offset, duration] of notes) {
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = kind === "crisis" ? "sine" : "triangle";
        oscillator.frequency.value = 440 * 2 ** ((pitch-69)/12);
        envelope.gain.setValueAtTime(0, start+offset);
        envelope.gain.linearRampToValueAtTime(volume*.09, start+offset+.025);
        envelope.gain.exponentialRampToValueAtTime(.0001, start+offset+duration);
        oscillator.connect(envelope);
        envelope.connect(context.destination);
        oscillator.start(start+offset);
        oscillator.stop(start+offset+duration+.01);
      }
    } catch { /* Audio can be unavailable or blocked by the browser. */ }
  }
  window.CivPlaySound = {play};
})();
