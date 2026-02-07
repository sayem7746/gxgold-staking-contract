# Apache Configuration Guide

This guide explains how to configure Apache as a reverse proxy for the Next.js staking frontend.

## Prerequisites

1. **SSL Certificate Files** (required):
   - Certificate: `/etc/ssl/certs/gxgold_net.crt` ✓ (exists)
   - Private Key: `/etc/ssl/private/gxgold_net.key` ✗ (missing - needs to be installed)
   - CA Bundle: `/etc/apache2/ssl.crt/gxgold_net.ca-bundle` ✓ (exists)

2. **Apache2** installed and running

3. **Next.js app** configured to run on port 8080

## Quick Setup

Run the configuration script:

```bash
sudo bash /home/gxgold/staking/configure-apache.sh
```

## Manual Setup Steps

If you prefer to configure manually:

1. **Enable required Apache modules:**
   ```bash
   sudo a2enmod proxy proxy_http headers rewrite ssl
   ```

2. **Install SSL certificate key** (if missing):
   ```bash
   # Copy your private key to the correct location
   sudo cp /path/to/your/gxgold_net.key /etc/ssl/private/gxgold_net.key
   sudo chmod 600 /etc/ssl/private/gxgold_net.key
   sudo chown root:root /etc/ssl/private/gxgold_net.key
   ```

3. **Install Apache configuration:**
   ```bash
   sudo cp /home/gxgold/staking/apache-proxy-config.conf /etc/apache2/sites-available/default-ssl.conf
   ```

4. **Enable SSL site:**
   ```bash
   sudo a2ensite default-ssl.conf
   ```

5. **Test configuration:**
   ```bash
   sudo apache2ctl -t
   ```

6. **Restart Apache:**
   ```bash
   sudo systemctl restart apache2
   ```

## Configuration Details

The Apache configuration:
- Proxies all requests from `https://staking.gxgold.net` to `http://localhost:8080`
- Supports WebSocket connections
- Sets proper headers for Next.js (`X-Forwarded-Proto`, `X-Forwarded-Port`)
- Uses SSL/TLS on port 443
- Has extended timeouts (300 seconds) for Next.js compilation

## Verify Setup

1. **Check Apache status:**
   ```bash
   sudo systemctl status apache2
   ```

2. **Check if Next.js is running on port 8080:**
   ```bash
   curl http://localhost:8080
   # or
   netstat -tlnp | grep 8080
   ```

3. **Test HTTPS access:**
   ```bash
   curl -k https://staking.gxgold.net
   ```

4. **View Apache logs:**
   ```bash
   sudo tail -f /var/log/apache2/error.log
   sudo tail -f /var/log/apache2/access.log
   ```

## Troubleshooting

### SSL Certificate Key Missing

If you see the error:
```
SSLCertificateKeyFile: file '/etc/ssl/private/gxgold_net.key' does not exist or is empty
```

**Solution:** Install the SSL private key file:
```bash
sudo cp /path/to/your/private.key /etc/ssl/private/gxgold_net.key
sudo chmod 600 /etc/ssl/private/gxgold_net.key
sudo chown root:root /etc/ssl/private/gxgold_net.key
```

### Next.js Not Responding

Make sure your Next.js app is running on port 8080:
```bash
cd /home/gxgold/staking/frontend
PORT=8080 npm run start
```

Or using PM2:
```bash
pm2 start /home/gxgold/staking/frontend/ecosystem.config.js
```

### Apache Modules Not Enabled

Enable required modules:
```bash
sudo a2enmod proxy proxy_http headers rewrite ssl
sudo systemctl restart apache2
```

### Port Already in Use

If port 8080 is already in use, either:
1. Change the Next.js port in `ecosystem.config.js`
2. Update the Apache config to proxy to the new port
3. Stop the service using port 8080

## Next.js Configuration

The Next.js app should be configured to:
- Run on port 8080 (as specified in `ecosystem.config.js`)
- Accept connections from localhost (Apache will proxy)
- Handle the `X-Forwarded-Proto` header correctly

## Security Notes

- SSL private keys should have permissions 600 (read/write for owner only)
- Keep SSL certificates up to date
- Regularly check Apache logs for suspicious activity
- Consider setting up fail2ban for additional security
