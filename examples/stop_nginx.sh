#!/bin/bash
sudo nginx -p $(pwd) -c nginx.conf -s stop
