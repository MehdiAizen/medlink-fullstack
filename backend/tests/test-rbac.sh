#!/bin/bash
echo "🛡️ Début des tests de scénarios RBAC (US-62)"
echo "=============================================="

BASE_URL="http://localhost:4000/api"

# 1. Récupérer le token du Patient
echo -e "\n1️⃣ Connexion en tant que Patient..."
PATIENT_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@medlink.tn","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Récupérer le token du Praticien
echo "2️⃣ Connexion en tant que Praticien..."
PRACTITIONER_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@medlink.tn","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 3. TEST CRITIQUE : Le patient essaie d'accéder à une route réservée aux praticiens
echo -e "\n3️⃣ [TEST ATTAQUE] Patient tente d'accéder à /api/practitioner/appointments..."
echo "   (Doit être bloqué avec 403 Forbidden)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/practitioner/appointments \
  -H "Authorization: Bearer $PATIENT_TOKEN")

if [ "$HTTP_CODE" = "403" ]; then
  echo "   ✅ SUCCÈS : Accès correctement refusé par le middleware requireRole()"
else
  echo "   ❌ ÉCHEC CRITIQUE : Code reçu = $HTTP_CODE (Attendu : 403). Faille de sécurité !"
fi

# 4. TEST : Le praticien accède légitimement à sa route
echo -e "\n4️⃣ [TEST LÉGITIME] Praticien tente d'accéder à /api/practitioner/appointments..."
echo "   (Doit être autorisé avec 200 OK ou 404 si pas de données, mais pas 401/403)"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/practitioner/appointments \
  -H "Authorization: Bearer $PRACTITIONER_TOKEN")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  echo "   ✅ SUCCÈS : Accès correctement autorisé"
else
  echo "   ❌ ÉCHEC : Code reçu = $HTTP_CODE"
fi

echo -e "\n🏁 Fin des tests RBAC. Voir rapport ci-dessus."
