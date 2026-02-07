#!/bin/bash

# Script to configure Apache as reverse proxy for Next.js app
# Run with: sudo bash /home/gxgold/staking/setup-apache-proxy.sh

echo "Setting up Apache reverse proxy for Next.js app..."

# Enable required Apache modules
echo "Enabling Apache modules..."
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod rewrite
a2enmod ssl

# Backup original config
echo "Backing up original Apache SSL config..."
cp /etc/apache2/sites-available/default-ssl.conf /etc/apache2/sites-available/default-ssl.conf.backup

# Copy new config
echo "Installing new Apache SSL config..."
cp /home/gxgold/staking/apache-proxy-config.conf /etc/apache2/sites-available/default-ssl.conf

# Test Apache configuration
echo "Testing Apache configuration..."
apache2ctl -t

if [ $? -eq 0 ]; then
    echo "Configuration is valid. Restarting Apache..."
    systemctl restart apache2
    echo "Apache has been restarted."
    echo "Your Next.js app should now be accessible at https://staking.gxgold.net"
else
    echo "ERROR: Apache configuration test failed. Please check the errors above."
    echo "Restoring backup..."
    cp /etc/apache2/sites-available/default-ssl.conf.backup /etc/apache2/sites-available/default-ssl.conf
    exit 1
fi
