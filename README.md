Lightsquare
===========

Lightsquare is an HTML5 application for playing chess with other people.
It connects to any WebSocket server implementing the [jsonchess][2] protocol.

Installation
------------

There's nothing particularly special or complicated about the app - it could quite
easily be run with $python -mSimpleHTTPServer from the root directory with some
minor changes - but for the sake of code organisation not all of the libraries it
uses are included in the source, so there is a bit of messing around to do to setup
all the paths properly.  It uses RequireJS, so if you're familiar with that then it
will probably be obvious from looking at the config in index.html and reading these
instructions:

- Download the code
- Put it somewhere where index.html is at the root of a webserver (e.g. in an Apache virtual host)
- Redirect all URLs to /index.html (optional - the view is determined by the URL using the history API so this is required for navigating directly to URLs other than index.html)
- Download [libjs][1] and place it where it will be found under the 'lib' path as mapped in the requirejs config in index.html
- Download [jsonchess][2] and put it in the libjs folder

**Example Apache virtualhost:**

```
<VirtualHost *:80>
	DocumentRoot /var/www/lightsquare
	ServerName lightsquare
	DirectoryIndex /index.html
	RewriteEngine On
	RewriteRule ^[^.]+$ /index.html
</VirtualHost>
```

[1]:http://github.com/lightsquaredev/libjs
[2]:http://github.com/lightsquaredev/jsonchess