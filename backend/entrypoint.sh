#!/bin/sh

echo "⏳ Attente de la base de données..."

until nc -z db 5432; do
  sleep 1
done

echo "✅ Base de données prête !"
echo "🚀 Démarrage du serveur..."

npm start