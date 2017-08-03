# Atlas

This project is a bare-bones clone of Wolpy (which, sadly, seems to be dead). It has no concept of users, it uses file-based storage, and it uses a Node.js CLI to add places because the web front-end is 100% read-only.

Deploying your own instance of this is super-easy:

1. Clone this repo.
2. Copy `secrets.template.json` to `secrets.json` and add your Google API key.
3. Run `npm install` followed by `node app.js` (or `pm2 process.local.json` if you're using PM2).
4. Point your browser to `localhost:3003` (or set up something more exciting with Nginx or similar).
5. Start adding places by running `node add-place.js`.

My version can be found at https://atlas.markormesher.co.uk.
