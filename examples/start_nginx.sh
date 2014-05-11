#!/bin/bash
mkdir -p logs
mkdir -p temp
sudo nginx -p $(pwd) -c nginx.conf
