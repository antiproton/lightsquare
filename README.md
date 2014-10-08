Lightsquare
===========

Lightsquare is an HTML5 application for playing chess with other people.
It connects to the WebSocket server created by [lightsquared](http://github.com/jsonchess/lightsquared).
It can connect to any WebSocket server by changing the address in main.js,
and this doesn't necessarily have to be running lightsquared, but the messages
haven't been formalised into a proper protocol yet so at the moment writing
another server implementation would involve some reverse-engineering.  If you want
to do this, just look at User.js in lightsquared -- all the messages are handled
there.

Installation
------------

See [a screencast](https://www.youtube.com/watch?v=PR2FBr_5wiI) showing the
installation procedure or follow the steps below:

- Download the code
- Put it somewhere where index.html is at the root of a webserver
- Redirect all URLs without a file extension to /index.html*
- `cd` to the downloaded directory
- Run `$bower install` (run `#npm install -g bower` to get the bower command)

*This step is optional.  If omitted, the app will work correctly when you visit
`/` or `/index.html`, and then click around and use the back button.  It won't
work if you point your browser directly to a URL like `/game/123`, for example
by refreshing the page or following a link or bookmark.  See the example apache
virtual host for a mod_rewrite-based solution for this.

**Note** - `bower` seems to require the `node` command, which can be obtained by
installing the `nodejs-legacy` package, or possibly by just symlinking /usr/bin/node
to /usr/bin/nodejs.

**Example Apache virtualhost:**

```
<VirtualHost *:80>
	DocumentRoot /home/gus/projects/lightsquare
	ServerName lightsquare
	DirectoryIndex /index.html
	RewriteEngine On
	RewriteRule ^[^.]+$ /index.html
</VirtualHost>
```

Optimisation
------------

Run `r.js -o rjs-optimise.js` to build a completely separate source tree called
lightsquare-optimised as a sibling to lightsquare (the directory containing rjs-optimise.js).

The actual virtual host config used for jsonchess.com is:

```
<VirtualHost *:80>
        DocumentRoot /home/gus/projects/lightsquare-optimised
        ServerName jsonchess.com
        ServerAlias www.jsonchess.com
        DirectoryIndex /index.html
        RewriteEngine On
        RewriteRule ^[^.]+$ /index.html
</VirtualHost>
```