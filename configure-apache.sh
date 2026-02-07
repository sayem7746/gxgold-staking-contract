#!/bin/bash

# Script to configure Apache as reverse proxy for Next.js app
# Run with: sudo bash /home/gxgold/staking/configure-apache.sh

set -e

echo "=========================================="
echo "Apache Configuration for Next.js Staking App"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: This script must be run as root (use sudo)"
    exit 1
fi

# Check if Apache is installed
if ! command -v apache2 &> /dev/null; then
    echo "ERROR: Apache2 is not installed. Please install it first:"
    echo "  sudo apt-get update && sudo apt-get install apache2"
    exit 1
fi

echo "Step 1: Enabling required Apache modules..."
MODULES=("proxy" "proxy_http" "headers" "rewrite" "ssl")
for module in "${MODULES[@]}"; do
    if a2enmod -q "$module" 2>/dev/null; then
        echo "  ✓ Enabled module: $module"
    else
        echo "  ✓ Module already enabled: $module"
    fi
done

echo ""
echo "Step 2: Checking SSL certificate files..."

CERT_FILE="/etc/ssl/certs/gxgold_net.crt"
KEY_FILE="/etc/ssl/private/gxgold_net.key"
CA_BUNDLE="/etc/apache2/ssl.crt/gxgold_net.ca-bundle"

# Check certificate file
if [ -f "$CERT_FILE" ]; then
    echo "  ✓ Certificate file found: $CERT_FILE"
else
    echo "  ✗ Certificate file NOT found: $CERT_FILE"
    echo "    Please ensure the SSL certificate is installed."
fi

# Check key file
if [ -f "$KEY_FILE" ]; then
    echo "  ✓ Key file found: $KEY_FILE"
    # Check permissions
    KEY_PERMS=$(stat -c "%a" "$KEY_FILE" 2>/dev/null || echo "000")
    if [ "$KEY_PERMS" != "600" ] && [ "$KEY_PERMS" != "640" ]; then
        echo "  ⚠ Warning: Key file permissions are $KEY_PERMS (should be 600 or 640)"
        echo "    Consider running: chmod 600 $KEY_FILE"
    fi
else
    echo "  ✗ Key file NOT found: $KEY_FILE"
    echo "    ERROR: SSL key file is required for HTTPS."
    echo ""
    echo "    Please ensure the SSL private key is installed at: $KEY_FILE"
    echo "    If you have the key file elsewhere, copy it:"
    echo "      sudo cp /path/to/your/key.key $KEY_FILE"
    echo "      sudo chmod 600 $KEY_FILE"
    echo "      sudo chown root:root $KEY_FILE"
    exit 1
fi

# Check CA bundle
if [ -f "$CA_BUNDLE" ]; then
    echo "  ✓ CA bundle found: $CA_BUNDLE"
else
    echo "  ⚠ CA bundle NOT found: $CA_BUNDLE"
    echo "    This may cause certificate chain issues. Continuing anyway..."
fi

echo ""
echo "Step 3: Backing up existing Apache SSL configuration..."
BACKUP_FILE="/etc/apache2/sites-available/default-ssl.conf.backup.$(date +%Y%m%d_%H%M%S)"
if [ -f "/etc/apache2/sites-available/default-ssl.conf" ]; then
    cp /etc/apache2/sites-available/default-ssl.conf "$BACKUP_FILE"
    echo "  ✓ Backup created: $BACKUP_FILE"
else
    echo "  ℹ No existing config to backup"
fi

echo ""
echo "Step 4: Installing Apache SSL configuration..."
CONFIG_SOURCE="/home/gxgold/staking/apache-proxy-config.conf"
if [ ! -f "$CONFIG_SOURCE" ]; then
    echo "  ✗ ERROR: Configuration source file not found: $CONFIG_SOURCE"
    exit 1
fi

cp "$CONFIG_SOURCE" /etc/apache2/sites-available/default-ssl.conf
echo "  ✓ Configuration installed"

echo ""
echo "Step 5: Enabling SSL site..."
a2ensite default-ssl.conf > /dev/null 2>&1
echo "  ✓ SSL site enabled"

echo ""
echo "Step 6: Testing Apache configuration..."
if apache2ctl -t; then
    echo "  ✓ Configuration test passed"
else
    echo "  ✗ Configuration test FAILED"
    echo ""
    echo "  Restoring backup..."
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" /etc/apache2/sites-available/default-ssl.conf
    fi
    echo "  Please check the errors above and fix them before continuing."
    exit 1
fi

echo ""
echo "Step 7: Restarting Apache..."
if systemctl restart apache2; then
    echo "  ✓ Apache restarted successfully"
else
    echo "  ✗ Failed to restart Apache"
    echo "  Check status with: sudo systemctl status apache2"
    exit 1
fi

echo ""
echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "Your Next.js app should now be accessible at:"
echo "  https://staking.gxgold.net"
echo ""
echo "Make sure your Next.js app is running on port 8080:"
echo "  cd /home/gxgold/staking/frontend"
echo "  PORT=8080 npm run start"
echo ""
echo "Or use PM2:"
echo "  pm2 start ecosystem.config.js"
echo ""
echo "To check Apache status:"
echo "  sudo systemctl status apache2"
echo ""
echo "To view Apache error logs:"
echo "  sudo tail -f /var/log/apache2/error.log"
echo ""
