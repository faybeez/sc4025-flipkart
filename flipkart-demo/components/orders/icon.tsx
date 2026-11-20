const paths = {
  phone: "M5 3 2 6c0 8 8 16 16 16l3-3-5-4-3 3c-3-1-6-4-7-7l3-3z",
  attachment: "m8 13 7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L13 2m-7 13 9-9",
  send: "m3 3 19 9-19 9 4-9zm4 9h15",
  lock: "M6 10h12v11H6zm3 0V6a3 3 0 0 1 6 0v4m-3 5v2",
  menu: "M3 5h18M3 12h18M3 19h18",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4M12 2V1",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0zM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  home: "m2 11 10-9 10 9M5 9v13h5v-8h4v8h5V9",
  parcel: "m12 2 10 5v13l-10 4L2 20V7zm0 9L2 7m10 4 10-4M12 11v13",
  headset: "M3 14v-3a9 9 0 0 1 18 0v3M3 12h3v8H3zm15 0h3v8h-3zm3 8c0 3-5 3-9 3",
  back: "M19 12H5m6-6-6 6 6 6", search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  cart: "M2 3h3l3 13h11l3-10H6M10 21h.01M18 21h.01", check: "m5 12 4 4L19 6",
  chevron: "m9 5 7 7-7 7", box: "M4 11h16v10H4zM3 9l17-6 2 4-17 6zM10 12v9",
  inspect: "m16 16 6 6M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-12 0 2 2 4-5",
  shield: "M4 3h16v8c0 6-8 10-8 10S4 17 4 11zm4 8 3 3 5-6", close: "m6 6 12 12M6 18 18 6",
};
export function Icon({ name }: { name: keyof typeof paths }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
