# HotshotTournaments

A web based tournament app, that allows users to create tournaments for any sports with discussion boards

Hotshots Tournaments can be found online [here](https://hotshot-tournaments.herokuapp.com).

---

## Contributing

### Forking

If you are not a direct access contributor to this repository, then you will need to fork this repo to your own GitHub account. Then follow these steps,

1. Go to your forked version of the repo
2. Clone the code to your computer using the `git clone <your-repo-link-here>`
3. Go into directory `cd <directory-name>`
4. Make a new branch `git checkout -b <branch name>`
5. Apply your code changes
6. Add and commit your code to your local repository `git add .` => `git commit -m <commit-message>`
7. Push your new branch and changes to your GitHub remote `git push -u origin <new-branch-name>`
8. Create a new Pull Request to the `main` branch, which will then be reviewed, once reviewed and approved, the changes will be merged with the `main` branch
9. You can now switch back to `main` branch using `git checkout main` then `git pull` then latest changes.

---

## How To Run

- clone the repo using the steps above.
- go into the directory `cd HotshotTournaments/`
- install the dependencies `npm install`
- run the development script `npm run dev`

---

## Using Markdown

Any files that have the `.md` suffix required the Markdown syntax to work properly, use this link to for a little [cheatsheet here](https://guides.github.com/pdfs/markdown-cheatsheet-online.pdf)

Note: If you ever want to make a comment on any of the GitHub textboxes, they all support mardown natively.

---

## Configuring Code Formatting

We use [Prettier](https://prettier.io/) to ensure that all our code adheres to the [JavaScript Standard Style](https://standardjs.com/rules.html). To contribute to the project, you'll have to use Prettier and use the [StandardJS Prettier config](https://www.npmjs.com/package/prettier-config-standard). It doesn't matter what editor you use, but we recommend VScode. To setup Prettier, follow these steps:

1. Run `npm i` to install all the projects dependencies, including [prettier-config-standard](https://www.npmjs.com/package/prettier-config-standard)
2. Open *settings.json* by launching the Command Palette (<kbd>⌘</kbd> + <kbd>⇧</kbd> + <kbd>P</kbd> on MacOS or <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> on Windows), type *settings.json* and press <kbd>↵</kbd>
3. Add the following key:value pairs to set Prettier as the default formatter:
```json
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
```

No extra configuration is needed; Prettier is already pointing to the configuration file in package.json. Now you should be able to format an entire document by launching the Command Palette and running Format Document (Forced).