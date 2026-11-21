@echo off
rem Called by the Windows scheduled task. Runs the publisher from the repo root
rem and appends everything it prints to data\publish.log.
cd /d "%~dp0.."
node tools\publish.js >> data\publish.log 2>&1
