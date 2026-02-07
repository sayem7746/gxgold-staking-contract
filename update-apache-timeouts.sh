#!/bin/bash

# Script to add timeout settings to Apache config
# Run with: sudo bash /home/gxgold/staking/update-apache-timeouts.sh

echo "Updating Apache configuration with timeout settings..."

# Backup current config
cp /etc/apache2/sites-available/default-ssl.conf /etc/apache2/sites-available/default-ssl.conf.backup.$(date +%Y%m%d_%H%M%S)

# Add timeout settings after ProxyRequests Off line
sed -i '/ProxyRequests Off/a\\t\t# Timeout settings for slow Next.js compilation\n\t\tTimeout 300\n\t\tProxyTimeout 300' /etc/apache2/sites-available/default-ssl.conf

# Test Apache configuration
echo "Testing Apache configuration..."
apache2ctl -t

if [ $? -eq 0 ]; then
    echo "Configuration is valid. Restarting Apache..."
    systemctl restart apache2
    echo "Apache has been restarted with new timeout settings."
else
    echo "ERROR: Apache configuration test failed. Restoring backup..."
    cp /etc/apache2/sites-available/default-ssl.conf.backup.* /etc/apache2/sites-available/default-ssl.conf
    exit 1
fi
