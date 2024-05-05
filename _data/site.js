module.exports = {
  meta: {
    title: "DudeByte",
    description: "Dudes Bits and Bytes.",
    lang: "en",
    siteUrl: "https://dudebyte.me/",
  },
  feed: { // used in feed.xml.njk
    subtitle: "Lorem ipsum dolor sit amet consecuteor",
    filename: "atom.xml",
    path: "/atom.xml",
    id: "https://example.com/",
    authorName: "John Doe",
    authorEmail: "johndoe@example.com"
  },
  hero: { // used in hero section of main page ie. index.html.njk
    title: "DudeByte",
    description: "Dudes Bits and Bytes. He's a dude. He likes dude stuff.",
    logo: "img/logo.jpg"
  }
}