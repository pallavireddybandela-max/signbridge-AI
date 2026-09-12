@echo off
echo =====================================================================
echo  Pushing SignBridge AI to all branches on GitHub repository:
echo  https://github.com/pallavireddybandela-max/signbridge-AI
echo =====================================================================
echo.

echo [1/6] Pushing to branch 'main'...
git push origin main:main --force

echo [2/6] Pushing to branch 'bhanu'...
git push origin main:bhanu --force

echo [3/6] Pushing to branch 'naveen'...
git push origin main:naveen --force

echo [4/6] Pushing to branch 'pallavi'...
git push origin main:pallavi --force

echo [5/6] Pushing to branch 'sathwika'...
git push origin main:sathwika --force

echo [6/6] Pushing to branch 'yogasri'...
git push origin main:yogasri --force

echo.
echo =====================================================================
echo  All branches updated successfully!
echo =====================================================================
pause
