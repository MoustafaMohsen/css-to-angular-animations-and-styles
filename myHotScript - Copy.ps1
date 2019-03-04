#Moustafa Mohesen 2018
#HardCoded Variables
$inputcsspath = "C:\Data\Dev\Projects\fridge-notes\fridge-notes\src\app\animations\custom.css"
$outputtspath = "C:\Data\Dev\Projects\fridge-notes\fridge-notes\src\app\animations\test-Keyframes.ts"
$publishdirectory="C:\Data\Dev\Projects\fridge-notes\fridge-notes\src\app\animations"



node css-to-angular-styles $inputcsspath $outputtspath


#Copy-Item $outputtspath -Destination $publishdirectory -Force 



echo 'all done'
pause