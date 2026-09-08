#!/bin/bash
echo "==============================================="
echo "  Smart Library Assistant - Starting..."
echo "==============================================="
echo ""

if ! command -v java &> /dev/null; then
    echo "[ERROR] Java is not installed. Please install Java 17+."
    exit 1
fi

LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "Starting Smart Library Assistant..."
echo ""
echo "Once started, access the app at:"
echo "  Local:   http://localhost:8080"
echo "  Network: http://${LOCAL_IP}:8080"
echo ""
echo "Login credentials:"
echo "  Librarian: librarian@smartlibrary.com / librarian123"
echo "  Student:   student@smartlibrary.com / student123"
echo ""
echo "Press Ctrl+C to stop the server."
echo "==============================================="
echo ""

java -jar target/smart-library-backend-1.0.0.jar
