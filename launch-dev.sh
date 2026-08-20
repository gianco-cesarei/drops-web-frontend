#!/bin/bash

# Terminate script gracefully on Ctrl+C and restore terminal colors
cleanup() {
  echo -e "\nRestoring original terminal settings..."
  printf "\033]111\033\\" # Reset background color to default
  printf "\033]110\033\\" # Reset text color to default
  printf "\033]2;\007"   # Reset window title
  clear
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Apply "Light Drops" mint theme to Terminal/iTerm2
printf "\033]11;#f4f8f5\033\\" # Light mint background
printf "\033]10;#0a2212\033\\" # Dark forest green text
printf "\033]2;[Drops Web Frontend]\007" # Set terminal tab title

# Clear terminal screen to apply background color immediately
clear

echo "=============================================="
echo "🌱  Drops Frontend Dev Terminal - Light Drops Theme"
echo "=============================================="
echo "Running Astro Dev Server..."
echo "Press Ctrl+C to stop and restore terminal colors."
echo ""

# 2. Run the actual development server
cross-env ASTRO_TELEMETRY_DISABLED=1 astro dev
