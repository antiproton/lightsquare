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

- Download the code
- Put it somewhere where index.html is at the root of a webserver (e.g. in
    an Apache virtual host)
- Redirect all URLs without a file extension to /index.html (optional -
    the view is determined by the URL using the history API so this is required
    for navigating directly to URLs other than index.html)
- `$bower install` (`#npm install -g bower` to get the bower command)

**Note** - `bower` seems to require the `node` command, which can be obtained by
installing the `node-legacy` package, or possibly by just symlinking /usr/bin/node
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