server {
    listen 80;
    server_name srv942210.hstgr.cloud;  # Replace with your domain or IP

    # Handle API requests
    location /api/ {
        proxy_pass http://localhost:5001;  # Assuming your Node.js app runs on port 5000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for large file uploads if needed
        client_max_body_size 10M;
        
        # CORS headers
        # add_header 'Access-Control-Allow-Origin' '*' always;
        # add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        # add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        # add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    }

    # Serve static files from the React app
    location / {
        root /Users/federivero/Documents/Dodo/dodo-travel-frontend/build;
        try_files $uri $uri/ /App.js;
    }

    # Serve uploaded files
    location /uploads/ {
        alias http://localhost:5001/uploads/;
        add_header Cache-Control "public, no-transform";
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
