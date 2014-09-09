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
- $bower install (#npm install -g bower to get the bower command)

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

Run `r.js -o rjs-optimise.js` to build a completely separate source tree with compressed
JavaScript.  Note - the r.js options file `rjs-optimise.js` contains hard-coded
paths so you'll want to change these to match your system.