# Mjengo Tracker

A small website for following the building of our family home upcountry.

It has three pages.

* **Home** shows the architect's render of the house. Each floor starts faint and becomes clear as building moves forward, so one glance tells you where the house has reached.
* **Funding** keeps a log of every amount sent to Dad for the building, whether it went by bank, cash or M-Pesa. Every transfer is laid as bricks in a "money wall".
* **Interior** has clickable floor plans drawn from the architect's drawings. Each room has a mood, a colour palette and a shopping list.

## Built with

Plain HTML, CSS and JavaScript. No framework, no build step and no server. That means it can be hosted free on Netlify or GitHub Pages.

## Project layout

```
index.html          Home page with the house reveal
funding.html        Money sent and the money wall
interior.html       Floor plans and room plans
css/style.css       All the styling
js/store.js         Loads and saves the data, shared by every page
js/home.js          Logic for the home page
js/funding.js       Logic for the funding page
js/interior.js      Logic for the interior page
data/site-data.js   All the content (progress, transfers, rooms)
assets/img/         House renders taken from the architect's PDF
```

## How updating works

All the content lives in `data/site-data.js`.

1. Open the live site and click **Update** on any page. Change the progress, add a transfer or tick off an item.
2. Your change is saved in your browser straight away, and a bar at the bottom reminds you that only this device can see it.
3. Click **Download data file** in that bar. Replace `data/site-data.js` in the repo with the downloaded file.
4. Commit and push. Netlify rebuilds the site and everyone sees the update.

```
git add data/site-data.js
git commit -m "Ground floor at 40 percent, sent 25k for blocks"
git push
```

## Running it on your laptop

Double click `index.html`. That is all. Because the data is a `.js` file and not a `.json` file, the browser can load it without a local server.

## Deploying free on Netlify

1. Push this repo to GitHub.
2. On Netlify choose **Add new site**, then **Import an existing project**, then pick this repo.
3. Leave the build command empty and set the publish directory to `.` (the `netlify.toml` file already does this).

House design and renders by Grandscale Builders Ltd.
