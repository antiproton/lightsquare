#!/bin/sh

sudo ln -s /var/www/chess/scripts/chessd /etc/init.d/chessd
sudo update-rc.d chessd defaults