// Mjengo Tracker data.
// Everything the site shows comes from this file.
// To publish changes, use "Download data file" on the site, replace this file and commit.

window.SITE_DATA = {
  "project": {
    "name": "The House Construction",
    "tagline": "Our family home, rising one course of blocks at a time.",
    "location": "Ngoni",
    "builder": "Grandscale Builders Ltd",
    "startDate": "2026-10-01"
  },

  // Each stage is one slice of the house picture.
  // band = [top, bottom] as a percent of the image height. left/right trim the trees.
  // weight = how much of the whole job this stage is worth.
  "stages": [
    { "id": "foundation", "name": "Foundation", "short": "Foundation", "progress": 100, "weight": 15, "band": [89.5, 97], "note": "Footings, ring beam and slab are done." },
    { "id": "ground", "name": "Ground floor", "short": "Ground", "progress": 20, "weight": 35, "band": [60, 89.5], "note": "Walling has started." },
    { "id": "first", "name": "First floor", "short": "First", "progress": 0, "weight": 35, "band": [30, 60], "note": "" },
    { "id": "roof", "name": "Roof terrace", "short": "Roof", "progress": 0, "weight": 15, "band": [2.5, 30], "note": "" }
  ],
  "houseTrim": { "left": 15, "right": 16 },

  "updates": [],

  // source is one of: Bank (sent from bank to Dad's M-Pesa), Cash
  "transfers": [],
  "brickValue": 5000,
  "spendCategories": ["General", "Foundation", "Ground floor", "First floor", "Roof terrace", "Materials", "Labour", "Transport", "Fittings"],

  // Interior plan. Room boxes are in metres, measured from the architect's grid.
  // x runs from grid line A (0) to D (9.8). y runs from grid line 1 (0) up to 7 (9.8).
  "floors": [
    {
      "id": "ground", "name": "Ground floor",
      "rooms": [
        {
          "id": "lounge", "name": "Lounge", "size": "4.55 × 5.00 m", "rects": [[0, 0, 4.75, 5.205]],
          "status": "planning", "mood": "Warm and easy, made for long afternoons with family.",
          "palette": ["#B5694B", "#EFE6D6", "#6F7A4E", "#5A3E2B"],
          "items": [
            { "name": "L shaped sofa", "cost": 85000, "done": false },
            { "name": "Large sisal rug", "cost": 12000, "done": false },
            { "name": "Mvule wood coffee table", "cost": 18000, "done": false },
            { "name": "TV wall unit", "cost": 30000, "done": false },
            { "name": "Shuka print cushions", "cost": 4500, "done": false },
            { "name": "Linen curtains", "cost": 15000, "done": false }
          ]
        },
        {
          "id": "kitchen", "name": "Kitchen", "size": "4.55 × 2.82 m", "rects": [[0, 5.205, 4.75, 8.205]],
          "status": "idea", "mood": "Clean, bright and practical",
          "palette": ["#9AAB8E", "#F4F1EA", "#C9A46A", "#3E4A3D"],
          "items": [
            { "name": "Granite worktop", "cost": 60000, "done": false },
            { "name": "Upper and lower cabinets", "cost": 90000, "done": false },
            { "name": "Gas cooker with oven", "cost": 45000, "done": false },
            { "name": "Cooker hood", "cost": 15000, "done": false },
            { "name": "Open shelf for sufurias", "cost": 6000, "done": false },
            { "name": "Pendant lights", "cost": 7000, "done": false }
          ]
        },
        {
          "id": "pantry", "name": "Pantry", "size": "1.30 × 2.90 m", "rects": [[4.75, 6.905, 6.05, 9.8]],
          "status": "idea", "mood": "Everything in its place, from foodstuff to utensils",
          "palette": ["#D8C3A0", "#F4EDE0", "#8A6F4E"],
          "items": [
            { "name": "Floor to ceiling shelving", "cost": 14000, "done": false },
            { "name": "Storage bins", "cost": 4000, "done": false },
            { "name": "Light fitting", "cost": 1500, "done": false }
          ]
        },
        {
          "id": "lobby", "name": "Lobby", "size": "1.30 m wide", "rects": [[4.75, 1.5, 6.05, 6.905]],
          "status": "idea", "mood": "A soft landing when you walk in. Shoes off, keys down.",
          "palette": ["#E6DCCB", "#7C6A55", "#A3B09A"],
          "items": [
            { "name": "Shoe bench", "cost": 8000, "done": false },
            { "name": "Long mirror", "cost": 6000, "done": false },
            { "name": "Key hooks", "cost": 800, "done": false }
          ]
        },
        {
          "id": "guest", "name": "Guest room", "size": "3.55 × 4.40 m", "rects": [[6.05, 5.205, 9.8, 9.8]],
          "status": "idea", "mood": "Calm and welcoming, for visitors who want to stay an extra night.",
          "palette": ["#C7D1D3", "#F2EEE6", "#8C7B6B", "#4F6470"],
          "items": [
            { "name": "5 by 6 bed and mattress", "cost": 45000, "done": false },
            { "name": "Bedside tables", "cost": 8000, "done": false },
            { "name": "Kikoi bed cover", "cost": 3500, "done": false },
            { "name": "Blackout curtains", "cost": 9000, "done": false }
          ]
        },
        {
          "id": "gbath", "name": "Bathroom", "size": "3.55 × 1.50 m", "rects": [[6.05, 3.71, 9.8, 5.205]],
          "status": "idea", "mood": "Simple and fresh.",
          "palette": ["#E7ECEC", "#B9C4C2", "#7A6A58"],
          "items": [
            { "name": "Shower screen", "cost": 18000, "done": false },
            { "name": "Mirror cabinet", "cost": 7000, "done": false },
            { "name": "Towel rails", "cost": 2500, "done": false }
          ]
        },
        {
          "id": "gstairs", "name": "Staircase", "size": "3.75 × 2.21 m", "rects": [[6.05, 1.5, 9.8, 3.71]],
          "status": "idea", "mood": "A cool mirror staircase",
          "palette": ["#5A3E2B", "#EFE6D6", "#24412F"],
          "items": [
            { "name": "Handrail", "cost": 25000, "done": false },
            { "name": "Photo frames", "cost": 6000, "done": false },
            { "name": "Step lights", "cost": 8000, "done": false }
          ]
        },
        {
          "id": "porch", "name": "Front porch", "size": "4.40 × 2.10 m", "rects": [[4.75, 0, 9.8, 1.5]],
          "status": "idea", "mood": "Two chairs, a flask of chai and a view of the shamba.",
          "palette": ["#7C8B6A", "#D9C6A5", "#3B3A35"],
          "items": [
            { "name": "Two outdoor chairs", "cost": 12000, "done": false },
            { "name": "Potted plants", "cost": 5000, "done": false },
            { "name": "Wall light", "cost": 3500, "done": false }
          ]
        },
        {
          "id": "patio", "name": "Patio", "size": "4.75 × 1.60 m", "rects": [[0.3, 8.205, 4.75, 9.8]],
          "status": "idea", "mood": "Nyama choma corner ",
          "palette": ["#A8624A", "#E8D9BE", "#55603F"],
          "items": [
            { "name": "Outdoor dining set", "cost": 25000, "done": false },
            { "name": "Charcoal grill", "cost": 8000, "done": false },
            { "name": "String lights", "cost": 2500, "done": false }
          ]
        }
      ]
    },
    {
      "id": "first", "name": "First floor",
      "rooms": [
        {
          "id": "master", "name": "Master bedroom", "size": "4.55 × 3.51 m", "rects": [[0, 0, 4.75, 3.71]],
          "status": "idea", "mood": "A quiet retreat",
          "palette": ["#24412F", "#EFE6D6", "#B08D57", "#4A3428"],
          "items": [
            { "name": "6 by 6 bed and mattress", "cost": 70000, "done": false },
            { "name": "Dressing table", "cost": 18000, "done": false },
            { "name": "Reading chair", "cost": 15000, "done": false },
            { "name": "Blackout curtains", "cost": 12000, "done": false }
          ]
        },
        {
          "id": "mbath", "name": "Bathroom", "size": "4.55 × 1.30 m", "rects": [[0, 3.71, 4.75, 5.205]],
          "status": "idea", "mood": "Spa feel with warm wood tones.",
          "palette": ["#E7E1D6", "#9C8268", "#6E7F72"],
          "items": [
            { "name": "Shower screen", "cost": 18000, "done": false },
            { "name": "Vanity unit", "cost": 22000, "done": false }
          ]
        },
        {
          "id": "bed2", "name": "Bedroom 02", "size": "4.55 × 2.80 m", "rects": [[0, 5.205, 4.75, 8.205]],
          "status": "idea", "mood": "Part bedroom, part study. Good light for reading.",
          "palette": ["#C9D3C0", "#F4F0E6", "#7D6B57"],
          "items": [
            { "name": "4 by 6 bed and mattress", "cost": 32000, "done": false },
            { "name": "Study desk and chair", "cost": 16000, "done": false },
            { "name": "Bookshelf", "cost": 9000, "done": false }
          ]
        },
        {
          "id": "balback", "name": "Back balcony", "size": "3.95 × 1.40 m", "rects": [[0.3, 8.205, 4.75, 9.8]],
          "status": "idea", "mood": "Morning coffee over the back garden.",
          "palette": ["#7C8B6A", "#E6D8BF"],
          "items": [
            { "name": "Planter boxes", "cost": 6000, "done": false },
            { "name": "Bistro set", "cost": 9000, "done": false }
          ]
        },
        {
          "id": "passage", "name": "Passage", "size": "1.10 m wide", "rects": [[4.75, 1.5, 6.05, 6.905]],
          "status": "idea", "mood": "Let it breathe",
          "palette": ["#D9CBB3", "#5A3E2B"],
          "items": [
            { "name": "Runner rug", "cost": 5000, "done": false },
            { "name": "Wall art", "cost": 7000, "done": false }
          ]
        },
        {
          "id": "bed1", "name": "Bedroom 01", "size": "4.85 × 4.40 m", "rects": [[6.05, 5.205, 9.8, 9.8], [4.75, 6.905, 6.05, 9.8]],
          "status": "idea", "mood": "The biggest bedroom. Room for a reading nook by the window.",
          "palette": ["#C7D1D3", "#EFE6D6", "#A8624A", "#3E4A3D"],
          "items": [
            { "name": "5 by 6 bed and mattress", "cost": 45000, "done": false },
            { "name": "Reading nook seat", "cost": 12000, "done": false },
            { "name": "Curtains", "cost": 10000, "done": false }
          ]
        },
        {
          "id": "bath2", "name": "Bathroom", "size": "3.75 × 1.50 m", "rects": [[6.05, 3.71, 9.8, 5.205]],
          "status": "idea", "mood": "Shared and easy to clean.",
          "palette": ["#E7ECEC", "#9AAB8E"],
          "items": [
            { "name": "Shower screen", "cost": 18000, "done": false },
            { "name": "Mirror", "cost": 4000, "done": false }
          ]
        },
        {
          "id": "fstairs", "name": "Staircase", "size": "3.75 × 2.21 m", "rects": [[6.05, 1.5, 9.8, 3.71]],
          "status": "idea", "mood": "Carries on the photo wall from below.",
          "palette": ["#5A3E2B", "#EFE6D6"],
          "items": [{ "name": "Pendant light", "cost": 6000, "done": false }]
        },
        {
          "id": "balfront", "name": "Front balcony", "size": "4.00 × 1.30 m", "rects": [[4.75, 0, 9.8, 1.5]],
          "status": "idea", "mood": "Flowers spilling over the glass, just like the render.",
          "palette": ["#6F7A4E", "#8A7FB8", "#EFE6D6"],
          "items": [
            { "name": "Flower troughs", "cost": 7000, "done": false },
            { "name": "Two chairs", "cost": 9000, "done": false }
          ]
        }
      ]
    },
    {
      "id": "roof", "name": "Roof terrace",
      "rooms": [
        {
          "id": "terrace", "name": "Roof terrace", "size": "about 55 m²", "rects": [[0, 0, 4.75, 8.205], [4.75, 3.71, 9.8, 5.205]],
          "status": "idea", "mood": "Sundowners above the trees. The best seat in the house.",
          "palette": ["#B08D57", "#24412F", "#EFE6D6", "#A8624A"],
          "items": [
            { "name": "Outdoor sofa set", "cost": 45000, "done": false },
            { "name": "Shade pergola", "cost": 60000, "done": false },
            { "name": "Herb planters", "cost": 8000, "done": false },
            { "name": "Solar lights", "cost": 6000, "done": false }
          ]
        },
        {
          "id": "tanks", "name": "Tank deck", "size": "two tanks", "rects": [[4.75, 5.205, 9.8, 9.8]],
          "status": "idea", "mood": "Water for the whole house, from the rain where possible.",
          "palette": ["#3B3A35", "#9AAB8E"],
          "items": [
            { "name": "Two water tanks", "cost": 50000, "done": false },
            { "name": "Gutters to tanks", "cost": 15000, "done": false }
          ]
        },
        {
          "id": "rstairs", "name": "Stair head", "size": "3.75 × 2.21 m", "rects": [[4.75, 1.5, 9.8, 3.71]],
          "status": "idea", "mood": "A door that opens onto the sky.",
          "palette": ["#5A3E2B", "#EFE6D6"],
          "items": [{ "name": "Weatherproof door", "cost": 20000, "done": false }]
        }
      ]
    }
  ]
};
