Lightsquare
===========

Lightsquare is an HTML5 application for playing chess with other people.
It connects to any WebSocket server implementing the [jsonchess][3] protocol.

Installation
------------

- Download the code
- Put it somewhere where index.html is at the root of a webserver (e.g. in an Apache virtual host)
- Redirect all URLs without a file extension to /index.html (optional - the view is determined by the URL using the history API so this is required for navigating directly to URLs other than index.html)
- Download the following repos and place them according to the paths configuration in index.html:
    - [websocket][4]
    - [routing][5]
    - [js][6]
    - [tokeniser][7]
    - [Array.prototype][8]
    - [json-local-storage][9]
    - [chess][10]
    - [jsonchess][12]
    - [dom][11]
	- [RequireJS](https://github.com/jrburke/requirejs)
	- [RequireJS text](https://github.com/requirejs/text)
	- [RequireJS css](https://github.com/guybedford/require-css)
	- [RequireJS domReady](https://github.com/requirejs/domReady)

I also use an Apache Alias directive to map /lib to the folder containing the above repos.

**Example Apache virtualhost:**

```
<VirtualHost *:80>
	DocumentRoot /home/gus/projects/lightsquare
	Alias /lib /home/gus/projects
	ServerName lightsquare
	DirectoryIndex /index.html
	RewriteEngine On
	RewriteRule ^[^.]+$ /index.html
</VirtualHost>
```

Optimisation
------------

Run `r.js -o optimise.js` to build a completely separate source tree with compressed
JavaScript.

Copy index.html to the new source tree and point the Apache vhost for the production
URL to it.

[1]:http://github.com/gushogg-blake/libjs
[2]:http://github.com/jsonchess/jsonchess
[3]:http://jsonchess.org
[4]:http://github.com/gushogg-blake/websocket
[5]:http://github.com/gushogg-blake/routing
[6]:http://github.com/gushogg-blake/js
[7]:http://github.com/gushogg-blake/tokeniser
[8]:http://github.com/gushogg-blake/Array.prototype
[9]:http://github.com/gushogg-blake/json-local-storage
[10]:http://github.com/gushogg-blake/chess
[11]:http://github.com/gushogg-blake/dom
[12]:http://github.com/gushogg-blake/jsonchess