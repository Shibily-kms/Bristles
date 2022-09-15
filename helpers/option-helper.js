const medium = [
    { name: "Acrylic" },
    { name: "Color Ball" },
    { name: "Color Ink" },
    { name: "Color Mixed" },
    { name: "Media Oil" },
    { name: "Color Pencil" },
    { name: "Color Poster" },
    { name: "Color Watercolor" },
    { name: "Oil Color" },
    { name: "Mixed media" },
    { name: "UV Resistant Printer Inks" }

]
const surface = [
    { name: "Canson" },
    { name: "Paper Canvas" },
    { name: "Board Drawing" },
    { name: "Paper Fabriano" },
    { name: "Sheet Handmade" },
    { name: "Plastic" },
    { name: "Sheets Paper Thick" },
    { name: "Rolled Canvas" },
    { name: "Leather" }

]
const quality = [
    { name: "Museum Quality" },
    { name: "100% Handpainted" },
    { name: "Ultra HD Prints" },
    { name: "No Quality" }
]

let getOption = () => {
    let obj = {
        medium,
        surface,
        quality
    }
    return obj
}

module.exports = getOption()




