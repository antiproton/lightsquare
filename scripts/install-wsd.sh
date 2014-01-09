#!/bin/sh

sudo ln -s /var/www/chess/scripts/wsd-chess /etc/init.d/wsd-chess
sudo update-rc.d wsd-chess defaults
sudo service wsd-chess start