window.PomodoroPride = window.PomodoroPride || {};
window.PomodoroPride.flags = [
  {
    id: "rainbow",
    name: "Classic Rainbow",
    colors: ["#E40303", "#FF8C00", "#FFED00", "#008026", "#004CFF", "#732982"]
  },
  {
    id: "progress",
    name: "Progress Pride",
    colors: ["#000000", "#613915", "#74D7EE", "#FFAFC8", "#FFFFFF", "#E40303", "#FF8C00", "#FFED00", "#008026", "#004DFF", "#750787"],
    stops: [
      { color: "#000000", start: 0, end: 5 },
      { color: "#613915", start: 5, end: 10 },
      { color: "#74D7EE", start: 10, end: 15 },
      { color: "#FFAFC8", start: 15, end: 20 },
      { color: "#FFFFFF", start: 20, end: 25 },
      { color: "#E40303", start: 25, end: 37.5 },
      { color: "#FF8C00", start: 37.5, end: 50 },
      { color: "#FFED00", start: 50, end: 62.5 },
      { color: "#008026", start: 62.5, end: 75 },
      { color: "#004DFF", start: 75, end: 87.5 },
      { color: "#750787", start: 87.5, end: 100 }
    ]
  },
  {
    id: "trans",
    name: "Transgender",
    colors: ["#5BCEFA", "#F5A9B8", "#FFFFFF", "#F5A9B8", "#5BCEFA"]
  },
  {
    id: "bisexual",
    name: "Bisexual",
    colors: ["#D60270", "#9B4F96", "#0038A8"],
    stops: [
      { color: "#D60270", start: 0, end: 40 },
      { color: "#9B4F96", start: 40, end: 60 },
      { color: "#0038A8", start: 60, end: 100 }
    ]
  },
  {
    id: "pansexual",
    name: "Pansexual",
    colors: ["#FF218C", "#FFD800", "#21B1FF"]
  },
  {
    id: "lesbian",
    name: "Lesbian",
    colors: ["#D52D00", "#FF9B55", "#FFFFFF", "#D461A6", "#A50062"]
  },
  {
    id: "gay",
    name: "Gay (MLM)",
    colors: ["#078D70", "#26CEAA", "#98E8C1", "#FFFFFF", "#7BADE2", "#5049CC", "#3D1A78"]
  },
  {
    id: "sapphic",
    name: "Sapphic",
    colors: ["#FD8BA3", "#FCB5CE", "#FFFFFF", "#D696B6", "#A40062"]
  },
  {
    id: "achillean",
    name: "Achillean",
    colors: ["#078D70", "#6EB875", "#F9FDEA", "#7BADE2", "#3D1A78"]
  },
  {
    id: "nonbinary",
    name: "Nonbinary",
    colors: ["#FCF434", "#FFFFFF", "#9C59D1", "#2C2C2C"]
  },
  {
    id: "asexual",
    name: "Asexual",
    colors: ["#000000", "#A3A3A3", "#FFFFFF", "#800080"]
  },
  {
    id: "aromantic",
    name: "Aromantic",
    colors: ["#3DA542", "#A7D379", "#FFFFFF", "#A9A9A9", "#000000"]
  },
  {
    id: "aroace",
    name: "Aroace",
    colors: ["#E28C00", "#ECCD00", "#FFFFFF", "#62AEDC", "#203856"]
  },
  {
    id: "demisexual",
    name: "Demisexual",
    colors: ["#FFFFFF", "#6E0070", "#D2D2D2"],
    stops: [
      { color: "#FFFFFF", start: 0, end: 42 },
      { color: "#6E0070", start: 42, end: 58 },
      { color: "#D2D2D2", start: 58, end: 100 }
    ]
  },
  {
    id: "demiromantic",
    name: "Demiromantic",
    colors: ["#FFFFFF", "#339933", "#D2D2D2"],
    stops: [
      { color: "#FFFFFF", start: 0, end: 42 },
      { color: "#339933", start: 42, end: 58 },
      { color: "#D2D2D2", start: 58, end: 100 }
    ]
  },
  {
    id: "genderfluid",
    name: "Genderfluid",
    colors: ["#FF76A4", "#FFFFFF", "#C011D7", "#000000", "#2F3CBE"]
  },
  {
    id: "genderqueer",
    name: "Genderqueer",
    colors: ["#B57EDC", "#FFFFFF", "#498022"]
  },
  {
    id: "intersex",
    name: "Intersex",
    colors: ["#FFD800", "#7902AA", "#FFD800"],
    stops: [
      { color: "#FFD800", start: 0, end: 35 },
      { color: "#7902AA", start: 35, end: 65 },
      { color: "#FFD800", start: 65, end: 100 }
    ]
  },
  {
    id: "agender",
    name: "Agender",
    colors: ["#000000", "#B9B9B9", "#FFFFFF", "#B8F483", "#FFFFFF", "#B9B9B9", "#000000"]
  },
  {
    id: "polysexual",
    name: "Polysexual",
    colors: ["#F714BA", "#01D66A", "#1594F6"]
  },
  {
    id: "omnisexual",
    name: "Omnisexual",
    colors: ["#FC9CCC", "#FC54BC", "#240444", "#645CFC", "#8CA4FC"]
  },
  {
    id: "polyamorous",
    name: "Polyamorous",
    colors: ["#0000FF", "#FF0000", "#000000"]
  },
  {
    id: "demiboy",
    name: "Demiboy",
    colors: ["#7F7F7F", "#C4C4C4", "#9DD7EA", "#FFFFFF", "#9DD7EA", "#C4C4C4", "#7F7F7F"]
  },
  {
    id: "demigirl",
    name: "Demigirl",
    colors: ["#7F7F7F", "#C4C4C4", "#FFADCA", "#FFFFFF", "#FFADCA", "#C4C4C4", "#7F7F7F"]
  },
  {
    id: "bigender",
    name: "Bigender",
    colors: ["#C479A2", "#EDA5CD", "#D6C7E8", "#FFFFFF", "#9AC7E8", "#6D82D1"]
  },
  {
    id: "bear",
    name: "Bear",
    colors: ["#613704", "#D46300", "#FDDC62", "#FDE5B7", "#FFFFFF", "#545454", "#000000"]
  },
  {
    id: "abrosexual",
    name: "Abrosexual",
    colors: ["#75CA91", "#B3E4C7", "#FFFFFF", "#E695B5", "#D9446C"]
  },
  {
    id: "pangender",
    name: "Pangender",
    colors: ["#FFF798", "#FFDDCD", "#FFEBFB", "#FFFFFF", "#FFEBFB", "#FFDDCD", "#FFF798"]
  },
  {
    id: "trigender",
    name: "Trigender",
    colors: ["#FF95C5", "#9581FF", "#67D966", "#9581FF", "#FF95C5"]
  },
  {
    id: "neutrois",
    name: "Neutrois",
    colors: ["#FFFFFF", "#1F9F00", "#000000"]
  },
  {
    id: "maverique",
    name: "Maverique",
    colors: ["#FFF344", "#FFFFFF", "#F49622"]
  },
  {
    id: "aceflux",
    name: "Aceflux",
    colors: ["#C72252", "#C12779", "#C0279A", "#A828AC", "#8C26AF"]
  },
  {
    id: "aroflux",
    name: "Aroflux",
    colors: ["#E7526B", "#D86C65", "#B7A55D", "#A3C95A", "#92E555"]
  },
  {
    id: "androsexual",
    name: "Androsexual",
    colors: ["#00CCFF", "#603524", "#B899DF"]
  },
  {
    id: "gynesexual",
    name: "Gynesexual",
    colors: ["#F5A9B8", "#8F3F2B", "#5B943A"]
  }
];
