#!/bin/bash

# Script para limpar cache e reiniciar o desenvolvimento
echo "🧹 Limpando caches..."

# Limpar cache do Metro
npx expo r -c

echo "✅ Cache limpo! Reiniciando servidor..."

# Reiniciar o servidor
npx expo start