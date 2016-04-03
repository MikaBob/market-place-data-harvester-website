@echo off

echo Starting MongoDB...
start cmd.exe /k launch_mongodb.bat
echo __________________________
echo Starting node...
echo __________________________
start cmd.exe /k launch_node.bat