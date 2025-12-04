#!/bin/bash

# Start the Python ML Service in the background
echo "Starting ML Service..."
cd ml-service
# Run Gunicorn on port 5001, detached
gunicorn app:app --bind 0.0.0.0:5001 --daemon
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start ML Service: $status"
  exit $status
fi
cd ..

# Start the Node.js Backend
echo "Starting Node.js Backend..."
exec npm start
