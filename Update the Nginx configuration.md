To update the Nginx configuration for the default server block located in sites-enabled, follow these steps: Locate the default configuration file.
The default server block configuration is typically found as a symbolic link in /etc/nginx/sites-enabled/default, pointing to the actual configuration file in /etc/nginx/sites-available/default. Edit the configuration file. 
Open the default file in /etc/nginx/sites-available/ using a text editor with superuser privileges. For example, using nano:
Code

    sudo nano /etc/nginx/sites-available/default
Make the necessary changes within the server block, such as modifying the root directory, index files, server_name, or location directives. Test the Nginx configuration.
Before applying the changes, verify the syntax of your updated configuration to prevent errors:
Code

    sudo nginx -t
If there are no syntax errors, the output will indicate that the test was successful. Reload Nginx to apply changes.
If the configuration test is successful, reload Nginx to apply the updated configuration without interrupting active connections:
Code

    sudo systemctl reload nginx
Alternatively, you can restart Nginx, which will briefly interrupt connections:
Code

    sudo systemctl restart nginx
