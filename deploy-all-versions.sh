#!/bin/bash

# Clear Seas Draft - Deploy All 30+ Versions Script
echo "🌊 Clear Seas Solutions - Multi-Version Deployment"
echo "=================================================="

# Initialize git
git init
git remote add origin https://github.com/Domusgpt/Clear-Seas-Draft.git

# Copy assets and supporting files
echo "📁 Copying assets..."
cp -r ../assets ./assets 2>/dev/null || echo "No assets directory found"
cp -r ../js ./js 2>/dev/null || echo "No js directory found"
cp -r ../src ./src 2>/dev/null || echo "No src directory found"
cp -r ../styles ./styles 2>/dev/null || echo "No styles directory found"
cp -r ../vib34d-styles ./vib34d-styles 2>/dev/null || echo "No vib34d-styles directory found"

# Add README
cat > README.md << 'EOF'
# Clear Seas Solutions - Multi-Version Deployment System

This repository contains all versions and iterations of the Clear Seas Solutions website, including:

- **Main HTML Versions**: 6 core versions (production, optimized, fixed, unified, vib34d, totalistic)
- **PR Branches**: 24 different experimental and development versions
- **Total**: 30+ unique versions for comparison and testing

## 🌊 Access All Versions

Visit the **[Master Index](https://domusgpt.github.io/Clear-Seas-Draft/)** to explore all versions.

## 📋 Version Categories

### Core HTML Versions (1-6)
- Production Ready
- Performance Enhanced
- Bug Fixes Applied
- Unified Architecture
- VIB34D Integrated
- Complete Experience

### PR Branch Versions (7-30)
- Various experimental builds
- Different design approaches
- Feature variations
- Interaction experiments

© 2025 Paul Phillips - Clear Seas Solutions LLC
EOF

echo "✅ Repository setup complete"
echo "📦 Ready to deploy all versions..."