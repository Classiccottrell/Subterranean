import { TrackData } from "../types";

export const INITIAL_TRACKS: TrackData[] = [
  {
    id: "track-1",
    trackNumber: 1,
    title: "Stillness Below the City",
    mode: "Ninja Meditation",
    target: "instrumental lo-fi hip-hop meditation track",
    bpm: 72,
    keyMood: "Calm, Nocturnal, Meditative, Slightly Mysterious",
    themeColor: "emerald",
    sunoPrompt:
      "Instrumental lo-fi hip-hop, 72 BPM, calm late-night ninja meditation atmosphere in a hidden underground city room. Dusty boom-bap drums played softly, warm Rhodes chords, mellow rounded bass, sparse plucked-string accents, subtle tape wobble and vinyl texture, distant rain and subway rumble used only as atmosphere. Meditative, focused, nocturnal and slightly mysterious, with the warmth of close friends unwinding after a long night. Minimal melodic movement, memorable but understated motif, generous space between elements, organic human groove. Begin quietly, settle into a hypnotic beat, introduce one subtle melodic variation midway, then return to the original calm. Instrumental only; no vocals, no comedy, no aggressive trap drums, no EDM build or cinematic bombast.",
    evaluationQuestions: [
      {
        id: "q1",
        question: "Does it feel calm without becoming generic spa music?",
        rating: null,
        notes: "Boom-bap rhythm must anchor the track so it doesn't drift into generic ambient drone.",
      },
      {
        id: "q2",
        question: "Does the hip-hop groove remain present?",
        rating: null,
        notes: "Soft snare with micro-pocket swing keeps the head nodding while maintaining meditative calm.",
      },
      {
        id: "q3",
        question: "Does it suggest an underground nighttime world without needing recognizable franchise material?",
        rating: null,
        notes: "Subtle low-frequency subway tremor and damp subterranean reverb evoke hidden sewer/dojo sanctuary.",
      },
      {
        id: "q4",
        question: "Could it loop for 20–60 minutes without becoming irritating?",
        rating: null,
        notes: "Sparse melodic motif prevents ear fatigue over extended focus sessions.",
      },
      {
        id: "q5",
        question: "Which generated details should become permanent rules for Ninja Meditation?",
        rating: null,
        notes: "Restricted harmonic palette (minor 7ths / 9ths), tape warble <0.3%, plucked koto/pentatonic notes spaced >= 4 bars.",
      },
    ],
    permanentRules: [
      "Keep boom-bap drums played with soft velocity (no hard rim shots or sharp peaks)",
      "Use warm Rhodes voicing with rich low-mids and sparse pentatonic plucked accents",
      "Subway rumble and rain remain background room tone only; never rise above -18dB",
      "Zero aggressive trap hi-hat rolls or modern 808 glides",
    ],
    generatedAudioList: [],
    notes: "Opening track of the album. Sets the subterranean refuge tone for the whole project.",
  },
  {
    id: "track-2",
    trackNumber: 2,
    title: "Concrete & Cassettes",
    mode: "Sewer Beats",
    target: "Everyday instrumental lo-fi hip-hop with cozy underground-headquarters energy.",
    bpm: 85,
    keyMood: "Cozy, Lived-in, Tactile Analog, Head-nodding",
    themeColor: "amber",
    sunoPrompt:
      "Instrumental lo-fi hip-hop, 85 BPM, central everyday sound with a cozy underground-headquarters energy. Boom-bap drums, jazz chords, mellow bass, tape saturation and small environmental details. Dusty, tactile, analog production with a hip-hop-first rhythmic language. A world that feels lived-in, utilizing subtle room tone or vinyl texture. Rhythmic and head-nodding but relaxed enough for background listening. Instrumental only; no vocals, no aggressive drops, no trap hi-hats.",
    evaluationQuestions: [
      {
        id: "q1",
        question: "Does it feel like a cozy everyday hangout track?",
        rating: null,
        notes: "Warm cassette saturation and living-room acoustics give that underground lair warmth.",
      },
      {
        id: "q2",
        question: "Is the tape saturation present without ruining the mix?",
        rating: null,
        notes: "Should sound like a third-generation Maxell cassette tape recorded in 1993, warm harmonics without harsh clipping.",
      },
      {
        id: "q3",
        question: "Does it maintain a hip-hop-first rhythmic language?",
        rating: null,
        notes: "Classic Dilla-esque swinging boom-bap kick and snare pattern.",
      },
      {
        id: "q4",
        question: "Which environmental details best sell the underground atmosphere?",
        rating: null,
        notes: "Water drips, CRT monitor buzz, cassette deck transport clicks, vinyl surface crackle.",
      },
    ],
    permanentRules: [
      "Boom-bap rhythm leads the sonic signature; chords support rather than overpower the groove",
      "Tape saturation should roll off harsh frequencies above 10kHz",
      "Cozy head-nod tempo locked around 84–86 BPM",
    ],
    generatedAudioList: [],
    notes: "The everyday soundtrack of four brothers hanging out in the secret subterranean living room.",
  },
  {
    id: "track-3",
    trackNumber: 3,
    title: "2:17 AM Rooftops",
    mode: "Night Patrol",
    target: "Cinematic, nocturnal lo-fi hip-hop for moving through the city after midnight.",
    bpm: 90,
    keyMood: "Cinematic, Nocturnal, Restrained Tension, Wet Streets",
    themeColor: "indigo",
    sunoPrompt:
      "Cinematic instrumental lo-fi hip-hop, 90 BPM, nocturnal atmosphere for moving through the city after midnight. Deeper drums, moody keys, mysterious synth texture, wet streets, subway ambience and restrained tension. Warm bass and sampled-feeling textures. Steady, driving momentum that feels slightly dangerous but retains a martial-arts calm. Instrumental only; no vocals, no EDM builds, no overly bright melodies.",
    evaluationQuestions: [
      {
        id: "q1",
        question: "Does it capture the cinematic and nocturnal feeling of a rooftop patrol?",
        rating: null,
        notes: "Atmospheric siren reflections and rooftop breeze give a cinematic sense of altitude over neon alleys.",
      },
      {
        id: "q2",
        question: "Is the tension restrained enough to stay within the lo-fi genre?",
        rating: null,
        notes: "Driving pulse should avoid sounding like an action movie score; it must remain head-nodding lo-fi hip-hop.",
      },
      {
        id: "q3",
        question: "Do the mysterious synth textures fit the 1980s/1990s street culture aesthetic?",
        rating: null,
        notes: "Analog Juno/Prophet pad textures with chorus and tape delay blend perfectly with classic sampling vibe.",
      },
    ],
    permanentRules: [
      "Maintain driving 90 BPM forward momentum without turning into four-on-the-floor or trap",
      "Minor 9th and diminished passing chords create vigilance and nocturnal suspense",
      "Deeper low-end punch for the kick drum to reflect open city night air",
    ],
    generatedAudioList: [],
    notes: "Leaping across brick water towers and neon fire escapes while the metropolis sleeps below.",
  },
  {
    id: "track-4",
    trackNumber: 4,
    title: "Last Slice",
    mode: "Pizza Party",
    target: "Energetic, playful lo-fi hip-hop with a youthful street energy.",
    bpm: 100,
    keyMood: "Youthful, Funky, Danceable, Playful Street Groove",
    themeColor: "orange",
    sunoPrompt:
      "Energetic lo-fi hip-hop, 100 BPM, youthful street energy and underground pizza party atmosphere. Punchier hip-hop drums, funky bass, playful samples/vocal chops, scratches and danceable hooks. Fun and vibrant without turning into comedy music or novelty music. Dusty, analog production mixed with upbeat, head-nodding momentum. Instrumental with playful vocal chops; no full vocal performances, no parody sounds, no modern trap drums.",
    evaluationQuestions: [
      {
        id: "q1",
        question: "Is it fun and youthful without turning into comedy music?",
        rating: null,
        notes: "Playful vinyl scratching and soulful chop stabs bring joy while maintaining genuine golden-era hip-hop credibility.",
      },
      {
        id: "q2",
        question: "Are the punchier drums still dusty and analog?",
        rating: null,
        notes: "Drums hit with SP-1200 or MPC60 crunch rather than sanitized modern EDM punch.",
      },
      {
        id: "q3",
        question: "Does it fit in the same cohesive musical universe as the Ninja Meditation track?",
        rating: null,
        notes: "Shares the same vinyl texture, Rhodes undertones, and warm tape saturation as Track 1.",
      },
    ],
    permanentRules: [
      "Funky syncopated bassline with walking octaves and slight slide",
      "BPM must sit at 98–102 to retain organic boom-bap bounce rather than uptempo electronic",
      "Vocal chops must be rhythmic and abstract micro-samples (ah, yeah, hey) rather than full singing",
    ],
    generatedAudioList: [],
    notes: "The celebratory pizza feast finale after saving the city. Pure 90s camaraderie.",
  },
];
